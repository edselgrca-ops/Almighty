# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Almighty is a static, no-build Christian prayer generation site deployed to GitHub Pages. It calls the Anthropic API directly from the browser — there is no backend.

**Live URL:** https://edselgrca-ops.github.io/almighty

## Local development

```bash
open index.html
```

No build, no server, no dependencies to install. Google Sign-In requires the origin to be registered in the OAuth client; `http://localhost` is already allowed for local testing (serve via `python3 -m http.server` if you need a localhost origin).

## Architecture

The app is a vanilla-JS SPA with CSS-class-based page switching. All four "pages" (home, gen, cat, saved) are always in the DOM; `showPage(id)` toggles `.active` on the right `#page-<id>` div and the matching nav link.

### Two parallel versions — keep them in sync

`index.html` is **self-contained**: all CSS is in a `<style>` block, all JS is in an inline `<script>`. This is what GitHub Pages actually serves.

`style.css` and `app.js` are the **modular source files** — same logic, but split out and slightly more polished (e.g. `escHtml` vs `esc`, `renderPrayer` extracted). They are **not referenced by index.html**. When making changes, update both the inline version in `index.html` and the corresponding external file.

### Key globals in app.js / index.html script

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLAUDE_MODEL` | Anthropic model string (currently `claude-sonnet-4-20250514`) |
| `currentUser` | JWT payload from Google Sign-In (`null` if not signed in) |
| `savedPrayers` | In-memory array; persisted to `localStorage` keyed by `almighty_saved_<user.sub>` |

### API call

`generatePrayer()` posts directly to `https://api.anthropic.com/v1/messages` from the browser. The API key must be injected at request time (or stored client-side) — there is no proxy.

### Auth flow

Google Sign-In uses the GSI client library. `handleCredential()` decodes the JWT with `parseJwt()`, sets `currentUser`, loads that user's prayers from localStorage, and updates the nav avatar. Saving is gated on `currentUser !== null`.

## Deployment

Push to `main` — GitHub Pages auto-deploys from root. When changing the OAuth client (Google Cloud Console → APIs & Services → Credentials), ensure `https://edselgrca-ops.github.io` is in **Authorized JavaScript origins**.
