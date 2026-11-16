# Mike Gibney Photography

A sleek, single-page black portfolio — self-hosted, no Wix, no monthly platform
fee. Hosted free on **GitHub Pages** at photo.mikegibney.net.

**The page:** a large photo viewer on the left, a scrollable 5-wide thumbnail
grid on the right. Click a thumbnail to view it; hit **expand** (or click the
photo) for true full-screen — click anywhere or press **Esc** to exit, arrow
keys to move between shots. Scroll past the gallery for your **About** and
**Contact** sections.

```
index.html        The whole site (gallery + about + contact)
css/styles.css    Styling
js/app.js         Gallery: thumbnails, viewer, fullscreen
js/contact.js     Contact form (no server needed)
photography/      ← YOUR ORIGINAL PHOTOS LIVE HERE (untouched)
images/gallery/   Auto-generated web + fullscreen versions (don't edit)
images/about/     Auto-generated About portrait
galleries/        manifest.js — auto-generated list the site reads
tools/            process-photos.py (optimize+manifest) · serve.mjs (preview)
render.yaml       Render deploy settings
```

## Adding or changing photos — the one thing to remember

1. Drop (or remove) image files in the **`photography/`** folder. Use any normal
   JPG/PNG; your originals are never modified.
2. Run the processor once:
   ```bash
   python3 tools/process-photos.py        # or: npm run photos
   ```
   It makes fast web-sized + full-screen copies and rebuilds the photo list.
3. Refresh the site — the new photos are there.

**Order:** photos appear alphabetically. Prefix filenames with numbers to set the
order: `01-little-tahoma.jpg`, `02-dunes.jpg`, …

**Captions (optional):** create `tools/captions.json`:
```json
{ "Fuego Erupt.jpg": "Volcán de Fuego erupting at dawn" }
```

**Special files** (handled automatically by name):
- A file with **"headshot"** in its name becomes the About portrait (not shown in
  the grid).
- Screenshots (filenames containing "screen shot") are skipped.
- The image named **"Little Tahoma"** opens the gallery first — change
  `HERO_MATCH` near the top of `tools/process-photos.py` to feature a different one.

> Requires Python with Pillow (`pip install pillow`). Node is only needed for the
> local preview server.

## Preview on your computer

```bash
npm start        # serves http://localhost:5173
```

## The contact form

No shopping cart — print orders and inquiries arrive as messages. The form posts
to [FormSubmit](https://formsubmit.co): free, no server, no signup. The **first**
submission emails *you* a one-time activation link; click it once and you're set.
If it ever can't reach the service, it falls back to opening a pre-filled email.

## Hosting (GitHub Pages)

Live at **https://photo.mikegibney.net**, served free by GitHub Pages from the
`main` branch of the GitHub repo for this project.

- `CNAME` tells GitHub Pages the custom domain. DNS: a CNAME record
  `photo` → `gibberney.github.io` at GoDaddy (mikegibney.net's DNS host).
- `.nojekyll` makes Pages serve the files as-is.
- `photography/` (the originals) is git-ignored and never uploaded; only the
  optimized copies in `images/` are published.

**To update the site:** run `python3 tools/process-photos.py`, then commit and
push (in PyCharm: Commit, then Push). Pages redeploys in about a minute.
