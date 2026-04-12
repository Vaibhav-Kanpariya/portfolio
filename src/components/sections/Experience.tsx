"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const entries = [
  {
    icon: "checkmark",
    title: "Full Stack Developer",
    org: "Culturex Entertainment (Influenzer.ai)",
    date: "Aug 2023 — Present",
    description:
      "Spearheaded 0-to-1 platform, 100K+ daily API requests, 99.8% uptime, 8 major releases",
    badges: ["React", "TypeScript", "Node.js", "MySQL", "AWS"],
    statusBadge: "BUILD PASSED",
    accent: "border-purple",
    accentBg: "bg-purple",
    accentText: "text-purple",
  },
  {
    icon: "checkmark",
    title: "Software Developer Intern",
    org: "Crest Data Systems",
    date: "Dec 2022 — June 2023",
    description:
      "Reduced developer workload by 70% with Universal Rest Client, built APIs with Python & FastAPI",
    badges: ["Python", "FastAPI"],
    statusBadge: "BUILD PASSED",
    accent: "border-coral",
    accentBg: "bg-coral",
    accentText: "text-coral",
  },
  {
    icon: "graduation",
    title: "B.Tech Computer Science",
    org: "CHARUSAT University",
    date: "May 2023 — CGPA: 9.04/10",
    description: "Software Engineering, OS, Algorithms, AI",
    badges: [],
    statusBadge: "GRADUATED",
    accent: "border-yellow",
    accentBg: "bg-yellow",
    accentText: "text-yellow",
  },
];

const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -60 : 60,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 14,
    },
  },
};

const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
      delay: 0.35,
    },
  },
};

function CheckmarkIcon() {
  return (
    <svg
      className="h-5 w-5 text-green-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg
      className="h-5 w-5 text-yellow"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  );
}

function PipelineLine() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <div
      ref={ref}
      className="absolute left-5 top-0 bottom-0 w-0 sm:left-7 md:left-1/2 md:-translate-x-1/2"
    >
      <motion.div
        className="h-full w-[4px] rounded-full bg-charcoal origin-top"
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      className="min-h-screen px-4 py-20 sm:px-10 md:px-20 lg:px-32 overflow-x-hidden"
    >
      {/* Terminal header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="mx-auto mb-14 max-w-2xl"
      >
        <div className="rounded-xl border-[3px] border-charcoal bg-charcoal shadow-brutal-lg overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-coral" />
            <span className="h-3 w-3 rounded-full bg-yellow" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 font-sora text-xs text-white/50">
              career.sh
            </span>
          </div>
          {/* Terminal body */}
          <div className="bg-charcoal px-5 pb-5 pt-2 font-space-grotesk text-sm leading-relaxed">
            <p>
              <span className="text-green-400">vaibhav</span>
              <span className="text-white/50">@</span>
              <span className="text-purple">portfolio</span>
              <span className="text-white/50"> ~ </span>
              <span className="text-white">
                $ git log --oneline --graph ./career
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Timeline pipeline */}
      <div className="relative mx-auto max-w-4xl">
        <PipelineLine />

        <div className="space-y-12">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className={`relative pl-14 sm:pl-18 md:pl-0 ${
                i % 2 === 0
                  ? "md:pr-[calc(50%+2rem)] md:text-right"
                  : "md:pl-[calc(50%+2rem)]"
              }`}
            >
              {/* Pipeline node */}
              <div
                className={`absolute left-3 top-6 h-5 w-5 rounded-full border-[3px] border-charcoal ${entry.accentBg} sm:left-5 md:left-1/2 md:-translate-x-1/2 z-10`}
              />

              {/* Card */}
              <div
                className={`relative rounded-xl border-[3px] ${entry.accent} bg-cream shadow-brutal-lg p-6 pb-8 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#2D3436]`}
              >
                {/* Title row */}
                <div
                  className={`mb-1 flex items-center gap-2 ${
                    i % 2 === 0 ? "md:justify-end" : ""
                  }`}
                >
                  {entry.icon === "checkmark" ? (
                    <CheckmarkIcon />
                  ) : (
                    <GraduationCapIcon />
                  )}
                  <h3 className="font-sora text-lg font-bold text-charcoal">
                    {entry.title}
                  </h3>
                </div>

                {/* Org */}
                <p
                  className={`font-sora text-sm font-semibold ${entry.accentText}`}
                >
                  {entry.org}
                </p>

                {/* Date */}
                <p className="mt-1 font-space-grotesk text-xs text-charcoal/50">
                  {entry.date}
                </p>

                {/* Description */}
                <p className="mt-3 font-dm-sans text-sm leading-relaxed text-charcoal/80">
                  {entry.description}
                </p>

                {/* Badges */}
                {entry.badges.length > 0 && (
                  <div
                    className={`mt-4 flex flex-wrap gap-2 ${
                      i % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    {entry.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border-2 border-charcoal bg-cream px-3 py-0.5 font-sora text-xs font-semibold text-charcoal"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status badge — always bottom-right of card */}
                <motion.div
                  variants={badgeVariants}
                  className="absolute -bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full border-2 border-charcoal bg-green-500 px-3 py-1 shadow-brutal"
                >
                  <svg
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-sora text-[10px] font-bold uppercase tracking-wider text-white">
                    {entry.statusBadge}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
