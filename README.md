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
| `src/data/*.json` | Profile, bio, news, CV, and music — edit from /admin |
| `src/config/site.ts` | Technical settings (share image, visitor API) |
| `src/content/` | Posts, publications, and projects (Markdown; projects in `en/` and `zh/`) |
| `src/content.config.ts` | Zod schemas for the content collections |
| `src/components/` | Astro components + the `FilterBar` React island |
| `src/styles/global.css` | Tailwind v4 theme tokens (colors, fonts) and global styles |
| `public/cv/ping-wang-cv.pdf` | CV linked from the site |
| `public/images/profile/ping-wang.jpg` | Portrait on the home and About pages |
| `public/images/og-logo.png` | Square logo shown when the link is shared |
| `visitor-api/` | Cloudflare Worker behind the Global Reach map |

**Hiding a link:** set any URL in `SITE.social` to `''` and it disappears from the home
and About pages and the footer.

**Light / dark mode:** follows the visitor's system setting until they use the toggle in the header;
the choice is saved in their browser. Light-theme colors are in `src/styles/global.css`.

## Editing the site from the browser (/admin)

Go to **https://pingw220.github.io/admin** to edit everything without touching code. Saving
commits to this GitHub repo, and the site rebuilds automatically (about 1–2 minutes).

**First time:** click **Sign In Using Access Token**, follow the link to GitHub, and create a
*fine-grained* token for the `pingw220/pingw220.github.io` repository with
**Contents: Read and write**. Paste it in; the browser remembers it.

| In the admin | What it edits | Stored in |
| --- | --- | --- |
| Posts | Blog posts | `src/content/posts/*.md` |
| Publications | Papers on the Research page | `src/content/publications/*.md` |
| Projects | Project pages (English + 中文) | `src/content/projects/{en,zh}/*.md` |
| Profile & pages → Profile & bio | Name, role, bio, links, photo, CV PDF | `src/data/profile.json` |
| Profile & pages → News | Home-page news | `src/data/news.json` |
| Profile & pages → About page (CV) | Interests, education, experience, skills | `src/data/cv.json` |
| Profile & pages → Music | Performance videos | `src/data/music.json` |

**Editor layout:** the editor is on the left and a live preview on the right (drag the divider to
resize; scroll stays in sync). Posts and projects open in plain Markdown, like HackMD — switch to
*Rich text* in the body field's menu for the Image / Audio / Video / YouTube buttons. The preview
renders math, code colors, and media the same way the site does (`public/admin/index.html`,
`public/admin/preview.css`).

**Writing posts** (Markdown):

- Math: `$E = mc^2$` inline, `$$ … $$` on its own lines for display equations (KaTeX).
- Code: fenced blocks with a language, e.g. ```` ```python ````; colors follow light/dark mode.
- Images: the Image block (uploads go to `public/media/uploads/`).
- Audio / video files: the Audio or Video block, or `![caption](/media/uploads/file.mp3)`.
- YouTube: the YouTube block, or paste a YouTube link on its own line.

Keep uploads small (a few MB; GitHub rejects files over 100 MB). For long videos, upload to
YouTube and embed the link instead.

The admin configuration is `public/admin/config.yml`; the embeds are handled by
`src/lib/rehype-media.mjs`.

## Playground (/playground)

A small 3D night market (three.js) where visitors walk around with Mochi, a little Shiba Inu. Each
stall leads into its own world (also linkable directly, e.g. `/playground#library`):

| Stall | World | What's inside |
| --- | --- | --- |
| 🎻 Music | Music studio (`#studio`) | Every performance framed on the walls; walk up to play it |
| 📝 Posts | Writing room (`#writing`) | Each post is a note on the cork board |
| 📚 Novel Library | Library (`#library`) | Novels on display tables, grouped by author |
| 📺 Anime Library | Anime theater (`#theater`) | A poster for each anime |
| ✈️ Travel Journal | Train station (`#station`) | A world map with a pin per place (green houses = home) |
| 🏆 Sports | Hall of GOATs (`#sports`) | A pedestal and photo for each athlete |
| 💌 Post Office | Post office (`#postoffice`) | A mailbox for leaving a message, and a board of public ones |

At the far end of the street is a fireworks plaza: walk up to the launcher and press E.

**Controls.** On a computer, click once to look around with the mouse (like a first-person game;
Esc releases it). WASD / arrow keys walk, the scroll wheel zooms, and E / Enter / click uses whatever
is under the crosshair. On a phone, drag to look and tap to walk or open things. Every world has a
door and a "Back to the market" button, plus "Show as a list". Devices without WebGL, and visitors
who prefer reduced motion, get the same content as lists.

**Content.** Music videos and posts appear automatically. Novels, anime, travel places, and sports
are edited in the admin: **Profile & pages → Playground library** (`src/data/library.json`). Each
novel, anime, and athlete can have a photo, an image credit, a rating (0–5), how much you love it
(1–5 hearts), a category, and your thoughts; these show on the card when you click it. Travel places
take a latitude/longitude, and "Home" makes the pin a green house. Covers and photos are hotlinked
from their source (AniList, Open Library, Wikimedia Commons) with a credit, never copied into the repo;
items without one get a cover drawn in code.

**Messages.** The post office form sends a message to the visitor Worker (`POST /messages`). Visitors
choose **Public** (pinned on the board and listed under the form) or **Private** (only you see it).
Read and delete everything at **/admin/inbox.html** with your admin key (the Worker's `ADMIN_KEY`
secret). See `visitor-api/README.md`.

**Code.** `src/views/Playground.astro` (page, panels, item cards, message form) and
`src/scripts/playground/`: `engine.ts` (movement, mouse-look camera, aiming, transitions),
`worlds/*.ts` (one file per world), `stall.ts`, `mascot.ts` (Mochi), `fireworks.ts`, and
`kit.ts` / `textures.ts` (shared materials and painted textures).

## Two languages (English / 中文)

English is the default at `/`; Traditional Chinese lives at `/zh/` (e.g. `/zh/about`). The 中文 / EN
button in the header switches to the same page in the other language.

- **UI text** (menus, headings, labels): `src/i18n/index.ts`, one entry per language.
- **Your content** (`src/data/*.json`, edited from /admin): bilingual fields have an `en` and a
  `zh` version.
- **Projects:** `src/content/projects/en/<slug>.md` and `src/content/projects/zh/<slug>.md` — give
  both files the same name. Paper titles, abstracts, and BibTeX stay in English.
- **Pages:** each page's markup is in `src/views/`; `src/pages/` and `src/pages/zh/` just render it.

## Personal assets & branding

- **Logo / favicon.** The P-and-violin monogram is `public/images/branding/logo-mark.png` (nav and
  footer) and `logo-mark-512.png` (OG image). `logo-badge.png` is the tiled version used for
  `favicon.ico`, `favicon-32.png`, `favicon-192.png`, and `apple-touch-icon.png`.
- **Portrait.** `public/images/profile/ping-wang.jpg`, a 480×480 head-and-shoulders crop.
- **Share image.** `public/images/og-logo.png` (600×600), the logo badge shown in link previews.

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

The easiest way is the admin page (see above). To edit files directly instead, copy an existing file
in the same folder and change it — the frontmatter fields are defined in `src/content.config.ts`:

- Post: `src/content/posts/<slug>.md` → `/posts/<slug>`
- Publication: `src/content/publications/<slug>.md`
- Project: `src/content/projects/en/<slug>.md` and `src/content/projects/zh/<slug>.md` → `/projects/<slug>`

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
