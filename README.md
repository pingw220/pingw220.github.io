# Peter Wang — Personal Website

Personal academic/research website built with [Astro](https://astro.build), TypeScript, MDX,
Tailwind CSS v4, and React islands. Static-first, no database, no CMS — all content is MDX files
you edit directly.

## Setup

Requires Node.js ≥ 22.12.

```sh
npm install
npm run dev        # start dev server at http://localhost:4321
```

Other scripts:

```sh
npm run build      # production build to ./dist
npm run preview    # preview the production build locally
npm run check      # astro check (TypeScript + template diagnostics)
```

## Where things live

| Path | Purpose |
| --- | --- |
| `src/config/site.ts` | Your name, email, social links, tagline — edit this first |
| `astro.config.mjs` | Site URL (used for canonical URLs, sitemap, RSS) — update before deploying |
| `src/content/` | All content: publications, projects, posts, demos (MDX) |
| `src/content.config.ts` | Zod schemas for the four content collections |
| `src/components/` | Astro components + React islands (`FilterBar`, `AnimatedWaveform`) |
| `src/styles/global.css` | Tailwind v4 theme tokens (colors, fonts) and global styles |
| `src/config/visitors.ts` | Data for the Global Reach visitor section (hand-editable) |
| `public/cv/peter-wang-cv.pdf` | Your CV — **currently a placeholder, replace it** |
| `public/media/` | Audio/image files referenced by demos |
| `public/images/branding/` | Logo mark (SVG + PNG), apple-touch-icon |
| `public/images/profile/` | Portrait — drop `peter-wang.jpg` here and point `SITE.portrait` at it |
| `public/images/backgrounds/` | Decorative harbor art (swap for a real photo if you like) |
| `public/images/og-default.png` | Open Graph / social share image |

## Personal assets & branding

- **Logo / favicon.** The P-and-violin monogram is `public/images/branding/logo-mark.png`
  (transparent, used in the nav and footer) and `logo-mark-512.png` (larger, for the OG image and
  the hero watermark). `logo-badge.png` is the navy-tiled version used to generate `favicon.ico`,
  `favicon-32.png`, `favicon-192.png`, and `apple-touch-icon.png`. To rebrand, replace these and
  regenerate the icons.
- **Portrait.** `public/images/profile/peter-wang.jpg`, shown on the home intro and About page via
  `SITE.portrait`. The crop is biased toward the top so the face stays in frame — adjust the
  `object-[50%_18%]` class if needed.
- **Backgrounds.** `public/images/backgrounds/harbor.jpg` (landscape) is used on the About page and
  in the home "Between the notes" panel with a dark gradient overlay; `harbor-portrait.jpg` is the
  vertical version, available if you want it.
- **OG image.** `public/images/og-default.png` (1200×630) is the social preview, composed from the
  logo + name + tagline. Regenerate it if you rebrand.

## Global Reach (visitor statistics)

The home page shows a "Global Reach" section: a Leaflet world map (Esri dark tiles) with a bubble
per city, Top Countries / Top Cities rankings, and a privacy note.

GitHub Pages only serves static files, so visits are recorded by a small **Cloudflare Worker** in
[`visitor-api/`](visitor-api/README.md) that stores per-city totals in a free D1 database. Every
page sends one request to it (`src/scripts/visits.ts`, loaded by `BaseLayout.astro`); each visitor
is counted at most once per day and no IP addresses are stored.

- **Connect it:** follow `visitor-api/README.md`, then set `SITE.visitorApi` in
  `src/config/site.ts` to the Worker URL.
- **Until then** the map shows sample data from `src/config/visitors.ts`, with a note saying so.

## Adding content

### Add a publication

Create `src/content/publications/my-paper.mdx`:

```mdx
---
title: 'Paper Title'
authors: ['Peter Wang', 'Co Author']
venue: 'ISMIR 2026'
year: 2026
status: 'published' # published | accepted | preprint | under-review | in-progress
abstract: 'One-paragraph abstract shown on the card.'
tags: ['amt', 'evaluation']
links:
  paper: 'https://...'
  code: 'https://...'
bibtex: |
  @inproceedings{...}
featured: true # shows on the home page
---

Optional extra notes (not currently rendered — publications display as cards).
```

### Add a project

Create `src/content/projects/my-project.mdx`. The filename becomes the URL slug
(`/projects/my-project`):

```mdx
---
title: 'Project Name'
subtitle: 'One-line subtitle'
description: 'Card description.'
role: 'Lead developer'
year: 2026
status: 'active' # active | completed | paused | archived
category: 'research' # research | engineering | experiment
tags: ['amt']
links:
  github: 'https://...'
featured: true
---

Full project write-up in MDX — rendered on the detail page.
```

### Add a post

Create `src/content/posts/my-post.mdx` (`/posts/my-post`):

```mdx
---
title: 'Post Title'
description: 'Shown in lists and meta tags.'
date: 2026-07-01
tags: ['mir']
draft: false # true hides it from the site and RSS
---

Post body in MDX.
```

### Add a demo

Create `src/content/demos/my-demo.mdx` (`/demos/my-demo`). Put media files in `public/media/`:

```mdx
---
title: 'Demo Name'
subtitle: 'One-liner'
description: 'Card description.'
tags: ['transcription']
media:
  - kind: 'audio' # audio | image | midi
    src: '/media/example.wav'
    label: 'Input audio'
links:
  project: '/projects/my-project'
featured: false
---

Explanation of the demo.
```

## Deploying to GitHub Pages

The site is served from **https://pingw220.github.io** by `.github/workflows/deploy.yml`, which
builds and publishes on every push to `main`.

1. Rename the GitHub repository to **`pingw220.github.io`** (Settings → General → Repository name)
   so the site is served from the root of the domain. Then update your local remote:
   `git remote set-url origin https://github.com/pingw220/pingw220.github.io.git`
2. In Settings → Pages, set **Source** to **GitHub Actions**.
3. Push to `main`. The Actions tab shows the build; the site goes live when it finishes.

`site` in `astro.config.mjs` is already set to `https://pingw220.github.io` for canonical URLs,
the sitemap, and RSS.

## Before you ship (placeholders to replace)

- `public/cv/peter-wang-cv.pdf` — placeholder PDF
- `src/config/site.ts` — LinkedIn URL is a placeholder; `visitorApi` is empty until the Worker is deployed
- `public/media/*.wav` — synthesized placeholder audio used by the Audio → Lead Sheet demo
- `public/images/profile/peter-wang.jpg` — add your real portrait, then point `SITE.portrait` at it
- `public/images/branding/logo-mark.svg` — recreated logo; swap in your exact artwork if you have it
- `public/images/backgrounds/harbor-dusk.svg` — generated art; replace with a real photo if desired
- `src/content/demos/audio-to-leadsheet.mdx` — the one remaining demo, still using placeholder audio
