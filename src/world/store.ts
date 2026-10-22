/**
 * Shared state for the drivable world. Per-frame values (input, car pose)
 * live on the mutable object and are read inside useFrame; discrete changes
 * (phase, open panel) notify React.
 */
import { useSyncExternalStore } from "react";
import * as THREE from "three";

export type Phase = "loading" | "intro" | "play";

export type Input = {
  forward: number; // -1..1
  steer: number; // -1..1 (left positive)
  brake: boolean;
  boost: boolean;
};

type State = {
  phase: Phase;
  panel: string | null;
  /** zone the car is currently inside, for the HUD hint */
  zone: string | null;
  touch: boolean;
  resetCount: number;
  input: Input;
  /** last known car pose, for the camera, the sun and the HUD */
  car: { position: THREE.Vector3; quaternion: THREE.Quaternion; speed: number };
  reducedMotion: boolean;
  horn: number;
};

export const world: State = {
  phase: "loading",
  panel: null,
  zone: null,
  touch: false,
  resetCount: 0,
  input: { forward: 0, steer: 0, brake: false, boost: false },
  car: { position: new THREE.Vector3(0, 1, -16), quaternion: new THREE.Quaternion(), speed: 0 },
  reducedMotion: false,
  horn: 0,
};

const listeners = new Set<() => void>();
let version = 0;

export function setWorld(patch: Partial<Pick<State, "phase" | "panel" | "zone" | "touch" | "resetCount" | "reducedMotion" | "horn">>) {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof typeof patch)[]) {
    if (world[k] !== patch[k]) {
      (world as Record<string, unknown>)[k] = patch[k];
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

export function useWorld<T>(select: (s: State) => T): T {
  const v = useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  void v;
  return select(world);
}

export const resetCar = () => setWorld({ resetCount: world.resetCount + 1 });
