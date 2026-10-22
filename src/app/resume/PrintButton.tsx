"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-rule px-4 py-2 text-[0.95rem] font-[600] text-ink transition-colors hover:border-ink"
    >
      Print
    </button>
  );
}
