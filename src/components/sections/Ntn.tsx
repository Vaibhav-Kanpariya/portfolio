import { ntn } from "@/content/portfolio";
import Region from "./Region";
import StoryCaption from "./StoryCaption";

const stages: [number, string][] = [
  [0, "A creator replies. An event wakes the agent, which reads the whole thread and answers on its own."],
  [0.35, "A send fails. It drops into the dead-letter queue instead of disappearing."],
  [0.6, "The retry timer runs out. The agent picks it back up and sends it again."],
  [0.85, "Deal closed. Gmail quota, rate limits and watch renewals handled underneath."],
];

export default function Ntn() {
  return (
    <Region region="ntn" labelledBy="ntn-title" story className="h-[340vh]">
      <h2 id="ntn-title" className="t-h2 text-[clamp(2.5rem,5vw,4rem)]">
        {ntn.title}
      </h2>
      <p className="t-meta mt-2 text-dust">{ntn.fullTitle}</p>
      <p className="t-lead mt-5 text-starlight">{ntn.tagline}</p>
      <StoryCaption region="ntn" stages={stages} className="mt-6 min-h-[4.5rem] max-w-[26rem] text-dust" />
    </Region>
  );
}
