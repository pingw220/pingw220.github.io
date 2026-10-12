# Ping Wang — Personal Website

Academic homepage for Ping Wang, live at **https://pingw220.github.io**. Built with
[Astro](https://astro.build), TypeScript, MDX, and Tailwind CSS v4. Static site on GitHub Pages;
all content is MDX and TypeScript files you edit directly.

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
| `src/config/site.ts` | Name, role, email, profile links (Scholar / GitHub / LinkedIn), advisor URLs — edit this first |
| `src/config/news.ts` | News items on the home page (newest first) |
| `src/config/music.ts` | Performance videos on the Music page (YouTube ids, titles, dates) |
| `src/config/cv.ts` | Education, experience, interests, and skills on the About page — keep in sync with the CV PDF |
| `src/content/` | Publications and projects (MDX); posts and demos collections are empty for now |
| `src/content.config.ts` | Zod schemas for the content collections |
| `src/components/` | Astro components + the `FilterBar` React island |
| `src/styles/global.css` | Tailwind v4 theme tokens (colors, fonts) and global styles |
| `public/cv/ping-wang-cv.pdf` | CV linked from the site |
| `public/images/profile/ping-wang.jpg` | Portrait on the home and About pages |
| `public/images/og-default.png` | Social share image |
| `visitor-api/` | Cloudflare Worker behind the Global Reach map |

**Hiding a link:** set any URL in `SITE.social` to `''` and it disappears from the home
and About pages and the footer.

**Light / dark mode:** follows the visitor's system setting until they use the toggle in the header;
the choice is saved in their browser. Light-theme colors are in `src/styles/global.css`.

## Personal assets & branding

- **Logo / favicon.** The P-and-violin monogram is `public/images/branding/logo-mark.png` (nav and
  footer) and `logo-mark-512.png` (OG image). `logo-badge.png` is the tiled version used for
  `favicon.ico`, `favicon-32.png`, `favicon-192.png`, and `apple-touch-icon.png`.
- **Portrait.** `public/images/profile/ping-wang.jpg`, a 420×420 head-and-shoulders crop.
- **OG image.** `public/images/og-default.png` (1200×630): logo, name, role, and tagline.
  Regenerate it if your name or role changes.

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
authors: ['Ping Wang', 'Co Author']
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
