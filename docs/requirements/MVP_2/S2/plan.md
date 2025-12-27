# Plan: MVP_2 Phase S2 - In-page Navigation & Visual Effects

## 1. Executive Summary
This phase focuses on enhancing the reading experience and visual appeal of the blog. We will implement an automatic "Table of Contents" (ToC) for articles to improve navigation within long posts, and add subtle background effects to elevate the design without compromising performance or readability.

## 2. Objectives
1.  **In-page Navigation (ToC)**:
    *   Automatically generate a Table of Contents from `h2` and `h3` headers in the article body.
    *   Display the ToC in a fixed sidebar (desktop) or suitable mobile layout.
    *   Implement "scroll spy" functionality to highlight the current section.
    *   Enable smooth scrolling to sections when ToC links are clicked.
2.  **Visual Enhancements**:
    *   Implement a subtle background lighting/grid effect using CSS or a lightweight Canvas approach.
    *   Ensure effects are performance-friendly and do not distract from content.

## 3. Architecture & Technical Design

### 3.1 Table of Contents (ToC)
*   **Generation Strategy**:
    *   After Markdown rendering (in `renderPost`), scan the content container for `h2` and `h3` elements.
    *   Generate a nested list structure (`<ul>`) based on header hierarchy.
    *   Inject unique `id` attributes into headers if missing (slugified text).
*   **Placement**:
    *   **Desktop**: A new sticky column on the right side of the article (requires layout adjustment to 3-column or overlay). *Decision: Use a fixed position overlay on the right side or adjust grid to `sidebar | content | toc`.* Given the current 2-column layout (`240px | 1fr`), a fixed right sidebar for ToC is most unobtrusive.
    *   **Mobile**: A collapsible "Contents" detail block at the top of the article.
*   **Interaction**:
    *   **Scroll Spy**: Use `IntersectionObserver` to detect which header is currently in view and update the active class in the ToC.
    *   **Smooth Scroll**: CSS `scroll-behavior: smooth` is already globally set; ensure JS scroll calls use it.

### 3.2 Background Effects
*   **Design**: A subtle "tech/grid" or "glow" effect.
*   **Implementation**:
    *   **CSS-first approach**: Use `background-image` with `linear-gradient` or `radial-gradient` to create a mesh or spotlight effect. This is more performant and requires no JS overhead compared to Canvas.
    *   **Dynamic elements**: Optional mouse-follow "spotlight" using a small JS handler updating CSS variables (`--mouse-x`, `--mouse-y`) on the container.
*   **Performance**:
    *   Use `will-change` sparingly.
    *   Disable effects on `prefers-reduced-motion`.

## 4. Implementation Steps

### Phase 2.1: Table of Contents (ToC)
1.  **Refactor Layout**: Update `post.html` structure to accommodate the ToC container.
2.  **Header Processing**: Modify `renderPost` in `app.js` to:
    *   Add IDs to `h2`/`h3` elements after Marked parsing.
    *   Extract headers into a data structure.
3.  **ToC Rendering**:
    *   Implement `renderToC(headers)` function.
    *   Inject HTML into the ToC container.
4.  **Scroll Spy**:
    *   Implement `IntersectionObserver` logic in `navigation.js` (or `app.js` module) to track active headers.
5.  **Styling**: Add CSS for the ToC (sticky positioning, active states, hierarchy).

### Phase 2.2: Visual Effects
1.  **CSS Background**: Add a subtle grid/gradient background to `body` or `.main` in `style.css`.
2.  **Interactive Spotlight (Optional)**:
    *   Add JS listener for `mousemove`.
    *   Update CSS variables for a radial gradient spotlight effect.

## 5. Risk Assessment & Mitigation
*   **Risk**: ToC overlaps content on smaller desktop screens.
    *   *Mitigation*: Use media queries to hide/collapse ToC below a certain width (e.g., 1200px) and switch to the mobile top-block view.
*   **Risk**: `IntersectionObserver` performance issues with many headers.
    *   *Mitigation*: Use a single observer with appropriate `rootMargin`. Throttling updates if necessary.
*   **Risk**: Background effects cause paint flashing or high CPU usage.
    *   *Mitigation*: Stick to CSS opacity/transform changes. Avoid layout-thrashing properties. Test on low-end devices.

## 6. Testing Strategy
*   **Manual Testing**:
    *   Verify ToC generation on articles with varying header depths.
    *   Check scroll spy accuracy while scrolling up and down.
    *   Test smooth scrolling behavior.
    *   Verify layout responsiveness (Desktop vs Mobile).
    *   Check CPU usage of background effects via DevTools.

## 7. Lessons Applied
*   **From Phase S3 (Mermaid)**: Deferred loading is key. If we used a heavy library for effects (like Particles.js), it would hurt load time. We are choosing CSS/lightweight JS instead.
*   **From Phase S4 (Routing)**: Ensure anchor links (`#header-id`) work correctly with the existing query-param routing (`post.html?id=...`). Note: Hash links might conflict with `window.location.hash` if used for routing, but since we use `?slug=`, standard hashes `#section` are safe for in-page navigation.

## 8. Success Criteria
*   Articles display a correct hierarchy of `h2`/`h3` headers in the ToC.
*   Clicking a ToC link scrolls smoothly to the section.
*   The current section is highlighted in the ToC while scrolling.
*   Background effects are visible but subtle, with no noticeable frame drop.
