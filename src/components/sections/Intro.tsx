"use client";

import Link from "next/link";
import { profile } from "@/content/portfolio";
import { useGalaxy } from "@/components/galaxy/store";
import Region from "./Region";

export default function Intro() {
  const webgl = useGalaxy((s) => s.webgl);

  return (
    <Region region="intro" className="flex min-h-[100svh] items-end pb-[9vh] pt-32">
      {/* With WebGL the name is drawn by the particles; keep it for readers and search. */}
      <h1 className={webgl ? "sr-only" : "t-display"}>
        <span className="block">{profile.firstName}</span>
        <span className="block">{profile.lastName}</span>
      </h1>

      <p className="t-lead mt-8 max-w-[26rem] text-starlight">
        Full stack engineer. I build autonomous AI agents and the event-driven backends that keep
        them reliable.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a href="#mastermind" className="btn btn-primary">
          See my flagship project
        </a>
        <a href={`mailto:${profile.email}`} className="btn btn-quiet">
          Email me
        </a>
      </div>

      <p className="t-meta mt-6 flex items-center gap-4 text-dust">
        <span className="scroll-hint" aria-hidden="true" />
        <span>
          Scroll to explore, or{" "}
          <Link href="/resume" className="text-link">
            open the recruiter view
          </Link>
        </span>
      </p>
    </Region>
  );
}
