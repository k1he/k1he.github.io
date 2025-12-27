# Lessons Learned

## Phase S2: Core Functionality & Rich Content

### [Architecture: Static Site Dependency Management]
**Problem**: Managing complex third-party libraries (Prism, KaTeX) without a build step (npm/webpack) is challenging, especially for assets like fonts or language extensions.
**Solution**: Adopted a hybrid approach: downloaded core JS/CSS files for reliability and offline basic support, but configured Prism's Autoloader to fetch language definitions from a CDN to avoid checking in hundreds of files.
**Key Takeaway**: For "no-build" projects, minimize local dependencies to the absolute core and leverage CDNs for "long-tail" resources (fonts, extra languages) to keep the repo clean.

## Phase S3: Visual Enhancements

### [Performance: Large Library Integration]
**Problem**: Libraries like Mermaid.js (~1MB) can significantly impact initial load time if included synchronously in the head.
**Solution**: Implemented deferred loading strategies, ensuring heavy visual libraries only load after critical content is interactive or when specifically required by the content.
**Key Takeaway**: In "no-build" environments where tree-shaking isn't available, manual lazy-loading and `defer` attributes are critical for maintaining performance.

## Phase S4: Testing & Deployment

### [Architecture: Static Hosting Routing]
**Problem**: Single Page Application (SPA) style routing (`/post/hello-world`) often fails on static hosts like GitHub Pages, causing 404 errors on refresh because the server looks for actual directories.
**Solution**: Adopted a query-parameter based routing strategy (`post.html?id=hello-world`) which works natively without server-side configuration.
**Key Takeaway**: Choose routing strategies that respect the constraints of the target hosting platform; for purely static hosts, query parameters or hash-based routing are often the most robust solutions.

## Phase MVP_2/S2: In-page Navigation & Visual Effects

### [UX/Responsiveness: Table of Contents Layout]
**Problem**: A Table of Contents needs to be always visible on large screens for utility but unobtrusive on small screens.
**Solution**: Implemented a dual-rendering approach: a fixed sidebar for desktops (>1450px) and a native `<details>` element at the top of the content for mobile, handled via CSS media queries.
**Key Takeaway**: Responsive design isn't just about resizing; sometimes it requires completely different structural components (Sidebar vs Accordion) to best serve the user context.

### [Performance: Visual Effects]
**Problem**: Implementing a "spotlight" mouse-tracking effect can cause layout thrashing and high CPU usage if implemented with heavy event listeners or Canvas.
**Solution**: Used CSS variables (`--mouse-x`, `--mouse-y`) updated via a passive `pointermove` listener throttled with `requestAnimationFrame`.
**Key Takeaway**: For simple cosmetic effects, CSS Variables + JS Coordinators are significantly more performant and maintainable than full Canvas implementations.
