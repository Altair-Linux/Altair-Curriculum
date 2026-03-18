(function () {
  const ROOT = window.__RELATIVE_ROOT__ || "./";

  let index = [];
  let indexLoaded = false;
  let selectedIdx = -1;
  let lastQuery = "";

  const modal = document.getElementById("search-modal");
  const backdrop = modal?.querySelector(".search-backdrop");
  const input = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");
  const trigger = document.querySelector(".search-trigger");

  function loadIndex() {
    if (indexLoaded) return Promise.resolve();
    return fetch(ROOT + "search-index.json")
      .then((r) => r.json())
      .then((data) => {
        index = data;
        indexLoaded = true;
      })
      .catch(() => {
        index = [];
        indexLoaded = true;
      });
  }

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    trigger?.setAttribute("aria-expanded", "true");
    loadIndex().then(() => {
      requestAnimationFrame(() => input?.focus());
      if (lastQuery) runSearch(lastQuery);
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    trigger?.setAttribute("aria-expanded", "false");
    selectedIdx = -1;
  }

  function escapeRe(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp("(" + escapeRe(query) + ")", "gi");
    return text.replace(re, "<mark class=\"search-highlight\">$1</mark>");
  }

  function tokenize(str) {
    return str.toLowerCase().split(/\s+/).filter(Boolean);
  }

  function scoreEntry(entry, tokens) {
    const titleLower = entry.title.toLowerCase();
    const tagsStr = (entry.tags || []).join(" ").toLowerCase();
    const excerptLower = (entry.excerpt || "").toLowerCase();
    const gradeStr = entry.grade ? String(entry.grade) : "";

    let score = 0;

    for (const token of tokens) {
      if (titleLower === token) {
        score += 100;
      } else if (titleLower.startsWith(token)) {
        score += 60;
      } else if (titleLower.includes(token)) {
        score += 40;
      }

      if (tagsStr.includes(token)) score += 30;
      if (gradeStr.includes(token)) score += 20;
      if (excerptLower.includes(token)) score += 10;
    }

    return score;
  }

  function runSearch(query) {
    lastQuery = query;
    const trimmed = query.trim();

    if (!trimmed) {
      resultsContainer.innerHTML = "";
      selectedIdx = -1;
      return;
    }

    const tokens = tokenize(trimmed);

    const scored = index
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    renderResults(scored, trimmed);
  }

  function renderResults(scored, query) {
    resultsContainer.innerHTML = "";
    selectedIdx = -1;

    if (scored.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText =
        "text-align:center;padding:2rem 1rem;color:var(--text-muted);font-size:0.9375rem;";
      empty.textContent = 'No results for "' + query + '"';
      resultsContainer.appendChild(empty);
      return;
    }

    scored.forEach(({ entry }, i) => {
      const href = ROOT + entry.url.replace(/^\//, "");

      const item = document.createElement("a");
      item.className = "search-result-item";
      item.href = href;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.dataset.index = String(i);

      const title = document.createElement("div");
      title.className = "result-title";
      title.innerHTML = highlight(entry.title, query);

      const excerpt = document.createElement("div");
      excerpt.className = "result-excerpt";
      excerpt.textContent = entry.excerpt || "";

      const meta = document.createElement("div");
      meta.className = "result-meta";

      if (entry.grade) {
        const chip = document.createElement("span");
        chip.className = "result-chip";
        chip.textContent = "Grade " + entry.grade;
        meta.appendChild(chip);
      }

      if (entry.type) {
        const chip = document.createElement("span");
        chip.className = "result-chip";
        chip.textContent = entry.type;
        meta.appendChild(chip);
      }

      if (entry.difficulty) {
        const chip = document.createElement("span");
        chip.className = "result-chip";
        chip.textContent = entry.difficulty;
        meta.appendChild(chip);
      }

      (entry.tags || []).slice(0, 3).forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "result-chip";
        chip.textContent = tag;
        meta.appendChild(chip);
      });

      item.appendChild(title);
      item.appendChild(excerpt);
      if (meta.children.length > 0) item.appendChild(meta);

      item.addEventListener("mouseenter", () => setSelected(i));
      item.addEventListener("click", closeModal);

      resultsContainer.appendChild(item);
    });
  }

  function getItems() {
    return [...resultsContainer.querySelectorAll(".search-result-item")];
  }

  function setSelected(idx) {
    const items = getItems();
    items.forEach((el, i) => {
      const active = i === idx;
      el.setAttribute("aria-selected", String(active));
      if (active) el.classList.add("is-selected");
      else el.classList.remove("is-selected");
    });
    selectedIdx = idx;
    if (items[idx]) {
      items[idx].scrollIntoView({ block: "nearest" });
    }
  }

  function navigateResult(dir) {
    const items = getItems();
    if (!items.length) return;
    const next = Math.max(0, Math.min(items.length - 1, selectedIdx + dir));
    setSelected(next);
  }

  function activateSelected() {
    const items = getItems();
    if (selectedIdx >= 0 && items[selectedIdx]) {
      items[selectedIdx].click();
    }
  }

  function initTrigger() {
    if (!trigger) return;
    trigger.addEventListener("click", openModal);
  }

  function initBackdrop() {
    if (!backdrop) return;
    backdrop.addEventListener("click", closeModal);
  }

  function initInput() {
    if (!input) return;

    let debounceTimer;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runSearch(input.value), 160);
    });
  }

  function initKeyboard() {
    document.addEventListener("keydown", (e) => {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !modal?.hidden === false) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        openModal();
        return;
      }

      if (modal?.hidden !== false) return;

      switch (e.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateResult(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          navigateResult(-1);
          break;
        case "Enter":
          e.preventDefault();
          activateSelected();
          break;
        case "Tab":
          e.preventDefault();
          navigateResult(e.shiftKey ? -1 : 1);
          break;
      }
    });
  }

  function init() {
    initTrigger();
    initBackdrop();
    initInput();
    initKeyboard();

    if (trigger) {
      trigger.addEventListener("mouseenter", () => {
        if (!indexLoaded) loadIndex();
      }, { once: true });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
