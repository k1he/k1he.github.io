# MVP_4 Phase S1: Technical Plan

## 1. Overview
This plan details the technical architecture and implementation steps for **MVP-4**, focusing on two key features: the **About Page** and **Home Page Search**. 

The goal is to enhance content discovery and provide a dedicated space for personal branding, while adhering to the project's "no-build" philosophy (Static Site, Vanilla JS, CSS).

## 2. Architecture & Design

### 2.1 File Structure Changes
```text
blog-project/
├── index.html          (Modified: Add search bar, update nav)
├── post.html           (Modified: Update nav)
├── about.html          (New: About page container)
├── data/               (New: Data directory)
│   └── about.json      (New: Structured data for About page - timeline, skills)
├── posts/
│   └── about.md        (New: Bio content for About page)
├── css/
│   └── style.css       (Modified: Styles for search bar, timeline, skills grid)
└── js/
    └── app.js          (Modified: Search logic, About page rendering)
```

### 2.2 Home Page Search
- **Mechanism**: Client-side filtering. 
- **Data Source**: `posts/index.json` (already fetched).
- **Logic**:
  - Store fetched posts in a global `allPosts` array.
  - Listen to `input` event on the search field.
  - **Debounce**: 200ms delay to prevent excessive rendering.
  - **Filter**: Match `query` against `post.title` (fuzzy) and `post.tags` (fuzzy).
  - **Render**: Re-use `renderPostList()` (or `renderArchive()`) with filtered results.
- **UI**: A search input placed above the post list.

### 2.3 About Page
- **Rendering Strategy**: Hybrid.
  - **Shell**: `about.html` provides the standard layout (Sidebar + Main).
  - **Bio Content**: Fetched from `posts/about.md` and rendered via `marked.js`.
  - **Structured Content**: Timeline and Skills fetched from `data/about.json` and rendered via custom DOM generation.
- **Why JSON?**: Separation of content and presentation. Easier to update the timeline or skills without touching HTML/CSS.
- **Why MD?**: Rich text support for the biography.

### 2.4 Navigation
- Update the "About" link in the sidebar (remove `is-disabled` class, point to `about.html`).
- Ensure `setActiveNav('about')` works correctly on the new page.

## 3. Implementation Phases

### Phase 1: Search Functionality (Days 1-2)
1.  **HTML**: Add search input container to `index.html` (inside `<main>`, before `#postList`).
2.  **CSS**: Style the search bar (dark theme, focus states, clear button).
3.  **JS**: 
    - Refactor `initIndexPage` to store `posts` globally (or in a closure accessible to search).
    - Implement `debounce` utility.
    - Implement `filterPosts(query)` logic.
    - Implement `renderSearchResults(posts)` (wrapper around `renderPostList` with "No results" handling).
    - Bind events.

### Phase 2: About Page Structure & Data (Days 3-4)
1.  **Data**: Create `data/about.json` (Timeline, Skills) and `posts/about.md` (Bio).
2.  **HTML**: Create `about.html` by cloning `index.html` and stripping main content.
3.  **JS**: 
    - Add `initAboutPage()` function in `app.js`.
    - Implement fetching of `about.json` and `about.md`.
    - Implement rendering logic for Timeline (vertical list) and Skills (grid/flex).
4.  **CSS**: Style the Timeline (nodes, lines) and Skill tags.

### Phase 3: Integration & Refinement (Day 5)
1.  **Navigation**: Update all HTML files to link to `about.html`.
2.  **Responsiveness**: Test Search bar and Timeline on mobile.
3.  **Performance**: Ensure search is snappy (optimize DOM updates if needed).
4.  **Error Handling**: Graceful fallback if `about.json` fails to load.

## 4. Risks & Mitigation

-   **Risk**: `app.js` becoming too monolithic.
    -   **Mitigation**: Keep functions small and distinct (`initIndexPage`, `initPostPage`, `initAboutPage`). Use comments to section code.
-   **Risk**: Search performance with many posts.
    -   **Mitigation**: The blog currently has few posts. `Array.filter` is very fast for < 1000 items. Debounce handles input thrashing.
-   **Risk**: "Flash of Unstyled Content" (FOUC) or "Flash of Wrong Content" on About page.
    -   **Mitigation**: Show a loading skeleton or spinner in `about.html` until JS populates it.

## 5. Lessons Applied
-   **No-Build**: Used standard JSON/MD fetching instead of build-time generation.
-   **Performance**: Search is client-side (no server roundtrips).
-   **Responsive**: Timeline will need specific mobile styles (e.g., stacking instead of alternating side-by-side if we were doing that, but standard vertical is fine).
