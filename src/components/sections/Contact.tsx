import { profile } from "@/content/portfolio";
import Region from "./Region";

export default function Contact() {
  return (
    <Region region="contact" labelledBy="contact-title" className="flex min-h-[100svh] flex-col justify-center pb-10 pt-[16vh]">
      <h2 id="contact-title" className="t-display text-[clamp(2.75rem,6.5vw,6rem)]">
        Send me a brief
      </h2>
      <p className="t-lead mt-6 max-w-[30rem] text-starlight">
        I&rsquo;m open to full stack and AI engineering roles. Email is the fastest way to reach me.
      </p>

      <p className="mt-8">
        <a
          href={`mailto:${profile.email}`}
          className="text-link break-all text-[clamp(1.15rem,2.2vw,1.6rem)] font-[650] [font-stretch:110%]"
        >
          {profile.email}
        </a>
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-quiet">
          LinkedIn
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer" className="btn btn-quiet">
          GitHub
        </a>
        <a href={profile.resume} download className="btn btn-quiet">
          Download résumé (PDF)
        </a>
      </div>

      <p className="t-meta mt-[14vh] text-faint">
        © {new Date().getFullYear()} {profile.name}. Built with Next.js and React Three Fiber.
      </p>
    </Region>
  );
}
