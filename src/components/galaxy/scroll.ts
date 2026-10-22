/**
 * Scrolling helpers shared by DOM links and 3D star clicks.
 * When Lenis smooth scrolling is active it owns the scroll position, so
 * programmatic scrolls go through it.
 */
type LenisLike = { scrollTo: (target: HTMLElement | number, opts?: { offset?: number; immediate?: boolean }) => void };

let lenis: LenisLike | null = null;

export function registerLenis(instance: LenisLike | null) {
  lenis = instance;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
