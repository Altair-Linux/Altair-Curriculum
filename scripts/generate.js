#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const matter = require("gray-matter");
const Handlebars = require("handlebars");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUTPUT_DIR = path.join(ROOT, "dist");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const ASSETS_DIR = path.join(ROOT, "assets");
const NAV_OUTPUT = path.join(OUTPUT_DIR, "nav.json");

const renderer = new marked.Renderer();

renderer.code = (code, lang) => {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<pre class="code-block" data-lang="${lang || ""}"><button class="copy-btn" aria-label="Copy code">Copy</button><code class="language-${lang || "plain"}">${escaped}</code></pre>`;
};

renderer.heading = (text, level) => {
  const slug = text.toLowerCase().replace(/[^\w]+/g, "-");
  return `<h${level} id="${slug}" class="heading-anchor"><a href="#${slug}" aria-hidden="true" tabindex="-1">¶</a>${text}</h${level}>`;
};

marked.setOptions({ renderer, gfm: true, breaks: false });

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

function collectMarkdownFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(full, base));
    } else if (entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

function parseFile(filepath) {
  const raw = fs.readFileSync(filepath, "utf8");
  const { data: frontmatter, content } = matter(raw);
  const html = marked.parse(content);
  const rel = path.relative(CONTENT_DIR, filepath);
  const parts = rel.split(path.sep);
  const outputRel = rel.replace(/\.md$/, ".html");
  const outputPath = path.join(OUTPUT_DIR, outputRel);
  const urlPath = "/" + outputRel.replace(/\\/g, "/");

  return {
    filepath,
    outputPath,
    urlPath,
    parts,
    frontmatter: {
      title: frontmatter.title || path.basename(filepath, ".md"),
      grade: frontmatter.grade || null,
      tags: frontmatter.tags || [],
      difficulty: frontmatter.difficulty || null,
      prerequisites: frontmatter.prerequisites || [],
      estimatedTime: frontmatter["estimated-time"] || null,
      type: frontmatter.type || "lesson",
      ...frontmatter,
    },
    html,
    rawContent: content,
  };
}

function buildNavTree(pages) {
  const tree = {};

  for (const page of pages) {
    const parts = page.parts.slice(0, -1);
    let node = tree;
    for (const part of parts) {
      if (!node[part]) node[part] = { _pages: [], _children: {} };
      node = node[part]._children;
    }
    const dir = parts[parts.length - 1] || "__root__";
    if (!tree[dir] && parts.length === 0) {
      if (!tree.__root__) tree.__root__ = { _pages: [], _children: {} };
      tree.__root__._pages.push({
        title: page.frontmatter.title,
        url: page.urlPath,
        grade: page.frontmatter.grade,
        tags: page.frontmatter.tags,
        difficulty: page.frontmatter.difficulty,
        type: page.frontmatter.type,
      });
    }
  }

  function buildArray(dir, depth = 0) {
    const result = [];
    const stack = [{ node: {}, prefix: [] }];

    function walk(obj, prefix) {
      const entries = Object.entries(obj).filter(([k]) => k !== "__root__");
      for (const [key, val] of entries) {
        const item = {
          label: key.replace(/-/g, " ").replace(/^\d+\s*/, ""),
          slug: key,
          path: "/" + [...prefix, key].join("/"),
          pages: (val._pages || []).sort((a, b) => a.title.localeCompare(b.title)),
          children: walk(val._children || {}, [...prefix, key]),
        };
        result.push(item);
      }
      return result.filter((x) => x);
    }

    walk(obj, []);
    return result;
  }

  const flat = [];
  function flattenTree(obj, prefix = []) {
    for (const [key, val] of Object.entries(obj)) {
      if (key === "__root__") {
        for (const p of val._pages || []) flat.push({ ...p, section: [] });
        continue;
      }
      for (const p of val._pages || []) flat.push({ ...p, section: [...prefix, key] });
      flattenTree(val._children || {}, [...prefix, key]);
    }
  }
  flattenTree(tree);

  return { tree, flat };
}

function buildNavJson(pages) {
  const sections = {};

  for (const page of pages) {
    const parts = page.parts;
    const sectionKey = parts.length > 1 ? parts[0] : "__root__";
    if (!sections[sectionKey]) sections[sectionKey] = [];
    sections[sectionKey].push({
      title: page.frontmatter.title,
      url: page.urlPath,
      grade: page.frontmatter.grade,
      tags: page.frontmatter.tags,
      difficulty: page.frontmatter.difficulty,
      estimatedTime: page.frontmatter.estimatedTime,
      type: page.frontmatter.type,
      path: page.parts,
    });
  }

  return sections;
}

function buildBreadcrumbs(page) {
  const crumbs = [{ label: "Home", url: "/" }];
  const parts = page.parts.slice(0, -1);
  let cumPath = "";
  for (const part of parts) {
    cumPath += "/" + part;
    crumbs.push({ label: part.replace(/-/g, " ").replace(/^\d+\s*/, ""), url: cumPath });
  }
  crumbs.push({ label: page.frontmatter.title, url: page.urlPath, current: true });
  return crumbs;
}

function renderPage(page, navJson, templateSrc) {
  const template = Handlebars.compile(templateSrc);
  const breadcrumbs = buildBreadcrumbs(page);

  const relativeRoot = "../".repeat(page.parts.length - 1) || "./";

  return template({
    title: page.frontmatter.title,
    grade: page.frontmatter.grade,
    tags: page.frontmatter.tags,
    difficulty: page.frontmatter.difficulty,
    prerequisites: page.frontmatter.prerequisites,
    estimatedTime: page.frontmatter.estimatedTime,
    type: page.frontmatter.type,
    content: page.html,
    breadcrumbs,
    navJson: JSON.stringify(navJson),
    currentUrl: page.urlPath,
    relativeRoot,
    year: new Date().getFullYear(),
  });
}

function copyAssets() {
  if (!fs.existsSync(ASSETS_DIR)) return;
  const destAssets = path.join(OUTPUT_DIR, "assets");
  ensureDir(destAssets);

  function copyDir(src, dest) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) copyDir(srcPath, destPath);
      else fs.copyFileSync(srcPath, destPath);
    }
  }
  copyDir(ASSETS_DIR, destAssets);
}

function copyPublicFiles() {
  const publicDir = path.join(ROOT, "public");
  if (!fs.existsSync(publicDir)) return;
  function copyDir(src, dest) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) copyDir(srcPath, destPath);
      else fs.copyFileSync(srcPath, destPath);
    }
  }
  copyDir(publicDir, OUTPUT_DIR);
}

function generateIndexPage(navJson, templateSrc) {
  const indexTemplatePath = path.join(TEMPLATES_DIR, "index.html");
  let indexTemplate = templateSrc;
  if (fs.existsSync(indexTemplatePath)) {
    indexTemplate = fs.readFileSync(indexTemplatePath, "utf8");
  }
  const template = Handlebars.compile(indexTemplate);
  return template({
    title: "Altair K-12 Curriculum",
    navJson: JSON.stringify(navJson),
    year: new Date().getFullYear(),
    relativeRoot: "./",
    isIndex: true,
  });
}

function main() {
  console.log("🚀 Altair K-12 Generator starting...");

  ensureDir(OUTPUT_DIR);
  copyPublicFiles();
  copyAssets();

  const templatePath = path.join(TEMPLATES_DIR, "lesson.html");
  if (!fs.existsSync(templatePath)) {
    console.error("❌ Template not found: templates/lesson.html");
    process.exit(1);
  }
  const templateSrc = fs.readFileSync(templatePath, "utf8");

  const mdFiles = collectMarkdownFiles(CONTENT_DIR);
  if (mdFiles.length === 0) {
    console.warn("⚠️  No Markdown files found in content/");
  }

  const pages = mdFiles.map(parseFile);
  const navJson = buildNavJson(pages);

  fs.writeFileSync(NAV_OUTPUT, JSON.stringify(navJson, null, 2));
  console.log(`📋 nav.json written with ${pages.length} entries`);

  for (const page of pages) {
    ensureDir(path.dirname(page.outputPath));
    const rendered = renderPage(page, navJson, templateSrc);
    fs.writeFileSync(page.outputPath, rendered);
    console.log(`✅ ${page.urlPath}`);
  }

  const indexHtml = generateIndexPage(navJson, templateSrc);
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), indexHtml);
  console.log("🏠 index.html written");

  const searchIndex = pages.map((p) => ({
    title: p.frontmatter.title,
    url: p.urlPath,
    tags: p.frontmatter.tags,
    grade: p.frontmatter.grade,
    difficulty: p.frontmatter.difficulty,
    type: p.frontmatter.type,
    excerpt: p.rawContent.slice(0, 200).replace(/[#*`>\-\[\]]/g, "").trim(),
  }));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "search-index.json"),
    JSON.stringify(searchIndex, null, 2)
  );
  console.log("🔍 search-index.json written");

  console.log(`\n✨ Done. ${pages.length} pages generated in dist/`);
}

main();
