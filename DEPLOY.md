# Deployment Guide

The app builds to a static bundle in `dist/` and can be deployed to any static host.

## 1. Build

```bash
pnpm install
pnpm build
# Output: dist/
```

## 2. Hosting options

### Netlify (recommended)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git**.
3. Set build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist`
4. Deploy. Netlify gives you a `*.netlify.app` URL instantly.

### Vercel

```bash
npx vercel --prod
# Follow prompts. Framework preset: Vite.
```

Or via dashboard: import repo, set output directory to `dist`.

### Cloudflare Pages

1. Dashboard → Pages → Create project → Connect to Git.
2. Build command: `pnpm build`
3. Build output directory: `dist`
4. Deploy.

### Any static host (S3, nginx, etc.)

Upload the contents of `dist/` to your web root. Because this is a single-page app, configure your host to serve `index.html` for all routes (there's only one route, so this is a no-op for this app, but good practice).

---

## 3. Custom subdomain: play.shareefs.com.au

### Step 1 — Add custom domain in your host

In Netlify/Vercel/Cloudflare Pages, go to **Domain settings → Add custom domain** and enter:

```
play.shareefs.com.au
```

Your host will show you either a CNAME target or an A record IP.

### Step 2 — Update DNS at your registrar

Log into wherever `shareefs.com.au` DNS is managed (likely your domain registrar or Cloudflare).

Add a DNS record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `play` | `your-project.netlify.app` (or equivalent) | 300 |

If your host requires an A record instead of CNAME (e.g. for the apex domain):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `play` | `76.76.21.21` (Vercel IP — check your host) | 300 |

### Step 3 — Wait for propagation

DNS changes typically propagate in 5–30 minutes. Your host will auto-provision an SSL certificate once the CNAME resolves.

### Step 4 — Verify

```bash
curl -I https://play.shareefs.com.au
# Should return HTTP 200
```

---

## 4. Environment notes

- **No backend required.** All game state is client-side localStorage.
- **No API keys or secrets** — nothing to configure in environment variables.
- **Google Fonts** are loaded via CSS `@import` in `src/index.css`. Ensure the deploy host doesn't block external CDN requests.
- The app works fully offline after first load (no service worker in v1 — add one later for full PWA support).

---

## 5. Adding a PWA manifest (optional)

Create `public/manifest.json`:

```json
{
  "name": "Shareefs Backgammon",
  "short_name": "Backgammon",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A1A1A",
  "theme_color": "#8B1A1A",
  "icons": [
    { "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json" />
```

This enables "Add to Home Screen" on iOS/Android so customers can bookmark the game like a native app.
