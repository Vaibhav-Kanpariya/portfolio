import type { RegionId } from "@/content/portfolio";

/**
 * A scroll stop. The wrapper lets pointer events fall through to the 3D
 * scene; only the text column itself is interactive.
 *
 * A `story` region is tall and its column sticks to the viewport while the
 * visitor scrolls through it, so a scroll-driven set piece can play behind.
 */
export default function Region({
  id,
  region,
  children,
  className = "",
  as: Tag = "section",
  labelledBy,
  story = false,
}: {
  id?: string;
  region: RegionId;
  children: React.ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
  labelledBy?: string;
  story?: boolean;
}) {
  const column = (
    <div className="pointer-events-auto w-full max-w-[36rem] px-5 min-[960px]:ml-[7vw] min-[960px]:px-0">
      {children}
    </div>
  );
  return (
    <Tag
      id={id ?? region}
      data-region={region}
      data-story={story ? "true" : undefined}
      aria-labelledby={labelledBy}
      className={`pointer-events-none relative ${className}`}
    >
      {story ? (
        <div className="sticky top-0 flex h-[100svh] items-end pb-[8vh] min-[960px]:items-center min-[960px]:pb-0">{column}</div>
      ) : (
        column
      )}
    </Tag>
  );
}
