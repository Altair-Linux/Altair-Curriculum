(function () {
  const NAV = window.__NAV_JSON__ || {};
  const CURRENT = window.__CURRENT_URL__ || "";
  const ROOT = window.__RELATIVE_ROOT__ || "./";

  function buildTOC() {
    const toc = document.getElementById("toc");
    const body = document.querySelector(".lesson-body");
    if (!toc || !body) return;

    const headings = [...body.querySelectorAll("h2, h3, h4")];
    if (headings.length < 2) {
      const panel = document.querySelector(".toc-panel");
      if (panel) panel.style.display = "none";
      return;
    }

    headings.forEach((h) => {
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent.replace(/¶$/, "").trim();
      a.className = "toc-" + h.tagName.toLowerCase();
      a.dataset.target = h.id;

      a.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#" + h.id);
      });

      toc.appendChild(a);
    });
  }

  function initReadingProgress() {
    const bar = document.getElementById("reading-progress");
    const article = document.querySelector(".lesson-article");
    if (!bar || !article) return;

    const tocLinks = document.querySelectorAll("#toc a");

    function update() {
      const rect = article.getBoundingClientRect();
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;

      bar.style.setProperty("--progress", pct.toFixed(1) + "%");
      bar.setAttribute("aria-valuenow", String(Math.round(pct)));

      if (tocLinks.length > 0) {
        const headings = [...document.querySelectorAll(".lesson-body h2, .lesson-body h3, .lesson-body h4")];
        let activeId = null;

        for (let i = headings.length - 1; i >= 0; i--) {
          if (headings[i].getBoundingClientRect().top <= 96) {
            activeId = headings[i].id;
            break;
          }
        }

        tocLinks.forEach((link) => {
          link.classList.toggle("toc-active", link.dataset.target === activeId);
        });
      }
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  function initCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.nextElementSibling?.textContent || "";
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 2000);
        }).catch(() => {
          const ta = document.createElement("textarea");
          ta.value = code;
          ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        });
      });
    });
  }

  function initHints() {
    document.querySelectorAll(".hint-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".hint-item");
        if (!item) return;
        const wasRevealed = item.classList.contains("is-revealed");
        item.classList.toggle("is-revealed", !wasRevealed);
        btn.setAttribute("aria-expanded", String(!wasRevealed));
      });
    });
  }

  function initCollapsibles() {
    document.querySelectorAll("details.collapsible").forEach((el) => {
      const summary = el.querySelector("summary");
      if (!summary) return;
      summary.addEventListener("click", () => {
        const willOpen = !el.open;
        el.setAttribute("aria-expanded", String(willOpen));
      });
    });
  }

  function flattenNav() {
    const all = [];
    for (const pages of Object.values(NAV)) {
      all.push(...pages);
    }
    return all;
  }

  function initPrevNext() {
    const prevBtn = document.getElementById("prev-lesson");
    const nextBtn = document.getElementById("next-lesson");
    if (!prevBtn || !nextBtn) return;

    const all = flattenNav();
    const idx = all.findIndex((p) => p.url === CURRENT);
    if (idx === -1) return;

    const prev = all[idx - 1];
    const next = all[idx + 1];

    if (prev) {
      prevBtn.href = ROOT + prev.url.replace(/^\//, "");
      prevBtn.textContent = "← " + prev.title;
      prevBtn.hidden = false;
    }

    if (next) {
      nextBtn.href = ROOT + next.url.replace(/^\//, "");
      nextBtn.textContent = next.title + " →";
      nextBtn.hidden = false;
    }
  }

  function initMermaid() {
    if (typeof mermaid === "undefined") return;
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    });

    document.querySelectorAll("pre code.language-mermaid").forEach((el) => {
      const pre = el.closest("pre");
      const div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = el.textContent;
      pre.replaceWith(div);
    });

    mermaid.run({ querySelector: ".mermaid" });
  }

  function initHighlightJS() {
    if (typeof hljs === "undefined") return;
    document.querySelectorAll("pre code[class*='language-']:not(.language-mermaid)").forEach((el) => {
      hljs.highlightElement(el);
    });
  }

  function initExternalLinks() {
    document.querySelectorAll(".lesson-body a[href^='http']").forEach((a) => {
      if (!a.hostname || a.hostname === location.hostname) return;
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      if (!a.querySelector(".ext-icon")) {
        const icon = document.createElement("span");
        icon.className = "ext-icon";
        icon.setAttribute("aria-label", "(opens in new tab)");
        icon.textContent = " ↗";
        icon.style.cssText = "font-size:0.75em;opacity:0.6;";
        a.appendChild(icon);
      }
    });
  }

  function initImageZoom() {
    document.querySelectorAll(".lesson-body img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.style.cssText = [
          "position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.85);",
          "display:flex;align-items:center;justify-content:center;cursor:zoom-out;",
          "animation:fadeIn 150ms ease;padding:2rem;",
        ].join("");

        const zoomed = document.createElement("img");
        zoomed.src = img.src;
        zoomed.alt = img.alt;
        zoomed.style.cssText = "max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.6);";

        overlay.appendChild(zoomed);
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        function dismiss() {
          document.body.removeChild(overlay);
          document.body.style.overflow = "";
        }

        overlay.addEventListener("click", dismiss);
        document.addEventListener("keydown", function onKey(e) {
          if (e.key === "Escape") { dismiss(); document.removeEventListener("keydown", onKey); }
        });
      });
    });
  }

  function initXPBar() {
    const xpData = window.__GAMIFICATION__?.getState?.();
    if (!xpData) return;

    const wrap = document.createElement("div");
    wrap.className = "xp-bar-wrap";
    const fill = document.createElement("div");
    fill.className = "xp-bar";
    fill.style.width = xpData.progress + "%";
    wrap.appendChild(fill);
    document.body.appendChild(wrap);
  }

  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "default");
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-exit");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, 3000);
  }

  window.showToast = showToast;

  function initMarkComplete() {
    const btn = document.querySelector(".mark-complete-btn");
    const xpReward = document.querySelector(".xp-reward");
    if (!btn) return;

    const url = btn.dataset.url || CURRENT;
    const gam = window.__GAMIFICATION__;

    const isComplete = gam?.isComplete?.(url) || false;
    if (isComplete) {
      btn.setAttribute("aria-pressed", "true");
      btn.querySelector(".btn-text").textContent = "Completed";
    }

    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";

      if (!pressed) {
        btn.setAttribute("aria-pressed", "true");
        btn.querySelector(".btn-text").textContent = "Completed";

        const xp = gam?.complete?.(url) || 0;

        if (xp > 0 && xpReward) {
          xpReward.textContent = "+" + xp + " XP";
          xpReward.classList.remove("animating");
          void xpReward.offsetWidth;
          xpReward.classList.add("animating");
          showToast("+" + xp + " XP earned!", "xp");
        }

        const xpFill = document.querySelector(".xp-bar");
        if (xpFill && gam?.getState) {
          const state = gam.getState();
          xpFill.style.width = state.progress + "%";
        }
      } else {
        btn.setAttribute("aria-pressed", "false");
        btn.querySelector(".btn-text").textContent = "Mark as Complete";
        gam?.uncomplete?.(url);
        if (xpReward) xpReward.textContent = "";
      }
    });
  }

  function init() {
    buildTOC();
    initReadingProgress();
    initCopyButtons();
    initHints();
    initCollapsibles();
    initPrevNext();
    initExternalLinks();
    initImageZoom();
    initMarkComplete();
    initXPBar();

    if (document.readyState === "complete") {
      initHighlightJS();
      initMermaid();
    } else {
      window.addEventListener("load", () => {
        initHighlightJS();
        initMermaid();
      });
    }

    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute("data-theme");
      if (typeof mermaid !== "undefined") {
        mermaid.initialize({
          theme: theme === "dark" ? "dark" : "default",
        });
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
