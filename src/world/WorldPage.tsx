"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import Hud from "./Hud";
import { profile } from "@/content/portfolio";

const World = dynamic(() => import("./World"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Full-screen drivable world with the HUD over it; a plain page without WebGL. */
export default function WorldPage() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  if (webgl === false) {
    return (
      <main className="flex min-h-screen flex-col items-start justify-center gap-5 bg-[#E8DAC4] px-6 text-[#1E2140]">
        <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-[820] leading-[0.9] tracking-[-0.03em] [font-stretch:125%]">{profile.name}</h1>
        <p className="max-w-[30rem] text-[1.1rem]">{profile.headline}</p>
        <p className="max-w-[30rem] text-[#1E2140]/75">
          This page is a 3D world you drive through, and your browser can&rsquo;t run it. The one-page version has everything.
        </p>
        <Link href="/resume" className="hud-btn hud-btn-solid">
          Open the recruiter view
        </Link>
      </main>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1E2140]">
      {/* readable fallback for crawlers and screen readers */}
      <h1 className="sr-only">{profile.name}</h1>
      <p className="sr-only">{profile.headline}</p>
      <div className="absolute inset-0">{webgl && <World />}</div>
      <Hud />
    </div>
  );
}
