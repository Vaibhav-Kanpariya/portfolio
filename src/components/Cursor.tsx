"use client";

import { useEffect, useRef } from "react";
import { galaxy } from "@/components/galaxy/store";

/**
 * A small ring that trails the pointer on devices with a mouse or trackpad.
 * It opens up over anything clickable and closes to a dot while a block is
 * being dragged. Text fields keep the native caret.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ring.current;
    if (!fine || reduced || !el) return;

    document.documentElement.classList.add("has-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let shown = false;
    let raf = 0;

    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("a, button, [role='button'], summary, label, select");
    const isText = (t: EventTarget | null) => t instanceof Element && !!t.closest("input, textarea, [contenteditable]");

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        el.dataset.shown = "true";
      }
      const t = e.target;
      el.dataset.mode = isText(t) ? "text" : isInteractive(t) ? "link" : galaxy.grabbing ? "grab" : galaxy.hovered ? "star" : "";
    };
    const onDown = () => (el.dataset.pressed = "true");
    const onUp = () => (el.dataset.pressed = "false");
    const onLeave = () => {
      shown = false;
      el.dataset.shown = "false";
    };

    const tick = () => {
      x += (tx - x) * 0.3;
      y += (ty - y) * 0.3;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (galaxy.grabbing && el.dataset.mode !== "grab") el.dataset.mode = "grab";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return <div ref={ring} aria-hidden="true" className="cursor-ring" data-shown="false" />;
}
