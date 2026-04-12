"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const navLinks = [
  { label: "About", href: "#about", color: "bg-purple text-white" },
  { label: "Skills", href: "#skills", color: "bg-coral text-white" },
  { label: "Work", href: "#work", color: "bg-yellow text-charcoal" },
  { label: "Experience", href: "#experience", color: "bg-purple text-white" },
];

function Logo() {
  return (
    <img
      src="/portfoio-logo.png"
      alt="V"
      width={36}
      height={36}
      className="shrink-0 rounded-lg"
    />
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const scrollTo = useCallback((href: string) => {
    setIsOpen(false);
    // Delay scroll slightly so body overflow:hidden gets removed first
    setTimeout(() => {
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -60;
        const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  }, []);

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
        className="fixed top-4 left-1/2 z-50 -translate-x-1/2 hidden md:block"
      >
        <div className="flex items-center gap-4 rounded-full border-[3px] border-charcoal bg-cream/80 backdrop-blur-md px-6 py-2.5 shadow-brutal">
          <button
            onClick={() => scrollTo("#hero")}
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Logo />
            <span className="font-sora font-bold text-purple text-base whitespace-nowrap">
              vaibhav@latest
            </span>
          </button>

          <div className="w-[3px] h-6 bg-charcoal/20 rounded-full" />

          <div className="flex items-center gap-2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`${link.color} rounded-full border-2 border-charcoal px-4 py-1.5 text-sm font-sora font-semibold transition-all hover:shadow-brutal hover:-translate-y-0.5 cursor-pointer`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 pr-6 py-2.5 bg-cream/95 backdrop-blur-md border-b-[3px] border-charcoal">
          <button onClick={() => scrollTo("#hero")}>
            <Logo />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 rounded-lg border-[2px] border-charcoal bg-white flex flex-col items-center justify-center gap-[3px] transition-all"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-3.5 h-[2px] bg-charcoal rounded-full origin-center"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-3.5 h-[2px] bg-charcoal rounded-full"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-3.5 h-[2px] bg-charcoal rounded-full origin-center"
            />
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 top-[49px] bg-charcoal/20 backdrop-blur-sm z-40"
              />

              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden bg-cream border-b-[3px] border-charcoal z-50 relative"
              >
                <div className="flex flex-col gap-2 p-3">
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.href}
                      onClick={() => scrollTo(link.href)}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.15 }}
                      className={`${link.color} rounded-lg border-[2px] border-charcoal px-4 py-2.5 text-sm font-sora font-bold text-left shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer`}
                    >
                      {link.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
