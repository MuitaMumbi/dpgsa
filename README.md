# DPGSA UoN website

Static redesign of https://dpgsa.vercel.app. Plain HTML, CSS and JavaScript with no build step.

## Files

```
index.html          Home  (/)
about.html          /about
events.html         /events
resources.html      /resources
publications.html   /publications
membership.html     /membership
assets/styles.css   All styles (colour and type tokens are at the top, in :root)
assets/site.js      Card nav, terminal, hero slider, Medium feed, copy-till button
api/medium.js       Vercel function: reads the Medium feed for /api/medium
vercel.json         cleanUrls, so /about serves about.html
```

External scripts and fonts: GSAP 3.12.5 from cdnjs (card nav animation) and Google Fonts
(Archivo, Source Serif 4, IBM Plex Mono). If GSAP fails to load, the nav still opens without animation.

## Images

The pages point at the images already in your project:

- `/images/association/dpgsa-meeting-01.webp`, `dpgsa-meeting-02.webp`
- `/images/association/about-*.webp`, `dpgsa-board-2025-2026.webp` (About)
- `/images/association/activity-*.webp`, `juaterms-*.webp`, `juaterms-logo-white.jpeg` (Activities)
- `/images/association/essay-competition-01.webp` … `-08.webp`
- `/images/membership-registration-poster.jpeg`
- `/images/uon-entrance.jpg` (home mission block)
- `/images/dpgsa-auditorium-meeting.jpg` (home hero, social preview)
- `/images/dpgsa-logo.webp` (favicon)

Hero slides and page banners are CSS backgrounds set inline with `style="--bg:url('…')"`.
Change the URL there to swap a photo.

Copy your existing `images/` folder next to `index.html`.

Every page uses your real photos; there are no placeholders left.

## Medium articles

The homepage ("Latest articles") and Publications page show posts from https://medium.com/@datapgsa.

- `api/medium.js` runs on Vercel at `/api/medium`. It reads the Medium feed and returns the latest
  six posts as JSON. Vercel caches it for an hour, so a new article shows up within the hour.
- `assets/site.js` loads `/api/medium` and fills every `[data-medium]` block (`data-limit` sets how many).
- Each page also has the current article written into the HTML, so something shows even before the feed
  loads or if Medium is unreachable. When you publish new articles you don't need to touch this.
- Medium's feed only includes the 10 most recent posts.

The function needs Vercel (or any host that runs Node 18+ functions from `api/`). `npx serve` won't run it
locally; use `npx vercel dev` to test it on your computer.

## Logos

The nav and footer show two logos from `images/brand/`:

- `dpgsa-logo.png` is included (cut from the logo you supplied).
- `uon-logo.png` you need to add: save the University of Nairobi logo from
  https://www.uonbi.ac.ke/sites/default/files/UoN_Logo.png into `images/brand/` as `uon-logo.png`.
  Use that exact file: the CSS shows only the crest from it, so a different image would be cropped wrongly.

## Board photos

The "Meet the board" section on the About page (`/about#board`) has a photo spot and a
"Name to be added" line for each of the 11 positions. To fill one in, in `about.html`:

1. Save the photo as `/images/board/<position>.webp`. The comment above each card gives the exact
   filename, for example `president.webp` or `first-year-rep-1.webp`.
2. Replace that card's `<div class="avatar" …>…</div>` with the `<img class="avatar-img" …>` line in
   the comment, and put the person's name in its `alt`.
3. Replace `Name to be added` with their name.

## Run locally

Root-relative links (`/about`, `/assets/…`) need a local server, not a double-clicked file:

```
npx serve .
```

## Deploy

Put these files (plus `images/`) at the root of the repo that Vercel deploys. If the current project
uses a framework, set Vercel's Framework Preset to "Other" with no build command and the output
directory as the repo root.

The privacy policy page (`/privacy-policy`) was not redesigned. Keep your existing one at that path.

## Editing

- Colours and fonts: the `:root` block at the top of `assets/styles.css`.
- Nav links: the `.nav-card` blocks, repeated at the top of each HTML file.
- Terminal lines: the `script` array in `assets/site.js`.
