"use client";

import { useEffect, useState } from "react";
import { setGalaxy } from "@/components/galaxy/store";

const lines = [
  "spawning agent vaibhav",
  "connecting to queue … ok",
  "loading 2,000 creator embeddings … ok",
  "GET /portfolio → 200 OK",
];

/**
 * A one-second boot sequence before the name assembles. Skipped on repeat
 * visits in the same session and for visitors who prefer reduced motion.
 */
export default function Boot() {
  const [shown, setShown] = useState<number>(0);
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("booted") === "1";
    } catch {
      /* storage unavailable */
    }
    if (reduced || seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      setGalaxy({ booted: true });
      return;
    }
    setVisible(true);
    const timers: number[] = [];
    lines.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 180 + i * 230)));
    timers.push(
      window.setTimeout(() => {
        setVisible(false);
        setGalaxy({ booted: true });
        try {
          sessionStorage.setItem("booted", "1");
        } catch {
          /* ignore */
        }
      }, 180 + lines.length * 230 + 420),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  if (visible === null) return <div aria-hidden="true" className="fixed inset-0 z-50 bg-void" />;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex items-end bg-void px-6 pb-10 transition-opacity duration-500 min-[960px]:px-[5vw] ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ol className="font-mono text-[0.85rem] leading-7 text-dust">
        {lines.slice(0, shown).map((l) => (
          <li key={l}>
            <span className="text-signal">›</span> {l}
          </li>
        ))}
        {visible && shown < lines.length && (
          <li>
            <span className="inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-pulse bg-signal" />
          </li>
        )}
      </ol>
    </div>
  );
}
