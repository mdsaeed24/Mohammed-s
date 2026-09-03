# Mohammed Sayeed — portfolio

Static site. No build step, no dependencies, no database.
Open `index.html` in a browser and it works.

```
index.html        all content and structure
css/styles.css    all styling
js/main.js        all interaction
assets/           your images (see assets/README.md)
refrences/        the design reference screenshots (not used by the site)
```

## Editing checklist

Everything you need to fill in is marked `[REPLACE: …]` in `index.html`.

1. **Projects** — 9 placeholder entries. Each project appears twice: once as a name
   in the left `.pindex` list, once as an `<article class="pcard">` on the right.
   Edit both so the columns stay in sync, and keep the `id="project-N"` matching
   the list item's `data-target`. Delete the yellow "Note to self" box when done.
2. **Social links** — footer. Replace `href="#"` with the real URL and delete the
   `data-placeholder-link` attribute (it's what makes the link say "placeholder").
3. **Photos** — see `assets/README.md`.
4. **Form** — currently opens WhatsApp with the visitor's details prefilled.
   To switch to Tally, replace the `<form id="callForm">` block with the Tally
   embed and delete the `FORM -> WHATSAPP` section in `js/main.js`.

## Deploying to GitHub Pages

Push this folder to a repo, then Settings → Pages → Deploy from branch → `main` / `root`.

Two things that break Pages and are already handled here — keep them that way:

- **Relative paths only.** `css/styles.css`, not `/css/styles.css`. A leading slash
  resolves to the domain root and 404s on a project-page URL like
  `username.github.io/repo/`.
- **Case-sensitive filenames.** Pages runs on Linux. `Assets/Photo.JPG` will 404
  even though it works on macOS.

Fonts load from Google Fonts, so the site needs a connection to look right; without
one it falls back to system fonts and still reads fine.
