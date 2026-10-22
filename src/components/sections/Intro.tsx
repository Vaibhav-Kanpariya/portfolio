import Link from "next/link";
import { profile } from "@/content/portfolio";
import Region from "./Region";

export default function Intro() {
  return (
    <Region region="intro" className="flex min-h-[100svh] items-end pb-[12vh] pt-32 min-[960px]:items-center min-[960px]:pb-0">
      <h1 className="t-display">
        <span className="block">{profile.firstName}</span>
        <span className="block">{profile.lastName}</span>
      </h1>

      <p className="t-lead mt-8 max-w-[30rem] text-starlight">{profile.headline}</p>

      <p className="mt-4 max-w-[30rem] text-dust">
        Full stack engineer at CultureX, based in Surat, India. Each point of light here is a
        skill, project or job, placed near the things it relates to. Scroll to fly through, or
        hover a star to see what it connects to.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href="#mastermind" className="btn btn-primary">
          See my flagship project
        </a>
        <a href={`mailto:${profile.email}`} className="btn btn-quiet">
          Email me
        </a>
      </div>

      <p className="t-meta mt-6 text-dust">
        Short on time?{" "}
        <Link href="/resume" className="text-link">
          Open the one-page recruiter view
        </Link>
      </p>
    </Region>
  );
}
