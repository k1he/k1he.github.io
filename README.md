# k1he blog (Minimal Static Blog)

A minimal, **no-build** static blog designed for **GitHub Pages**.

- Content: Markdown files in `posts/` with Front Matter
- Rendering: client-side via vanilla JavaScript
- Enhancements: Prism (code), KaTeX (math), Mermaid (diagrams), medium-zoom (image zoom)
- MVP_2: Archive view, Personal Panel, Table of Contents (ToC), subtle background effects

## Quick start (local)

Because the app uses `fetch()` to load `posts/index.json` and Markdown files, you must run it from a local HTTP server (not `file://`).

### Option A: Python

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000/

### Option B: Node

```bash
npx serve
```

## Content management

### 1) Add a new post

1. Create a Markdown file under `posts/`, e.g. `posts/my-first-post.md`.
2. Add Front Matter at the top:

```md
---
title: My First Post
date: 2025-12-27
tags: [demo, notes]
---

# Hello

Your content here.
```

### 2) Register the post in `posts/index.json`

GitHub Pages does **not** provide directory listing, so the homepage uses a registry file: `posts/index.json`.

Add an entry like:

```json
{
  "id": "my-first-post",
  "file": "my-first-post.md",
  "excerpt": "A short summary shown on the homepage."
}
```

Notes:

- The `id` is used in the URL: `post.html?slug=my-first-post`.
- `title`, `date`, and `tags` can be provided in Front Matter (recommended). `js/app.js` will read them and use them for rendering/sorting.

## Project structure

```text
.
├── index.html              # Homepage (post list + archive view via query param)
├── post.html               # Post detail page (with ToC)
├── css/
│   ├── style.css           # Main styles
│   ├── prism-theme.css     # Prism theme
│   └── katex.min.css       # KaTeX styles
├── js/
│   ├── app.js              # Main logic
│   ├── marked.min.js       # Markdown parser
│   ├── prism.min.js        # Code highlighting
│   ├── prism-autoloader.min.js
│   ├── katex.min.js        # Math rendering
│   ├── katex-auto-render.min.js
│   ├── mermaid.min.js      # Diagrams (lazy-loaded)
│   └── medium-zoom.min.js  # Image zoom (lazy-loaded)
├── posts/
│   ├── index.json          # Post registry
│   └── *.md                # Markdown posts
└── assets/
    ├── logo.svg
    ├── profile.jpg
    └── logos/
        ├── current.svg
        ├── past-1.svg
        └── past-2.svg
```

## Deployment (GitHub Pages)

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

This project includes a `.nojekyll` file to ensure GitHub Pages serves raw static assets without Jekyll processing.

## Customization

- Colors / layout: edit CSS variables and rules in `css/style.css`.
- Code highlighting theme: adjust `css/prism-theme.css`.
- Site title: update `<title>` in `index.html` / `post.html` and the sidebar branding.
