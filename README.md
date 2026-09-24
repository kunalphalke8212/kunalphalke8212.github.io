# Kunal.dev: portfolio

A futuristic, dark-first personal site in plain HTML, CSS and JavaScript. No framework, no build step.

```
myResumeWeb/
├── index.html          ← all content (search for "EDIT:" comments)
├── css/style.css       ← theme tokens at the top (colours, fonts)
├── js/main.js          ← boot screen, typing, particles, cursor trail, reveal, lightbox
└── assets/
    ├── favicon.svg
    ├── Kunal_Phalke_Resume.pdf   ← add your CV here (the Resume button links to it)
    └── images/          ← your photos; see images/README.md for sizes
        ├── profile.jpg
        ├── about.jpg
        └── gallery/01.jpg … 06.jpg
```

## Run locally
```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Edit content
Search `index.html` for `EDIT:`. The experience, projects, skills and contact
links are **sample content**; replace them with your own before sharing.

## Deploy
**GitHub Pages:** repo Settings → Pages → Source "Deploy from a branch" → `main` / `(root)`.
The site will be live at `https://kunalphalke8212.github.io/myResumeWeb/`.

Any other static host (Netlify, Vercel, Cloudflare Pages) also works: no build command, publish directory is the repo root.

## Motion & performance
- `prefers-reduced-motion`: no boot screen, particles, typing, cursor trail, ring spin or reveal animations.
- Particle canvas and cursor trail run only on desktop (mouse + ≥768px wide).
  The canvas pauses when the tab is hidden or the hero is off-screen.
- Boot screen runs at most once per browser session and is skippable by click or key press.
