import { mastermind } from "@/content/portfolio";
import Region from "./Region";
import { FigureList } from "./Impact";

export default function Mastermind() {
  return (
    <Region region="mastermind" labelledBy="mastermind-title" className="min-h-[130vh] pt-[20vh]">
      <h2 id="mastermind-title" className="t-h2 text-[clamp(2.5rem,5vw,4rem)]">
        {mastermind.title}
      </h2>
      <p className="t-lead mt-4 text-starlight">My flagship project: {mastermind.tagline.charAt(0).toLowerCase() + mastermind.tagline.slice(1)}</p>
      <p className="mt-5 text-dust">{mastermind.intro}</p>

      <FigureList
        className="mt-10"
        items={[
          { value: "2,000+", text: "creator profiles in the pool." },
          { value: "100–200", text: "chosen for each brief, a 20:1 funnel with no manual curation." },
        ]}
      />

      <ol className="mt-10 flex flex-col gap-7">
        {mastermind.stages.map((stage, i) => (
          <li key={stage.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
            <span className="t-meta pt-[0.2rem] text-signal" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3 className="t-h3">{stage.title}</h3>
              <p className="mt-1.5 text-dust">{stage.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="t-meta mt-10 text-dust">Built with {formatList(mastermind.stack)}.</p>
    </Region>
  );
}

export function formatList(items: string[]) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
