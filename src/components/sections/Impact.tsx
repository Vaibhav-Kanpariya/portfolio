import { impact } from "@/content/portfolio";
import Region from "./Region";

export default function Impact() {
  return (
    <Region region="impact" labelledBy="impact-title" className="min-h-[110vh] pt-[22vh]">
      <h2 id="impact-title" className="t-h2">
        Numbers from production
      </h2>
      <p className="mt-4 text-dust">
        From Influenzer.ai and its analytics layer, lit up in the sky to the right.
      </p>
      <FigureList items={impact} className="mt-10" />
    </Region>
  );
}

/** A big figure beside the sentence that explains it. */
export function FigureList({
  items,
  className = "",
}: {
  items: { value: string; text: string }[];
  className?: string;
}) {
  return (
    // The list is one grid and each row is a subgrid, so every figure shares
    // the width of the widest one.
    <ul className={`grid gap-y-7 min-[520px]:grid-cols-[max-content_1fr] min-[520px]:gap-x-6 ${className}`}>
      {items.map((item) => (
        <li
          key={item.value}
          className="grid gap-1.5 min-[520px]:col-span-2 min-[520px]:grid-cols-subgrid min-[520px]:items-baseline"
        >
          <span className="t-figure whitespace-nowrap text-starlight">{item.value}</span>
          <span className="text-dust">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}
