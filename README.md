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

If the site should go somewhere other than `public_html/`, add a **variable** (not secret) `FTP_SERVER_DIR`, e.g. `public_html/new/`.

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
