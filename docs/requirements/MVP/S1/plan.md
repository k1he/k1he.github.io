# Implementation Plan - MVP Phase 1 (S1)

## 1. Objective & Scope
**Goal**: Establish the foundational "no-build" static blog architecture, implementing the core layout, styling, and basic Markdown rendering capability.

**Scope**:
- Project file structure creation.
- Core HTML structure (`index.html`, `post.html` template).
- CSS architecture (Variables, Layout, Typography, Dark Theme).
- Basic JavaScript engine (Article loader, Markdown parser integration).
- Sample content verification.

## 2. Architecture & Design

### 2.1 File Structure
Adhering to PRD "Planned Directory Structure":
```
├── index.html              # Entry point (Article List)
├── post.html               # Article Detail (or SPA container)
├── css/
│   ├── style.css           # Core styles (Reset, Layout, Typography, Theme)
│   └── prism-theme.css     # (Placeholder for S2)
├── js/
│   ├── app.js              # Main logic (Router, Fetcher, Renderer)
│   ├── marked.min.js       # Markdown parser (Vendor)
│   └── ...                 # Other libs for later phases
├── posts/
│   ├── index.json          # Registry of posts (Critical for static site discovery)
│   └── hello-world.md      # Sample article
└── assets/
    └── logo.svg            # Placeholder
```

**Architectural Decision**: 
- **Post Discovery**: Since GitHub Pages does not expose a directory listing API, we will implement a `posts/index.json` file to act as the registry for available articles. This ensures reliable fetching without backend logic.

### 2.2 Design System (Dark Tech-Style)
- **Colors**:
  - Background: `#0d1117` (GitHub Dark)
  - Surface/Code: `#161b22`
  - Border: `#30363d`
  - Text Primary: `#c9d1d9`
  - Accent: `#58a6ff`
- **Typography**:
  - Font Family: `'SF Mono', 'Monaco', 'Consolas', monospace` (Global application).
- **Layout**:
  - Sidebar: Fixed 240px (Left).
  - Main: Responsive, max-width ~900px (Right).

## 3. Technology Stack
- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Libraries**: 
  - `marked.js` (Manual download/inclusion for S1).
- **Server**: Python `http.server` or Node `serve` for local development (required for CORS).

## 4. Implementation Steps

### Step 1: Scaffolding
- Create directory hierarchy.
- Create `posts/index.json` and `posts/hello-world.md`.
- Download `marked.min.js` (or use CDN link temporarily for dev, but PRD requests local file. I will use a placeholder or write a script to fetch it). *Action*: We will use a CDN link in the code for simplicity in S1, or try to `curl` it if possible. Plan: Use CDN for S1 to reduce friction, or download if `curl` is available.

### Step 2: HTML Structure
- **index.html**: Semantic structure with `<aside>` (Sidebar) and `<main>` (Content).
- **Sidebar**: Static navigation implementation.

### Step 3: CSS Styling
- Define CSS Variables for the color palette.
- Implement Flexbox/Grid layout for the Sidebar + Main Content structure.
- Apply global Monospace typography.
- Implement "Tech/Code" aesthetic (borders, dark mode).

### Step 4: Core JavaScript Logic (`js/app.js`)
- **Initialization**: tailored to the current page.
- **Fetcher**: Function to fetch `posts/index.json`.
- **Renderer (List)**: Parse JSON and render the list of articles in `index.html`.
- **Renderer (Detail)**: 
  - Function to fetch `.md` file content.
  - Integration with `marked.parse()`.
  - DOM injection into the main container.

### Step 5: Content & Verification
- Create a sample `posts/hello-world.md` with various Markdown elements (Headers, Lists, Code blocks).
- Verify rendering locally using `python3 -m http.server`.

## 5. Risk Assessment & Mitigation
- **Risk**: CORS errors when opening `index.html` directly via `file://`.
  - **Mitigation**: Strictly strictly adhere to "Local Development Server" instructions in `CODEBUDDY.md`.
- **Risk**: GitHub Pages routing for `post.html` vs query parameters.
  - **Strategy**: For MVP, we might use `index.html?post=hello-world` to keep it Single Page App (SPA) like, OR actual `post.html?id=hello-world`. 
  - **Decision**: To keep it simple and avoid 404s on refresh (a common GH Pages SPA issue), using query parameters on `index.html` (e.g., `?p=hello-world`) is safest. However, PRD mentions `post.html`. We will support both or stick to PRD.
  - **Refined Strategy**: We will implement `index.html` for the list and `post.html` for details. `index.html` links will point to `post.html?id=hello-world`. `post.html` parses the query param and fetches the md.

## 6. Success Criteria
- [ ] Project structure matches PRD.
- [ ] Local server starts and serves the site.
- [ ] Homepage displays list of articles fetched from `posts/index.json`.
- [ ] Clicking an article navigates to `post.html` (or view) and renders Markdown content.
- [ ] Visual style matches the "Dark Tech" specification.
