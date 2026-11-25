# Arcade Atlas

An original, static browser prototype for a premium game discovery and creation platform. It uses plain HTML, CSS, and JavaScript modules so the source is easy to inspect and it can run without installing packages.

## Run it

From this repository's root, start a local static server:

```powershell
python -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173). No build step or package install is needed.

## Source map

- `index.html` — app entry point and document metadata.
- `styles.css` — design tokens, responsive layouts, artwork, and component styles.
- `data.js` — deterministic sample catalogue, creator, and jam data.
- `app.js` — hash-based navigation, rendering, local demo persistence, and interactions.
- `PROGRESS.md` — initial audit, implementation status, verification, and remaining integrations.

## Demo behavior

Search, genre filters, sorting, game details, a small keyboard-controlled browser game, save-to-library, recent history, creator follows, sample generation, versioned drafts, and the creator studio work locally in the browser. The generator, analytics, publishing, user identity, and community content are explicitly demo-only. No backend, authentication, AI service, or public publishing service is connected.

Game cards, the featured-game banner, genre tiles, creator spotlights, and jam cards use original vector cover illustrations matched to each game's theme. The cover artwork is embedded locally in `artwork.js`, so it does not rely on stock-photo URLs. Interface icons use the Hugeicons Free stroke font from its CDN. Google Fonts are requested for Space Grotesk and DM Sans; system fallbacks keep the app readable if those fonts are unavailable.
