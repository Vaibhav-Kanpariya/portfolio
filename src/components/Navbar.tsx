"use client";

import { motion } from "framer-motion";

const navLinks = [
  { label: "About", href: "#about", color: "bg-purple text-white" },
  { label: "Skills", href: "#skills", color: "bg-coral text-white" },
  { label: "Work", href: "#work", color: "bg-yellow text-charcoal" },
  { label: "Experience", href: "#experience", color: "bg-purple text-white" },
];

export default function Navbar() {
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border-[3px] border-charcoal bg-cream/80 backdrop-blur-md px-4 py-2 shadow-brutal sm:gap-4 sm:px-6 sm:py-2.5">
        {/* Logo / Package name */}
        <a
          href="#hero"
          onClick={(e) => handleClick(e, "#hero")}
          className="font-sora font-bold text-purple text-sm sm:text-base whitespace-nowrap mr-2 sm:mr-4 hover:scale-105 transition-transform"
        >
          vaibhav@latest
        </a>

        {/* Nav links */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className={`${link.color} rounded-full border-2 border-charcoal px-2.5 py-1 text-xs font-sora font-semibold transition-all hover:shadow-brutal hover:-translate-y-0.5 sm:px-4 sm:py-1.5 sm:text-sm`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
