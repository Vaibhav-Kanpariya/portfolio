import { mastermind } from "@/content/portfolio";
import Region from "./Region";
import StoryCaption from "./StoryCaption";

const stages: [number, string][] = [
  [0, "A pool of 2,000 creators. Three signals flow in: reel audio, thumbnails, captions."],
  [0.3, "Everything funnels into one embedding per creator. The agent plans its own retrieval."],
  [0.62, "100 to 200 come out, matched on what they actually make. A 20:1 funnel, no manual curation."],
  [0.86, "A brand rejects one. The agent learns from it and re-ranks the rest."],
];

export default function Mastermind() {
  return (
    <Region region="mastermind" labelledBy="mastermind-title" story className="h-[380vh]">
      <p className="t-meta text-signal">Flagship project</p>
      <h2 id="mastermind-title" className="t-h2 mt-3 text-[clamp(2.5rem,5vw,4rem)]">
        {mastermind.title}
      </h2>
      <p className="t-lead mt-4 text-starlight">{mastermind.tagline}</p>
      <StoryCaption region="mastermind" stages={stages} className="mt-6 min-h-[4.5rem] max-w-[26rem] text-dust" />
    </Region>
  );
}
