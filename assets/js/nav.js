(function () {
  const NAV     = window.__NAV_JSON__      || {};
  const CURRENT = window.__CURRENT_URL__   || "";
  const ROOT    = window.__RELATIVE_ROOT__ || "./";
  const IS_INDEX = window.__IS_INDEX__     || false;

  const SECTION_ICONS = {
    "k-2": "🌱", "3-5": "🌿", "6-8": "🔬",
    "9-12": "🚀", "projects": "🛠", "exercises": "✏️", "__root__": "📄",
  };

  function sectionIcon(key) {
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(SECTION_ICONS)) {
      if (lower.includes(k)) return v;
    }
    return "📁";
  }

  function labelFromKey(key) {
    return key.replace(/-/g, " ").replace(/^\d+\s*/, "").replace(/\b\w/g, c => c.toUpperCase());
  }

  function isActive(url) {
    if (!CURRENT) return false;
    const norm = p => p.replace(/\/index\.html$/, "/").replace(/\/$/, "");
    return norm(CURRENT) === norm(url);
  }

  function buildNavItem(page, depth) {
    const a = document.createElement("a");
    a.className = "nav-item" + (isActive(page.url) ? " is-active" : "");
    a.href = ROOT + page.url.replace(/^\//, "");
    a.setAttribute("role", "treeitem");
    a.setAttribute("aria-selected", isActive(page.url) ? "true" : "false");
    a.style.paddingLeft = ((depth + 1) * 16 + 8) + "px";
    a.textContent = page.title;
    if (page.difficulty) {
      const badge = document.createElement("span");
      badge.className = "nav-item-badge";
      badge.textContent = page.difficulty.slice(0, 3);
      a.appendChild(badge);
    }
    return a;
  }

  function buildSection(key, pages, depth, storageKey) {
    if (!pages || pages.length === 0) return null;

    const section = document.createElement("div");
    section.className = "nav-section";
    section.setAttribute("role", "group");

    const savedState = localStorage.getItem("nav-section-" + storageKey);
    const isExpanded = savedState !== null ? savedState === "open" : true;

    if (key !== "__root__") {
      const toggle = document.createElement("button");
      toggle.className = "nav-section-toggle";
      toggle.setAttribute("aria-expanded", String(isExpanded));
      toggle.setAttribute("aria-controls", "nav-body-" + storageKey);
      toggle.setAttribute("role", "treeitem");

      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = sectionIcon(key);

      const label = document.createElement("span");
      label.textContent = labelFromKey(key);
      label.style.flex = "1";

      const count = document.createElement("span");
      count.className = "nav-item-badge";
      count.textContent = pages.length;

      const arrow = document.createElement("span");
      arrow.className = "nav-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6 4 10 8 6 12"/></svg>';

      toggle.appendChild(icon);
      toggle.appendChild(label);
      toggle.appendChild(count);
      toggle.appendChild(arrow);
      section.appendChild(toggle);

      const body = document.createElement("div");
      body.className = "nav-section-body" + (isExpanded ? "" : " is-collapsed");
      body.id = "nav-body-" + storageKey;
      pages.forEach(page => body.appendChild(buildNavItem(page, depth)));

      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        body.classList.toggle("is-collapsed", expanded);
        localStorage.setItem("nav-section-" + storageKey, expanded ? "closed" : "open");
      });

      section.appendChild(body);
    } else {
      pages.forEach(page => section.appendChild(buildNavItem(page, depth)));
    }

    return section;
  }

  function renderNavTree(filterText) {
    const container = document.getElementById("nav-tree");
    if (!container) return;
    container.innerHTML = "";

    const query = (filterText || "").toLowerCase().trim();

    for (const [sectionKey, pages] of Object.entries(NAV)) {
      const filtered = query
        ? pages.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.tags || []).some(t => t.toLowerCase().includes(query)) ||
            (p.grade && String(p.grade).toLowerCase().includes(query))
          )
        : pages;

      const section = buildSection(sectionKey, filtered, 0, sectionKey);
      if (section) container.appendChild(section);
    }

    if (query && container.children.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText = "padding: 12px 16px; font-size: 0.8125rem; color: var(--text-muted);";
      empty.textContent = 'No lessons match "' + filterText + '"';
      container.appendChild(empty);
    }
  }

  function scrollActiveIntoView() {
    const active = document.querySelector(".nav-item.is-active");
    if (!active) return;
    requestAnimationFrame(() => active.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  function initSidebarToggle() {
    const toggle  = document.querySelector(".nav-toggle");
    const sidebar = document.getElementById("sidebar");
    if (!toggle || !sidebar) return;

    let backdrop = document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      document.body.appendChild(backdrop);
    }

    function open()  { sidebar.classList.add("is-open"); backdrop.classList.add("is-visible"); toggle.setAttribute("aria-expanded", "true"); }
    function close() { sidebar.classList.remove("is-open"); backdrop.classList.remove("is-visible"); toggle.setAttribute("aria-expanded", "false"); }

    toggle.addEventListener("click", () => sidebar.classList.contains("is-open") ? close() : open());
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && sidebar.classList.contains("is-open")) close(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 1024) close(); });
  }

  function initThemeToggle() {
    const btn = document.querySelector(".theme-toggle");
    if (!btn) return;

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("altair-theme", theme);
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }

    const current = document.documentElement.getAttribute("data-theme") || "light";
    btn.setAttribute("aria-pressed", current === "dark" ? "true" : "false");
    btn.addEventListener("click", () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  function initSidebarSearch() {
    const input = document.getElementById("sidebar-search-input");
    if (!input) return;
    let debounceTimer;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderNavTree(input.value), 180);
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Escape") { input.value = ""; renderNavTree(""); input.blur(); }
    });
  }

  function initKeyboardNav() {
    const container = document.getElementById("nav-tree");
    if (!container) return;
    container.addEventListener("keydown", e => {
      const items = [...container.querySelectorAll(".nav-item, .nav-section-toggle")]
        .filter(el => !el.closest(".is-collapsed"));
      const current = document.activeElement;
      const idx = items.indexOf(current);
      if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(idx + 1, items.length - 1)]?.focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(idx - 1, 0)]?.focus(); }
      else if (e.key === "ArrowRight" && current.classList.contains("nav-section-toggle")) {
        if (current.getAttribute("aria-expanded") === "false") current.click();
      } else if (e.key === "ArrowLeft" && current.classList.contains("nav-section-toggle")) {
        if (current.getAttribute("aria-expanded") === "true") current.click();
      } else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
      else if (e.key === "End")  { e.preventDefault(); items[items.length - 1]?.focus(); }
    });
  }

  function initIndexGrid() {
    const grid = document.getElementById("curriculum-grid");
    if (!grid || !IS_INDEX) return;

    const CARD_META = {
      "k-2":      { icon: "🌱", label: "Kindergarten – Grade 2", color: "#2d7a4f" },
      "3-5":      { icon: "🌿", label: "Grades 3 – 5",           color: "#1a5fa0" },
      "6-8":      { icon: "🔬", label: "Grades 6 – 8",           color: "#7a2da0" },
      "9-12":     { icon: "🚀", label: "Grades 9 – 12",          color: "#c8521a" },
      "projects": { icon: "🛠",  label: "Projects",               color: "#a07a00" },
      "exercises":{ icon: "✏️", label: "Exercises",              color: "#1a5a7a" },
    };

    for (const [key, pages] of Object.entries(NAV)) {
      if (!pages || !pages.length) continue;
      const meta = CARD_META[key.toLowerCase()] || { icon: "📂", label: labelFromKey(key), color: "var(--accent)" };
      const card = document.createElement("a");
      card.className = "curriculum-card";
      card.href = ROOT + key + "/";
      card.style.setProperty("--card-color", meta.color);
      card.innerHTML =
        '<div class="card-icon">' + meta.icon + '</div>' +
        '<div class="card-title">' + meta.label + '</div>' +
        '<div class="card-count">' + pages.length + ' lesson' + (pages.length !== 1 ? 's' : '') + '</div>';
      grid.appendChild(card);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderNavTree();
    scrollActiveIntoView();
    initSidebarToggle();
    initThemeToggle();
    initSidebarSearch();
    initKeyboardNav();
    initIndexGrid();
  });
})();
