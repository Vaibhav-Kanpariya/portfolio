# Vaibhav Kanpariya: portfolio v2 (3D)

My work as an embedding-space galaxy. Every skill, project and job is a star, placed near the things it relates to. Scrolling flies the camera between sections. A plain one-page recruiter view lives at `/resume`.

## What happens as you scroll

| Stop | What you see |
| --- | --- |
| Boot | A one-second terminal boot sequence (skipped on repeat visits and with reduced motion). |
| Intro | The galaxy's dust assembles into the name, reacts to the pointer, then scatters into the spiral. |
| Impact | Figures count up as they enter view. |
| Career | The camera follows the career track from CHARUSAT to CultureX. |
| Mastermind | A 2,000-particle pool, three signal streams fusing into an orb, the 20:1 funnel and a re-rank after a rejection, scrubbed by scroll. |
| NTN | Envelopes between two agents; one fails into the dead-letter bin, waits out the retry timer, and completes. |
| Skills | A physics pile of labelled blocks you can grab and throw (tap to flip on a phone). |
| Contact | Email and links. |

Also: `⌘K` command palette, a custom cursor on fine pointers, bloom on desktop, and the Konami code (↑↑↓↓←→←→BA) for six seconds of "DLQ chaos mode".

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Where things are

| What | Where |
| --- | --- |
| All copy, metrics, jobs, projects, skills | `src/content/portfolio.ts` |
| Star positions, links, camera stops | `src/components/galaxy/layout.ts` |
| Dust + name particles | `src/components/galaxy/Dust.tsx`, `namePoints.ts` |
| Stars, links, packets, labels | `src/components/galaxy/Constellation.tsx` |
| Scroll-driven set pieces | `MastermindStory.tsx`, `NtnStory.tsx` |
| Physics pile | `src/components/galaxy/SkillsPile.tsx` |
| Scroll → camera and story progress | `ScrollDriver.tsx`, `CameraRig.tsx`, `story.ts` |
| Palette, cursor, boot, count-up | `src/components/Commands.tsx`, `Cursor.tsx`, `Boot.tsx`, `CountUp.tsx` |
| Page sections | `src/components/sections/` |
| Recruiter view | `src/app/resume/page.tsx` |
| Design tokens and type roles | `src/app/globals.css` |

To add a project, add it to `projects` in `portfolio.ts` with the skill ids it `uses`. Its star is placed automatically between those skills.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Three Fiber + Drei, Rapier physics, postprocessing (bloom), custom GLSL shaders, Lenis smooth scrolling.

## Accessibility and fallbacks

- `prefers-reduced-motion`: no boot sequence, no smooth scrolling, no twinkle or packets, no custom cursor, and the camera cuts between views instead of flying.
- Bloom and the physics world are mounted only when needed; a struggling GPU drops to a lower pixel ratio without bloom.
- No WebGL: the page shows a still gradient behind the same content.
- All content is real HTML; the canvas is decorative (`aria-hidden`).

## Branches

Each version of the portfolio lives on its own branch and is deployed from there. `main` holds v1.
