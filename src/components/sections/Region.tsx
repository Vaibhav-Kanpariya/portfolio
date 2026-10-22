import type { RegionId } from "@/content/portfolio";

/**
 * A scroll stop. The wrapper lets pointer events fall through to the 3D
 * scene; only the text column itself is interactive.
 */
export default function Region({
  id,
  region,
  children,
  className = "",
  as: Tag = "section",
  labelledBy,
}: {
  id?: string;
  region: RegionId;
  children: React.ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
  labelledBy?: string;
}) {
  return (
    <Tag
      id={id ?? region}
      data-region={region}
      aria-labelledby={labelledBy}
      className={`pointer-events-none relative ${className}`}
    >
      <div className="pointer-events-auto w-full max-w-[36rem] px-5 min-[960px]:ml-[7vw] min-[960px]:px-0">
        {children}
      </div>
    </Tag>
  );
}
