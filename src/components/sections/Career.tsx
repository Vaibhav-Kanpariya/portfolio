import { career, type RegionId } from "@/content/portfolio";
import Region from "./Region";

export default function Career() {
  return (
    <section id="career" aria-labelledby="career-title" className="pointer-events-none relative pt-[18vh]">
      <div className="pointer-events-auto w-full max-w-[36rem] px-5 min-[960px]:ml-[7vw] min-[960px]:px-0">
        <h2 id="career-title" className="t-h2">
          Where I&rsquo;ve worked
        </h2>
        <p className="mt-4 text-dust">
          In order, from university to now. The camera follows the same path through the sky.
        </p>
      </div>

      <ol className="mt-[8vh]">
        {career.map((job) => (
          <li key={job.id}>
            <Region
              as="article"
              region={job.region as RegionId}
              id={job.region}
              className="min-h-[85vh] pt-[14vh]"
            >
              <p className="t-meta text-signal">
                {job.start} to {job.end}
              </p>
              <h3 className="t-h3 mt-3 text-[1.75rem] [font-stretch:118%]">{job.title}</h3>
              <p className="mt-2 text-dust">
                {job.org}
                {job.orgNote ? `, working on ${job.orgNote}` : ""}. {job.place}
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {job.points.slice(0, 2).map((point) => (
                  <li key={point} className="relative pl-5 text-starlight/90">
                    <span aria-hidden="true" className="absolute left-0 top-[0.72em] h-px w-2.5 bg-faint" />
                    {point}
                  </li>
                ))}
              </ul>
            </Region>
          </li>
        ))}
      </ol>
    </section>
  );
}
