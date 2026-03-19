#!/usr/bin/env node
"use strict";

const schoolsBody = require("./schools-body.js");

// Read Supabase config from environment — injected as window globals at build time
const SUPABASE_URL      = process.env.SUPABASE_URL      || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

const fs   = require("fs");
const path = require("path");

const ROOT          = path.resolve(__dirname, "..");
const CONTENT_DIR   = path.join(ROOT, "content");
const OUTPUT_DIR    = path.join(ROOT, "dist");
const ASSETS_DIR    = path.join(ROOT, "assets");

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function copyDir(src, dest) {
  ensureDir(dest);
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function collectMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collectMd(full));
    else if (e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function parseFm(raw) {
  if (!raw.startsWith("---")) return { data: {}, content: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: raw };
  const block = raw.slice(3, end).trim();
  const content = raw.slice(end + 4);
  const data = {};
  const lines = block.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const ci = line.indexOf(":");
    if (ci === -1) { i++; continue; }
    const key = line.slice(0, ci).trim();
    const rest = line.slice(ci + 1).trim();
    if (rest === "" || rest === "|" || rest === ">") {
      const arr = [];
      i++;
      while (i < lines.length && /^\s+/.test(lines[i])) {
        const item = lines[i].trim().replace(/^-\s*/, "").replace(/^["']|["']$/g, "");
        if (item) arr.push(item);
        i++;
      }
      data[key] = arr;
      continue;
    }
    if (rest.startsWith("[")) {
      const inner = rest.replace(/^\[|\]$/g, "");
      data[key] = inner ? inner.split(",").map(s => s.trim().replace(/^["']|["']$/g, "")) : [];
      i++; continue;
    }
    data[key] = rest.replace(/^["']|["']$/g, "");
    i++;
  }
  return { data, content };
}

function md(src) {
  let h = src;
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const esc = code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return `<pre class="code-block" data-lang="${lang||""}"><button class="copy-btn" aria-label="Copy code">Copy</button><code class="language-${lang||"plain"}">${esc}</code></pre>`;
  });
  h = h.replace(/^(#{1,6}) (.+)$/gm, (_, hh, txt) => {
    const lvl = hh.length;
    const slug = txt.toLowerCase().replace(/[^\w]+/g,"-").replace(/^-|-$/g,"");
    return `<h${lvl} id="${slug}" class="heading-anchor"><a href="#${slug}" aria-hidden="true" tabindex="-1">¶</a>${txt}</h${lvl}>`;
  });
  h = h.replace(/^---$/gm, "<hr>");
  h = h.replace(/^>\s+(.+)$/gm, "<blockquote><p>$1</p></blockquote>");
  h = h.replace(/((?:^[*\-] .+\n?)+)/gm, blk => {
    const items = blk.trim().split("\n").map(l=>`<li>${l.replace(/^[*\-] /,"").trim()}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
  h = h.replace(/((?:^\d+\. .+\n?)+)/gm, blk => {
    const items = blk.trim().split("\n").map(l=>`<li>${l.replace(/^\d+\. /,"").trim()}</li>`).join("");
    return `<ol>${items}</ol>`;
  });
  h = h.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, tbl => {
    const rows = tbl.trim().split("\n");
    const ths = rows[0].split("|").slice(1,-1).map(c=>`<th>${c.trim()}</th>`).join("");
    const trs = rows.slice(2).map(r=>`<tr>${r.split("|").slice(1,-1).map(c=>`<td>${c.trim()}</td>`).join("")}</tr>`).join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });
  h = h.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*(.+?)\*/g, "<em>$1</em>");
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  h = h.split(/\n{2,}/).map(b => {
    b = b.trim();
    if (!b) return "";
    if (/^<(h[1-6]|ul|ol|pre|table|blockquote|hr|details|div|section|header|nav|article)/.test(b)) return b;
    if (b.startsWith("<")) return b;
    return `<p>${b.replace(/\n/g," ")}</p>`;
  }).join("\n");
  return h;
}

function parseFile(fp) {
  const raw = fs.readFileSync(fp, "utf8");
  const { data: fm, content } = parseFm(raw);
  const rel = path.relative(CONTENT_DIR, fp);
  const parts = rel.split(path.sep);
  const outputRel = rel.replace(/\.md$/, ".html");
  const urlPath = "/" + outputRel.replace(/\\/g, "/");
  return {
    fp, parts,
    outputPath: path.join(OUTPUT_DIR, outputRel),
    urlPath,
    fm: {
      id:                fm.id || null,
      title:             fm.title || path.basename(fp, ".md"),
      grade:             fm.grade || null,
      tags:              Array.isArray(fm.tags) ? fm.tags : [],
      difficulty:        fm.difficulty || null,
      prerequisites:     Array.isArray(fm.prerequisites) ? fm.prerequisites : [],
      estimatedTime:     fm["estimated-time"] || null,
      type:              fm.type || "lesson",
      sequence_position: fm.sequence_position ? Number(fm.sequence_position) : 999,
    },
    html: md(content),
    raw: content,
  };
}

function buildNav(pages) {
  const nav = {};
  for (const p of pages) {
    const key = p.parts.length > 1 ? p.parts[0] : "__root__";
    if (!nav[key]) nav[key] = [];
    nav[key].push({
      id: p.fm.id, title: p.fm.title, url: p.urlPath, grade: p.fm.grade,
      tags: p.fm.tags, difficulty: p.fm.difficulty,
      estimatedTime: p.fm.estimatedTime, type: p.fm.type,
      sequence_position: p.fm.sequence_position,
      prerequisites: p.fm.prerequisites,
    });
  }
  for (const k of Object.keys(nav)) {
    nav[k].sort((a,b) => (a.sequence_position||999)-(b.sequence_position||999) || a.title.localeCompare(b.title));
  }
  return nav;
}

// ── HTML shell — used for every page ─────────────────────────────────────────
function shell({ title, relRoot, navJson, currentUrl, isIndex, isModeration, body }) {
  const logoSvg = fs.existsSync(path.join(OUTPUT_DIR, "logo.svg"))
    ? `<img src="${relRoot}logo.svg" alt="Altair logo" class="logo-img" width="28" height="28" />`
    : `<span class="logo-mark" aria-hidden="true">◈</span>`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${title} — Altair K-12 Curriculum" />
  <title>${title} | Altair</title>
  <link rel="icon" type="image/svg+xml" href="${relRoot}favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${relRoot}assets/css/main.css" />
  <link rel="stylesheet" href="${relRoot}assets/css/lesson.css" />
  <script>(function(){var s=localStorage.getItem("altair-theme");document.documentElement.setAttribute("data-theme",s||"dark");})();</script>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header" role="banner">
    <div class="header-inner">
      <a href="${relRoot}index.html" class="logo" aria-label="Altair Home">
        ${logoSvg}
        <span class="logo-text">Altair</span>
      </a>
      <div class="header-controls">
        <button class="search-trigger" aria-label="Open search" aria-expanded="false" aria-controls="search-modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Search</span><kbd aria-label="Keyboard shortcut: slash">/</kbd>
        </button>
        <button class="theme-toggle" aria-label="Toggle dark mode" aria-pressed="false">
          <span class="icon-sun" aria-hidden="true">☀</span>
          <span class="icon-moon" aria-hidden="true">◑</span>
        </button>
        <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="sidebar">
          <span></span><span></span><span></span>
        </button>
        <div class="auth-header-wrap">
          <button id="auth-btn" class="auth-btn" aria-label="Sign in or create account">Sign in</button>
          <div id="auth-user-menu" class="auth-user-menu" role="menu" aria-label="Account menu"></div>
        </div>
      </div>
    </div>
  </header>

  <div class="layout">
    <nav id="sidebar" class="sidebar" aria-label="Curriculum navigation" role="navigation">
      <div class="sidebar-inner">
        <div class="sidebar-search">
          <input type="search" id="sidebar-search-input" placeholder="Filter lessons…" aria-label="Filter sidebar navigation" autocomplete="off" />
        </div>
        <div id="nav-tree" role="tree" aria-label="Curriculum sections"></div>
      </div>
    </nav>

    <main id="main-content" class="main-content" tabindex="-1">
      ${body}
    </main>

    <aside class="toc-panel" aria-label="On this page" role="complementary">
      <div class="toc-inner">
        <p class="toc-label">On this page</p>
        <nav id="toc" aria-label="Table of contents"></nav>
        <div class="progress-track">
          <div id="reading-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </aside>
  </div>

  <div id="search-modal" class="search-modal" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="search-backdrop"></div>
    <div class="search-panel">
      <div class="search-input-wrap">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" id="search-input" class="search-field" placeholder="Search lessons, tags, topics…" aria-label="Search curriculum" autocomplete="off" spellcheck="false" />
        <kbd class="search-esc" aria-label="Press Escape to close">Esc</kbd>
      </div>
      <div id="search-results" class="search-results" role="listbox" aria-label="Search results"></div>
      <div class="search-footer"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div>
    </div>
  </div>

  <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>

  <div id="auth-modal" class="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in or create account" hidden>
    <div class="auth-modal-backdrop"></div>
    <div class="auth-panel">
      <button id="auth-modal-close" class="auth-modal-close" aria-label="Close">&#10005;</button>
      <div class="auth-tabs" role="tablist" aria-label="Authentication">
        <button class="auth-tab-btn active" id="auth-tabBtn-signin" role="tab" data-tab="signin" aria-selected="true">Sign in</button>
        <button class="auth-tab-btn" id="auth-tabBtn-signup" role="tab" data-tab="signup" aria-selected="false">Create account</button>
      </div>
      <div id="auth-tab-signin">
        <form id="auth-signin-form" class="auth-form" novalidate>
          <label class="auth-label" for="signin-email">Email</label>
          <input class="auth-input" id="signin-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" />
          <label class="auth-label" for="signin-password">Password</label>
          <input class="auth-input" id="signin-password" name="password" type="password" autocomplete="current-password" required placeholder="Your password" />
          <p id="signin-msg" class="auth-msg" hidden></p>
          <button type="submit" class="auth-submit-btn">Sign in</button>
        </form>
      </div>
      <div id="auth-tab-signup" hidden>
        <form id="auth-signup-form" class="auth-form" novalidate>
          <label class="auth-label" for="signup-name">Display name</label>
          <input class="auth-input" id="signup-name" name="display_name" type="text" autocomplete="name" placeholder="Your name" />
          <label class="auth-label" for="signup-email">Email</label>
          <input class="auth-input" id="signup-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" />
          <label class="auth-label" for="signup-password">Password</label>
          <input class="auth-input" id="signup-password" name="password" type="password" autocomplete="new-password" required placeholder="At least 8 characters" />
          <label class="auth-label" for="signup-confirm">Confirm password</label>
          <input class="auth-input" id="signup-confirm" name="confirm_password" type="password" autocomplete="new-password" required placeholder="Repeat password" />
          <p id="signup-msg" class="auth-msg" hidden></p>
          <button type="submit" class="auth-submit-btn">Create account</button>
        </form>
      </div>
    </div>
  </div>

  <script>window.__NAV_JSON__ = ${navJson};</script>
  <script>window.__CURRENT_URL__ = "${currentUrl}";</script>
  <script>window.__RELATIVE_ROOT__ = "${relRoot}";</script>
  <script>window.__IS_INDEX__ = ${isIndex};</script>

  <script src="${relRoot}assets/js/gamification.js" defer></script>
  <script src="${relRoot}assets/js/nav.js" defer></script>
  <script src="${relRoot}assets/js/search.js" defer></script>
  <script src="${relRoot}assets/js/lesson.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js" defer></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" defer></script>
  <script>window.__SUPABASE_URL__ = "${SUPABASE_URL}";</script>
  <script>window.__SUPABASE_ANON_KEY__ = "${SUPABASE_ANON_KEY}";</script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  <script src="${relRoot}assets/js/auth.js" defer></script>
  ${isModeration ? `<script src="${relRoot}assets/js/moderation.js" defer></script>` : ""}
</body>
</html>`;
}

function lessonBody(page) {
  const fm = page.fm;
  const crumbs = (() => {
    const parts = page.parts.slice(0,-1);
    const items = [{ label:"Home", url:"/", current:false }];
    let cum = "";
    for (const p of parts) { cum += "/" + p; items.push({ label: p.replace(/-/g," "), url: cum, current: false }); }
    items.push({ label: fm.title, url: page.urlPath, current: true });
    return items.map(c => {
      const inner = c.current ? `<span>${c.label}</span>` : `<a href="${c.url}">${c.label}</a>`;
      return `<li${c.current ? ' aria-current="page"' : ""}>${inner}</li>`;
    }).join("");
  })();

  const tags    = fm.tags.length ? `<div class="lesson-tags" aria-label="Tags">${fm.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>` : "";
  const prereqs = fm.prerequisites.length ? `<div class="prerequisites" role="note"><strong>Prerequisites:</strong><ul>${fm.prerequisites.map(p=>`<li>${p}</li>`).join("")}</ul></div>` : "";

  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs}</ol></nav>
<article class="lesson-article" itemscope itemtype="https://schema.org/LearningResource">
  <header class="lesson-header">
    ${fm.type ? `<span class="type-badge type-${fm.type}" role="note">${fm.type}</span>` : ""}
    <h1 class="lesson-title" itemprop="name">${fm.title}</h1>
    <div class="lesson-meta" role="list" aria-label="Lesson metadata">
      ${fm.grade        ? `<div class="meta-chip" role="listitem"><span class="meta-icon" aria-hidden="true">🎓</span><span>Grade ${fm.grade}</span></div>` : ""}
      ${fm.difficulty   ? `<div class="meta-chip meta-difficulty-${fm.difficulty}" role="listitem"><span class="meta-icon" aria-hidden="true">⚡</span><span>${fm.difficulty}</span></div>` : ""}
      ${fm.estimatedTime? `<div class="meta-chip" role="listitem"><span class="meta-icon" aria-hidden="true">⏱</span><span>${fm.estimatedTime}</span></div>` : ""}
    </div>
    ${tags}${prereqs}
  </header>
  <div class="lesson-body" itemprop="text">${page.html}</div>
  <footer class="lesson-footer">
    <div class="completion-block">
      <button class="mark-complete-btn" aria-pressed="false" data-url="${page.urlPath}">
        <span class="btn-icon" aria-hidden="true">✓</span>
        <span class="btn-text">Mark as Complete</span>
      </button>
      <div class="xp-reward" aria-live="polite"></div>
    </div>
    <nav class="lesson-nav" aria-label="Previous and next lesson">
      <a id="prev-lesson" class="lesson-nav-btn" hidden>← Previous</a>
      <a id="next-lesson" class="lesson-nav-btn lesson-nav-next" hidden>Next →</a>
    </nav>
  </footer>
</article>`;
}

function indexBody() {
  return `<section class="index-hero">
  <h1 class="hero-title">Altair <em>K–12</em><br/>Curriculum</h1>
  <p class="hero-subtitle">A free, open-source, community-driven computer science curriculum for every grade.</p>
  <div id="curriculum-grid" class="curriculum-grid" aria-label="Curriculum sections"></div>
</section>`;
}

function sectionBody(sectionKey, pages) {
  const META = {
    "k-2":      { label:"Kindergarten – Grade 2", icon:"🌱" },
    "3-5":      { label:"Grades 3 – 5",           icon:"🌿" },
    "6-8":      { label:"Grades 6 – 8",           icon:"🔬" },
    "9-12":     { label:"Grades 9 – 12",          icon:"🚀" },
    "projects": { label:"Projects",               icon:"🛠"  },
    "schools":  { label:"Schools Using Altair",   icon:"🏫"  },
  };
  const meta = META[sectionKey] || { label: sectionKey.replace(/-/g," "), icon:"📂" };
  const cards = pages.map(p => {
    const tags = (p.fm.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("");
    const infoParts = [
      p.fm.grade && p.fm.grade !== "null" ? `Grade ${p.fm.grade}` : "",
      p.fm.estimatedTime && p.fm.estimatedTime !== "null" ? p.fm.estimatedTime : "",
      p.fm.difficulty && p.fm.difficulty !== "null" ? p.fm.difficulty : ""
    ].filter(Boolean);
    const info = infoParts.join(" · ");
    return `<a class="section-lesson-card" href="../${p.urlPath.replace(/^\//,"")}">
  <div class="slc-title">${p.fm.title}</div>
  ${info?`<div class="slc-meta">${info}</div>`:""}
  ${tags?`<div class="slc-tags">${tags}</div>`:""}
</a>`;
  }).join("\n");
  const countWord = sectionKey === "schools" ? "page" : "lesson";
  return `<section class="section-index">
  <header class="section-index-header">
    <span class="section-index-icon">${meta.icon}</span>
    <h1 class="section-index-title">${meta.label}</h1>
    <p class="section-index-count">${pages.length} ${countWord}${pages.length!==1?"s":""}</p>
  </header>
  <div class="section-lesson-grid">${cards}</div>
</section>`;
}


// ── Moderation queue page body ────────────────────────────────────────────────
function moderationBody() {
  const statusOptions = [
    ["","All statuses"],["pending","Pending"],["under_review","Under review"],
    ["approved","Approved"],["rejected","Rejected"],["needs_changes","Needs changes"]
  ].map(o => `<option value="${o[0]}">${o[1]}</option>`).join("");

  const typeOptions = [
    ["","All types"],["new_school","New school"],["ownership_claim","Ownership claim"],
    ["school_edit","School edit"],["curriculum_feedback","Curriculum feedback"]
  ].map(o => `<option value="${o[0]}">${o[1]}</option>`).join("");

  return `<div class="mod-page">
  <div id="mod-gate" aria-live="polite"></div>
  <div id="mod-content" class="mod-wrap" hidden>
    <header class="mod-header">
      <div>
        <h1 class="mod-title">Moderation Queue</h1>
        <p id="mod-count" class="mod-subtitle" aria-live="polite"></p>
      </div>
      <button id="mod-refresh" class="mod-refresh-btn" aria-label="Refresh queue">&#8635; Refresh</button>
    </header>
    <div class="mod-filters" role="group" aria-label="Filter queue">
      <select id="mod-filter-status" class="mod-select" aria-label="Filter by status">${statusOptions}</select>
      <select id="mod-filter-type"   class="mod-select" aria-label="Filter by type">${typeOptions}</select>
    </div>
    <div class="mod-layout">
      <div class="mod-list-col">
        <div id="mod-list" class="mod-list" role="list" aria-label="Queue items"></div>
      </div>
      <div id="mod-detail" class="mod-detail" hidden aria-label="Item detail"></div>
    </div>
  </div>
</div>`;
}

function main() {
  console.log("🚀 Altair K-12 Generator starting...");
  ensureDir(OUTPUT_DIR);
  const publicDir = path.join(ROOT, "public");
  if (fs.existsSync(publicDir)) copyDir(publicDir, OUTPUT_DIR);
  if (fs.existsSync(ASSETS_DIR)) copyDir(ASSETS_DIR, path.join(OUTPUT_DIR, "assets"));

  const pages   = collectMd(CONTENT_DIR).map(parseFile);
  const nav     = buildNav(pages);
  const navJson = JSON.stringify(nav);

  fs.writeFileSync(path.join(OUTPUT_DIR, "nav.json"), JSON.stringify(nav, null, 2));
  console.log(`📋 nav.json → ${pages.length} pages`);

  // Load schools data once for any schools-type pages
  const schoolsDataPath = path.join(OUTPUT_DIR, 'certified-schools.json');
  let schoolsData = { schools: [] };
  if (fs.existsSync(schoolsDataPath)) {
    try { schoolsData = JSON.parse(fs.readFileSync(schoolsDataPath, 'utf8')); } catch(e) {}
  }

  for (const p of pages) {
    const relRoot = "../".repeat(p.parts.length - 1) || "./";
    ensureDir(path.dirname(p.outputPath));
    const body = p.fm.type === 'schools' ? schoolsBody(schoolsData) : p.fm.type === 'moderation' ? moderationBody() : lessonBody(p);
    fs.writeFileSync(p.outputPath, shell({ title: p.fm.title, relRoot, navJson, currentUrl: p.urlPath, isIndex: false, isModeration: p.fm.type === 'moderation', body }));
    console.log(`✅ ${p.urlPath}`);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), shell({ title: "Altair K-12 Curriculum", relRoot: "./", navJson, currentUrl: "/", isIndex: true, body: indexBody() }));
  console.log("🏠 index.html");

  for (const [key, entries] of Object.entries(nav)) {
    if (key === "__root__") continue;
    const sectionDir = path.join(OUTPUT_DIR, key);
    ensureDir(sectionDir);
    // If a content page already owns /<key>/index.html, do not overwrite it
    const hasContentIndex = pages.some(p => p.urlPath === "/" + key + "/index.html");
    if (hasContentIndex) { console.log(`📂 ${key}/index.html (content page — skipped overwrite)`); continue; }
    const fullPages = entries.map(e => pages.find(p => p.urlPath === e.url)).filter(Boolean);
    fs.writeFileSync(path.join(sectionDir, "index.html"), shell({ title: key + " — Altair", relRoot: "../", navJson, currentUrl: "/" + key + "/", isIndex: false, body: sectionBody(key, fullPages) }));
    console.log(`📂 ${key}/index.html`);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "search-index.json"), JSON.stringify(
    pages.map(p => ({ title: p.fm.title, url: p.urlPath, tags: p.fm.tags, grade: p.fm.grade, difficulty: p.fm.difficulty, type: p.fm.type, excerpt: p.raw.slice(0,200).replace(/[#*`>\-\[\]]/g,"").trim() })),
    null, 2
  ));
  console.log("🔍 search-index.json");
  console.log(`\n✨ Done. ${pages.length} pages in dist/`);
}

main();
