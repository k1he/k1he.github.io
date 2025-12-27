# Implementation Plan - MVP_2 Phase S1

## 1. Goal & Objectives
**Goal**: Implement the **Archive Functionality** and **Personal Panel Optimization** to enhance content discoverability and personal branding.

**Objectives**:
- Enable users to browse articles by year/month.
- Provide a comprehensive overview of article distribution (statistics).
- Upgrade the sidebar personal panel with detailed info and professional history.
- Maintain the "no-build" architecture and high performance.

## 2. Technical Architecture

### 2.1 Archive Functionality
**Approach**: Query Parameter Routing (`index.html?view=archive`)
- **Rationale**: Avoids duplicating the Sidebar HTML across multiple files (like `archive.html`). Leverages existing `app.js` data loading logic.
- **Routing**: Check URLSearchParams on load. If `view=archive`, render Archive Component instead of Post List.

**Data Structure (in-memory)**:
```javascript
// Grouped structure for rendering
const archiveData = {
    "2025": [
        { title: "Post A", date: "2025-01-01", id: "..." },
        { title: "Post B", date: "2025-02-15", id: "..." }
    ],
    "2024": [ ... ]
};
```

**UI Components**:
- **Archive Container**: Replaces `#post-list` in `index.html`.
- **Year Group**: Collapsible/Expandable header (e.g., "2025 (2 posts)").
- **Post Item**: Date (MM-DD) + Title link.

### 2.2 Personal Panel Optimization
- **HTML Changes**: Update `.sidebar` structure in `index.html`.
- **Styling**: Add specific classes for `.profile-info`, `.company-logo` (grayscale filter for 'past' status).
- **Assets**: Store avatars and company logos in `assets/images/`.

### 2.3 Lessons Applied
- **From S4 (Routing)**: Avoid complex client-side routers or 404 hacks. Use standard `?query` params for different views within `index.html` to ensure compatibility with GitHub Pages.
- **From S2 (Dependencies)**: Use lightweight SVGs for icons (Location, Email, Company) directly in HTML or a small sprite, rather than importing a heavy icon font library.
- **From S3 (Performance)**: Ensure archive grouping logic happens *after* initial paint if possible, or is efficient enough (O(N)) not to block the main thread.

## 3. Implementation Steps

### Step 1: Personal Panel (Sidebar) Update
1.  **Asset Preparation**:
    - Place user avatar in `assets/profile.jpg` (placeholder if needed).
    - Place company logos in `assets/logos/`.
2.  **HTML Modification (`index.html`)**:
    - Refactor `.profile` section.
    - Add fields: Nickname, Profession, Location, Email, Github.
    - Add "Experience" section with company logos.
3.  **CSS Styling (`css/style.css`)**:
    - Style profile circular image.
    - Implement `filter: grayscale(100%)` for `.company-logo.past`.
    - Style `.company-logo.current` with full color.

### Step 2: Archive Logic Implementation
1.  **Refactor `app.js`**:
    - Extract `renderPostList()` from the main initialization logic.
    - Create `renderArchive()` function.
    - Implement `getArchiveData(posts)` helper to group posts by year.
2.  **Routing Logic**:
    - In `init()`: parse `window.location.search`.
    - If `view=archive`, call `renderArchive()`.
    - Else, call `renderPostList()`.
3.  **Navigation Update**:
    - Update "Archive" link in sidebar to point to `index.html?view=archive`.
    - Add "active" class logic for the navigation menu.

### Step 3: Archive UI Styling
1.  **CSS for Archive**:
    - `.archive-year`: Typography, border-bottom.
    - `.archive-count`: Small badge style.
    - `.archive-list`: Indentation, clean list style.
    - `.archive-item`: Hover effects.

### Step 4: Verification
1.  **Visual Check**:
    - Sidebar looks correct on Desktop and Mobile.
    - Company logos show correct state (gray/color).
2.  **Functional Check**:
    - Clicking "Archive" loads the archive view.
    - Posts are correctly grouped by year.
    - Post counts are correct.
    - Clicking a post in Archive navigates to `post.html`.
    - Browser "Back" button works (might need `pushState` handling if we want smooth transitions, but simple link navigation is fine for MVP).

## 4. Risk Assessment
- **Risk**: Sidebar content overflowing on small screens.
    - **Mitigation**: Ensure sidebar is scrollable (`overflow-y: auto`) and collapses correctly on mobile.
- **Risk**: Performance with many posts.
    - **Mitigation**: Grouping is O(N). With < 1000 posts, client-side grouping is negligible (sub-10ms).

## 5. Success Criteria
- [ ] Sidebar matches new design with Avatar, Info, and Company history.
- [ ] Archive page displays posts grouped by Year.
- [ ] No build errors or console errors.
- [ ] "Archive" link in sidebar is functional.
