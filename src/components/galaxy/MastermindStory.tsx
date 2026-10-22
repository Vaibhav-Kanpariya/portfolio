"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { nodeById } from "./layout";
import { glowTexture } from "./glow";
import { galaxy } from "./store";
import { smoothstep, storyProgress, storyWeight } from "./story";
import { useStoryScale } from "./NtnStory";

/*
  Mastermind, told in particles.

  p = 0.00–0.30  a pool of 2,000 creators drifts above the orb; three signal
                 streams (audio, thumbnails, captions) flow into the orb
  p = 0.30–0.62  the pool spirals down the funnel into the orb
  p = 0.62–0.85  150 come out below, lit, and settle into a ring; the rest fall away
  p = 0.86–1.00  one is rejected, drops out, and the ring re-ranks around the gap
*/

const POOL = 2000;
const KEEP = 150;
const STREAM_POINTS = 90;

const COLOR_AUDIO = new THREE.Color("#52E3F2");
const COLOR_IMAGE = new THREE.Color("#FF8FB4");
const COLOR_TEXT = new THREE.Color("#F3E07C");

/* ───────── pool ───────── */
const poolVertex = /* glsl */ `
  uniform float uP, uTime, uW, uPixelRatio;
  attribute vec3 aCloud, aRing, aRing2;
  attribute float aSeed, aKeep;
  varying vec3 vColor;
  varying float vAlpha;
  float ss(float a, float b, float x) { return smoothstep(a, b, x); }
  void main() {
    float s = aSeed;
    float eB = ss(0.0, 1.0, (uP - 0.30 - s * 0.12) / 0.26);
    float eC = ss(0.0, 1.0, (uP - 0.62 - s * 0.10) / 0.18);
    float eD = ss(0.0, 1.0, (uP - 0.86) / 0.12);

    vec3 c = aCloud + vec3(sin(uTime * 0.5 + s * 20.0), sin(uTime * 0.35 + s * 13.0), cos(uTime * 0.4 + s * 17.0)) * 0.16;
    float ang = atan(c.z, c.x) + eB * 5.5;
    float rad = length(c.xz) * (1.0 - eB);
    vec3 spiral = vec3(cos(ang) * rad, c.y * (1.0 - eB), sin(ang) * rad);

    vec3 ring = mix(aRing, aRing2, eD);
    vec3 fall = vec3(aCloud.x * 0.35, -3.5 - s * 7.0, aCloud.z * 0.35);
    float kept = step(0.5, aKeep);
    float rejectedLate = step(1.5, aKeep);
    vec3 after = mix(fall, ring, kept);
    // the late rejection drops straight down out of the ring
    after = mix(after, aRing + vec3(0.0, -6.0 * eD, 0.0), rejectedLate);
    vec3 p = mix(spiral, after, eC);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    float sz = mix(1.6 + s * 1.2, 3.2 + s * 1.4, kept * eC);
    gl_PointSize = sz * (40.0 / depth) * uPixelRatio;

    vec3 cloudCol = mix(vec3(0.55, 0.62, 0.95), vec3(0.8, 0.86, 1.0), s);
    vec3 keptCol = vec3(0.86, 0.98, 1.0);
    vec3 redCol = vec3(1.0, 0.35, 0.4);
    vColor = mix(cloudCol, keptCol, kept * eC);
    vColor = mix(vColor, redCol, rejectedLate * eD);

    float a = 0.75;
    a *= mix(1.0, 1.0 - eC, 1.0 - kept);           // rejected fade out after the orb
    a *= mix(1.0, 1.0 - eD, rejectedLate);          // late rejection fades as it falls
    a *= 1.0 - 0.5 * eB * (1.0 - eC);               // dimmer while inside the funnel
    vAlpha = a * uW;
  }
`;
const poolFragment = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

/* ───────── streams ───────── */
const streamVertex = /* glsl */ `
  uniform float uTime, uW, uI, uPixelRatio;
  attribute vec3 aA, aB, aC, aColor;
  attribute float aOffset;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float t = fract(uTime * 0.22 + aOffset);
    vec3 p = mix(mix(aA, aB, t), mix(aB, aC, t), t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.2 + 2.0 * t) * (40.0 / -mv.z) * uPixelRatio;
    vColor = aColor;
    vAlpha = sin(t * 3.14159) * uW * uI;
  }
`;

/* ───────── orb ───────── */
const orbVertex = /* glsl */ `
  varying vec3 vN, vV, vP;
  void main() {
    vP = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const orbFragment = /* glsl */ `
  uniform float uTime, uI, uW;
  uniform vec3 uA, uB, uC;
  varying vec3 vN, vV, vP;
  void main() {
    float fres = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.2);
    float n = sin(vP.x * 5.0 + uTime * 1.4) * sin(vP.y * 5.0 - uTime * 1.1) * sin(vP.z * 5.0 + uTime * 0.9);
    float m = sin(vP.y * 9.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 c = mix(uA, uB, 0.5 + 0.5 * n);
    c = mix(c, uC, m * 0.5);
    c = mix(c, vec3(1.0), fres * 0.6);
    float a = (0.18 + 0.82 * fres) * uI * uW;
    gl_FragColor = vec4(c * (0.8 + uI), a);
  }
`;

function Pool() {
  const ref = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const cloud = new Float32Array(POOL * 3);
    const ring = new Float32Array(POOL * 3);
    const ring2 = new Float32Array(POOL * 3);
    const seed = new Float32Array(POOL);
    const keep = new Float32Array(POOL);
    let s = 11;
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    // which are kept: an even spread through the pool
    const keptIdx: number[] = [];
    for (let i = 0; i < POOL; i++) {
      const isKept = i % Math.floor(POOL / KEEP) === 0 && keptIdx.length < KEEP;
      keep[i] = isKept ? 1 : 0;
      if (isKept) keptIdx.push(i);
    }
    keep[keptIdx[7]] = 2; // the one that gets rejected late
    for (let i = 0; i < POOL; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 4.2;
      cloud.set([Math.cos(a) * r, 0.6 + rand() * 2.7, Math.sin(a) * r], i * 3);
      seed[i] = rand();
    }
    // ring: two concentric rows below the orb; ring2: same ring with the gap closed
    const place = (arr: Float32Array, order: number[]) => {
      order.forEach((idx, k) => {
        const n = order.length;
        const row = k < Math.floor(n * 0.6) ? 0 : 1;
        const inRow = row === 0 ? Math.floor(n * 0.6) : n - Math.floor(n * 0.6);
        const j = row === 0 ? k : k - Math.floor(n * 0.6);
        const ang = (j / inRow) * Math.PI * 2 + row * 0.3;
        const rad = row === 0 ? 2.5 : 1.6;
        arr.set([Math.cos(ang) * rad, -2.1 - row * 0.4, Math.sin(ang) * rad], idx * 3);
      });
    };
    place(ring, keptIdx);
    const without = keptIdx.filter((i) => keep[i] !== 2);
    place(ring2, without);
    // the rejected one keeps its ring position in ring2 (it falls from there)
    const rj = keptIdx[7];
    ring2.set([ring[rj * 3], ring[rj * 3 + 1], ring[rj * 3 + 2]], rj * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(POOL * 3), 3));
    geometry.setAttribute("aCloud", new THREE.BufferAttribute(cloud, 3));
    geometry.setAttribute("aRing", new THREE.BufferAttribute(ring, 3));
    geometry.setAttribute("aRing2", new THREE.BufferAttribute(ring2, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute("aKeep", new THREE.BufferAttribute(keep, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: poolVertex,
      fragmentShader: poolFragment,
      uniforms: { uP: { value: 0 }, uTime: { value: 0 }, uW: { value: 0 }, uPixelRatio: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const u = (ref.current.material as THREE.ShaderMaterial).uniforms;
    u.uP.value = storyProgress("mastermind");
    u.uTime.value = galaxy.reducedMotion ? 0 : state.clock.elapsedTime;
    u.uW.value = storyWeight("mastermind");
    u.uPixelRatio.value = state.gl.getPixelRatio();
    ref.current.visible = u.uW.value > 0.01;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

const sources = [
  { color: COLOR_AUDIO, angle: 95, kind: "audio" as const },
  { color: COLOR_IMAGE, angle: 215, kind: "image" as const },
  { color: COLOR_TEXT, angle: 335, kind: "text" as const },
].map((s) => {
  const r = (s.angle * Math.PI) / 180;
  const pos = new THREE.Vector3(Math.cos(r) * 5.8, 0.8 + Math.sin(r * 2) * 0.4, Math.sin(r) * 5.8);
  const ctrl = pos.clone().multiplyScalar(0.55).add(new THREE.Vector3(0, 2.4, 0));
  return { ...s, pos, ctrl };
});

function Streams() {
  const ref = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const n = sources.length * STREAM_POINTS;
    const A = new Float32Array(n * 3);
    const B = new Float32Array(n * 3);
    const C = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const off = new Float32Array(n);
    let sd = 3;
    const rnd = () => ((sd = (sd * 16807) % 2147483647) - 1) / 2147483646;
    sources.forEach((s, si) => {
      for (let k = 0; k < STREAM_POINTS; k++) {
        const i = si * STREAM_POINTS + k;
        // a little spread so each stream is a ribbon, not a line
        const jitter = new THREE.Vector3((rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.5);
        A.set(s.pos.clone().add(jitter).toArray(), i * 3);
        B.set(s.ctrl.clone().add(jitter).toArray(), i * 3);
        C.set([0, 0, 0], i * 3);
        col.set([s.color.r, s.color.g, s.color.b], i * 3);
        off[i] = k / STREAM_POINTS;
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geometry.setAttribute("aA", new THREE.BufferAttribute(A, 3));
    geometry.setAttribute("aB", new THREE.BufferAttribute(B, 3));
    geometry.setAttribute("aC", new THREE.BufferAttribute(C, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geometry.setAttribute("aOffset", new THREE.BufferAttribute(off, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: streamVertex,
      fragmentShader: poolFragment,
      uniforms: { uTime: { value: 0 }, uW: { value: 0 }, uI: { value: 1 }, uPixelRatio: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const u = (ref.current.material as THREE.ShaderMaterial).uniforms;
    const p = storyProgress("mastermind");
    u.uTime.value = galaxy.reducedMotion ? 0.3 : state.clock.elapsedTime;
    u.uW.value = storyWeight("mastermind");
    // streams run until the pool has gone through, then ease off
    u.uI.value = 1 - smoothstep(0.62, 0.8, p);
    u.uPixelRatio.value = state.gl.getPixelRatio();
    ref.current.visible = u.uW.value > 0.01;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

/** The three signal sources: a waveform, a thumbnail grid, a few lines of caption. */
function Emblem({ kind, color, position }: { kind: "audio" | "image" | "text"; color: THREE.Color; position: THREE.Vector3 }) {
  const group = useRef<THREE.Group>(null);
  const bars = useMemo(() => Array.from({ length: kind === "audio" ? 9 : kind === "image" ? 9 : 4 }, (_, i) => i), [kind]);

  useFrame((state) => {
    if (!group.current) return;
    const w = storyWeight("mastermind") * (1 - smoothstep(0.62, 0.8, storyProgress("mastermind")));
    group.current.visible = w > 0.01;
    const t = galaxy.reducedMotion ? 0 : state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const m = child as THREE.Mesh;
      const mat = m.material as THREE.MeshBasicMaterial;
      if (kind === "audio") {
        m.scale.y = 0.25 + Math.abs(Math.sin(t * 3 + i * 0.9)) * 1.1;
        mat.opacity = 0.9 * w;
      } else if (kind === "image") {
        mat.opacity = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.3))) * w;
      } else {
        mat.opacity = (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.2 - i * 1.1))) * w;
      }
    });
  });

  return (
    <Billboard position={position}>
      <group ref={group}>
        {bars.map((i) => {
          if (kind === "audio") {
            return (
              <mesh key={i} position={[(i - 4) * 0.22, 0, 0]}>
                <boxGeometry args={[0.1, 1, 0.1]} />
                <meshBasicMaterial color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
              </mesh>
            );
          }
          if (kind === "image") {
            return (
              <mesh key={i} position={[((i % 3) - 1) * 0.5, (Math.floor(i / 3) - 1) * 0.5, 0]}>
                <planeGeometry args={[0.4, 0.4]} />
                <meshBasicMaterial color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
              </mesh>
            );
          }
          const len = [1.5, 1.1, 1.4, 0.8][i];
          return (
            <mesh key={i} position={[(len - 1.5) / 2, (1.5 - i) * 0.32, 0]}>
              <boxGeometry args={[len, 0.1, 0.05]} />
              <meshBasicMaterial color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          );
        })}
      </group>
    </Billboard>
  );
}

function Orb() {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: orbVertex,
        fragmentShader: orbFragment,
        uniforms: {
          uTime: { value: 0 },
          uI: { value: 0.3 },
          uW: { value: 0 },
          uA: { value: COLOR_AUDIO },
          uB: { value: COLOR_IMAGE },
          uC: { value: COLOR_TEXT },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const p = storyProgress("mastermind");
    const w = storyWeight("mastermind");
    const u = (mesh.current.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value = galaxy.reducedMotion ? 0 : state.clock.elapsedTime;
    u.uW.value = w;
    const intensity = 0.35 + 0.65 * smoothstep(0.3, 0.62, p) - 0.4 * smoothstep(0.7, 0.9, p);
    u.uI.value = intensity;
    const pulse = galaxy.reducedMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.03;
    mesh.current.scale.setScalar((0.9 + 0.5 * smoothstep(0.3, 0.62, p)) * pulse);
    mesh.current.visible = w > 0.01;
    if (halo.current) {
      halo.current.visible = w > 0.01;
      (halo.current.material as THREE.SpriteMaterial).opacity = 0.35 * intensity * w;
      halo.current.scale.setScalar(6 + 3 * intensity);
    }
  });

  return (
    <group>
      <mesh ref={mesh} material={material}>
        <icosahedronGeometry args={[1.1, 5]} />
      </mesh>
      <sprite ref={halo}>
        <spriteMaterial map={glowTexture()} color="#9fb4ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/** Faint rings tracing the funnel between the pool and the orb. */
function Funnel() {
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const pts: number[] = [];
    const rings = 7;
    for (let r = 0; r < rings; r++) {
      const t = r / (rings - 1);
      const y = 0.4 + t * 3.4;
      const rad = 0.5 + t * 3.9;
      const seg = 72;
      for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * Math.PI * 2;
        const a1 = ((i + 1) / seg) * Math.PI * 2;
        pts.push(Math.cos(a0) * rad, y, Math.sin(a0) * rad, Math.cos(a1) * rad, y, Math.sin(a1) * rad);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const p = storyProgress("mastermind");
    const w = storyWeight("mastermind");
    const m = ref.current.material as THREE.LineBasicMaterial;
    m.opacity = 0.12 * w * (smoothstep(0.2, 0.35, p) - smoothstep(0.7, 0.85, p));
    ref.current.visible = m.opacity > 0.005;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#9fb4ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

export default function MastermindStory() {
  const origin = nodeById("mastermind")!.position;
  const scale = useStoryScale();
  return (
    <group position={origin} scale={scale}>
      <Pool />
      <Streams />
      {sources.map((s) => (
        <Emblem key={s.kind} kind={s.kind} color={s.color} position={s.pos} />
      ))}
      <Orb />
      <Funnel />
    </group>
  );
}
