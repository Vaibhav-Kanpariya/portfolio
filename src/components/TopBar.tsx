import Link from "next/link";
import { profile } from "@/content/portfolio";
import { CommandHint } from "./Commands";

export default function TopBar() {
  return (
    <header className="no-print pointer-events-none fixed inset-x-0 top-0 z-30">
      <div className="flex items-center justify-between px-5 py-4 min-[960px]:px-[5vw] min-[960px]:py-6">
        <a
          href="#intro"
          className="pointer-events-auto text-[1.05rem] font-[800] tracking-[-0.02em] [font-stretch:125%]"
          aria-label={`${profile.name}, back to top`}
        >
          VK
        </a>
        <div className="pointer-events-auto flex items-center gap-2">
          <CommandHint />
          <Link href="/resume" className="btn btn-quiet bg-void/60 backdrop-blur-sm">
            Recruiter view
          </Link>
        </div>
      </div>
    </header>
  );
}
