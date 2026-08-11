# assets/

Drop your images in this folder. **No code editing needed** — the site looks for these
exact filenames and shows the photo automatically. If a file isn't here, a placeholder
box shows instead, so the site never looks broken.

| File name (exact) | Where it shows |
|---|---|
| `mohammed-sayeed.jpg` | Hero — your portrait |
| `about-visual.jpg` | About section — second image |

## The name has to match exactly

`mohammed-sayeed.jpg` — all lowercase, a hyphen between the words, ending in `.jpg`.

- `Mohammed-Sayeed.jpg` won't work once the site is on GitHub Pages (Linux servers treat
  capital letters as different characters, even though your Mac doesn't).
- `mohammed sayeed.jpg` (space instead of hyphen) won't work.
- `mohammed-sayeed.jpg.jpg` won't work — this happens when macOS hides file extensions and
  you type `.jpg` onto a name that already ends in `.jpg`. To see the real name: Finder →
  Settings → Advanced → tick "Show all filename extensions".

## Photos from an iPhone

iPhones save as `.HEIC`, which browsers can't display. Convert first:

Right-click the file in Finder → Quick Actions → Convert Image → Format: JPEG → Convert.

## Size

Aim for under ~500 KB per photo so the site loads fast. If yours is several MB:
open it in Preview → Tools → Adjust Size → set width to about 1200 pixels → save.

Hero photo looks best roughly 16:10 (landscape-ish); the About image roughly 4:5
(portrait). They're cropped to fit automatically, centred — so keep faces near the middle.
