import type { Metadata } from "next";
import Link from "next/link";
import {
  career,
  clusters,
  education,
  impact,
  mastermind,
  ntn,
  profile,
  skills,
  type ClusterId,
} from "@/content/portfolio";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Vaibhav Kanpariya | Résumé",
  description: profile.summary,
};

const jobs = [...career].filter((j) => j.id !== "charusat").reverse();
const skillOrder: ClusterId[] = ["ai", "cloud", "backend", "frontend", "observability"];

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-rule py-8 min-[720px]:grid-cols-[10rem_1fr] min-[720px]:gap-8 print:py-4">
      <h2 className="text-[0.95rem] font-[700] [font-stretch:112%] text-ink">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="relative pl-4 text-ink-2">
          <span aria-hidden="true" className="absolute left-0 top-[0.75em] h-px w-2 bg-ink-2/60" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-paper text-ink [color-scheme:light] [&_:focus-visible]:outline-link">
      <header className="no-print sticky top-0 z-10 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-[52rem] items-center justify-between gap-3 px-5 py-3">
          <Link href="/" className="text-[0.95rem] font-[600] text-link underline underline-offset-4">
            Open the 3D view
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <a
              href={profile.resume}
              download
              className="rounded-full bg-ink px-4 py-2 text-[0.95rem] font-[600] text-paper transition-colors hover:bg-link"
            >
              Download PDF
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[52rem] px-5 pb-20 pt-12 print:pt-0">
        <h1 className="text-[clamp(2.4rem,6vw,3.75rem)] font-[820] leading-[0.92] tracking-[-0.03em] [font-stretch:125%]">
          {profile.name}
        </h1>
        <p className="mt-3 text-[1.2rem] font-[500] text-ink">
          {profile.role}, {profile.focus.toLowerCase()}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem] text-ink-2">
          <li>
            <a className="text-link underline underline-offset-4" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </li>
          <li>
            <a className="text-link underline underline-offset-4" href={profile.linkedin}>
              LinkedIn
            </a>
          </li>
          <li>
            <a className="text-link underline underline-offset-4" href={profile.github}>
              GitHub
            </a>
          </li>
          <li>{profile.location}</li>
        </ul>

        <div className="mt-10">
          <Row title="Summary">
            <p className="text-ink-2">{profile.summary}</p>
            <ul className="mt-5 grid gap-x-6 gap-y-3 min-[560px]:grid-cols-2">
              {impact.map((m) => (
                <li key={m.value} className="text-[0.95rem] text-ink-2">
                  <strong className="font-[750] text-ink [font-stretch:115%]">{m.value}</strong> {m.text}
                </li>
              ))}
            </ul>
          </Row>

          <Row title="Experience">
            <div className="flex flex-col gap-7">
              {jobs.map((job) => (
                <article key={job.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-[1.1rem] font-[700] [font-stretch:108%]">{job.title}</h3>
                    <p className="text-[0.9rem] text-ink-2 [font-stretch:85%]">
                      {job.start} to {job.end}
                    </p>
                  </div>
                  <p className="text-ink-2">
                    {job.org}
                    {job.orgNote ? ` (${job.orgNote})` : ""}, {job.place}
                  </p>
                  <Bullets items={job.points} />
                </article>
              ))}
            </div>
          </Row>

          <Row title="Key projects">
            <div className="flex flex-col gap-7">
              <article>
                <h3 className="text-[1.1rem] font-[700] [font-stretch:108%]">{mastermind.title}</h3>
                <p className="font-[550] text-ink">{mastermind.tagline}</p>
                <p className="mt-1 text-ink-2">{mastermind.intro}</p>
                <Bullets
                  items={mastermind.stages.map((s) => (
                    <>
                      <strong className="font-[650] text-ink">{s.title}.</strong> {s.text}
                    </>
                  ))}
                />
                <p className="mt-2 text-[0.9rem] text-ink-2 [font-stretch:90%]">{mastermind.stack.join(", ")}</p>
              </article>
              <article>
                <h3 className="text-[1.1rem] font-[700] [font-stretch:108%]">
                  {ntn.title} ({ntn.fullTitle})
                </h3>
                <p className="font-[550] text-ink">{ntn.tagline}</p>
                <p className="mt-1 text-ink-2">{ntn.intro}</p>
                <Bullets items={ntn.points} />
                <p className="mt-2 text-[0.9rem] text-ink-2 [font-stretch:90%]">{ntn.stack.join(", ")}</p>
              </article>
            </div>
          </Row>

          <Row title="Skills">
            <dl className="flex flex-col gap-2.5">
              {skillOrder.map((id) => (
                <div key={id} className="grid gap-x-4 min-[560px]:grid-cols-[12rem_1fr]">
                  <dt className="font-[600] text-ink">{clusters[id].recruiterLabel}</dt>
                  <dd className="text-ink-2">
                    {skills
                      .filter((s) => s.cluster === id)
                      .map((s) => s.label)
                      .join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </Row>

          <Row title="Education">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[1.1rem] font-[700] [font-stretch:108%]">{education.title}</h3>
              <p className="text-[0.9rem] text-ink-2 [font-stretch:85%]">
                {education.start} to {education.end}
              </p>
            </div>
            <p className="text-ink-2">
              {education.org}, {education.place}. CGPA 9.04 / 10.
            </p>
          </Row>
        </div>
      </main>
    </div>
  );
}
