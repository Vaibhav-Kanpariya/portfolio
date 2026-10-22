"use client";

import { navItems } from "@/content/portfolio";
import { useGalaxy } from "@/components/galaxy/store";
import { scrollToId } from "@/components/galaxy/scroll";

/** Right-edge list of scroll stops. Shows where you are and jumps on click. */
export default function RegionNav() {
  const region = useGalaxy((s) => s.region);

  return (
    <nav
      aria-label="Sections"
      className="no-print pointer-events-auto fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 min-[960px]:block"
    >
      <ol className="flex flex-col items-end gap-3">
        {navItems.map((item) => {
          const active = item.matches.includes(region);
          return (
            <li key={item.label}>
              <a
                href={`#${item.region}`}
                aria-current={active ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(item.region);
                }}
                className="group flex items-center gap-3 py-0.5"
              >
                <span
                  className={`t-meta transition-colors ${
                    active ? "text-starlight" : "text-faint group-hover:text-dust"
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`block h-px transition-all duration-300 ${
                    active ? "w-8 bg-signal" : "w-4 bg-faint group-hover:w-6 group-hover:bg-dust"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
