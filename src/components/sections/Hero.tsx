"use client";

import { motion } from "framer-motion";

const techBadges = [
  { label: "React", bg: "bg-blue-400", rotate: "-1deg" },
  { label: "TypeScript", bg: "bg-blue-600", rotate: "2deg" },
  { label: "Node.js", bg: "bg-green-500", rotate: "-2deg" },
  { label: "Python", bg: "bg-yellow-400", rotate: "1deg" },
  { label: "Docker", bg: "bg-sky-500", rotate: "-1deg" },
  { label: "AWS", bg: "bg-orange-400", rotate: "2deg" },
];

const terminalLines = [
  { text: "$ npm start vaibhav", color: "text-purple" },
  { text: "Starting backend engineer...", color: "text-charcoal" },
  { text: "✓ Server running on port:awesome", color: "text-green-500" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen bg-cream px-6 py-20 md:px-12 lg:px-24 flex items-center overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        {/* ── Left Column (60%) ── */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Terminal Window */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border-3 border-charcoal bg-white shadow-brutal-lg p-5 max-w-lg"
            style={{ borderWidth: "3px" }}
          >
            {/* Traffic lights */}
            <div className="flex gap-2 mb-4">
              <span className="h-3.5 w-3.5 rounded-full bg-coral" />
              <span className="h-3.5 w-3.5 rounded-full bg-yellow" />
              <span className="h-3.5 w-3.5 rounded-full bg-green-400" />
            </div>

            {/* Terminal lines */}
            <div className="font-mono text-sm leading-relaxed space-y-1">
              {terminalLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.45, duration: 0.4 }}
                  className={line.color}
                >
                  {line.text}
                </motion.p>
              ))}
              {/* Blinking cursor */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  delay: 2.2,
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="inline-block w-2.5 h-5 bg-charcoal align-middle"
              />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6, ease: "easeOut" }}
            className="font-sora text-5xl md:text-6xl font-bold text-charcoal leading-tight"
          >
            I make servers
            <br />
            go <span className="text-purple">brrr</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
            className="font-dm-sans text-lg text-gray-500 max-w-md"
          >
            Backend engineer who mass deploys containers and mass produces APIs
            before breakfast.
          </motion.p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <motion.a
              href="#work"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 2.5,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="inline-block rounded-full bg-purple px-7 py-3 font-space-grotesk font-semibold text-white shadow-brutal border-2 border-charcoal hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all cursor-pointer"
            >
              git clone my-work
            </motion.a>
            <motion.a
              href="mailto:kanpariyavaibhav966@gmail.com"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 2.7,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="inline-block rounded-full bg-cream px-7 py-3 font-space-grotesk font-semibold text-coral shadow-brutal border-2 border-coral hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all cursor-pointer"
            >
              ping vaibhav
            </motion.a>
          </div>

          {/* Tech Sticker Badges */}
          <div className="flex flex-wrap gap-3 pt-2">
            {techBadges.map((badge, i) => (
              <motion.span
                key={badge.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.0 + i * 0.12, duration: 0.4 }}
                style={{ rotate: badge.rotate }}
                className={`${badge.bg} text-white text-xs font-space-grotesk font-bold px-4 py-1.5 rounded-full border-2 border-charcoal shadow-brutal select-none`}
              >
                {badge.label}
              </motion.span>
            ))}
          </div>
        </div>

        {/* ── Right Column — Avatar + Floating Stickers ── */}
        <div className="lg:col-span-2 hidden lg:flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8, type: "spring", stiffness: 100 }}
            className="relative"
          >
            {/* Avatar image — main centerpiece */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div
                className="w-[320px] h-[320px] rounded-full border-[4px] border-charcoal shadow-brutal-lg overflow-hidden bg-white"
              >
                <img
                  src="/portfolio-avatar.png"
                  alt="Vaibhav Kanpariya"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name tag pinned on avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2, type: "spring", stiffness: 200 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-purple rounded-full border-[3px] border-charcoal shadow-brutal px-6 py-2 z-20"
              >
                <p className="font-sora text-sm font-bold text-white whitespace-nowrap">Vaibhav Kanpariya</p>
              </motion.div>
            </motion.div>

            {/* ── Floating stickers around the avatar ── */}

            {/* Top-left: API badge */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-8, -5, -8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-12 z-20"
            >
              <div className="bg-white rounded-xl border-[3px] border-charcoal shadow-brutal px-4 py-2" style={{ rotate: "-8deg" }}>
                <p className="font-space-grotesk text-[10px] text-charcoal/50">HTTP/1.1</p>
                <p className="font-sora text-xl font-black text-green-500">200 OK</p>
              </div>
            </motion.div>

            {/* Top-right: Terminal snippet */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [5, 8, 5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute -top-4 -right-16 z-20"
            >
              <div className="bg-charcoal rounded-xl border-[3px] border-charcoal shadow-brutal px-4 py-2.5" style={{ rotate: "5deg" }}>
                <div className="flex gap-1 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-coral" />
                  <span className="w-2 h-2 rounded-full bg-yellow" />
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <p className="font-space-grotesk text-[11px] text-green-400">$ deploy prod</p>
                <p className="font-space-grotesk text-[11px] text-white/70">✓ shipped!</p>
              </div>
            </motion.div>

            {/* Left: Docker sticker */}
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [-12, -9, -12] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute top-[45%] -left-20 z-20"
            >
              <div className="bg-sky-100 rounded-xl border-[3px] border-charcoal shadow-brutal px-3 py-2" style={{ rotate: "-12deg" }}>
                <p className="font-sora text-lg font-black text-sky-600">🐳</p>
                <p className="font-space-grotesk text-[9px] font-bold text-sky-500">docker up</p>
              </div>
            </motion.div>

            {/* Right: Coffee sticker */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [10, 13, 10] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
              className="absolute top-[40%] -right-14 z-20"
            >
              <div className="bg-yellow/30 rounded-xl border-[3px] border-charcoal shadow-brutal px-3 py-2" style={{ rotate: "10deg" }}>
                <p className="font-sora text-lg font-black">☕</p>
                <p className="font-space-grotesk text-[9px] font-bold text-charcoal/60">fuel.js</p>
              </div>
            </motion.div>

            {/* Bottom-left: Database sticker */}
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [6, 9, 6] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute -bottom-12 -left-8 z-20"
            >
              <div className="bg-coral/15 rounded-xl border-[3px] border-charcoal shadow-brutal px-4 py-2" style={{ rotate: "6deg" }}>
                <p className="font-space-grotesk text-[11px] font-bold text-coral">SELECT *</p>
                <p className="font-space-grotesk text-[10px] text-coral/60">FROM users</p>
              </div>
            </motion.div>

            {/* Bottom-right: Ship it sticker */}
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [-6, -3, -6] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
              className="absolute -bottom-10 -right-10 z-20"
            >
              <div className="bg-purple/10 rounded-full border-[3px] border-charcoal shadow-brutal px-4 py-2" style={{ rotate: "-6deg" }}>
                <p className="font-sora text-sm font-bold text-purple">ship it 🚀</p>
              </div>
            </motion.div>

            {/* Tiny floating pills */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] left-[10%] bg-green-400 rounded-full w-3 h-3 border-2 border-charcoal z-0"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[70%] right-[5%] bg-yellow rounded-full w-2.5 h-2.5 border-2 border-charcoal z-0"
            />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-[20%] right-[15%] bg-coral rounded-full w-2 h-2 border-2 border-charcoal z-0"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
