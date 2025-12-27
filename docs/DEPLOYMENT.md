# Deployment Guide (GitHub Pages)

This project is a **no-build** static site intended for **GitHub Pages**.

## Requirements
- A GitHub repository containing this codebase.
- GitHub Pages enabled for the repository.

## Deploy as a user/organization site
This repo is designed to be deployed as a **user/organization site** (e.g. `k1he.github.io`).

### 1) Repository settings
- Repository name: `k1he.github.io`
- Default branch: `main`

### 2) Enable GitHub Pages
In GitHub:
1. **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/** (root)

### 3) Commit & push
Commit and push all static files to the selected branch.

### 4) Verify deployment
- Wait for the Pages build to complete.
- Visit: https://k1he.github.io/

## Notes
- This project includes a `.nojekyll` file to ensure GitHub Pages serves raw static assets without Jekyll processing.
- Do not open pages with `file://` locally; use a local HTTP server since the app uses `fetch()`.

## Local preview

```bash
python3 -m http.server 8000
```

Then open:
- http://localhost:8000/
