"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { regionOrder, type RegionId } from "@/content/portfolio";
import { galaxy, setGalaxy } from "./store";
import { registerLenis } from "./scroll";

/**
 * Turns page scroll into a continuous "stop" index for the camera, keeps the
 * active region in sync, tracks the pointer for parallax, and enables smooth
 * scrolling unless the visitor prefers reduced motion.
 */
export default function ScrollDriver() {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const startLenis = () => {
      if (motionQuery.matches || lenis) return;
      lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
      registerLenis(lenis);
    };
    const stopLenis = () => {
      lenis?.destroy();
      lenis = null;
      registerLenis(null);
    };

    const applyMotion = () => {
      setGalaxy({ reducedMotion: motionQuery.matches });
      if (motionQuery.matches) stopLenis();
      else startLenis();
    };
    applyMotion();
    motionQuery.addEventListener("change", applyMotion);

    // Scroll position → stop index. Each region's key point is the scroll
    // offset at which its element's top reaches the top of the viewport.
    let keys: number[] = [];
    const measure = () => {
      keys = regionOrder.map((id, i) => {
        if (i === 0) return 0;
        const el = document.querySelector<HTMLElement>(`[data-region="${id}"]`);
        if (!el) return Number.POSITIVE_INFINITY;
        return el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.12;
      });
    };

    // Elements whose own scroll progress drives a 3D story.
    let stories: { id: RegionId; el: HTMLElement }[] = [];
    const findStories = () => {
      stories = Array.from(document.querySelectorAll<HTMLElement>("[data-story]")).map((el) => ({
        id: el.dataset.region as RegionId,
        el,
      }));
    };

    // In a story region the camera holds for the first part of the scroll
    // while the set piece plays, then travels on in the remainder.
    const STORY_HOLD = 0.62;
    const storyIds = () => new Set(stories.map((s) => s.id));

    const update = () => {
      const y = window.scrollY;
      const isStory = storyIds();
      let stop = 0;
      for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i];
        const b = keys[i + 1];
        if (y >= b) {
          stop = i + 1;
          continue;
        }
        if (y > a) {
          let f = (y - a) / (b - a);
          const id = regionOrder[i];
          if (isStory.has(id)) {
            galaxy.progress[id] = Math.min(f / STORY_HOLD, 1);
            f = Math.max(0, (f - STORY_HOLD) / (1 - STORY_HOLD));
          }
          stop = i + f;
        }
        break;
      }
      // stories not currently being scrolled are at 0 (before) or 1 (after)
      stories.forEach((s) => {
        const i = regionOrder.indexOf(s.id);
        if (stop <= i - 0.001) galaxy.progress[s.id] = 0;
        else if (stop >= i + 0.001) galaxy.progress[s.id] = 1;
      });
      galaxy.stop = stop;
      const active = regionOrder[Math.min(Math.round(stop - 0.2), regionOrder.length - 1)] as RegionId;
      setGalaxy({ region: active ?? "intro" });
    };

    findStories();
    measure();
    update();

    const onResize = () => {
      findStories();
      measure();
      update();
    };
    galaxy.pointer.x = 0;
    galaxy.pointer.y = -4; // off-screen until the pointer moves
    const onPointer = (e: PointerEvent) => {
      galaxy.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      galaxy.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      galaxy.pointer.y = -4;
    };
    document.addEventListener("pointerleave", onLeave);

    // Content can change height after fonts load; re-measure then.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      motionQuery.removeEventListener("change", applyMotion);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      stopLenis();
    };
  }, []);

  return null;
}
