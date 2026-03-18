(function () {
  const ROOT = window.__RELATIVE_ROOT__ || "./";

  let index       = [];
  let indexLoaded = false;
  let selectedIdx = -1;
  let lastQuery   = "";

  const modal            = document.getElementById("search-modal");
  const input            = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");
  const trigger          = document.querySelector(".search-trigger");

  function loadIndex() {
    if (indexLoaded) return Promise.resolve();
    return fetch(ROOT + "search-index.json")
      .then(r => r.json())
      .then(data => { index = data; indexLoaded = true; })
      .catch(() => { index = []; indexLoaded = true; });
  }

  function isOpen() { return modal && !modal.hidden; }

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    trigger && trigger.setAttribute("aria-expanded", "true");
    loadIndex().then(() => {
      requestAnimationFrame(() => input && input.focus());
      if (lastQuery) runSearch(lastQuery);
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    trigger && trigger.setAttribute("aria-expanded", "false");
    selectedIdx = -1;
  }

  function escapeRe(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp("(" + escapeRe(query) + ")", "gi");
    return text.replace(re, '<mark class="search-highlight">$1</mark>');
  }

  function scoreEntry(entry, tokens) {
    const title   = entry.title.toLowerCase();
    const tags    = (entry.tags || []).join(" ").toLowerCase();
    const excerpt = (entry.excerpt || "").toLowerCase();
    const grade   = entry.grade ? String(entry.grade) : "";
    let score = 0;
    for (const token of tokens) {
      if (title === token)            score += 100;
      else if (title.startsWith(token)) score += 60;
      else if (title.includes(token))   score += 40;
      if (tags.includes(token))    score += 30;
      if (grade.includes(token))   score += 20;
      if (excerpt.includes(token)) score += 10;
    }
    return score;
  }

  function runSearch(query) {
    lastQuery = query;
    const trimmed = query.trim();
    if (!trimmed) { if (resultsContainer) resultsContainer.innerHTML = ""; selectedIdx = -1; return; }
    const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = index
      .map(entry => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    renderResults(scored, trimmed);
  }

  function renderResults(scored, query) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "";
    selectedIdx = -1;

    if (scored.length === 0) {
      const empty = document.createElement("div");
      empty.className = "search-no-results";
      empty.textContent = 'No results for "' + query + '"';
      resultsContainer.appendChild(empty);
      return;
    }

    scored.forEach(({ entry }, i) => {
      const item = document.createElement("a");
      item.className = "search-result-item";
      item.href = ROOT + entry.url.replace(/^\//, "");
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.dataset.index = String(i);

      const title = document.createElement("div");
      title.className = "search-result-title";
      title.innerHTML = highlight(entry.title, query);

      const excerpt = document.createElement("div");
      excerpt.className = "search-result-excerpt";
      excerpt.textContent = entry.excerpt || "";

      const meta = document.createElement("div");
      meta.className = "search-result-meta";

      const chips = [];
      if (entry.grade) chips.push("Grade " + entry.grade);
      if (entry.type && entry.type !== "lesson") chips.push(entry.type);
      if (entry.difficulty) chips.push(entry.difficulty);
      chips.forEach(text => {
        const chip = document.createElement("span");
        chip.className = "result-chip";
        chip.textContent = text;
        meta.appendChild(chip);
      });

      item.appendChild(title);
      item.appendChild(excerpt);
      if (meta.children.length) item.appendChild(meta);

      item.addEventListener("mouseenter", () => setSelected(i));
      item.addEventListener("click", closeModal);
      resultsContainer.appendChild(item);
    });
  }

  function getItems() {
    return resultsContainer ? [...resultsContainer.querySelectorAll(".search-result-item")] : [];
  }

  function setSelected(idx) {
    getItems().forEach((el, i) => {
      const active = i === idx;
      el.setAttribute("aria-selected", String(active));
      el.classList.toggle("is-selected", active);
    });
    selectedIdx = idx;
    const items = getItems();
    if (items[idx]) items[idx].scrollIntoView({ block: "nearest" });
  }

  function navigateResult(dir) {
    const items = getItems();
    if (!items.length) return;
    setSelected(Math.max(0, Math.min(items.length - 1, selectedIdx + dir)));
  }

  function activateSelected() {
    const items = getItems();
    if (selectedIdx >= 0 && items[selectedIdx]) items[selectedIdx].click();
  }

  function init() {
    if (trigger) trigger.addEventListener("click", openModal);

    const backdrop = modal && modal.querySelector(".search-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeModal);

    if (input) {
      let debounceTimer;
      input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => runSearch(input.value), 160);
      });
    }

    document.addEventListener("keydown", e => {
      // Open shortcut: / or Cmd+K when modal is closed
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !isOpen()) {
        const tag = document.activeElement && document.activeElement.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        openModal();
        return;
      }
      // Navigation shortcuts when modal is open
      if (!isOpen()) return;
      switch (e.key) {
        case "Escape":    closeModal(); break;
        case "ArrowDown": e.preventDefault(); navigateResult(1); break;
        case "ArrowUp":   e.preventDefault(); navigateResult(-1); break;
        case "Enter":     e.preventDefault(); activateSelected(); break;
        case "Tab":       e.preventDefault(); navigateResult(e.shiftKey ? -1 : 1); break;
      }
    });

    if (trigger) {
      trigger.addEventListener("mouseenter", () => { if (!indexLoaded) loadIndex(); }, { once: true });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
