# Vaibhav Kanpariya: portfolio v2 (3D)

My work as an embedding-space galaxy. Every skill, project and job is a star, placed near the things it relates to. Scrolling flies the camera between sections; hovering a star or a skill name lights up what it connects to. A plain one-page recruiter view lives at `/resume`.

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
| 3D scene (dust, stars, links, packets) | `src/components/galaxy/` |
| Page sections | `src/components/sections/` |
| Recruiter view | `src/app/resume/page.tsx` |
| Design tokens and type roles | `src/app/globals.css` |

To add a project, add it to `projects` in `portfolio.ts` with the skill ids it `uses`. Its star is placed automatically between those skills.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Three Fiber + Drei, custom GLSL shaders, Lenis smooth scrolling.

## Accessibility and fallbacks

- `prefers-reduced-motion`: no smooth scrolling, no twinkle or packets, and the camera cuts between views instead of flying.
- No WebGL: the page shows a still gradient behind the same content.
- All content is real HTML; the canvas is decorative (`aria-hidden`).

## Branches

Each version of the portfolio lives on its own branch and is deployed from there. `main` holds v1.
