"use client";

import { useEffect, useRef, useState } from "react";
import type { RegionId } from "@/content/portfolio";
import { galaxy } from "@/components/galaxy/store";

/**
 * One line that changes as a story region's set piece advances.
 * `stages` are [progress threshold, text] pairs in ascending order.
 */
export default function StoryCaption({
  region,
  stages,
  className = "",
}: {
  region: RegionId;
  stages: [number, string][];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = galaxy.progress[region] ?? 0;
      let i = 0;
      for (let k = 0; k < stages.length; k++) if (p >= stages[k][0]) i = k;
      if (i !== last.current) {
        last.current = i;
        setIndex(i);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [region, stages]);

  return (
    <p className={`relative ${className}`} aria-live="polite">
      {stages.map(([, text], i) => (
        <span
          key={text}
          className={`block transition-opacity duration-500 ${i === index ? "opacity-100" : "absolute inset-0 opacity-0"}`}
          aria-hidden={i !== index}
        >
          {text}
        </span>
      ))}
    </p>
  );
}
