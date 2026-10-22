"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a figure like "100K+", "1.2M+", "35%" or "2,000+" up from zero the
 * first time it scrolls into view. Ranges ("100–200") are shown as they are.
 */
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m || /[–-]/.test(value)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = (num.split(".")[1] ?? "").length;
    const grouped = num.includes(",");
    const fmt = (n: number) =>
      pre + (grouped ? Math.round(n).toLocaleString("en-US") : n.toFixed(decimals)) + post;

    let raf = 0;
    let started = false;
    const run = () => {
      const t0 = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const t = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        setText(fmt(target * e));
        if (t < 1) raf = requestAnimationFrame(tick);
        else setText(value);
      };
      raf = requestAnimationFrame(tick);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(fmt(0));
    const io = new IntersectionObserver(
      (entries) => {
        if (!started && entries.some((e) => e.isIntersecting)) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
