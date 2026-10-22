import { ntn } from "@/content/portfolio";
import Region from "./Region";
import { formatList } from "./Mastermind";

export default function Ntn() {
  return (
    <Region region="ntn" labelledBy="ntn-title" className="min-h-[115vh] pt-[20vh]">
      <h2 id="ntn-title" className="t-h2 text-[clamp(2.5rem,5vw,4rem)]">
        {ntn.title}
      </h2>
      <p className="t-meta mt-2 text-dust">{ntn.fullTitle}</p>
      <p className="t-lead mt-5 text-starlight">{ntn.tagline}</p>
      <p className="mt-5 text-dust">{ntn.intro}</p>

      <ul className="mt-8 flex flex-col gap-3">
        {ntn.points.map((point) => (
          <li key={point} className="relative pl-5 text-starlight/90">
            <span aria-hidden="true" className="absolute left-0 top-[0.72em] h-px w-2.5 bg-faint" />
            {point}
          </li>
        ))}
      </ul>

      <p className="t-meta mt-10 text-dust">Built with {formatList(ntn.stack)}.</p>
    </Region>
  );
}
