"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { resetCar, setWorld, useWorld, world } from "./store";
import { panels } from "./panels";

/* ───────── loading / intro overlay ───────── */
function Loader() {
  const phase = useWorld((s) => s.phase);
  return (
    <div
      aria-hidden={phase !== "loading"}
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-[#1E2140] text-[#F6F1E7] transition-opacity duration-700 ${
        phase === "loading" ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="text-[1.6rem] font-[800] tracking-[-0.02em] [font-stretch:125%]">VK</div>
      <div className="h-px w-40 overflow-hidden bg-white/15">
        <div className="h-full w-1/2 animate-[hud-load_1.1s_ease-in-out_infinite] bg-[#52E3F2]" />
      </div>
      <p className="t-meta text-white/60">Loading the world</p>
    </div>
  );
}

/* ───────── keys hint ───────── */
function Key({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <kbd
      className={`inline-flex h-7 items-center justify-center rounded-md border border-[#1E2140]/25 bg-white/70 px-1.5 font-sans text-[0.78rem] font-[650] text-[#1E2140] shadow-[0_2px_0_rgba(30,33,64,0.25)] ${
        wide ? "min-w-14" : "min-w-7"
      }`}
    >
      {children}
    </kbd>
  );
}

function Controls() {
  const touch = useWorld((s) => s.touch);
  const phase = useWorld((s) => s.phase);
  if (touch) return null;
  return (
    <div
      className={`absolute bottom-6 left-6 z-20 flex flex-col gap-2 text-[#1E2140] transition-opacity duration-700 ${
        phase === "play" ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-end gap-3">
        <div className="grid grid-cols-3 gap-1">
          <span />
          <Key>W</Key>
          <span />
          <Key>A</Key>
          <Key>S</Key>
          <Key>D</Key>
        </div>
        <p className="t-meta pb-1 text-[#1E2140]/80">drive</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-2">
          <Key wide>space</Key>
          <span className="t-meta text-[#1E2140]/80">brake</span>
        </span>
        <span className="flex items-center gap-2">
          <Key wide>shift</Key>
          <span className="t-meta text-[#1E2140]/80">boost</span>
        </span>
        <span className="flex items-center gap-2">
          <Key>R</Key>
          <span className="t-meta text-[#1E2140]/80">reset</span>
        </span>
      </div>
    </div>
  );
}

/* ───────── touch joystick + buttons ───────── */
function Joystick() {
  const touch = useWorld((s) => s.touch);
  const pad = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pad.current;
    const k = knob.current;
    if (!el || !k || !touch) return;
    const R = 46;
    let id: number | null = null;
    let cx = 0;
    let cy = 0;
    const set = (dx: number, dy: number) => {
      const len = Math.hypot(dx, dy);
      const s = len > R ? R / len : 1;
      dx *= s;
      dy *= s;
      k.style.transform = `translate(${dx}px, ${dy}px)`;
      world.input.steer = -dx / R;
      world.input.forward = -dy / R;
    };
    const begin = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      set(clientX - cx, clientY - cy);
    };
    const end = () => {
      id = null;
      k.style.transform = "translate(0,0)";
      world.input.steer = 0;
      world.input.forward = 0;
    };
    // pointer events (most browsers) …
    const down = (e: PointerEvent) => {
      id = e.pointerId;
      try {
        el.setPointerCapture(id);
      } catch {
        /* ignore */
      }
      begin(e.clientX, e.clientY);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      set(e.clientX - cx, e.clientY - cy);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      end();
    };
    // … and raw touch events as a fallback (older iOS, synthetic input)
    const tstart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      id = t.identifier;
      begin(t.clientX, t.clientY);
    };
    const tmove = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) if (t.identifier === id) set(t.clientX - cx, t.clientY - cy);
    };
    const tend = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) if (t.identifier === id) end();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("touchstart", tstart, { passive: false });
    el.addEventListener("touchmove", tmove, { passive: false });
    el.addEventListener("touchend", tend);
    el.addEventListener("touchcancel", tend);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("touchstart", tstart);
      el.removeEventListener("touchmove", tmove);
      el.removeEventListener("touchend", tend);
      el.removeEventListener("touchcancel", tend);
    };
  }, [touch]);

  if (!touch) return null;
  return (
    <>
      <div
        ref={pad}
        className="pointer-events-auto absolute bottom-7 left-6 z-20 flex size-36 touch-none items-center justify-center rounded-full border border-[#1E2140]/25 bg-white/35 backdrop-blur-sm"
        aria-label="Steering"
        role="application"
      >
        <div ref={knob} className="size-14 rounded-full bg-[#1E2140]/85 shadow-lg" />
      </div>
      <div className="pointer-events-auto absolute bottom-8 right-6 z-20 flex flex-col gap-3">
        <button
          type="button"
          className="size-16 touch-none rounded-full border border-[#1E2140]/25 bg-white/45 text-[0.8rem] font-[700] text-[#1E2140] backdrop-blur-sm active:bg-[#1E2140] active:text-white"
          onPointerDown={() => (world.input.brake = true)}
          onPointerUp={() => (world.input.brake = false)}
          onPointerCancel={() => (world.input.brake = false)}
          onPointerLeave={() => (world.input.brake = false)}
        >
          brake
        </button>
        <button
          type="button"
          className="size-16 rounded-full border border-[#1E2140]/25 bg-white/45 text-[0.8rem] font-[700] text-[#1E2140] backdrop-blur-sm"
          onClick={resetCar}
        >
          reset
        </button>
      </div>
    </>
  );
}

/* ───────── project / zone panel ───────── */
function PanelCard() {
  const id = useWorld((s) => s.panel);
  const box = useRef<HTMLDivElement>(null);
  // keep the last panel's content while it fades out
  const [shownId, setShownId] = useState<string | null>(null);
  if (id && id !== shownId) setShownId(id);
  const panel = shownId ? panels[shownId] : null;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (id) {
      gsap.fromTo(el, { autoAlpha: 0, y: 24, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out", overwrite: true });
    } else {
      gsap.to(el, { autoAlpha: 0, y: 16, duration: 0.3, ease: "power2.in", overwrite: true });
    }
  }, [id]);

  return (
    <div
      ref={box}
      role="dialog"
      aria-hidden={!id}
      className="pointer-events-auto invisible absolute right-6 top-20 z-30 w-[min(26rem,calc(100vw-3rem))] rounded-2xl border border-[#1E2140]/15 bg-[#FBF7F0]/95 p-6 text-[#1E2140] shadow-[0_24px_60px_rgba(30,33,64,0.25)] backdrop-blur max-[600px]:right-3 max-[600px]:top-16 max-[600px]:p-5"
    >
      {panel && (
        <>
          <p className="t-meta text-[#1E2140]/60">{panel.kicker}</p>
          <h2 className="mt-1 text-[1.6rem] font-[800] leading-[1.05] tracking-[-0.02em] [font-stretch:118%]">{panel.title}</h2>
          <div className="mt-3 flex max-h-[38vh] flex-col gap-2 overflow-y-auto pr-1 text-[0.95rem] leading-[1.5] text-[#1E2140]/85">
            {panel.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          {panel.links && (
            <div className="mt-4 flex flex-wrap gap-2">
              {panel.links.map((l) =>
                l.external || l.href.startsWith("mailto:") ? (
                  <a key={l.href} href={l.href} target={l.external ? "_blank" : undefined} rel="noreferrer" className="rounded-full bg-[#1E2140] px-3.5 py-1.5 text-[0.9rem] font-[600] text-[#F6F1E7] hover:bg-[#0a7584]">
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} className="rounded-full bg-[#1E2140] px-3.5 py-1.5 text-[0.9rem] font-[600] text-[#F6F1E7] hover:bg-[#0a7584]">
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setWorld({ panel: null })}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-[#1E2140]/60 hover:bg-[#1E2140]/10 hover:text-[#1E2140]"
            aria-label="Close"
          >
            ×
          </button>
          <p className="t-meta mt-4 text-[#1E2140]/50">Drive off the pad to close</p>
        </>
      )}
    </div>
  );
}

export default function Hud() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 font-sans">
      <Loader />
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 min-[960px]:px-8">
        <Link href="/" className="pointer-events-auto text-[1.05rem] font-[800] tracking-[-0.02em] text-[#1E2140] [font-stretch:125%]">
          VK
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <Link href="/galaxy" className="hud-btn hidden min-[700px]:inline-flex">
            Galaxy view
          </Link>
          <Link href="/resume" className="hud-btn hud-btn-solid">
            Recruiter view
          </Link>
        </div>
      </header>
      <Controls />
      <Joystick />
      <PanelCard />
    </div>
  );
}
