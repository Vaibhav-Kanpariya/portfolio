import { clusters, skills, type ClusterId } from "@/content/portfolio";
import Region from "./Region";

const order: ClusterId[] = ["ai", "cloud", "backend", "frontend", "observability"];

export default function Skills() {
  return (
    <Region region="skills" labelledBy="skills-title" className="flex min-h-[120vh] items-start pt-[18vh]">
      <h2 id="skills-title" className="t-h2">
        What I work with
      </h2>
      <p className="mt-4 max-w-[22rem] text-dust">
        Every block is a tool I use. Grab one and throw it; on a phone, tap to flip it.
      </p>
      <ul className="t-meta mt-6 flex flex-wrap gap-x-4 gap-y-2 text-dust">
        {order.map((id) => (
          <li key={id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2.5 rounded-full"
              style={{ background: clusters[id].color, boxShadow: `0 0 10px ${clusters[id].color}` }}
            />
            {clusters[id].label}
          </li>
        ))}
      </ul>
      {/* the full list, for readers and search */}
      <dl className="sr-only">
        {order.map((id) => (
          <div key={id}>
            <dt>{clusters[id].recruiterLabel}</dt>
            <dd>
              {skills
                .filter((s) => s.cluster === id)
                .map((s) => s.label)
                .join(", ")}
            </dd>
          </div>
        ))}
      </dl>
    </Region>
  );
}
