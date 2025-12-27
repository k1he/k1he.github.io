# Root-Cause / Risk Analysis — MVP_2 S3 (Testing & Optimization)

Generated: 2025-12-27

## Context
MVP_2 S3 is a quality gate phase focused on manual verification, performance review, and documentation polish. There was no recorded implementation failure from S2; this analysis focuses on **risk hotspots** introduced by MVP_2 features.

## Primary Risk Areas

### 1) Runtime performance regressions (visual effects)
**Why it’s risky**: Background spotlight effects rely on pointer events and animation timing. On low-end mobile devices this can become a battery/performance drain.

**Corrective strategy**
- Ensure `pointermove` listener work is minimal and gated by `requestAnimationFrame`.
- Use `passive: true` for input listeners.
- Respect `prefers-reduced-motion` and disable updates.
- Ensure effects initialization happens only on pages that need it.

### 2) Heavy library impact (Mermaid / medium-zoom)
**Why it’s risky**: Mermaid and medium-zoom can increase JS payload and block main-thread work if loaded/initialized eagerly.

**Corrective strategy**
- Verify lazy-loading triggers are working (load Mermaid only if Mermaid code blocks exist; load medium-zoom only if images exist).
- Ensure repeated navigation (back/forward, re-render) doesn’t create duplicate handlers.

### 3) Mobile layout / interaction issues
**Why it’s risky**: Archive view, Personal Panel, and the Mobile ToC introduce new layout containers that can overflow, overlap, or become hard to use on small screens.

**Corrective strategy**
- Perform viewport testing at 320px / 375px / 768px.
- Validate ToC `<details>` open/close behavior and anchor scroll offsets.
- Ensure sidebar / panel elements don’t cause horizontal scrolling.

### 4) Accessibility regressions
**Why it’s risky**: New navigation UI (Archive links, ToC controls, panel links) can fail keyboard navigation or lack ARIA labeling.

**Corrective strategy**
- Verify `aria-label` on key nav/controls.
- Check focus styles and contrast.
- Validate that ToC links are accessible and that headings can be reached.

## Success Criteria (from plan)
- P0/P1 test cases pass.
- Lighthouse Performance score > 90 (desktop target).
- Docs updated and accurate.
- Personal panel and Archive view correct on mobile (< 768px).
