@AGENTS.md

## Branching rules (from Vaibhav)

- Never push to `main`. Each portfolio version lives on its own branch (e.g. `v2-3d`) and is deployed from that branch once it's done, so earlier versions stay intact.
- Commit and push only to the version branch you're working on.

## v2 (3D galaxy) structure

- `src/content/portfolio.ts` holds all copy and data. Both the 3D view and `/resume` read from it.
- `src/components/galaxy/` is the WebGL scene: `layout.ts` places stars and camera stops, `ScrollDriver.tsx` maps scroll to camera stops, `store.ts` shares state between DOM and scene.
- Fonts are self-hosted from `src/fonts/` (no Google Fonts fetch at build time).
