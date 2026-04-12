"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ───── terminal log lines ───── */
const terminalLines = [
  { text: "$ vaibhav --shutdown --graceful", color: "text-green-400" },
  { prefix: "[INFO]", prefixColor: "text-blue-400", text: "Saving session..." },
  {
    prefix: "[INFO]",
    prefixColor: "text-blue-400",
    text: "Flushing caches...",
  },
  {
    prefix: "[INFO]",
    prefixColor: "text-blue-400",
    text: "Closing database connections...",
  },
  {
    prefix: "[WARN]",
    prefixColor: "text-amber-400",
    text: "You've reached the end!",
  },
  {
    prefix: "[OK]",
    prefixColor: "text-green-400",
    text: "Writing final logs...",
  },
] as const;

/* ───── restart buttons ───── */
const restartButtons = [
  {
    label: "git clone my-resume",
    href: "/Vaibhav Resume.pdf",
    bg: "bg-purple",
    text: "text-white",
    external: true,
  },
  {
    label: "ssh vaibhav@github",
    href: "https://github.com/Vaibhav-Kanpariya",
    bg: "bg-coral",
    text: "text-white",
    external: true,
  },
  {
    label: "traceroute linkedin",
    href: "https://www.linkedin.com/in/vaibhav-kanpariya/",
    bg: "bg-yellow",
    text: "text-charcoal",
    external: true,
  },
];

/* ───── ZZZ floater ───── */
function Zzz() {
  return (
    <div className="absolute -top-6 -right-4 flex flex-col items-start gap-0 select-none pointer-events-none">
      {["Z", "Z", "Z"].map((z, i) => (
        <motion.span
          key={i}
          className="font-sora font-extrabold text-purple leading-none"
          style={{ fontSize: `${1.2 + i * 0.6}rem` }}
          animate={{
            y: [0, -8 - i * 4, 0],
            opacity: [0.6, 1, 0.6],
            x: [0, 4 + i * 2, 0],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          {z}
        </motion.span>
      ))}
    </div>
  );
}

/* ───── sleepy server rack (pure CSS) ───── */
function SleepyServer() {
  return (
    <motion.div
      className="relative mx-auto w-40 sm:w-48"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
    >
      {/* sleeping cap */}
      <motion.div
        className="absolute -top-10 left-1/2 -translate-x-1/2 z-10"
        initial={{ y: -40, opacity: 0, rotate: -15 }}
        whileInView={{ y: 0, opacity: 1, rotate: -8 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 10,
          delay: 0.7,
        }}
      >
        {/* triangle cap */}
        <div
          className="w-0 h-0 border-l-[28px] border-r-[28px] border-b-[48px] border-l-transparent border-r-transparent border-b-purple"
          style={{ filter: "drop-shadow(2px 2px 0 #2D3436)" }}
        />
        {/* pompom */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-yellow border-2 border-charcoal" />
      </motion.div>

      {/* server body */}
      <div className="relative border-[3px] border-charcoal bg-cream rounded-lg w-full h-52 sm:h-60 shadow-brutal-lg overflow-hidden">
        {/* drive bays */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="mx-3 mt-3 h-8 rounded border-2 border-charcoal/30 bg-charcoal/5 flex items-center px-2 gap-1"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 border border-charcoal/40" />
            <div className="flex-1 h-1 bg-charcoal/10 rounded" />
          </div>
        ))}

        {/* sleepy face */}
        <div className="flex flex-col items-center mt-4 gap-1">
          <div className="flex gap-5">
            {/* closed eyes (arcs) */}
            <div className="w-6 h-3 border-b-[3px] border-charcoal rounded-b-full" />
            <div className="w-6 h-3 border-b-[3px] border-charcoal rounded-b-full" />
          </div>
          {/* small smile */}
          <div className="w-5 h-2 border-b-2 border-charcoal rounded-b-full mt-1" />
        </div>

        {/* CLOSED sign */}
        <motion.div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-cream border-2 border-charcoal rounded px-3 py-1 shadow-brutal rotate-[-3deg]"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 260, damping: 12, delay: 1 }}
        >
          <span className="font-sora font-bold text-coral text-xs tracking-widest">
            CLOSED
          </span>
        </motion.div>
      </div>

      {/* ZZZ */}
      <Zzz />
    </motion.div>
  );
}

/* ───── terminal window ───── */
function TerminalWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div
      ref={ref}
      className="w-full max-w-2xl mx-auto border-[3px] border-charcoal rounded-lg shadow-brutal-lg overflow-hidden"
    >
      {/* title bar */}
      <div className="flex items-center gap-2 bg-charcoal px-4 py-2.5">
        <div className="w-3 h-3 rounded-full bg-coral border border-charcoal/30" />
        <div className="w-3 h-3 rounded-full bg-yellow border border-charcoal/30" />
        <div className="w-3 h-3 rounded-full bg-green-400 border border-charcoal/30" />
        <span className="ml-3 text-cream/60 text-xs font-space-grotesk">
          vaibhav — bash — 80×24
        </span>
      </div>

      {/* terminal body */}
      <div className="bg-[#1e1e2e] px-4 sm:px-6 py-5 font-space-grotesk text-sm sm:text-base leading-relaxed min-h-[200px]">
        {terminalLines.map((line, i) => (
          <motion.div
            key={i}
            className="mb-1"
            initial={{ opacity: 0, x: -12 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.35 }}
          >
            {"prefix" in line ? (
              <span>
                <span className={line.prefixColor}>{line.prefix}</span>{" "}
                <span className="text-gray-300">{line.text}</span>
              </span>
            ) : (
              <span className={line.color}>{line.text}</span>
            )}
          </motion.div>
        ))}

        {/* blinking cursor */}
        <motion.span
          className="inline-block w-2.5 h-5 bg-green-400 align-middle mt-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

/* ───── main section ───── */
export default function Ending() {
  return (
    <section
      id="ending"
      className="relative py-24 sm:py-32 px-4 overflow-hidden bg-cream"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-16">
        {/* 1 — Terminal */}
        <TerminalWindow />

        {/* 2 — Sleepy server illustration */}
        <SleepyServer />

        {/* 3 — Big thank-you text */}
        <motion.p
          className="font-sora text-2xl sm:text-3xl font-bold text-charcoal text-center max-w-xl leading-snug"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Thanks for scrolling this far!
          <br />
          <span className="text-purple">
            You&apos;re now cached in my brain.
          </span>
        </motion.p>

        {/* 4 — Restart buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {restartButtons.map((btn, i) => (
            <motion.a
              key={btn.label}
              href={btn.href}
              target={btn.external ? "_blank" : undefined}
              rel={btn.external ? "noopener noreferrer" : undefined}
              className={`${btn.bg} ${btn.text} font-sora font-semibold text-sm sm:text-base px-5 sm:px-7 py-3 rounded-full border-[3px] border-charcoal shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 14,
                delay: 0.15 + i * 0.12,
              }}
            >
              {btn.label}
            </motion.a>
          ))}
        </div>

        {/* 5 — Footer log line */}
        <motion.footer
          className="w-full flex flex-col items-center gap-3 pt-8 border-t-2 border-charcoal/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="font-space-grotesk text-xs sm:text-sm text-gray-400 text-center">
            [2024] Process exited with code 0 (SUCCESS). Built with mass coffee
            and mass code.
          </p>
          <span className="inline-block bg-charcoal text-cream font-space-grotesk text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border-2 border-charcoal tracking-wider uppercase">
            End of Logs
          </span>
        </motion.footer>
      </div>
    </section>
  );
}
