/**
 * Tiny shared state between the DOM (scroll, hover on skill lists) and the
 * WebGL scene. Per-frame values (scroll position, pointer) are read directly
 * from the mutable object inside useFrame; discrete changes (active region,
 * hovered star) notify React subscribers.
 */
import { useSyncExternalStore } from "react";
import type { RegionId } from "@/content/portfolio";

type State = {
  /** continuous scroll stop index, e.g. 2.4 = between stop 2 and 3 */
  stop: number;
  /** 0..1 progress through each region's own element (for pinned stories) */
  progress: Partial<Record<RegionId, number>>;
  region: RegionId;
  hovered: string | null;
  selected: string | null;
  pointer: { x: number; y: number };
  reducedMotion: boolean;
  /** boot sequence finished; the name may assemble */
  booted: boolean;
  /** WebGL available and the canvas mounted */
  webgl: boolean;
  /** Konami-code "DLQ chaos mode" until this timestamp (ms) */
  chaosUntil: number;
  /** pointer is over something grabbable in the scene */
  grabbing: boolean;
  /** 0 while the name is formed, 1 once it has scattered into the galaxy */
  heroMorph: number;
};

export const galaxy: State = {
  stop: 0,
  progress: {},
  region: "intro",
  hovered: null,
  selected: null,
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
  booted: false,
  webgl: false,
  chaosUntil: 0,
  grabbing: false,
  heroMorph: 0,
};

const listeners = new Set<() => void>();
let version = 0;

export function setGalaxy(patch: Partial<Omit<State, "stop" | "pointer" | "progress" | "heroMorph">>) {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof typeof patch)[]) {
    if (galaxy[k] !== patch[k]) {
      (galaxy as Record<string, unknown>)[k] = patch[k];
      changed = true;
    }
  }
  if (changed) {
    version++;
    listeners.forEach((l) => l());
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Re-renders when any discrete value changes; select what you need. */
export function useGalaxy<T>(select: (s: State) => T): T {
  const v = useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  void v;
  return select(galaxy);
}

export const isChaos = () => galaxy.chaosUntil > performance.now();
