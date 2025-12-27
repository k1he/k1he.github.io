/*
  Minimal static blog — MVP Phase S3
  - index.html: fetch posts/index.json and render list
  - post.html: fetch selected markdown and render via marked
  - Rich rendering: Prism.js (syntax highlighting) + KaTeX (math) + Mermaid (diagrams)
  - MVP_3: Enhanced UI/UX with tech background, clickable profile, diagram zoom

  Notes:
  - GitHub Pages does not provide directory listing; index.json is the registry.
  - A local HTTP server is required for fetch() (avoid file:// CORS issues).
*/

(function () {
  "use strict";

  const POSTS_INDEX_URL = "posts/index.json";
  const ABOUT_DATA_URL = "data/about.json";
  const ABOUT_MD_URL = "posts/about.md";

  // Cache markdown fetches to avoid duplicate network requests.
  const markdownCache = new Map();

  // Optional rich-content libraries (loaded lazily on demand).
  // Note: Mermaid is large, so we only load it when mermaid blocks exist.
  const MERMAID_SCRIPT_URL = "js/mermaid.min.js";
  const MEDIUM_ZOOM_SCRIPT_URL = "js/medium-zoom.min.js";

  const scriptLoadCache = new Map();
  let mermaidInitialized = false;

  function loadScriptOnce(src, isReady) {
    if (typeof isReady === "function" && isReady()) return Promise.resolve();
    if (scriptLoadCache.has(src)) return scriptLoadCache.get(src);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    })
      .then(() => {
        if (typeof isReady === "function" && !isReady()) {
          throw new Error(`Loaded ${src} but expected global was not found.`);
        }
      })
      .catch((err) => {
        // Don't keep a rejected promise cached; allow retry.
        scriptLoadCache.delete(src);
        throw err;
      });

    scriptLoadCache.set(src, promise);
    return promise;
  }

  function configurePrismAutoloader() {
    // Point Prism Autoloader to CDN so we don't need to host all language files locally.
    if (window.Prism && window.Prism.plugins && window.Prism.plugins.autoloader) {
      window.Prism.plugins.autoloader.languages_path =
        "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/";
    }
  }

  function applyImagePerformanceAttrs(root) {
    if (!root) return;
    root.querySelectorAll("img").forEach((img) => {
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
      if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
    });
  }

  function convertMermaidCodeBlocks(root) {
    // Convert fenced mermaid blocks (```mermaid) rendered by marked into
    // <div class="mermaid">...source...</div> so Mermaid can render them.
    if (!root) return 0;

    const blocks = root.querySelectorAll(
      "pre > code.language-mermaid, pre > code.lang-mermaid, code.language-mermaid, code.lang-mermaid"
    );

    let count = 0;
    blocks.forEach((code) => {
      const text = code.textContent || "";
      if (!text.trim()) return;

      const container = document.createElement("div");
      container.className = "mermaid";
      container.textContent = text;

      const pre = code.closest("pre");
      if (pre) {
        pre.replaceWith(container);
      } else {
        code.replaceWith(container);
      }

      count += 1;
    });

    return count;
  }

  async function renderMermaidIfPresent(root) {
    const hasMermaid = root && root.querySelector(".mermaid");
    if (!hasMermaid) return;

    try {
      await loadScriptOnce(MERMAID_SCRIPT_URL, () => !!window.mermaid);
      const m = window.mermaid;
      if (!m) return;

      if (!mermaidInitialized && typeof m.initialize === "function") {
        m.initialize({
          startOnLoad: false,
          theme: "dark",
          // Be conservative: do not allow arbitrary HTML inside diagrams.
          securityLevel: "strict",
        });
        mermaidInitialized = true;
      }

      // Mermaid v10+ prefers mermaid.run(). Older versions use mermaid.init().
      if (typeof m.run === "function") {
        await m.run({ querySelector: ".mermaid" });
      } else if (typeof m.init === "function") {
        m.init(undefined, root.querySelectorAll(".mermaid"));
      } else {
        console.warn("[mermaid] Mermaid loaded, but no known render API found.");
      }
    } catch (err) {
      console.warn("[mermaid] Failed to render diagrams:", err);
    }
  }

  async function initMediumZoomIfPresent(root) {
    if (!root) return;

    const images = root.querySelectorAll("img");
    if (!images.length) return;

    try {
      await loadScriptOnce(MEDIUM_ZOOM_SCRIPT_URL, () => typeof window.mediumZoom === "function");
      if (typeof window.mediumZoom === "function") {
        window.mediumZoom(images, {
          background: "rgba(13, 17, 23, 0.92)",
          margin: 24,
        });
      }
    } catch (err) {
      console.warn("[medium-zoom] Failed to initialize:", err);
    }
  }

  // Mermaid diagram lightbox for zoom functionality
  function initMermaidLightbox(root) {
    if (!root) return;

    const mermaidContainers = root.querySelectorAll(".mermaid");
    if (!mermaidContainers.length) return;

    function closeLightbox() {
      const existing = document.querySelector(".mermaid-lightbox");
      if (existing) {
        existing.remove();
      }
      document.body.style.overflow = "";
    }

    function openLightbox(mermaidEl) {
      closeLightbox();

      const svg = mermaidEl.querySelector("svg");
      if (!svg) return;

      // Clone the SVG for the lightbox
      const svgClone = svg.cloneNode(true);

      // Create lightbox elements
      const lightbox = document.createElement("div");
      lightbox.className = "mermaid-lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("aria-label", "Enlarged diagram view");

      const content = document.createElement("div");
      content.className = "mermaid-lightbox__content";
      content.appendChild(svgClone);

      const closeBtn = document.createElement("button");
      closeBtn.className = "mermaid-lightbox__close";
      closeBtn.innerHTML = "×";
      closeBtn.setAttribute("aria-label", "Close diagram view");

      const hint = document.createElement("div");
      hint.className = "mermaid-lightbox__hint";
      hint.textContent = "Click outside or press ESC to close";

      lightbox.appendChild(content);
      lightbox.appendChild(closeBtn);
      lightbox.appendChild(hint);

      // Event handlers
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeLightbox();
      });

      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });

      content.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      document.body.appendChild(lightbox);
      document.body.style.overflow = "hidden";

      // Focus the close button for accessibility
      closeBtn.focus();
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        closeLightbox();
      }
    }

    // Add click handlers to all mermaid containers
    mermaidContainers.forEach((container) => {
      container.addEventListener("click", () => {
        openLightbox(container);
      });
    });

    // Global ESC key handler
    document.addEventListener("keydown", onKeyDown);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
  }

  // ------------------------------
  // MVP_4: Home page search helpers
  // ------------------------------
  const SEARCH_HISTORY_KEY = "blog.searchHistory.v1";
  const SEARCH_HISTORY_MAX = 10;

  function debounce(fn, delay) {
    const wait = Number(delay) || 0;
    let timer = 0;

    return function debounced(...args) {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = 0;
        fn.apply(this, args);
      }, wait);
    };
  }

  function escapeRegExp(text) {
    return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function splitSearchTokens(query) {
    return String(query || "")
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function buildHighlightRegex(tokens) {
    if (!Array.isArray(tokens) || tokens.length === 0) return null;

    const safe = tokens
      .map((t) => String(t || "").trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp);

    if (!safe.length) return null;

    try {
      return new RegExp(`(${safe.join("|")})`, "ig");
    } catch {
      return null;
    }
  }

  function highlightTextToHtml(text, regex) {
    const raw = String(text ?? "");
    if (!regex) return escapeHtml(raw);

    let html = "";
    let last = 0;

    regex.lastIndex = 0;
    let match;

    while ((match = regex.exec(raw)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      html += escapeHtml(raw.slice(last, start));
      html += `<mark class="search-highlight">${escapeHtml(raw.slice(start, end))}</mark>`;
      last = end;

      // Avoid infinite loops for zero-length matches.
      if (match[0].length === 0) {
        regex.lastIndex += 1;
      }
    }

    html += escapeHtml(raw.slice(last));
    return html;
  }

  function loadSearchHistory() {
    try {
      if (!window.localStorage) return [];
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .slice(0, SEARCH_HISTORY_MAX);
    } catch {
      return [];
    }
  }

  function saveSearchHistory(list) {
    try {
      if (!window.localStorage) return;
      const safe = Array.isArray(list) ? list : [];
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(safe.slice(0, SEARCH_HISTORY_MAX)));
    } catch {
      // Ignore quota / privacy mode.
    }
  }

  function pushSearchHistory(query) {
    const q = String(query || "").trim();
    if (!q) return;

    const existing = loadSearchHistory();
    const deduped = [q, ...existing.filter((x) => x.toLowerCase() !== q.toLowerCase())];
    saveSearchHistory(deduped);
  }

  function clearSearchHistory() {
    try {
      if (!window.localStorage) return;
      window.localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // Ignore.
    }
  }

  let tocCleanup = null;

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function initSpotlightBackground() {
    if (prefersReducedMotion()) return () => {};

    const root = document.documentElement;
    let raf = 0;
    let x = 0;
    let y = 0;

    // Avoid doing any work when the tab is hidden.
    const supportsVisibilityApi = typeof document.hidden === "boolean";

    function commit() {
      raf = 0;
      if (supportsVisibilityApi && document.hidden) return;
      root.style.setProperty("--mouse-x", `${x}px`);
      root.style.setProperty("--mouse-y", `${y}px`);
    }

    function onMove(e) {
      if (supportsVisibilityApi && document.hidden) return;

      // clientX/Y are viewport-relative, which matches our background gradients.
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = window.requestAnimationFrame(commit);
    }

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }

  function slugifyHeading(text) {
    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function ensureUniqueId(base, used) {
    const safeBase = base || "section";
    let id = safeBase;
    let i = 2;
    while (used.has(id)) {
      id = `${safeBase}-${i}`;
      i += 1;
    }
    used.add(id);
    return id;
  }

  function renderTocList(headers) {
    if (!headers || headers.length === 0) return "";

    let html = '<ul class="toc__list">';
    let inSub = false;

    for (let idx = 0; idx < headers.length; idx += 1) {
      const h = headers[idx];
      const next = headers[idx + 1];

      if (h.level === 2) {
        if (inSub) {
          html += "</ul></li>";
          inSub = false;
        }

        html += `<li class="toc__item toc__item--h2"><a class="toc__link" href="#${h.id}" data-toc-id="${h.id}">${escapeHtml(h.text)}</a>`;

        if (next && next.level === 3) {
          html += '<ul class="toc__list toc__list--sub">';
          inSub = true;
        } else {
          html += "</li>";
        }
      } else if (h.level === 3) {
        if (!inSub) {
          html += '<li class="toc__item toc__item--h2">';
          html += '<ul class="toc__list toc__list--sub">';
          inSub = true;
        }

        html += `<li class="toc__item toc__item--h3"><a class="toc__link" href="#${h.id}" data-toc-id="${h.id}">${escapeHtml(h.text)}</a></li>`;

        if (!next || next.level !== 3) {
          html += "</ul></li>";
          inSub = false;
        }
      }
    }

    if (inSub) html += "</ul></li>";
    html += "</ul>";
    return html;
  }

  function setActiveTocLink(id) {
    const activeId = String(id || "");
    const links = document.querySelectorAll('.toc__link[data-toc-id]');
    links.forEach((a) => {
      const match = a.getAttribute("data-toc-id") === activeId;
      a.classList.toggle("is-active", match);
    });
  }

  function wireTocClicks(container) {
    if (!container) return () => {};

    function onClick(e) {
      const a = e.target && e.target.closest ? e.target.closest("a.toc__link") : null;
      if (!a) return;

      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const behavior = prefersReducedMotion() ? "auto" : "smooth";
      target.scrollIntoView({ behavior, block: "start" });

      // Preserve path + query string (post slug), but update hash.
      const nextUrl = `${window.location.pathname}${window.location.search}#${id}`;
      if (history && typeof history.replaceState === "function") {
        history.replaceState(null, "", nextUrl);
      }

      setActiveTocLink(id);
    }

    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }

  function setupTocScrollSpy(headings) {
    if (!headings || headings.length === 0 || typeof IntersectionObserver !== "function") {
      return () => {};
    }

    let lastActive = "";

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting && e.target && e.target.id);
        if (!visible.length) return;

        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0].target.id;
        if (id && id !== lastActive) {
          lastActive = id;
          setActiveTocLink(id);
        }
      },
      {
        root: null,
        threshold: 0,
        // Consider a heading "active" when it enters the top portion of the viewport.
        rootMargin: "0px 0px -70% 0px",
      }
    );

    headings.forEach((h) => observer.observe(h));

    // Initial state from hash or first heading.
    const initialHash = (window.location.hash || "").replace(/^#/, "");
    const initialId = initialHash || (headings[0] && headings[0].id) || "";
    if (initialId) {
      lastActive = initialId;
      setActiveTocLink(initialId);
    }

    function onHashChange() {
      const id = (window.location.hash || "").replace(/^#/, "");
      if (id) {
        lastActive = id;
        setActiveTocLink(id);
      }
    }

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      observer.disconnect();
    };
  }

  function initTableOfContents(articleRoot) {
    const tocDesktop = $("tocDesktop");
    const tocMobile = $("tocMobile");
    const tocMobileNav = $("tocMobileNav");

    if (!tocDesktop || !tocMobile || !tocMobileNav || !articleRoot) {
      return () => {};
    }

    if (typeof tocCleanup === "function") {
      tocCleanup();
      tocCleanup = null;
    }

    const headings = Array.from(articleRoot.querySelectorAll("h2, h3"));
    if (headings.length === 0) {
      tocDesktop.hidden = true;
      tocMobile.hidden = true;
      tocDesktop.innerHTML = "";
      tocMobileNav.innerHTML = "";
      return () => {};
    }

    const used = new Set();
    headings.forEach((h) => {
      const existing = String(h.getAttribute("id") || "").trim();
      const base = existing || slugifyHeading(h.textContent || "");
      const nextId = ensureUniqueId(base, used);
      if (!existing || existing !== nextId) {
        h.id = nextId;
      }
    });

    const headers = [];
    let hasH2 = false;

    headings.forEach((h) => {
      const rawLevel = Number(String(h.tagName || "").replace(/^H/i, "")) || 2;
      let level = rawLevel;

      if (rawLevel === 2) hasH2 = true;
      if (rawLevel === 3 && !hasH2) level = 2;

      const text = (h.textContent || "").trim();
      if (!h.id || !text) return;
      if (level !== 2 && level !== 3) return;

      headers.push({ id: h.id, text, level });
    });

    const listHtml = renderTocList(headers);
    tocDesktop.hidden = false;
    tocMobile.hidden = false;

    tocDesktop.innerHTML = `<div class="toc__label">On this page</div><div class="toc__nav">${listHtml}</div>`;
    tocMobileNav.innerHTML = listHtml;

    const cleanupFns = [
      wireTocClicks(tocDesktop),
      wireTocClicks(tocMobile),
      setupTocScrollSpy(headings),
    ];

    // Close mobile details when switching to desktop layout.
    const mq =
      typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 1450px)") : null;

    function onMqChange() {
      if (mq && mq.matches) tocMobile.removeAttribute("open");
    }

    if (mq && typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onMqChange);
      cleanupFns.push(() => mq.removeEventListener("change", onMqChange));
    } else if (mq && typeof mq.addListener === "function") {
      // Safari < 14
      mq.addListener(onMqChange);
      cleanupFns.push(() => mq.removeListener(onMqChange));
    }

    onMqChange();

    tocCleanup = () => cleanupFns.forEach((fn) => (typeof fn === "function" ? fn() : null));
    return tocCleanup;
  }

  function parseFrontMatter(markdown) {
    // Minimal Front Matter parser:
    // ---\nkey: value\n---\n
    if (!markdown.startsWith("---")) {
      return { attributes: {}, body: markdown };
    }

    const end = markdown.indexOf("\n---", 3);
    if (end === -1) {
      return { attributes: {}, body: markdown };
    }

    const raw = markdown.slice(3, end).trim();
    const body = markdown.slice(end + "\n---".length).replace(/^\n/, "");

    const attributes = {};
    for (const line of raw.split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;

      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();

      // Support tags like: [a, b]
      if (value.startsWith("[") && value.endsWith("]")) {
        const inner = value.slice(1, -1);
        attributes[key] = inner
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        attributes[key] = value;
      }
    }

    return { attributes, body };
  }

  function normalizeTags(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return await res.json();
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return await res.text();
  }

  async function fetchPostMarkdown(file) {
    if (!file) return "";
    if (markdownCache.has(file)) return markdownCache.get(file);

    const text = await fetchText(`posts/${file}`);
    markdownCache.set(file, text);
    return text;
  }

  async function enrichPostsFromFrontMatter(posts) {
    // Read front matter for tags/title/date so index.json can remain minimal.
    const tasks = posts.map(async (p) => {
      if (!p || !p.file) return p;

      try {
        const md = await fetchPostMarkdown(p.file);
        const parsed = parseFrontMatter(md);
        const fm = parsed.attributes || {};

        const tags = normalizeTags(fm.tags);

        return {
          ...p,
          title: fm.title || p.title,
          date: fm.date || p.date,
          tags: tags.length ? tags : normalizeTags(p.tags),
        };
      } catch (err) {
        console.warn("[front-matter] Failed to read", p.id, err);
        return p;
      }
    });

    return await Promise.all(tasks);
  }

  function sortPostsByDateDesc(posts) {
    return [...posts].sort((a, b) => {
      const da = Date.parse(a.date || "");
      const db = Date.parse(b.date || "");
      return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
    });
  }

  function renderTagsFromPosts(posts) {
    const host = $("tagList");
    if (!host) return;

    const tagSet = new Set();
    for (const p of posts) {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => tagSet.add(String(t)));
      }
    }

    if (tagSet.size === 0) {
      host.innerHTML = '<span class="muted">(no tags)</span>';
      return;
    }

    const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    host.innerHTML = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  }

  function renderPostList(posts, options) {
    const host = $("postList");
    if (!host) return;

    const opts = options && typeof options === "object" ? options : {};
    const tokens = Array.isArray(opts.highlightTokens) ? opts.highlightTokens : [];
    const highlightRe = buildHighlightRegex(tokens);

    if (!posts.length) {
      host.innerHTML = '<div class="card"><div class="muted">No posts found.</div></div>';
      return;
    }

    host.innerHTML = posts
      .map((p) => {
        const titleHtml = highlightTextToHtml(p.title || p.id, highlightRe);
        const date = escapeHtml(p.date || "");
        const excerptHtml = highlightTextToHtml(p.excerpt || "", highlightRe);
        const href = `post.html?slug=${encodeURIComponent(p.id)}`;

        const tagHtml = Array.isArray(p.tags) && p.tags.length
          ? `<div class="tag-list">${p.tags
              .map((t) => `<span class="tag">${highlightTextToHtml(t, highlightRe)}</span>`)
              .join("")}</div>`
          : "";

        return `
          <article class="card post-item">
            <a class="post-item__title" href="${href}">${titleHtml}</a>
            <div class="post-item__meta">
              <span>${date}</span>
              <span class="muted">•</span>
              <span class="muted">id: ${escapeHtml(p.id)}</span>
            </div>
            ${tagHtml}
            <p class="post-item__excerpt">${excerptHtml}</p>
          </article>
        `;
      })
      .join("");
  }

  function setActiveNav(active) {
    const links = document.querySelectorAll(".nav__link[data-nav]");
    links.forEach((a) => {
      const name = a.getAttribute("data-nav");
      if (!name) return;

      const isActive = name === active;
      a.classList.toggle("is-active", isActive);

      // Accessibility: expose the active state to screen readers.
      if (isActive) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  function setIndexHeader(title, subtitle) {
    const titleEl = $("pageTitle") || document.querySelector(".page-header .page-title");
    const subtitleEl = $("pageSubtitle") || document.querySelector(".page-header .page-subtitle");

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    const baseTitle = "k1he blog";
    if (title && title !== "Posts") {
      document.title = `${title} • ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }

  function formatArchiveMonthDay(dateStr) {
    const raw = String(dateStr || "");
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[2]}-${m[3]}`;

    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${mm}-${dd}`;
    }

    return raw;
  }

  function getArchiveData(posts) {
    const groups = new Map();

    for (const p of posts || []) {
      if (!p) continue;

      const rawDate = String(p.date || "");
      let year = "Unknown";

      const iso = rawDate.match(/^(\d{4})-/);
      if (iso) {
        year = iso[1];
      } else {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) year = String(d.getFullYear());
      }

      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push({
        id: p.id,
        title: p.title || p.id,
        date: p.date || "",
      });
    }

    for (const list of groups.values()) {
      list.sort((a, b) => {
        const da = Date.parse(a.date || "");
        const db = Date.parse(b.date || "");
        return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
      });
    }

    return Object.fromEntries(groups.entries());
  }

  function renderArchive(posts) {
    const host = $("postList");
    if (!host) return;

    if (!posts.length) {
      host.innerHTML = '<div class="card"><div class="muted">No posts found.</div></div>';
      return;
    }

    const archiveData = getArchiveData(posts);

    const yearKeys = Object.keys(archiveData).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return Number(b) - Number(a);
    });

    const total = posts.length;
    const years = yearKeys.filter((y) => y !== "Unknown").length;

    const yearsHtml = yearKeys
      .map((year, idx) => {
        const list = archiveData[year] || [];
        const openAttr = idx === 0 ? " open" : "";

        const itemsHtml = list
          .map((p) => {
            const href = `post.html?slug=${encodeURIComponent(p.id)}`;
            const title = escapeHtml(p.title || p.id);
            const date = escapeHtml(formatArchiveMonthDay(p.date));
            const dt = escapeHtml(String(p.date || ""));

            return `
              <li class="archive-item">
                <time class="archive-date" datetime="${dt}">${date}</time>
                <a class="archive-link" href="${href}">${title}</a>
              </li>
            `;
          })
          .join("");

        return `
          <details class="card archive-year"${openAttr}>
            <summary class="archive-year__summary">
              <span class="archive-year__title">${escapeHtml(year)}</span>
              <span class="archive-count">${escapeHtml(String(list.length))}</span>
            </summary>
            <ul class="archive-list">
              ${itemsHtml}
            </ul>
          </details>
        `;
      })
      .join("");

    host.innerHTML = `
      <div class="card archive-summary">
        <div class="archive-summary__title">Archive</div>
        <div class="muted">${escapeHtml(String(total))} posts across ${escapeHtml(String(years))} years</div>
      </div>
      ${yearsHtml}
    `;
  }

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function configureMarked() {
    if (!window.marked) {
      throw new Error("marked.js not loaded. Ensure js/marked.min.js is present.");
    }

    // Safe-ish defaults for MVP: disable marked's email mangling.
    window.marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false,
    });
  }

  async function initRichContent(root) {
    // Must be called after the post HTML is injected.
    const host = root || document.body;

    applyImagePerformanceAttrs(host);

    // Mermaid conflicts with code highlighting; convert blocks before Prism runs.
    convertMermaidCodeBlocks(host);

    configurePrismAutoloader();

    if (window.Prism) {
      if (typeof window.Prism.highlightAllUnder === "function") {
        window.Prism.highlightAllUnder(host);
      } else if (typeof window.Prism.highlightAll === "function") {
        window.Prism.highlightAll();
      }
    }

    if (window.renderMathInElement) {
      window.renderMathInElement(host, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        ignoredClasses: ["mermaid"],
        throwOnError: false,
      });
    }

    // Load heavier libraries last (and only if needed).
    await renderMermaidIfPresent(host);
    await initMediumZoomIfPresent(host);
    
    // Initialize Mermaid diagram lightbox after Mermaid renders
    initMermaidLightbox(host);
  }

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function renderAboutBioMarkdown(markdown) {
    const host = $("aboutBio");
    if (!host) return;

    const md = String(markdown || "");
    const html = window.marked.parse(md);

    host.innerHTML = `<div class="article">${html}</div>`;

    // Minimal improvement: external links open in a new tab.
    host.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("http://") || href.startsWith("https://")) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function renderAboutInfo(profile) {
    const host = $("aboutInfo");
    if (!host) return;

    const p = profile && typeof profile === "object" ? profile : {};

    const rows = [
      { key: "Name", value: p.name },
      { key: "Title", value: p.title },
      { key: "Location", value: p.location },
      { key: "Education", value: p.education },
      { key: "Languages", value: Array.isArray(p.languages) ? p.languages.join(" / ") : p.languages },
      { key: "Focus", value: Array.isArray(p.focus) ? p.focus.join(" · ") : p.focus },
    ].filter((r) => String(r.value || "").trim());

    clearElement(host);

    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "(no profile data)";
      host.appendChild(empty);
      return;
    }

    rows.forEach((row) => {
      const wrapper = document.createElement("div");
      wrapper.className = "about-kv__row";

      const dt = document.createElement("dt");
      dt.className = "about-kv__key muted";
      dt.textContent = row.key;

      const dd = document.createElement("dd");
      dd.className = "about-kv__value";
      dd.textContent = String(row.value);

      wrapper.appendChild(dt);
      wrapper.appendChild(dd);
      host.appendChild(wrapper);
    });
  }

  function renderAboutSkills(skills) {
    const host = $("aboutSkills");
    if (!host) return;

    clearElement(host);

    if (!Array.isArray(skills) || !skills.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "(no skills data)";
      host.appendChild(empty);
      return;
    }

    skills.forEach((group) => {
      if (!group) return;

      const category = String(group.category || "").trim();
      const items = Array.isArray(group.items) ? group.items : [];
      if (!category || items.length === 0) return;

      const block = document.createElement("div");
      block.className = "skill-group";

      const title = document.createElement("div");
      title.className = "skill-group__title muted";
      title.textContent = category;

      const tags = document.createElement("div");
      tags.className = "tag-list";

      items
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .forEach((label) => {
          const tag = document.createElement("span");
          tag.className = "tag skill-tag";
          tag.textContent = label;
          tags.appendChild(tag);
        });

      block.appendChild(title);
      block.appendChild(tags);
      host.appendChild(block);
    });

    if (!host.childElementCount) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "(no skills data)";
      host.appendChild(empty);
    }
  }

  function renderAboutTimeline(timeline) {
    const host = $("aboutTimeline");
    if (!host) return;

    clearElement(host);

    if (!Array.isArray(timeline) || !timeline.length) {
      const li = document.createElement("li");
      li.className = "timeline-item";
      li.innerHTML = '<div class="muted">(no timeline data)</div>';
      host.appendChild(li);
      return;
    }

    timeline.forEach((item) => {
      if (!item || typeof item !== "object") return;

      const period = String(item.period || "").trim();
      const role = String(item.role || "").trim();
      const company = String(item.company || "").trim();
      const location = String(item.location || "").trim();
      const logo = String(item.logo || "").trim();
      const highlights = Array.isArray(item.highlights) ? item.highlights : [];

      if (!period && !role && !company) return;

      const li = document.createElement("li");
      li.className = "timeline-item";

      const row = document.createElement("div");
      row.className = "timeline-item__row";

      const time = document.createElement("div");
      time.className = "timeline-item__time muted";
      time.textContent = period;

      const main = document.createElement("div");
      main.className = "timeline-item__main";

      const header = document.createElement("div");
      header.className = "timeline-item__header";

      if (logo) {
        const img = document.createElement("img");
        img.className = "timeline-item__logo";
        img.src = logo;
        img.alt = company ? `${company} logo` : "Company logo";
        img.loading = "lazy";
        img.decoding = "async";
        header.appendChild(img);
      }

      const title = document.createElement("div");
      title.className = "timeline-item__title";
      title.textContent = [role, company].filter(Boolean).join(" • ");

      const meta = document.createElement("div");
      meta.className = "timeline-item__meta muted";
      meta.textContent = location;

      header.appendChild(title);
      if (location) header.appendChild(meta);

      main.appendChild(header);

      const safeHighlights = highlights
        .map((x) => String(x || "").trim())
        .filter(Boolean);

      if (safeHighlights.length) {
        const ul = document.createElement("ul");
        ul.className = "timeline-item__highlights";
        safeHighlights.forEach((h) => {
          const li2 = document.createElement("li");
          li2.textContent = h;
          ul.appendChild(li2);
        });
        main.appendChild(ul);
      }

      row.appendChild(time);
      row.appendChild(main);
      li.appendChild(row);

      host.appendChild(li);
    });

    if (!host.childElementCount) {
      const li = document.createElement("li");
      li.className = "timeline-item";
      li.innerHTML = '<div class="muted">(no timeline data)</div>';
      host.appendChild(li);
    }
  }

  function renderAboutContacts(contacts) {
    const host = $("aboutContacts");
    if (!host) return;

    clearElement(host);

    if (!Array.isArray(contacts) || !contacts.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "(no contact data)";
      host.appendChild(empty);
      return;
    }

    contacts.forEach((c) => {
      if (!c || typeof c !== "object") return;

      const label = String(c.label || "").trim();
      const value = String(c.value || "").trim();
      const href = String(c.href || "").trim();

      if (!label && !value) return;

      const item = document.createElement(href ? "a" : "div");
      item.className = "contact-item";
      if (href) {
        item.setAttribute("href", href);
        if (href.startsWith("http://") || href.startsWith("https://")) {
          item.setAttribute("target", "_blank");
          item.setAttribute("rel", "noopener noreferrer");
        }
      }

      const k = document.createElement("span");
      k.className = "contact-item__label muted";
      k.textContent = label || "Contact";

      const v = document.createElement("span");
      v.className = "contact-item__value";
      v.textContent = value || href;

      item.appendChild(k);
      item.appendChild(v);

      host.appendChild(item);
    });

    if (!host.childElementCount) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "(no contact data)";
      host.appendChild(empty);
    }
  }

  function renderAboutFatal(sectionId, message) {
    const host = $(sectionId);
    if (!host) return;

    clearElement(host);

    const box = document.createElement("div");
    box.className = "muted";
    box.textContent = String(message || "Failed to load");
    host.appendChild(box);
  }

  async function initAboutPage() {
    setActiveNav("about");
    setIndexHeader("About", "Profile, tech stack, and experience timeline.");

    // Sidebar always shows tags (best-effort).
    try {
      const posts = await fetchJson(POSTS_INDEX_URL);
      const enriched = await enrichPostsFromFrontMatter(posts);
      renderTagsFromPosts(enriched);
    } catch (err) {
      console.warn("[about] Failed to load tags:", err);
      const tagHost = $("tagList");
      if (tagHost) tagHost.innerHTML = '<span class="muted">(failed to load)</span>';
    }

    const [bioResult, dataResult] = await Promise.allSettled([
      fetchText(ABOUT_MD_URL),
      fetchJson(ABOUT_DATA_URL),
    ]);

    if (bioResult.status === "fulfilled") {
      renderAboutBioMarkdown(bioResult.value);
      // Apply optional rich enhancements (image lazy-loading, zoom, mermaid) if present.
      await initRichContent($("aboutBio"));
    } else {
      renderAboutFatal("aboutBio", "Failed to load bio.");
    }

    if (dataResult.status === "fulfilled") {
      const data = dataResult.value && typeof dataResult.value === "object" ? dataResult.value : {};
      renderAboutInfo(data.profile);
      renderAboutSkills(data.skills);
      renderAboutTimeline(data.timeline);
      renderAboutContacts(data.contacts);
    } else {
      renderAboutFatal("aboutInfo", "Failed to load profile.");
      renderAboutFatal("aboutSkills", "Failed to load tech stack.");
      renderAboutFatal("aboutTimeline", "Failed to load timeline.");
      renderAboutFatal("aboutContacts", "Failed to load contacts.");
    }
  }

  // ------------------------------
  // MVP_4: Pagination
  // ------------------------------
  const POSTS_PER_PAGE = 10;

  let paginationState = {
    allPosts: [],
    filteredPosts: [],
    currentPage: 1,
    highlightTokens: [],
  };

  function getTotalPages(posts) {
    return Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  }

  function getPagePosts(posts, page) {
    const start = (page - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    return posts.slice(start, end);
  }

  function renderPagination() {
    const pagination = $("pagination");
    const prevBtn = $("paginationPrev");
    const nextBtn = $("paginationNext");
    const info = $("paginationInfo");

    if (!pagination) return;

    const totalPages = getTotalPages(paginationState.filteredPosts);
    const currentPage = paginationState.currentPage;

    // Hide pagination if only one page
    if (totalPages <= 1) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;

    // Update info text
    if (info) {
      info.textContent = `${currentPage} / ${totalPages}`;
    }

    // Update button states
    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages;
    }
  }

  function renderCurrentPage() {
    const posts = getPagePosts(paginationState.filteredPosts, paginationState.currentPage);
    renderPostList(posts, { highlightTokens: paginationState.highlightTokens });
    renderPagination();
  }

  function goToPage(page) {
    const totalPages = getTotalPages(paginationState.filteredPosts);
    const newPage = Math.max(1, Math.min(page, totalPages));

    if (newPage !== paginationState.currentPage) {
      paginationState.currentPage = newPage;
      renderCurrentPage();

      // Scroll to top of post list
      const postList = $("postList");
      if (postList) {
        postList.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function initPagination(posts) {
    paginationState.allPosts = posts;
    paginationState.filteredPosts = posts;
    paginationState.currentPage = 1;
    paginationState.highlightTokens = [];

    const prevBtn = $("paginationPrev");
    const nextBtn = $("paginationNext");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToPage(paginationState.currentPage - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToPage(paginationState.currentPage + 1);
      });
    }

    // Keyboard navigation for pagination
    document.addEventListener("keydown", (e) => {
      // Only handle if not in an input field
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        goToPage(paginationState.currentPage - 1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        goToPage(paginationState.currentPage + 1);
      }
    });

    renderCurrentPage();
  }

  function updatePaginationWithFilter(filteredPosts, highlightTokens) {
    paginationState.filteredPosts = filteredPosts;
    paginationState.highlightTokens = highlightTokens || [];
    paginationState.currentPage = 1; // Reset to first page on filter
    renderCurrentPage();
  }

  // ------------------------------
  // MVP_4: Search functionality
  // ------------------------------
  function filterPosts(posts, query) {
    const tokens = splitSearchTokens(query);
    if (!tokens.length) return posts;

    return posts.filter((p) => {
      const title = String(p.title || p.id || "").toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags.map((t) => String(t).toLowerCase()) : [];
      const excerpt = String(p.excerpt || "").toLowerCase();

      return tokens.every((token) => {
        return (
          title.includes(token) ||
          tags.some((tag) => tag.includes(token)) ||
          excerpt.includes(token)
        );
      });
    });
  }

  function initSearchUI(allPosts) {
    const searchInput = $("searchInput");
    const searchClear = $("searchClear");
    const searchStats = $("searchStats");
    const searchSuggestions = $("searchSuggestions");
    const searchSection = $("search");

    if (!searchInput) return;

    // Store all posts globally for search
    window.allPosts = allPosts;

    let currentQuery = "";

    function updateSearchStats(filtered, total) {
      if (!searchStats) return;
      if (!currentQuery.trim()) {
        searchStats.textContent = "";
        return;
      }
      searchStats.textContent = `找到 ${filtered} 篇文章（共 ${total} 篇）`;
    }

    function performSearch(query) {
      currentQuery = query;
      const tokens = splitSearchTokens(query);
      const filtered = filterPosts(allPosts, query);

      // Use pagination for search results
      updatePaginationWithFilter(filtered, tokens);
      updateSearchStats(filtered.length, allPosts.length);

      // Toggle clear button visibility
      if (searchClear) {
        searchClear.hidden = !query.trim();
      }
    }

    function showSuggestions() {
      if (!searchSuggestions) return;

      const history = loadSearchHistory();
      if (!history.length) {
        searchSuggestions.hidden = true;
        searchInput.setAttribute("aria-expanded", "false");
        return;
      }

      const historyHtml = history
        .slice(0, 5)
        .map((q, i) => `
          <div class="search-suggestion" role="option" data-index="${i}" data-query="${escapeHtml(q)}">
            <span class="search-suggestion__text">${escapeHtml(q)}</span>
            <span class="search-suggestion__meta">历史</span>
          </div>
        `)
        .join("");

      searchSuggestions.innerHTML = `
        <div class="search-suggestions__section">
          <div class="search-suggestions__header">
            <span class="search-suggestions__label">搜索历史</span>
            <button class="search-suggestions__action" type="button" data-action="clear-history">清除</button>
          </div>
          ${historyHtml}
        </div>
      `;

      searchSuggestions.hidden = false;
      searchInput.setAttribute("aria-expanded", "true");
    }

    function hideSuggestions() {
      if (!searchSuggestions) return;
      searchSuggestions.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
    }

    // Debounced search handler
    const debouncedSearch = debounce((query) => {
      performSearch(query);
    }, 200);

    // Input event
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value;
      debouncedSearch(query);
      if (!query.trim()) {
        showSuggestions();
      } else {
        hideSuggestions();
      }
    });

    // Focus event - show suggestions
    searchInput.addEventListener("focus", () => {
      if (!searchInput.value.trim()) {
        showSuggestions();
      }
    });

    // Blur event - hide suggestions (with delay for click handling)
    searchInput.addEventListener("blur", () => {
      setTimeout(hideSuggestions, 200);
    });

    // Clear button
    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        performSearch("");
        searchInput.focus();
        showSuggestions();
      });
    }

    // Keyboard navigation
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        performSearch("");
        hideSuggestions();
        searchInput.blur();
      } else if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          pushSearchHistory(query);
        }
        hideSuggestions();
      }
    });

    // Suggestions click handling
    if (searchSuggestions) {
      searchSuggestions.addEventListener("click", (e) => {
        const suggestion = e.target.closest(".search-suggestion");
        if (suggestion) {
          const query = suggestion.getAttribute("data-query");
          if (query) {
            searchInput.value = query;
            performSearch(query);
            hideSuggestions();
          }
          return;
        }

        const action = e.target.closest("[data-action]");
        if (action && action.getAttribute("data-action") === "clear-history") {
          clearSearchHistory();
          hideSuggestions();
        }
      });
    }
  }

  async function initIndexPage() {
    const view = (getQueryParam("view") || "").toLowerCase();

    // Update navigation + header immediately, before async fetching.
    if (view === "archive") {
      setActiveNav("archive");
      setIndexHeader("Archive", "Browse posts grouped by year.");
    } else {
      setActiveNav("home");
      setIndexHeader("Posts", "Latest notes, experiments, and snippets.");
    }

    const posts = await fetchJson(POSTS_INDEX_URL);
    const enriched = await enrichPostsFromFrontMatter(posts);
    const sorted = sortPostsByDateDesc(enriched);

    // Sidebar always shows tags.
    renderTagsFromPosts(sorted);

    if (view === "archive") {
      renderArchive(sorted);
      // Hide search and pagination in archive view
      const searchSection = $("search");
      const pagination = $("pagination");
      if (searchSection) searchSection.hidden = true;
      if (pagination) pagination.hidden = true;
    } else {
      // Initialize pagination with all posts
      initPagination(sorted);
      // Initialize search functionality
      initSearchUI(sorted);
    }
  }

  async function renderPost(postId) {
    const titleEl = $("postTitle");
    const metaEl = $("postMeta");
    const contentEl = $("postContent");
    const crumbEl = $("postCrumb");

    const posts = await fetchJson(POSTS_INDEX_URL);
    const enriched = await enrichPostsFromFrontMatter(posts);
    renderTagsFromPosts(enriched);

    const post = enriched.find((p) => p.id === postId);

    if (!post) {
      if (titleEl) titleEl.textContent = "Post not found";
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="card">
            <p>Unknown post id: <code>${escapeHtml(postId)}</code></p>
            <p><a class="link" href="index.html">← Back</a></p>
          </div>
        `;
      }
      return;
    }

    // Defaults from registry (index.json)
    let title = post.title || post.id;
    let date = post.date || "";

    const md = await fetchPostMarkdown(post.file);
    const parsed = parseFrontMatter(md);

    // Front matter can override registry for better SEO.
    if (parsed.attributes.title) title = parsed.attributes.title;
    if (parsed.attributes.date) date = parsed.attributes.date;

    if (titleEl) titleEl.textContent = title;
    if (crumbEl) crumbEl.textContent = title;
    if (metaEl) metaEl.textContent = date;
    document.title = `${title} • k1he blog`;

    const html = window.marked.parse(parsed.body);
    if (contentEl) {
      contentEl.innerHTML = `<div class="card">${html}</div>`;

      // Minimal improvement: external links open in a new tab.
      contentEl.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href") || "";
        if (href.startsWith("http://") || href.startsWith("https://")) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        }
      });

      initTableOfContents(contentEl);
      await initRichContent(contentEl);
    }
  }

  async function initPostPage() {
    const postId = getQueryParam("slug") || getQueryParam("id") || getQueryParam("post");
    const titleEl = $("postTitle");
    const contentEl = $("postContent");

    if (!postId) {
      if (titleEl) titleEl.textContent = "Missing post id";
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="card">
            <p>Open a post from the <a class="link" href="index.html">homepage</a>.</p>
            <p class="muted">Expected format: <code>post.html?slug=hello-world</code></p>
          </div>
        `;
      }
      return;
    }

    await renderPost(postId);
  }

  function showFatalError(err) {
    console.error(err);

    const host = document.querySelector("main.main") || document.body;
    const msg = err instanceof Error ? err.message : String(err);

    const box = document.createElement("div");
    box.className = "card";
    box.innerHTML = `
      <h2 style="margin-top:0; color: var(--danger)">Error</h2>
      <p>${escapeHtml(msg)}</p>
      <p class="muted">Make sure you're running a local server (not file://).</p>
    `;

    host.prepend(box);
  }

  async function main() {
    configureMarked();

    const pathname = window.location.pathname;
    const isPostPage = /\/post\.html$/i.test(pathname);
    const isAboutPage = /\/about\.html$/i.test(pathname);

    // Enable spotlight background effect on all pages for tech feel
    const spotlightCleanup = initSpotlightBackground();

    try {
      if (isPostPage) {
        // Treat post pages as part of "Home".
        setActiveNav("home");
        await initPostPage();
      } else if (isAboutPage) {
        await initAboutPage();
      } else {
        await initIndexPage();
      }
    } finally {
      // Intentionally not invoked today because we don't currently have a teardown
      // lifecycle, but keep this in place if future navigation becomes SPA-like.
      // spotlightCleanup();
      void spotlightCleanup;
    }
  }

  main().catch(showFatalError);
})();
