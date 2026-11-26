# Simply N Sorted — website

Portfolio and company website for Simply N Sorted, built with [Astro](https://astro.build).
Astro turns the code into plain HTML/CSS files, so the site runs on any normal shared hosting (Globehost).

## How deployment works

```
push to main  →  GitHub Actions builds the site  →  uploads dist/ to Globehost over FTP
```

One-time setup in GitHub → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `FTP_SERVER` | FTP host from cPanel, e.g. `ftp.yourdomain.com` |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |

Files upload to the FTP account's home folder, which on this Globehost account is the website root. To upload somewhere else, add a **variable** (not secret) `FTP_SERVER_DIR`, e.g. `staging/`.

## Preview site (`test` branch → `/test/`)

```
push to test  →  GitHub Actions builds with BASE_PATH=/test  →  uploads to the test/ folder
```

The preview lives at `https://www.simplynsorted.com/test/` and never touches the live site.
It uses the same FTP secrets. Preview pages are marked `noindex` so Google ignores them.
When it is approved, merge `test` into `main` and the live site updates as usual.
In code, write internal links as `href={url('/page/')}` (from `src/utils/url.ts`) so they work in both places.

## Motion

Animations live in `src/scripts/motion.ts` (site-wide) and `src/scripts/hero-tiles.ts` (homepage hero),
using GSAP + ScrollTrigger and Lenis smooth scrolling. They read the theme colours from `global.css`,
so light/dark mode just works. Visitors with "reduce motion" turned on get the static site.

## Common edits

| To change… | Edit |
|---|---|
| Email, phone, WhatsApp, city | `src/data/site.ts` |
| Contact form recipient | `public/contact.php` (`$to` and `$from`) |
| Domain | `astro.config.mjs` and `public/robots.txt` |
| Services | `src/data/services.ts` |
| Colours & fonts | `src/styles/global.css` (top of file) |

## Adding a portfolio project

1. Copy any file in `src/content/projects/` and rename it, e.g. `new-client.md` (this becomes `/work/new-client/`).
2. Edit the details at the top (title, client, category, summary, url…).
3. Optional screenshot: put `new-client.png` in the same folder and add `cover: ./new-client.png`.
   Or, to show animation/parallax: put a short scroll-through video in `public/media/` (MP4, ideally under 3 MB)
   and add `video: /media/new-client.mp4` (plus optional `poster: /media/new-client.jpg`). Video takes priority over cover.
4. Optional results: add
   ```yaml
   results:
     - { value: '3x', label: 'more enquiries' }
   ```
5. Push to `main`. The site updates by itself in about two minutes.

Categories: `Websites`, `E-commerce`, `Software & CRM`, `Performance Marketing`, `Social Media`.

## Run locally (optional)

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # output in dist/
```
