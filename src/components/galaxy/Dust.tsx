"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { galaxy, isChaos } from "./store";
import { pointerOnNamePlane, sampleNamePoints, waitForDisplayFont } from "./namePoints";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSpin;      // rotation of the galaxy layout
  uniform float uAssemble;  // 0 = scattered, 1 = letters formed
  uniform float uMorph;     // 0 = letters, 1 = galaxy
  uniform vec3  uPointer;   // pointer on the name plane, world space
  uniform float uPointerOn;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute vec3 aText;     // position in the letters (or zero)
  attribute float aHasText; // 1 if this particle is part of a letter
  attribute vec3 aScatter;  // where it starts before assembling
  varying vec3 vColor;
  varying float vAlpha;

  float ease(float t) { t = clamp(t, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }

  void main() {
    // galaxy position, spun slowly
    float c = cos(uSpin), s = sin(uSpin);
    vec3 g = vec3(position.x * c - position.z * s, position.y, position.x * s + position.z * c);

    // letters: assemble from scatter, then feel the pointer
    vec3 t = mix(aScatter, aText, ease((uAssemble - aSeed * 0.3) / 0.7));
    vec3 d = t - uPointer;
    float dist = length(d);
    float push = smoothstep(3.2, 0.0, dist) * uPointerOn;
    t += normalize(d + vec3(0.0, 0.0001, 0.0)) * push * 2.4;
    t.z += sin(uTime * 1.3 + aSeed * 20.0) * 0.08; // letters breathe a little

    // morph letters -> galaxy in a wave, with a bulge along the way
    float m = ease((uMorph - aSeed * 0.35) / 0.65);
    vec3 p = mix(t, g, m);
    p += vec3(sin(aSeed * 12.0), cos(aSeed * 9.0), sin(aSeed * 5.0)) * sin(m * 3.14159) * (2.0 + aSeed * 4.0);
    // particles with no letter to form only exist in the galaxy
    p = mix(g, p, aHasText);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float twinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 40.0);
    float depth = -mv.z;
    float galaxySize = min(aSize * (60.0 / depth) * twinkle, 4.5);
    float textSize = (2.6 + aSeed * 1.2) * (60.0 / depth);
    gl_PointSize = mix(textSize, galaxySize, m) * uPixelRatio;

    vec3 letterColor = mix(vec3(0.82, 0.9, 1.0), vec3(1.0), aSeed);
    vColor = mix(letterColor, aColor, m);
    float letterAlpha = aHasText * ease(uAssemble - aSeed * 0.3) * (1.1 + 0.2 * twinkle);
    float galaxyAlpha = twinkle * smoothstep(1.5, 7.0, depth);
    vAlpha = mix(letterAlpha, galaxyAlpha, m);
    // non-letter particles fade in with the morph
    vAlpha = mix(galaxyAlpha * ease(uMorph * 1.6), vAlpha, aHasText);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha * 0.85);
  }
`;

function seededRandom(start: number) {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const smooth = (t: number) => {
  t = Math.min(Math.max(t, 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * The galaxy's dust. On arrival the particles assemble into the visitor's
 * first words — the name — then scatter into the spiral as they scroll.
 */
export default function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const scatter = new Float32Array(count * 3);

    const inner = new THREE.Color("#F6D9B8");
    const mid = new THREE.Color("#8C9BFF");
    const outer = new THREE.Color("#3B4F9E");
    const tmp = new THREE.Color();

    const rand = seededRandom(7);
    const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;

    const arms = 3;
    const radius = 42;
    for (let i = 0; i < count; i++) {
      const r = Math.pow(rand(), 1.6) * radius;
      const arm = ((i % arms) / arms) * Math.PI * 2;
      const spin = r * 0.12;
      const sc = 0.6 + r * 0.09;
      const a = arm + spin;
      const x = Math.cos(a) * r + gauss() * sc;
      const z = Math.sin(a) * r + gauss() * sc;
      const y = gauss() * (1.6 - (r / radius) * 0.9);
      positions.set([x, y, z], i * 3);

      const t = r / radius;
      if (t < 0.35) tmp.copy(inner).lerp(mid, t / 0.35);
      else tmp.copy(mid).lerp(outer, (t - 0.35) / 0.65);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);

      sizes[i] = 0.6 + rand() * 1.6 + (rand() > 0.985 ? 2.5 : 0);
      seeds[i] = rand();
      // scatter: a wide shell around the origin, so letters condense from everywhere
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      const rr = 40 + rand() * 30;
      scatter.set([Math.sin(ph) * Math.cos(th) * rr, Math.cos(ph) * rr * 0.6, Math.sin(ph) * Math.sin(th) * rr], i * 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    geometry.setAttribute("aText", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aHasText", new THREE.BufferAttribute(new Float32Array(count), 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uSpin: { value: 0 },
        uAssemble: { value: 0 },
        uMorph: { value: 0 },
        uPointer: { value: new THREE.Vector3(0, 9999, 0) },
        uPointerOn: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, [count]);

  // Fill the letter targets whenever the viewport changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await waitForDisplayFont();
      if (cancelled || !ref.current) return;
      // must match the view offset CameraRig applies
      const wide = size.width >= 960;
      const { points, count: n } = sampleNamePoints(
        size.width,
        size.height,
        Math.min(count, 7000),
        wide ? -size.width * 0.13 : 0,
        wide ? 0 : size.height * 0.16,
      );
      const geo = ref.current.geometry;
      const text = geo.getAttribute("aText") as THREE.BufferAttribute;
      const has = geo.getAttribute("aHasText") as THREE.BufferAttribute;
      const t = text.array as Float32Array;
      const h = has.array as Float32Array;
      for (let i = 0; i < count; i++) {
        if (i < n) {
          t[i * 3] = points[i * 3];
          t[i * 3 + 1] = points[i * 3 + 1];
          t[i * 3 + 2] = points[i * 3 + 2];
          h[i] = 1;
        } else {
          h[i] = 0;
        }
      }
      text.needsUpdate = true;
      has.needsUpdate = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [size.width, size.height, count]);

  const pointerWorld = useMemo(() => new THREE.Vector3(), []);
  const assembleStart = useRef<number | null>(null);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;
    const u = (points.material as THREE.ShaderMaterial).uniforms;
    const reduced = galaxy.reducedMotion;
    const t = state.clock.elapsedTime;
    u.uTime.value = reduced ? 0 : t;
    u.uPixelRatio.value = state.gl.getPixelRatio();

    const spinRate = isChaos() ? 0.25 : 0.006;
    if (!reduced) u.uSpin.value += delta * spinRate;

    // assemble after boot, over ~1.8s
    if (galaxy.booted && assembleStart.current === null) assembleStart.current = t;
    const target = assembleStart.current === null ? 0 : reduced ? 1 : Math.min(1, (t - assembleStart.current) / 1.8);
    u.uAssemble.value = target;

    // morph with the first scroll stop
    const morphTarget = smooth(galaxy.stop / 0.55);
    u.uMorph.value = reduced ? morphTarget : THREE.MathUtils.lerp(u.uMorph.value, morphTarget, 1 - Math.exp(-delta * 6));
    galaxy.heroMorph = u.uMorph.value;

    // pointer on the name plane, only while letters are visible
    const lettersVisible = u.uMorph.value < 0.9 && !reduced;
    if (lettersVisible && pointerOnNamePlane(camera, galaxy.pointer.x, galaxy.pointer.y, pointerWorld)) {
      (u.uPointer.value as THREE.Vector3).lerp(pointerWorld, 1 - Math.exp(-delta * 10));
      u.uPointerOn.value = THREE.MathUtils.lerp(u.uPointerOn.value, 1, 1 - Math.exp(-delta * 4));
    } else {
      u.uPointerOn.value = THREE.MathUtils.lerp(u.uPointerOn.value, 0, 1 - Math.exp(-delta * 4));
    }
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
