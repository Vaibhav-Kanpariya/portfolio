/**
 * Builds the galaxy's graph: where every star sits, which stars are linked,
 * and where the camera goes for each scroll stop.
 *
 * Positions are deterministic (seeded), so the server, client, and every
 * visitor see the same sky. Skills sit in clusters by domain; projects and
 * jobs sit at the centroid of what they use — the same idea as an embedding
 * space, where related things land near each other.
 */
import {
  career,
  clusters,
  projects,
  regionOrder,
  skills,
  type ClusterId,
  type RegionId,
} from "@/content/portfolio";

export type Vec3 = [number, number, number];

export type NodeKind = "skill" | "project" | "job";

export type GalaxyNode = {
  id: string;
  label: string;
  kind: NodeKind;
  color: string;
  position: Vec3;
  size: number;
  cluster?: ClusterId;
  section?: string;
  sub?: string;
};

export type GalaxyEdge = { a: number; b: number; kind: "uses" | "career" | "track" };

export type RegionView = {
  id: RegionId;
  camera: Vec3;
  target: Vec3;
  /** node ids whose labels and edges light up at this stop */
  focus: string[];
  showClusterLabels?: boolean;
  showAllSkillLabels?: boolean;
};

/* ───────── seeded random ───────── */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────── cluster centres on the disk ───────── */
const clusterAngles: Record<ClusterId, { angle: number; radius: number; y: number }> = {
  ai: { angle: 18, radius: 13, y: 1.2 },
  cloud: { angle: 92, radius: 14.5, y: -0.6 },
  backend: { angle: 168, radius: 13.5, y: 0.4 },
  frontend: { angle: 238, radius: 14, y: -0.8 },
  observability: { angle: 304, radius: 12.5, y: 0.6 },
};

export const clusterCenters = Object.fromEntries(
  (Object.keys(clusterAngles) as ClusterId[]).map((id) => {
    const { angle, radius, y } = clusterAngles[id];
    const r = (angle * Math.PI) / 180;
    return [id, [Math.cos(r) * radius, y, Math.sin(r) * radius] as Vec3];
  }),
) as Record<ClusterId, Vec3>;

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const centroid = (pts: Vec3[]): Vec3 =>
  scale(
    pts.reduce((acc, p) => add(acc, p), [0, 0, 0] as Vec3),
    1 / Math.max(pts.length, 1),
  );

function buildGraph() {
  const rand = mulberry32(20231108);
  const nodes: GalaxyNode[] = [];
  const index = new Map<string, number>();

  const push = (n: GalaxyNode) => {
    index.set(n.id, nodes.length);
    nodes.push(n);
  };

  // Skills: scattered inside their cluster, golden-angle spiral + jitter so
  // stars never overlap.
  const perCluster: Record<string, number> = {};
  for (const s of skills) {
    const k = (perCluster[s.cluster] = (perCluster[s.cluster] ?? 0) + 1) - 1;
    const c = clusterCenters[s.cluster];
    const r = 1.3 + Math.sqrt(k) * 1.25 + rand() * 0.5;
    const a = k * 2.39996 + rand() * 0.6;
    const pos: Vec3 = [
      c[0] + Math.cos(a) * r,
      c[1] + (rand() - 0.5) * 2.4,
      c[2] + Math.sin(a) * r,
    ];
    push({
      id: s.id,
      label: s.label,
      kind: "skill",
      color: clusters[s.cluster].color,
      position: pos,
      size: 0.55 + rand() * 0.25,
      cluster: s.cluster,
    });
  }

  // Projects: centroid of what they use, lifted slightly off the disk.
  for (const p of projects) {
    const pts = p.uses.map((u) => nodes[index.get(u)!].position);
    const c = centroid(pts);
    // pull a little toward the dominant cluster so projects don't all collapse to the middle
    const pos: Vec3 = [c[0] * 1.15, c[1] + 2.2 + rand() * 0.8, c[2] * 1.15];
    push({
      id: p.id,
      label: p.label,
      kind: "project",
      color: "#F2F5FF",
      position: pos,
      size: 1.25,
      section: p.section,
      sub: p.kind,
    });
  }

  // Jobs: centroid of their links, lifted higher — the career track floats
  // above the disk like a flight path.
  for (const j of career) {
    const pts = j.links.map((u) => nodes[index.get(u)!].position);
    const c = centroid(pts);
    push({
      id: j.id,
      label: j.label,
      kind: "job",
      color: "#52E3F2",
      position: [c[0] * 1.05, c[1] + 6.5, c[2] * 1.05],
      size: 1.05,
      section: j.region,
      sub: `${j.start} – ${j.end}`,
    });
  }

  const edges: GalaxyEdge[] = [];
  for (const p of projects) {
    for (const u of p.uses) edges.push({ a: index.get(u)!, b: index.get(p.id)!, kind: "uses" });
  }
  for (const j of career) {
    for (const l of j.links) edges.push({ a: index.get(l)!, b: index.get(j.id)!, kind: "career" });
  }
  for (let i = 0; i < career.length - 1; i++) {
    edges.push({ a: index.get(career[i].id)!, b: index.get(career[i + 1].id)!, kind: "track" });
  }

  return { nodes, edges, index };
}

export const graph = buildGraph();

export function nodeById(id: string) {
  const i = graph.index.get(id);
  return i === undefined ? undefined : graph.nodes[i];
}

/** ids directly linked to the given node */
export function neighbours(id: string): string[] {
  const i = graph.index.get(id);
  if (i === undefined) return [];
  const out: string[] = [];
  for (const e of graph.edges) {
    if (e.a === i) out.push(graph.nodes[e.b].id);
    else if (e.b === i) out.push(graph.nodes[e.a].id);
  }
  return out;
}

/* ───────── camera stops ───────── */

/**
 * Camera sits outside the focus point. It's swung sideways off the
 * centre line (by `swing` degrees) so the bright galactic core lands on the
 * left of the frame, behind the text column, instead of directly behind the
 * star being shown. Multi-star views back off far enough to fit them all.
 */
function orbitView(
  focusIds: string[],
  distance: number,
  lift = 0.45,
  swing = 48,
): { camera: Vec3; target: Vec3 } {
  const pts = focusIds.map((id) => nodeById(id)!.position);
  const target = centroid(pts);
  const spread = Math.max(0, ...pts.map((p) => len([p[0] - target[0], p[1] - target[1], p[2] - target[2]])));
  const d = Math.max(distance, spread * 1.9);
  const u = norm([target[0], 0, target[2]]);
  const v: Vec3 = [-u[2], 0, u[0]];
  const t = (swing * Math.PI) / 180;
  const dir = norm(add(scale(u, Math.cos(t)), scale(v, Math.sin(t))));
  const camera = add(target, add(scale(dir, d), [0, d * lift, 0]));
  return { camera, target };
}

function withNeighbours(id: string) {
  return [id, ...neighbours(id)];
}

export function buildRegions(): Record<RegionId, RegionView> {
  const r: Partial<Record<RegionId, RegionView>> = {};

  r.intro = {
    id: "intro",
    camera: [4, 17, 37],
    target: [0, -1.5, 0],
    focus: [],
    showClusterLabels: false,
  };

  const impactFocus = ["culturex", "influenzer", "analytics", "mixpanel", "posthog", "ga", "node", "mysql"];
  r.impact = { id: "impact", ...orbitView(["influenzer", "analytics"], 15, 0.5), focus: impactFocus };

  for (const j of career) {
    const id = j.region as RegionId;
    r[id] = { id, ...orbitView([j.id], 12, 0.55), focus: [j.id, ...j.links] };
  }

  r.mastermind = { id: "mastermind", ...orbitView(["mastermind"], 16, 0.3), focus: withNeighbours("mastermind") };
  r.ntn = { id: "ntn", ...orbitView(["ntn"], 14, 0.2), focus: withNeighbours("ntn") };

  // the skills pile sits on a tray far below the disk; the camera dives to it
  r.skills = {
    id: "skills",
    camera: [1, -14.5, 16.5],
    target: [1.5, -20.6, 0],
    focus: [],
    showAllSkillLabels: false,
    showClusterLabels: false,
  };

  r.contact = {
    id: "contact",
    camera: [-30, 14, -34],
    target: [0, 2, 0],
    focus: ["culturex", "mastermind", "ntn"],
    showClusterLabels: true,
  };

  return regionOrder.reduce(
    (acc, id) => ({ ...acc, [id]: r[id]! }),
    {} as Record<RegionId, RegionView>,
  );
}

export const regions = buildRegions();
