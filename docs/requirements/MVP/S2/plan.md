# Phase 2 Implementation Plan: Core Functionality & Rich Rendering

## 1. Executive Summary
Phase 2 focuses on elevating the blog from a basic skeleton to a functional content reader. The primary goals are to establish robust article navigation (List & Detail views) and enable rich content rendering (Code Highlighting & Math Formulas) to meet the "Tech/Code" aesthetic defined in the PRD.

## 2. Objectives
- **Dynamic Content Loading**: Robustly fetch and display article lists and details using `posts/index.json` as the source of truth.
- **Rich Text Rendering**: Implement Markdown parsing with Front Matter support.
- **Syntax Highlighting**: Integrate Prism.js for beautiful code blocks.
- **Math Support**: Integrate KaTeX for high-performance LaTeX math rendering.

## 3. Architecture & Design

### 3.1 Content Flow
1. **List View (`index.html`)**:
   - Fetch `posts/index.json`.
   - Render cards with Title, Date, Tags, and Excerpt.
2. **Detail View (`post.html`)**:
   - Parse URL query parameter (e.g., `?post=hello-world`).
   - Fetch `posts/hello-world.md`.
   - **Pipeline**:
     `Raw Text` -> `Split Front Matter/Body` -> `Marked.js (Body -> HTML)` -> `DOM Injection` -> `Post-Processing (Prism + KaTeX)`.

### 3.2 Technical Components
- **Front Matter Parser**: A custom lightweight Regex-based parser to avoid complex dependencies (keeping "no-build" promise).
- **Prism.js**:
  - `js/prism.js`: Core logic + Auto-loader or bundled languages.
  - `css/prism-theme.css`: Custom dark theme adaptation.
- **KaTeX**:
  - `js/katex.js` & `js/katex-auto-render.js`: For rendering math.
  - `css/katex.min.css`: Core styles.

## 4. Implementation Steps

### Step 1: Library Setup
- **Action**: Download and place necessary library files.
  - `js/prism.js` (Include languages: javascript, python, bash, css, html, markdown).
  - `js/katex.js`, `js/katex-auto-render.js`.
  - `css/katex.min.css`.
- **Validation**: Ensure files exist in `js/` and `css/`.

### Step 2: Core Rendering Logic (`js/app.js`)
- **Action**: Implement `parseFrontMatter(text)` function.
- **Action**: Update `renderPost(postId)`:
  1. Fetch markdown content.
  2. Parse metadata vs content.
  3. Render Markdown to HTML.
  4. Inject into DOM.
  5. Update page `<title>` and metadata.

### Step 3: Rich Content Integration
- **Action**: Create `initRichContent()` function.
  - Call `Prism.highlightAll()`.
  - Call `renderMathInElement(document.body)`.
- **Action**: Hook this function to run *immediately after* DOM injection in `renderPost`.

### Step 4: Article List Refinement
- **Action**: Update `renderPostList()` to read from `posts/index.json`.
- **Action**: Ensure list items link correctly to `post.html?slug=...`.

### Step 5: Testing Content
- **Action**: Create `posts/test-rich-content.md`.
  - Include Front Matter.
  - Include Code Blocks (JS, Python).
  - Include Math Formulas ($E=mc^2$).
- **Action**: Verify rendering on local server.

## 5. Risk Assessment
- **Risk**: Local file fetching (CORS) errors.
  - *Mitigation*: Strictly follow the `python3 -m http.server` workflow as documented in `CODEBUDDY.md`.
- **Risk**: KaTeX font loading issues.
  - *Mitigation*: Use CDN links for fonts in CSS if local font file management becomes too complex for MVP, or download fonts to `assets/fonts`. *Decision for MVP: Try local, fallback to CDN for CSS imports if needed.*
- **Risk**: Markdown/KaTeX conflicts (e.g., `_` escaping).
  - *Mitigation*: Configure `katex-auto-render` delimiters strictly and ensure `marked.js` doesn't mangle math delimiters before KaTeX sees them.

## 6. Success Criteria
- [ ] `posts/index.json` correctly populates the homepage.
- [ ] Clicking a post loads the markdown content.
- [ ] Front Matter (Title, Date) is displayed separately from body.
- [ ] Code blocks are colored (Prism).
- [ ] Math formulas are rendered (KaTeX).
- [ ] Console has no errors during navigation.
