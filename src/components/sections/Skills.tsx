"use client";

import { motion, type Variants } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Skill {
  name: string;
  icon: string; // URL to real tech icon
  subtitle: string;
}

interface SkillGroup {
  label: string;
  tint: string;
  borderTint: string;
  skills: Skill[];
}

// Using devicon CDN for real colored tech logos
const DI = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    tint: "bg-yellow/40",
    borderTint: "border-charcoal",
    skills: [
      { name: "C++", icon: `${DI}/cplusplus/cplusplus-original.svg`, subtitle: "speed demon" },
      { name: "Python", icon: `${DI}/python/python-original.svg`, subtitle: "scripting beast" },
      { name: "JavaScript", icon: `${DI}/javascript/javascript-original.svg`, subtitle: "web native" },
      { name: "TypeScript", icon: `${DI}/typescript/typescript-original.svg`, subtitle: "type safe" },
    ],
  },
  {
    label: "Web Dev",
    tint: "bg-purple/20",
    borderTint: "border-charcoal",
    skills: [
      { name: "ReactJS", icon: `${DI}/react/react-original.svg`, subtitle: "UI wizard" },
      { name: "NodeJS", icon: `${DI}/nodejs/nodejs-original.svg`, subtitle: "runtime king" },
      { name: "ExpressJS", icon: `${DI}/express/express-original.svg`, subtitle: "route master" },
      { name: "NextJS", icon: `${DI}/nextjs/nextjs-original.svg`, subtitle: "full-stack" },
      { name: "Tailwind", icon: `${DI}/tailwindcss/tailwindcss-original.svg`, subtitle: "style guru" },
      { name: "FastAPI", icon: `${DI}/fastapi/fastapi-original.svg`, subtitle: "blazing fast" },
    ],
  },
  {
    label: "Databases",
    tint: "bg-coral/25",
    borderTint: "border-charcoal",
    skills: [
      { name: "MySQL", icon: `${DI}/mysql/mysql-original.svg`, subtitle: "relational OG" },
      { name: "MongoDB", icon: `${DI}/mongodb/mongodb-original.svg`, subtitle: "doc store" },
      { name: "Firebase", icon: `${DI}/firebase/firebase-original.svg`, subtitle: "real-time" },
    ],
  },
  {
    label: "Cloud & Messaging",
    tint: "bg-sky-300/30",
    borderTint: "border-charcoal",
    skills: [
      { name: "AWS", icon: `${DI}/amazonwebservices/amazonwebservices-original-wordmark.svg`, subtitle: "SNS SQS SES" },
      { name: "Kafka", icon: `${DI}/apachekafka/apachekafka-original.svg`, subtitle: "event stream" },
      { name: "Docker", icon: `${DI}/docker/docker-original.svg`, subtitle: "containerized" },
    ],
  },
  {
    label: "Dev Tools",
    tint: "bg-emerald-300/30",
    borderTint: "border-charcoal",
    skills: [
      { name: "Git", icon: `${DI}/git/git-original.svg`, subtitle: "version ctrl" },
      { name: "Jira", icon: `${DI}/jira/jira-original.svg`, subtitle: "ticket wrangler" },
      { name: "Postman", icon: `${DI}/postman/postman-original.svg`, subtitle: "API tester" },
      { name: "VS Code", icon: `${DI}/vscode/vscode-original.svg`, subtitle: "daily driver" },
    ],
  },
  {
    label: "AI Tools",
    tint: "bg-fuchsia-300/30",
    borderTint: "border-charcoal",
    skills: [
      { name: "OpenAI", icon: "https://cdn.worldvectorlogo.com/logos/openai-2.svg", subtitle: "GPT vibes" },
      { name: "HuggingFace", icon: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg", subtitle: "model hub" },
      { name: "Ollama", icon: "https://ollama.com/public/ollama.png", subtitle: "local LLMs" },
    ],
  },
  {
    label: "Monitoring",
    tint: "bg-orange-300/30",
    borderTint: "border-charcoal",
    skills: [
      { name: "Mixpanel", icon: "https://cdn.worldvectorlogo.com/logos/mixpanel.svg", subtitle: "event track" },
      { name: "Google Analytics", icon: `${DI}/google/google-original.svg`, subtitle: "web stats" },
      { name: "PostHog", icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/posthog.svg", subtitle: "product intel" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Deterministic pseudo-random rotation per index                     */
/* ------------------------------------------------------------------ */

const rotations = [-2, 1.5, -1, 2.5, 0.5, -1.5, 3, -0.5, 2, -2.5, 1, -1.8, 0.8, 2.2, -0.3];
const getRotation = (i: number) => rotations[i % rotations.length];

/* Stagger directions for badges flying in from random spots */
const entryOffsets = [
  { x: -80, y: 40 },
  { x: 60, y: -50 },
  { x: -40, y: -60 },
  { x: 90, y: 30 },
  { x: -70, y: -30 },
  { x: 50, y: 60 },
  { x: -90, y: 20 },
  { x: 70, y: -40 },
];

/* ------------------------------------------------------------------ */
/*  Variants                                                           */
/* ------------------------------------------------------------------ */

const terminalVariants: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14, duration: 0.6 },
  },
};

const groupVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const badgeVariants = (index: number): Variants => {
  const offset = entryOffsets[index % entryOffsets.length];
  return {
    hidden: { x: offset.x, y: offset.y, opacity: 0, scale: 0.6 },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 180, damping: 14 },
    },
  };
};

const speechBubbleVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative min-h-screen bg-cream px-4 py-20 sm:px-8 md:px-16 lg:px-24 overflow-hidden"
    >
      {/* ---------- Terminal card header ---------- */}
      <motion.div
        variants={terminalVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-2xl"
      >
        <div className="rounded-xl border-[3px] border-charcoal bg-white shadow-brutal-lg">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b-[3px] border-charcoal px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-coral border border-charcoal" />
            <span className="h-3 w-3 rounded-full bg-yellow border border-charcoal" />
            <span className="h-3 w-3 rounded-full bg-emerald-400 border border-charcoal" />
            <span className="ml-3 font-sora text-xs text-charcoal/50 font-semibold tracking-wide">
              skills.sql
            </span>
          </div>
          {/* SQL query */}
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            <p className="font-space-grotesk text-sm leading-relaxed text-purple sm:text-base md:text-lg">
              <span className="text-coral font-bold">SELECT</span> *{" "}
              <span className="text-coral font-bold">FROM</span> skills{" "}
              <span className="text-coral font-bold">WHERE</span> awesome ={" "}
              <span className="text-yellow font-bold">true</span>;
            </p>
          </div>
        </div>
      </motion.div>

      {/* ---------- Skill groups ---------- */}
      <div className="mx-auto mt-14 flex max-w-5xl flex-col gap-12 sm:mt-16">
        {skillGroups.map((group, gi) => (
          <motion.div
            key={group.label}
            variants={groupVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col items-start gap-5"
          >
            {/* Speech bubble label */}
            <motion.div variants={speechBubbleVariants} className="relative">
              <div className="relative rounded-xl border-[3px] border-charcoal bg-white px-5 py-2 font-sora text-sm font-bold shadow-brutal sm:text-base">
                {group.label}
                {/* Bubble tail */}
                <div className="absolute -bottom-[10px] left-6 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-charcoal" />
                <div className="absolute -bottom-[7px] left-[26.5px] h-0 w-0 border-l-[8.5px] border-r-[8.5px] border-t-[8.5px] border-l-transparent border-r-transparent border-t-white" />
              </div>
            </motion.div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {group.skills.map((skill, si) => {
                const globalIdx = gi * 7 + si;
                const rotation = getRotation(globalIdx);
                return (
                  <motion.div
                    key={skill.name}
                    variants={badgeVariants(globalIdx)}
                    whileHover={{
                      rotate: [rotation, rotation + 3, rotation - 3, rotation + 2, rotation],
                      boxShadow: "8px 8px 0px 0px #2D3436",
                      scale: 1.08,
                      transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                    style={{ rotate: `${rotation}deg` }}
                    className={`${group.tint} ${group.borderTint} cursor-default select-none rounded-full border-[3px] px-4 py-2 shadow-brutal transition-colors sm:px-5 sm:py-2.5`}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                        loading="lazy"
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="font-sora text-xs font-bold text-charcoal sm:text-sm">
                          {skill.name}
                        </span>
                        <span className="font-dm-sans text-[10px] text-charcoal/60 sm:text-xs">
                          {skill.subtitle}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative scattered dots (background texture) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-3 w-3 rounded-full bg-charcoal"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53 + 17) % 100}%`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
