"use client";

import { motion } from "framer-motion";

const projects = [
  {
    tag: "influenzer-ai:v2.0",
    accent: "bg-purple",
    accentText: "text-purple",
    description:
      "0-to-1 influencer marketing platform serving 100+ users",
    badges: ["React", "TypeScript", "Node.js", "MySQL"],
    metric: "100K+ req/day",
  },
  {
    tag: "brand-intelligence:latest",
    accent: "bg-coral",
    accentText: "text-coral",
    description:
      "AI-powered filtering system for 200M+ influencer database using LLMs",
    badges: ["Python", "OpenAI", "FastAPI"],
    metric: "92% accuracy",
  },
  {
    tag: "analytics-engine:stable",
    accent: "bg-yellow",
    accentText: "text-yellow",
    description:
      "Real-time event tracking with Mixpanel, GA, PostHog analyzing 1.2M+ daily requests",
    badges: ["Mixpanel", "PostHog", "JavaScript"],
    metric: "35% CAC reduction",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 14,
    },
  },
};

const metricVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 12,
      delay: 0.3,
    },
  },
};

export default function Work() {
  return (
    <section
      id="work"
      className="min-h-screen px-6 py-20 sm:px-10 md:px-20 lg:px-32"
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
              projects.sh
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
                $ docker ps --filter status=awesome
              </span>
            </p>
            <p className="mt-2 text-yellow">
              CONTAINER ID &nbsp; IMAGE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; STATUS
            </p>
            <p className="text-white/70">
              ─────────────────────────────────────────────
            </p>
            <p className="text-green-400 font-semibold mt-1">
              3 containers running
            </p>
          </div>
        </div>
      </motion.div>

      {/* Project grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2"
      >
        {projects.map((project, i) => (
          <motion.div
            key={project.tag}
            variants={cardVariants}
            className={`relative rounded-xl border-[3px] border-charcoal bg-cream shadow-brutal-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#2D3436] ${
              i === 2 ? "md:col-span-2 md:max-w-lg md:mx-auto" : ""
            }`}
          >
            {/* Colored accent strip */}
            <div className={`h-2.5 ${project.accent}`} />

            <div className="p-6">
              {/* Tag + Status */}
              <div className="mb-4 flex items-center justify-between">
                <span className="font-space-grotesk text-sm font-bold text-charcoal">
                  {project.tag}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-sora font-semibold text-green-600">
                  <motion.span
                    className="inline-block h-2.5 w-2.5 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  RUNNING
                </span>
              </div>

              {/* Description */}
              <p className="mb-5 font-dm-sans text-sm leading-relaxed text-charcoal/80">
                {project.description}
              </p>

              {/* Badges */}
              <div className="mb-5 flex flex-wrap gap-2">
                {project.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border-2 border-charcoal bg-cream px-3 py-0.5 font-sora text-xs font-semibold text-charcoal"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Metric bubble */}
              <motion.div
                variants={metricVariants}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 border-charcoal ${project.accent} px-4 py-1.5 shadow-brutal`}
              >
                <span className="font-sora text-xs font-bold text-white drop-shadow-sm">
                  {project.metric}
                </span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
