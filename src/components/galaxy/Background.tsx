"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ScrollDriver from "./ScrollDriver";
import { setGalaxy } from "./store";

const GalaxyCanvas = dynamic(() => import("./GalaxyCanvas"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Fixed layer behind the page: the 3D galaxy when WebGL is available,
 * otherwise a still gradient. A scrim keeps the text column readable.
 */
export default function Background() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Feature detection has to run in the browser, after hydration.
    const ok = hasWebGL();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(ok);
    setGalaxy({ webgl: ok });
    const t = window.setTimeout(() => setReady(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <ScrollDriver />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-void transition-opacity duration-[1400ms] ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {webgl ? (
          <GalaxyCanvas />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_68%_45%,#1d2a66_0%,#0c1330_35%,#060a18_70%)]" />
        )}
      </div>
      {/* Scrim: solid behind the text column on wide screens, a wash on phones */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(6,10,24,0.2)_0%,rgba(6,10,24,0.35)_40%,rgba(6,10,24,0.88)_100%)] min-[960px]:bg-[linear-gradient(90deg,rgba(6,10,24,0.92)_0%,rgba(6,10,24,0.78)_30%,rgba(6,10,24,0)_56%)]"
      />
      {/* Quiet strip behind the section nav so star labels don't collide with it */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 right-0 z-[1] hidden w-56 bg-[linear-gradient(270deg,rgba(6,10,24,0.9)_0%,rgba(6,10,24,0.6)_45%,rgba(6,10,24,0)_100%)] min-[960px]:block"
      />
    </>
  );
}
