"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const jsonLines = [
  { raw: "{", content: <span className="text-charcoal">{"{"}</span> },
  {
    raw: '  "name": "Vaibhav Kanpariya",',
    content: (
      <>
        {"  "}
        <span className="text-purple">&quot;name&quot;</span>
        <span className="text-charcoal">: </span>
        <span className="text-coral">&quot;Vaibhav Kanpariya&quot;</span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '  "title": "Full Stack Developer",',
    content: (
      <>
        {"  "}
        <span className="text-purple">&quot;title&quot;</span>
        <span className="text-charcoal">: </span>
        <span className="text-coral">&quot;Full Stack Developer&quot;</span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '  "location": "Surat, Gujarat",',
    content: (
      <>
        {"  "}
        <span className="text-purple">&quot;location&quot;</span>
        <span className="text-charcoal">: </span>
        <span className="text-coral">&quot;Surat, Gujarat&quot;</span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '  "superpower": "Building scalable systems from 0 to 1",',
    content: (
      <>
        {"  "}
        <span className="text-purple">&quot;superpower&quot;</span>
        <span className="text-charcoal">: </span>
        <span className="text-coral">
          &quot;Building scalable systems from 0 to 1&quot;
        </span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '  "fuel": "Coffee and curiosity",',
    content: (
      <>
        {"  "}
        <span className="text-purple">&quot;fuel&quot;</span>
        <span className="text-charcoal">: </span>
        <span className="text-coral">&quot;Coffee and curiosity&quot;</span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '  "education": "B.Tech CS — CHARUSAT (CGPA: 9.04)",',
    content: (
      <>
        {"  "}
        <span className="text-purple">&quot;education&quot;</span>
        <span className="text-charcoal">: </span>
        <span className="text-coral">
          &quot;B.Tech CS — CHARUSAT (CGPA: 9.04)&quot;
        </span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '  "loves": [',
    content: (
      <>
        {"  "}
        <span className="text-purple">&quot;loves&quot;</span>
        <span className="text-charcoal">: [</span>
      </>
    ),
  },
  {
    raw: '    "Clean APIs",',
    content: (
      <>
        {"    "}
        <span className="text-coral">&quot;Clean APIs&quot;</span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '    "Scalable Architecture",',
    content: (
      <>
        {"    "}
        <span className="text-coral">&quot;Scalable Architecture&quot;</span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '    "AI Integration",',
    content: (
      <>
        {"    "}
        <span className="text-coral">&quot;AI Integration&quot;</span>
        <span className="text-charcoal">,</span>
      </>
    ),
  },
  {
    raw: '    "Late Night Deploys"',
    content: (
      <>
        {"    "}
        <span className="text-coral">&quot;Late Night Deploys&quot;</span>
      </>
    ),
  },
  {
    raw: "  ]",
    content: <span className="text-charcoal">{"  ]"}</span>,
  },
  { raw: "}", content: <span className="text-charcoal">{"}"}</span> },
];

const stats = [
  {
    number: "3+",
    label: "Years building products",
    bg: "bg-yellow",
    textColor: "text-charcoal",
  },
  {
    number: "300K+",
    label: "API requests handled daily",
    bg: "bg-purple",
    textColor: "text-white",
  },
  {
    number: "99.8%",
    label: "Uptime delivered",
    bg: "bg-coral",
    textColor: "text-white",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      {/* API Endpoint Banner */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.1 }}
        className="relative mb-10"
      >
        <div className="bg-purple border-3 border-charcoal rounded-2xl shadow-brutal-lg px-5 py-4 sm:px-8 sm:py-5 flex flex-wrap items-center gap-3 sm:gap-4">
          {/* GET badge */}
          <span className="inline-block bg-green-500 text-white text-xs sm:text-sm font-bold font-space-grotesk px-3 py-1 rounded-full tracking-wide uppercase shrink-0">
            GET
          </span>

          {/* Endpoint path */}
          <span className="font-space-grotesk text-white text-sm sm:text-lg md:text-xl tracking-tight break-all">
            /api/about/vaibhav
          </span>

          {/* 200 OK badge */}
          <span className="ml-auto inline-flex items-center gap-1.5 bg-green-400 text-charcoal text-xs sm:text-sm font-bold font-space-grotesk px-3 py-1 rounded-full border-2 border-charcoal shadow-brutal shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-green-700" />
            200 OK
          </span>
        </div>
      </motion.div>

      {/* JSON Response Card */}
      <motion.div
        initial={{ opacity: 0, rotate: -3 }}
        animate={isInView ? { opacity: 1, rotate: 1.5 } : {}}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 14,
          delay: 0.35,
        }}
        className="relative mb-14"
      >
        <div className="bg-white border-3 border-purple rounded-2xl shadow-brutal-lg p-5 sm:p-8 overflow-x-auto">
          <pre className="font-space-grotesk text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre">
            <code>
              {jsonLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    delay: 0.6 + i * 0.09,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  {line.content}
                </motion.div>
              ))}
            </code>
          </pre>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.number}
            initial={{ y: 80, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 14,
              delay: 1.6 + i * 0.15,
            }}
          >
            <div
              className={`${stat.bg} ${stat.textColor} border-3 border-charcoal rounded-2xl shadow-brutal-lg p-6 sm:p-8 text-center`}
            >
              <p className="font-sora text-4xl sm:text-5xl font-extrabold leading-none mb-2">
                {stat.number}
              </p>
              <p className="font-dm-sans text-sm sm:text-base font-medium opacity-90">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
