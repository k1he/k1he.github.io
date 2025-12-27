# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

This is a **minimal static blog** project designed to be deployed on GitHub Pages (`k1he.github.io`). The project follows a "no-build" philosophy: pure HTML, CSS, and JavaScript with client‑side rendering of Markdown articles. The MVP specification is detailed in `docs/requirements/MVP/PRD.md`.

## Common Development Tasks

### Local Development Server
Since there is no build step, you can use any static file server:
```bash
# Python 3
python3 -m http.server 8000

# Node.js (if serve is installed globally)
npx serve
```

### Testing
- Manual testing: open `index.html` in a browser or use the local server.
- No automated test suite is defined for MVP.

### Deployment
- Push the static files to the `main` branch of the `k1he.github.io` repository.
- GitHub Pages will automatically serve the content.

## Architecture

### High‑Level Design
- **Frontend only**: all rendering happens in the browser via JavaScript.
- **Content storage**: Markdown files with Front Matter metadata in `posts/` directory.
- **Client‑side parsing**: marked.js for Markdown, front‑matter library for metadata.
- **Enhanced rendering**: Prism.js (code highlighting), KaTeX (math formulas), Mermaid.js (diagrams), medium‑zoom (image lightbox).

### Planned Directory Structure
```
├── index.html              # Homepage (article list)
├── post.html               # Article detail page template
├── css/
│   ├── style.css          # Main styles
│   └── prism-theme.css    # Code highlighting theme
├── js/
│   ├── app.js             # Main application logic
│   ├── marked.min.js
│   ├── prism.js
│   ├── katex.js
│   └── mermaid.js
├── posts/                  # Article directory (Markdown files)
└── assets/                 # Static resources
```

### Data Flow
1. User visits `index.html` → loads CSS and JavaScript.
2. JavaScript fetches the list of `.md` files from `posts/`.
3. Each file’s Front Matter is parsed to extract title, date, tags, etc.
4. The article list is dynamically generated and displayed.
5. Clicking an article loads the corresponding Markdown file, parses it, and renders the full article in `post.html` (or a single‑page application).

### Design Guidelines
- **Color palette**:
  - Background: `#0d1117` (GitHub Dark)
  - Text: `#c9d1d9`
  - Accent: `#58a6ff`
  - Code background: `#161b22`
  - Border: `#30363d`
- **Typography**: Monospace fonts for both body and headings.
- **Layout**: Fixed left sidebar (240px) + responsive main content area (max width ~900px).
- **Responsive**: Mobile‑friendly with collapsible sidebar.

## Technology Stack
- **Markdown parsing**: marked.js
- **Front Matter**: front‑matter library or custom parser
- **Code highlighting**: Prism.js
- **Math formulas**: KaTeX
- **Diagrams**: Mermaid.js
- **Image lightbox**: medium‑zoom
- **No frameworks**: vanilla JavaScript and CSS.

## Implementation Phases (from PRD)
1. **Phase 1**: Basic framework & styling (Week 1)
2. **Phase 2**: Core functionality – article list & details (Week 2)
3. **Phase 3**: Enhancements – diagrams, lightbox, responsive design (Week 3)
4. **Phase 4**: Testing & deployment to GitHub Pages (Week 4)

## Important Notes
- The repository currently contains only the PRD; the actual HTML/CSS/JS files are yet to be created.
- All development should adhere to the “no‑build, static‑first” principle.
- Future extensions may include search (lunr.js), comments (Gitalk/Utterances), RSS, and theme switching.
- Refer to `docs/requirements/MVP/PRD.md` for the complete MVP specification.