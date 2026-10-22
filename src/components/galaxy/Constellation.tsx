"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { clusters, type ClusterId } from "@/content/portfolio";
import { clusterCenters, graph, neighbours, regions, type GalaxyNode } from "./layout";
import { galaxy, isChaos, setGalaxy, useGalaxy } from "./store";
import { scrollToId } from "./scroll";
import { storyWeight } from "./story";
import { glowTexture } from "./glow";

/* ───────── which stars are lit right now ───────── */
const neighbourCache = new Map<string, Set<string>>();
function neighbourSet(id: string) {
  let s = neighbourCache.get(id);
  if (!s) {
    s = new Set([id, ...neighbours(id)]);
    neighbourCache.set(id, s);
  }
  return s;
}
const regionFocus = Object.fromEntries(
  Object.values(regions).map((r) => [r.id, new Set(r.focus)]),
) as Record<string, Set<string>>;

function litSet(): Set<string> | null {
  const pick = galaxy.hovered ?? galaxy.selected;
  if (pick) return neighbourSet(pick);
  const f = regionFocus[galaxy.region];
  return f && f.size ? f : null;
}

/* ───────── one star ───────── */
const nearTmp = new THREE.Vector3();

function Star({ node, texture }: { node: GalaxyNode; texture: THREE.Texture }) {
  const core = useRef<THREE.Sprite>(null);
  const halo = useRef<THREE.Sprite>(null);
  const base = node.size * 2.4;
  const isBig = node.kind !== "skill";

  useFrame(({ camera }, delta) => {
    const lit = litSet();
    const on = !lit || lit.has(node.id);
    const isHover = galaxy.hovered === node.id || galaxy.selected === node.id;
    const targetScale = base * (isHover ? 1.7 : lit && on ? 1.25 : 1);
    // stars stay quiet behind the name until it scatters, and a star steps
    // aside while its own set piece plays
    let hero = 0.18 + 0.82 * galaxy.heroMorph;
    if (node.id === "mastermind") hero *= 1 - storyWeight("mastermind");
    if (node.id === "ntn") hero *= 1 - storyWeight("ntn");
    // a star right in front of the lens would be a blurry blob; fade it out
    const d = camera.position.distanceTo(core.current?.getWorldPosition(nearTmp) ?? nearTmp);
    hero *= THREE.MathUtils.smoothstep(d, 3, 9);
    const targetOpacity = (on ? 1 : 0.28) * hero;
    const k = 1 - Math.exp(-delta * 6);
    if (core.current) {
      const s = THREE.MathUtils.lerp(core.current.scale.x, targetScale, k);
      core.current.scale.setScalar(s);
      const m = core.current.material as THREE.SpriteMaterial;
      m.opacity = THREE.MathUtils.lerp(m.opacity, targetOpacity, k);
    }
    if (halo.current) {
      const m = halo.current.material as THREE.SpriteMaterial;
      m.opacity = THREE.MathUtils.lerp(m.opacity, (on ? 0.14 : 0.04) * hero, k);
    }
  });

  return (
    <group position={node.position}>
      {isBig && (
        <sprite ref={halo} scale={base * 2.6}>
          <spriteMaterial
            map={texture}
            color={node.color}
            transparent
            opacity={0.14}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}
      <sprite
        ref={core}
        scale={base}
        onPointerOver={(e) => {
          e.stopPropagation();
          setGalaxy({ hovered: node.id });
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (galaxy.hovered === node.id) setGalaxy({ hovered: null });
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (node.section) scrollToId(node.section);
          else setGalaxy({ selected: galaxy.selected === node.id ? null : node.id });
        }}
      >
        <spriteMaterial
          map={texture}
          color={node.color}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ───────── labels (DOM, so text stays crisp and accessible to zoom) ───────── */
function Labels() {
  const { region, hovered, selected } = useGalaxy((s) => ({
    region: s.region,
    hovered: s.hovered,
    selected: s.selected,
  }));
  const view = regions[region];
  const pick = hovered ?? selected;
  const visible = pick ? neighbourSet(pick) : regionFocus[region];

  return (
    <>
      {graph.nodes.map((n) => {
        // a set piece replaces its own star, so that label steps aside too
        const inStory =
          (region === "mastermind" && (n.id === "mastermind" || n.id === "agents")) ||
          (region === "ntn" && (n.id === "ntn" || n.id === "agents"));
        const show = !inStory && (visible.has(n.id) || (view.showAllSkillLabels && n.kind === "skill"));
        const strong = n.id === pick || (n.kind !== "skill" && show);
        return (
          <Html
            key={n.id}
            position={n.position}
            center
            zIndexRange={[10, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              className="star-label"
              data-visible={show ? "true" : "false"}
              data-strong={strong ? "true" : "false"}
              data-kind={n.kind}
            >
              <span className="star-label__name">{n.label}</span>
              {n.sub && n.kind !== "skill" && <span className="star-label__sub">{n.sub}</span>}
            </div>
          </Html>
        );
      })}
      {(Object.keys(clusterCenters) as ClusterId[]).map((id) => {
        const c = clusterCenters[id];
        return (
          <Html
            key={`cluster-${id}`}
            position={[c[0], c[1] - 3.2, c[2]]}
            center
            zIndexRange={[9, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              className="cluster-label"
              data-visible={view.showClusterLabels && !pick ? "true" : "false"}
              style={{ color: clusters[id].color }}
            >
              {clusters[id].label}
            </div>
          </Html>
        );
      })}
    </>
  );
}

/* ───────── links between stars ───────── */
const edgeVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const edgeFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() { gl_FragColor = vec4(vColor, vAlpha); }
`;

function Edges() {
  const { geometry, material } = useMemo(() => {
    const n = graph.edges.length;
    const pos = new Float32Array(n * 6);
    const col = new Float32Array(n * 6);
    const alpha = new Float32Array(n * 2);
    const c = new THREE.Color();
    graph.edges.forEach((e, i) => {
      const a = graph.nodes[e.a];
      const b = graph.nodes[e.b];
      pos.set(a.position, i * 6);
      pos.set(b.position, i * 6 + 3);
      c.set(a.color);
      col.set([c.r, c.g, c.b], i * 6);
      c.set(e.kind === "track" ? "#52E3F2" : b.color);
      col.set([c.r, c.g, c.b], i * 6 + 3);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    const alphaAttr = new THREE.BufferAttribute(alpha, 1);
    alphaAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aAlpha", alphaAttr);
    const material = new THREE.ShaderMaterial({
      vertexShader: edgeVertex,
      fragmentShader: edgeFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, []);

  const ref = useRef<THREE.LineSegments>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const alpha = ref.current.geometry.getAttribute("aAlpha") as THREE.BufferAttribute;
    const lit = litSet();
    const pick = galaxy.hovered ?? galaxy.selected;
    const view = regions[galaxy.region];
    const k = 1 - Math.exp(-delta * 5);
    const hero = 0.15 + 0.85 * galaxy.heroMorph;
    const arr = alpha.array as Float32Array;
    graph.edges.forEach((e, i) => {
      const a = graph.nodes[e.a].id;
      const b = graph.nodes[e.b].id;
      let t = e.kind === "track" ? 0.35 : 0.045;
      if (view.showAllSkillLabels && e.kind === "uses") t = 0.12;
      if (lit && lit.has(a) && lit.has(b)) t = 0.5;
      if (pick && (a === pick || b === pick)) t = 0.85;
      const v = THREE.MathUtils.lerp(arr[i * 2], t * hero, k);
      arr[i * 2] = v;
      arr[i * 2 + 1] = v;
    });
    alpha.needsUpdate = true;
  });

  return <lineSegments ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

/* ───────── packets: events flowing along lit links ───────── */
const packetVertex = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = 5.0 * uPixelRatio * (30.0 / -mv.z) + 1.5;
    vAlpha = aAlpha;
  }
`;
const packetFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(0.75, 0.97, 1.0, a * vAlpha);
  }
`;

const PACKETS = 72;

function Packets() {
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const pos = new THREE.BufferAttribute(new Float32Array(PACKETS * 3), 3);
    const alpha = new THREE.BufferAttribute(new Float32Array(PACKETS), 1);
    pos.setUsage(THREE.DynamicDrawUsage);
    alpha.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", pos);
    geometry.setAttribute("aAlpha", alpha);
    const material = new THREE.ShaderMaterial({
      vertexShader: packetVertex,
      fragmentShader: packetFragment,
      uniforms: { uPixelRatio: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, []);

  const ref = useRef<THREE.Points>(null);
  const active = useRef<number[]>([]);
  const key = useRef("");

  useFrame((state) => {
    const points = ref.current;
    if (!points) return;
    (points.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    const pos = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const alpha = points.geometry.getAttribute("aAlpha") as THREE.BufferAttribute;
    const lit = litSet();
    const k = `${galaxy.region}|${galaxy.hovered}|${galaxy.selected}`;
    if (k !== key.current) {
      key.current = k;
      active.current = lit
        ? graph.edges
            .map((e, i) => ({ e, i }))
            .filter(({ e }) => lit.has(graph.nodes[e.a].id) && lit.has(graph.nodes[e.b].id))
            .map(({ i }) => i)
        : [];
    }
    const list = active.current;
    const p = pos.array as Float32Array;
    const al = alpha.array as Float32Array;
    const t = galaxy.reducedMotion ? 0 : state.clock.elapsedTime;
    for (let i = 0; i < PACKETS; i++) {
      if (!list.length || galaxy.reducedMotion) {
        al[i] = 0;
        continue;
      }
      const edge = graph.edges[list[i % list.length]];
      const a = graph.nodes[edge.a].position;
      const b = graph.nodes[edge.b].position;
      const phase = (i * 0.61803) % 1;
      const f = (t * (isChaos() ? 2.2 : 0.32) + phase) % 1;
      p[i * 3] = a[0] + (b[0] - a[0]) * f;
      p[i * 3 + 1] = a[1] + (b[1] - a[1]) * f;
      p[i * 3 + 2] = a[2] + (b[2] - a[2]) * f;
      // fade in at the source, out at the destination
      al[i] = Math.sin(f * Math.PI) * (i < list.length * 2 ? 0.9 : 0);
    }
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

/* ───────── galactic core ───────── */
// Bright from afar; dims as the camera comes in close so it never washes
// out the star being shown.
function Core({ texture }: { texture: THREE.Texture }) {
  const ref = useRef<THREE.Sprite>(null);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const d = camera.position.length();
    const m = ref.current.material as THREE.SpriteMaterial;
    m.opacity = THREE.MathUtils.clamp((d - 14) / 40, 0.08, 0.5) * (0.3 + 0.7 * galaxy.heroMorph);
  });
  return (
    <sprite ref={ref} scale={13}>
      <spriteMaterial map={texture} color="#F6D9B8" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

export default function Constellation() {
  const texture = useMemo(() => glowTexture(), []);
  return (
    <group>
      <Core texture={texture} />
      <Edges />
      <Packets />
      {graph.nodes.map((n) => (
        <Star key={n.id} node={n} texture={texture} />
      ))}
      <Labels />
    </group>
  );
}
