# Plan: MVP_2 Phase S3 - Testing & Optimization

## 1. Objective
Complete the MVP_2 release cycle by ensuring system stability, optimizing performance, and finalizing documentation. This phase acts as the quality gate before the final deployment to GitHub Pages.

## 2. Approach
- **Verification First**: Validate all MVP_2 features (Archive, ToC, Personal Panel, Effects) against the PRD.
- **Performance Focused**: Ensure the added features (especially visual effects and large libraries) do not degrade the "lightweight" nature of the blog.
- **Documentation**: Bring documentation up to date to reflect the current feature set.

## 3. Tasks

### 3.1 Comprehensive Testing
- [ ] **Create Test Plan** (`docs/requirements/MVP_2/TEST_PLAN.md`) covering:
  - Functional testing (Archive logic, ToC navigation, Search params).
  - Visual regression testing (Personal panel layout, Spotlight effect).
  - Responsive testing (Mobile sidebar, Mobile ToC).
  - Browser compatibility (Chrome, Firefox, Safari).
- [ ] **Execute Test Plan**:
  - Run through all test cases manually.
  - Fix any identified bugs (e.g., edge cases in archive dates, sticky header issues).
- [ ] **Accessibility Check**:
  - Verify ARIA labels on new navigation elements.
  - Ensure contrast ratios for the new personal panel and archive tags.

### 3.2 Performance Optimization
- [ ] **Audit Asset Loading**:
  - Verify `loading="lazy"` on all images (already implemented dynamically, verify execution).
  - Check Mermaid.js and Medium Zoom lazy-loading triggers.
- [ ] **Code Optimization**:
  - Review `app.js` for redundant logic or memory leaks (especially in the `pointermove` listener for spotlight).
  - Ensure the `requestAnimationFrame` loop for effects is efficient.

### 3.3 Documentation & Polish
- [ ] **Update README.md**:
  - Add "Archive" feature description.
  - Document how to configure the Personal Panel (currently hardcoded in HTML, maybe move to JSON or `app.js` config object).
  - Update "Project Structure" section.
- [ ] **Deployment Guide**:
  - Create `docs/DEPLOYMENT.md` for clear steps on publishing to GitHub Pages.
- [ ] **Final Code Polish**:
  - Remove any `console.log` debugging leftovers.
  - Standardize comments in `app.js`.
  - Check for dead CSS in `style.css`.

## 4. Deliverables
- `docs/requirements/MVP_2/TEST_PLAN.md`
- Updated `README.md`
- `docs/DEPLOYMENT.md`
- Optimized `js/app.js` and `css/style.css` (if changes needed)

## 5. Success Criteria
- [ ] All P0/P1 test cases pass.
- [ ] Lighthouse Performance score > 90 on Desktop.
- [ ] Documentation accurately reflects the codebase.
- [ ] Personal panel and Archive view look correct on mobile (< 768px).
