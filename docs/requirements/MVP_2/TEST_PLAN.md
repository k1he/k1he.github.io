# MVP_2 Test Plan

Generated: 2025-12-27

## Scope
This test plan validates MVP_2 features:
- Archive view (`index.html?view=archive`)
- Personal Panel (sidebar profile + experience logos)
- Post page ToC (desktop fixed ToC + mobile `<details>` ToC)
- Background effects (subtle spotlight/grid)
- Lazy-loading triggers (Mermaid + medium-zoom)

## Test Environments
### Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

### Viewports
- Mobile: 320×568, 375×812
- Tablet: 768×1024
- Desktop: 1280×800, 1440×900, 1600×900

### Setup
Run a local static server from repo root:

```bash
python3 -m http.server 8000
```

Open:
- http://localhost:8000/

> Note: The app uses `fetch()`, so **do not** use `file://`.

---

## P0 — Functional

### P0.1 Home post list renders
**Steps**
1. Open `/index.html`.

**Expected**
- Post list loads from `posts/index.json`.
- Posts are sorted by date (desc).
- Clicking a post navigates to `post.html?slug=<id>`.

### P0.2 Archive view renders and is navigable
**Steps**
1. Open `/index.html?view=archive`.

**Expected**
- Archive summary shows total post count.
- Years are rendered as collapsible sections (`<details>`).
- Clicking a post navigates to the correct post.

### P0.3 Post page loads and renders markdown
**Steps**
1. Open `post.html?slug=test-rich-content`.

**Expected**
- Title and date render correctly.
- Markdown content renders without layout breaking.
- External links open in new tab.

### P0.4 ToC generation
**Steps**
1. Open `post.html?slug=test-rich-content`.
2. Verify the ToC contains entries for `h2`/`h3` headings.

**Expected**
- All `h2`/`h3` headings appear.
- Each ToC entry links to the matching heading.
- No duplicate IDs.

### P0.5 ToC navigation + scroll spy
**Steps**
1. Click ToC entries.
2. Scroll up/down through headings.

**Expected**
- Click scrolls to the section (smooth unless `prefers-reduced-motion`).
- Current section is highlighted (`.is-active`).

---

## P1 — Visual / Responsive

### P1.1 Mobile layout: sidebar + main
**Steps**
1. Set viewport < 860px.
2. Load `/index.html` and `/index.html?view=archive`.

**Expected**
- Sidebar collapses into a top section.
- No horizontal scrolling.
- Cards and lists wrap correctly.

### P1.2 Mobile ToC
**Steps**
1. Set viewport < 1450px.
2. Load a post.

**Expected**
- Mobile ToC `<details>` is visible.
- Desktop fixed ToC is hidden.

### P1.3 Desktop ToC
**Steps**
1. Set viewport >= 1450px.
2. Load a post.

**Expected**
- Desktop ToC is visible and does not overlap main content.
- Mobile ToC is hidden.

### P1.4 Personal Panel layout
**Steps**
1. Load `/index.html`.
2. Inspect sidebar profile section.

**Expected**
- Avatar is circular.
- Experience logos render consistently.
- Links are readable with sufficient contrast.

---

## P2 — Performance / Loading

### P2.1 Image loading attributes
**Steps**
1. Load a post with images.
2. Inspect rendered `<img>` elements.

**Expected**
- Content images have `loading="lazy"` and `decoding="async"`.

### P2.2 Mermaid lazy load
**Steps**
1. Load a post without Mermaid diagrams.
2. Confirm Mermaid JS is not requested.
3. Load a post with Mermaid diagrams.

**Expected**
- Mermaid script only loads when `.mermaid` blocks exist.

### P2.3 Medium-zoom lazy load
**Steps**
1. Load a post without images.
2. Confirm medium-zoom script is not requested.
3. Load a post with images.

**Expected**
- medium-zoom loads only when images exist.

### P2.4 Spotlight background efficiency
**Steps**
1. Load a post page.
2. Move pointer; monitor Performance panel briefly.

**Expected**
- No long tasks caused by `pointermove`.
- Updates are rAF-batched.
- Reduced motion disables the dynamic effect.

### P2.5 Lighthouse (desktop)
**Steps**
1. Run Lighthouse on a post page.

**Expected**
- Performance score > 90 (desktop).

---

## Accessibility Checks

### A11Y.1 Navigation labels
**Steps**
1. Inspect primary nav and ToC containers.

**Expected**
- `aria-label` present on Sidebar navigation, Primary nav, and ToC.

### A11Y.2 Keyboard navigation
**Steps**
1. Use `Tab` to navigate links and controls.

**Expected**
- Focus is visible.
- ToC links, Archive expand/collapse, and navigation links are reachable.

---

## Exit Criteria
- All P0/P1 tests pass.
- Any P2 issues are either fixed or documented with acceptable trade-offs.
- No console errors in normal usage flows.
