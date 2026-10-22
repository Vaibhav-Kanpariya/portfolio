"use client";

import { clusters, skills, type ClusterId } from "@/content/portfolio";
import { setGalaxy, useGalaxy } from "@/components/galaxy/store";
import Region from "./Region";

const order: ClusterId[] = ["ai", "cloud", "backend", "frontend", "observability"];

export default function Skills() {
  const selected = useGalaxy((s) => s.selected);

  return (
    <Region region="skills" labelledBy="skills-title" className="min-h-[110vh] pt-[20vh]">
      <h2 id="skills-title" className="t-h2">
        What I work with
      </h2>
      <p className="mt-4 text-dust">
        Point at a name to find its star and see which projects use it. Colors match the clusters
        in the sky.
      </p>

      <div className="mt-10 flex flex-col gap-7">
        {order.map((id) => {
          const group = skills.filter((s) => s.cluster === id);
          return (
            <div key={id}>
              <h3 className="t-meta flex items-center gap-2.5 text-starlight">
                <span
                  aria-hidden="true"
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: clusters[id].color, boxShadow: `0 0 10px ${clusters[id].color}` }}
                />
                {clusters[id].label}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-x-1 gap-y-1.5">
                {group.map((s) => {
                  const isOn = selected === s.id;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        aria-pressed={isOn}
                        onPointerEnter={() => setGalaxy({ hovered: s.id })}
                        onPointerLeave={() => setGalaxy({ hovered: null })}
                        onFocus={() => setGalaxy({ hovered: s.id })}
                        onBlur={() => setGalaxy({ hovered: null })}
                        onClick={() => setGalaxy({ selected: isOn ? null : s.id })}
                        className={`rounded-full px-3 py-1.5 text-[0.95rem] leading-none transition-colors ${
                          isOn
                            ? "bg-starlight text-void"
                            : "text-dust hover:bg-void-3 hover:text-starlight"
                        }`}
                      >
                        {s.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Region>
  );
}
