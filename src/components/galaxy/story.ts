import { regionOrder, type RegionId } from "@/content/portfolio";
import { galaxy } from "./store";

/**
 * How present a region's set piece is right now: 1 while the camera sits at
 * that stop, fading to 0 half a stop away.
 */
export function storyWeight(id: RegionId) {
  const i = regionOrder.indexOf(id);
  return Math.min(Math.max(1 - Math.abs(galaxy.stop - i) / 0.5, 0), 1);
}

/** 0..1 progress through a story region's own scroll length. */
export function storyProgress(id: RegionId) {
  return galaxy.progress[id] ?? 0;
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
