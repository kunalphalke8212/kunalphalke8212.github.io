# Photos: where they go and how to prepare them

Drop your files in with **exactly** these names. You don't need to edit any code.
If a file is missing, the site shows a neon **KP** placeholder instead
(gallery slots with no photo are hidden, and the whole section hides if it's empty).

| File | Where it shows | Crop | Ideal export size | Target file size |
|---|---|---|---|---|
| `profile.jpg` | Hero, round frame with rotating neon ring | **Square 1:1**, face centred with some headroom | **800 × 800 px** (min 560 × 560) | **≤ 120 KB** |
| `about.jpg` | About section, glass frame | **Portrait 4:5** | **800 × 1000 px** | **≤ 150 KB** |
| `gallery/01.jpg` … `gallery/06.jpg` | "Beyond Code" grid + lightbox | Landscape **4:3** looks best (any works, it's cropped to fit) | **1600 × 1200 px** (long edge 1600) | **≤ 250 KB each** |

All images use `object-fit: cover`, so other sizes still crop cleanly, but exporting
close to these sizes keeps the page fast (the hero photo is the page's largest paint).

## How to compress

**Easiest (browser):** open <https://squoosh.app>, drop the photo in, then:
1. *Resize* → set the width from the table above.
2. Choose **MozJPEG**, quality **70–80**.
3. Download, rename to the file name above, and put it in this folder.

**Command line (batch):**
```bash
# ImageMagick: resize + strip metadata + quality 78
magick input.jpg -resize 800x800^ -gravity center -extent 800x800 -strip -quality 78 profile.jpg
magick input.jpg -resize 800x1000^ -gravity center -extent 800x1000 -strip -quality 78 about.jpg
magick input.jpg -resize 1600x1600\> -strip -quality 75 gallery/01.jpg
```

Tips
- `-strip` removes EXIF data (including GPS location), which also makes the file smaller.
- Keep the `.jpg` extension. If you want to use `.webp` or `.png`, change the matching
  `src` in `index.html`.
- Update the `alt` text and `<figcaption>` for each gallery photo in `index.html`
  so it describes what's actually in the picture.
