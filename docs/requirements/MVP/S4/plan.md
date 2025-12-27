# Phase 4: Testing, Documentation & Deployment Prep

## 1. Objective
Finalize the "Simple Blog" MVP by verifying all features, documenting usage, and preparing for deployment to GitHub Pages.

## 2. Requirements Analysis (from PRD)
- **Local Testing**: Verify article list, detail view, markdown rendering, syntax highlighting, math, diagrams, and responsiveness.
- **Deployment Prep**: Prepare files for `k1he.github.io` (main branch).
- **Documentation**: Create a comprehensive README.md.

## 3. Tasks

### 3.1 Verification & QA
- [ ] **Static Code Analysis**:
    - Check `index.html` and `post.html` for correct resource linking (CSS, JS).
    - Verify `js/app.js` handles routing/URL parameters correctly.
    - Check `posts/` markdown files for correct Front Matter format.
- [ ] **Feature Verification**:
    - **Rendering**: Markdown to HTML, code highlighting (Prism), Math (KaTeX), Mermaid diagrams.
    - **Navigation**: Sidebar links, article list generation, "Back to Home" functionality.
    - **Responsive Design**: Verify CSS media queries for sidebar collapsing.

### 3.2 Documentation (README.md)
- [ ] Create `README.md` in the project root with:
    - **Project Overview**: Brief description and tech stack.
    - **Quick Start**: How to run locally (`python3 -m http.server`).
    - **Content Management**: Guide on how to add new articles (Front Matter format).
    - **Deployment**: Instructions for pushing to GitHub Pages.
    - **Customization**: Basic guide on changing colors/fonts.

### 3.3 Deployment Preparation
- [ ] **Clean up**: Remove any temporary test files.
- [ ] **GitHub Pages Config**: Create `.nojekyll` file (to ensure `_` prefixed folders or specific structures are served correctly, if any, though standard `posts` is fine, it's best practice for raw static sites).
- [ ] **Final Polish**: Ensure title tags and meta descriptions are generic/template-ready.

## 4. Risks & Mitigations
- **Risk**: Local file fetch restrictions (CORS).
  - *Mitigation*: Emphasize usage of `python3 -m http.server` or `npx serve` in docs, not `file://`.
- **Risk**: GitHub Pages routing 404s for SPA-like navigation.
  - *Mitigation*: Our architecture uses `post.html?id=...` which works natively on static hosts. Ensure `app.js` handles query params robustly.

## 5. Success Criteria
- [ ] `README.md` exists and is clear.
- [ ] Project runs locally with `python3 -m http.server`.
- [ ] All JS features (Prism, KaTeX, Mermaid) load without console errors.
- [ ] Codebase is clean and ready for `git push`.