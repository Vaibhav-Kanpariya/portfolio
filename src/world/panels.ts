import { career, impact, mastermind, ntn, profile, projects } from "@/content/portfolio";

export type Panel = {
  id: string;
  kicker: string;
  title: string;
  lines: string[];
  links?: { label: string; href: string; external?: boolean }[];
};

const influenzer = projects.find((p) => p.id === "influenzer")!;

export const panels: Record<string, Panel> = {
  mastermind: {
    id: "mastermind",
    kicker: "Flagship project",
    title: mastermind.title,
    lines: [mastermind.tagline, mastermind.intro, ...mastermind.stages.map((s) => `${s.title}. ${s.text}`)],
  },
  ntn: {
    id: "ntn",
    kicker: ntn.fullTitle,
    title: ntn.title,
    lines: [ntn.tagline, ntn.intro, ...ntn.points],
  },
  influenzer: {
    id: "influenzer",
    kicker: influenzer.kind,
    title: influenzer.label,
    lines: impact.map((m) => `${m.value} ${m.text}`),
  },
  ...Object.fromEntries(
    career.map((j) => [
      j.id,
      {
        id: j.id,
        kicker: `${j.start} to ${j.end}`,
        title: j.title,
        lines: [`${j.org}${j.orgNote ? `, working on ${j.orgNote}` : ""}. ${j.place}`, ...j.points],
      } satisfies Panel,
    ]),
  ),
  skills: {
    id: "skills",
    kicker: "Skills",
    title: "Crash into the crates",
    lines: ["Every crate is a tool I use, coloured by domain: agents & AI, distributed systems, backend & data, frontend, product analytics."],
    links: [{ label: "Full list in the recruiter view", href: "/resume" }],
  },
  contact: {
    id: "contact",
    kicker: "Contact",
    title: "Send me a brief",
    lines: ["Open to full stack and AI engineering roles. Email is the fastest way to reach me."],
    links: [
      { label: profile.email, href: `mailto:${profile.email}` },
      { label: "LinkedIn", href: profile.linkedin, external: true },
      { label: "GitHub", href: profile.github, external: true },
      { label: "Résumé (PDF)", href: profile.resume, external: true },
    ],
  },
};
