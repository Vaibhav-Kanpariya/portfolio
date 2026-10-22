"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { navItems, profile } from "@/content/portfolio";
import { scrollToId } from "@/components/galaxy/scroll";
import { setGalaxy } from "@/components/galaxy/store";

type Command = { id: string; label: string; hint?: string; run: () => void };

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const CHAOS_MS = 6000;

/**
 * ⌘K command palette, the Konami-code "DLQ chaos mode", and the toast that
 * announces it. One component so the keyboard handling lives in one place.
 */
export default function Commands() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const konami = useRef<string[]>([]);

  const say = useCallback((msg: string) => setToast(msg), []);
  // a toast clears itself; setting a new one restarts the clock
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const chaos = useCallback(() => {
    setGalaxy({ chaosUntil: performance.now() + CHAOS_MS });
    say("DLQ chaos mode: gravity is a suggestion for 6 seconds.");
  }, [say]);

  const commands = useMemo<Command[]>(
    () => [
      ...navItems.map((n) => ({ id: `go-${n.region}`, label: `Go to ${n.label}`, hint: "section", run: () => scrollToId(n.region) })),
      { id: "resume", label: "Open recruiter view", hint: "one-page résumé", run: () => router.push("/resume") },
      { id: "pdf", label: "Download résumé (PDF)", run: () => window.open(profile.resume, "_blank") },
      { id: "email", label: "Email Vaibhav", hint: profile.email, run: () => (window.location.href = `mailto:${profile.email}`) },
      { id: "github", label: "Open GitHub", run: () => window.open(profile.github, "_blank", "noopener") },
      { id: "linkedin", label: "Open LinkedIn", run: () => window.open(profile.linkedin, "_blank", "noopener") },
      { id: "chaos", label: "DLQ chaos mode", hint: "or type the Konami code", run: chaos },
    ],
    [router, chaos],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            setQuery("");
            setIndex(0);
          }
          return !o;
        });
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      // Konami, only when not typing somewhere
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if (!typing) {
        const seq = [...konami.current, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
        konami.current = seq;
        if (seq.length === KONAMI.length && seq.every((k, i) => k === KONAMI[i])) {
          konami.current = [];
          chaos();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, chaos]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);


  const run = (c: Command) => {
    setOpen(false);
    c.run();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-void/70 px-4 pt-[14vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Command palette"
            className="w-full max-w-[34rem] overflow-hidden rounded-2xl border border-starlight/15 bg-void-2 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={input}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setIndex((i) => Math.min(i + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" && results[index]) {
                  run(results[index]);
                }
              }}
              placeholder="Where to?"
              aria-label="Search commands"
              className="w-full border-b border-starlight/10 bg-transparent px-5 py-4 text-[1.05rem] text-starlight outline-none placeholder:text-faint"
            />
            <ul role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 && <li className="px-5 py-3 text-dust">Nothing matches. Try a section name.</li>}
              {results.map((c, i) => (
                <li key={c.id} role="option" aria-selected={i === index}>
                  <button
                    type="button"
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => run(c)}
                    className={`flex w-full items-baseline justify-between gap-4 px-5 py-2.5 text-left transition-colors ${
                      i === index ? "bg-starlight/10 text-starlight" : "text-dust"
                    }`}
                  >
                    <span>{c.label}</span>
                    {c.hint && <span className="t-meta text-faint">{c.hint}</span>}
                  </button>
                </li>
              ))}
            </ul>
            <p className="t-meta flex gap-4 border-t border-starlight/10 px-5 py-2.5 text-faint">
              <span>↑↓ move</span>
              <span>↵ open</span>
              <span>esc close</span>
            </p>
          </div>
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
        <div
          className={`rounded-full border border-signal/40 bg-void-2 px-4 py-2 text-[0.95rem] text-starlight shadow-lg transition-all duration-300 ${
            toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {toast}
        </div>
      </div>
    </>
  );
}

/** Small ⌘K affordance for the top bar (desktop). */
export function CommandHint() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      className="btn btn-quiet hidden bg-void/60 backdrop-blur-sm min-[960px]:inline-flex"
      aria-label="Open command palette"
    >
      <kbd className="font-sans text-[0.85rem]">⌘K</kbd>
    </button>
  );
}
