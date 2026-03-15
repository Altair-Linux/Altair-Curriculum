const fs   = require("fs");
const path = require("path");

const ROOT  = path.resolve(__dirname, "..");
const DIST  = path.join(ROOT, "dist");
const CONTENT = path.join(ROOT, "content");

const REQUIRED_FRONTMATTER = ["title"];
const RECOMMENDED_FRONTMATTER = ["grade", "tags", "difficulty", "estimated-time"];

const REQUIRED_HTML_MARKERS = [
  { marker: "<html",         label: "opening html tag" },
  { marker: "</html>",       label: "closing html tag" },
  { marker: "main-content",  label: "main-content id" },
  { marker: "__NAV_JSON__",  label: "NAV_JSON window global" },
  { marker: "assets/css/main.css", label: "main stylesheet link" },
];

let passed = 0;
let failed = 0;
let warned = 0;

const RESET  = "\x1b[0m";
const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

function pass(msg)  { console.log(`  ${GREEN}✓${RESET} ${msg}`); passed++; }
function fail(msg)  { console.error(`  ${RED}✗${RESET} ${msg}`); failed++; }
function warn(msg)  { console.warn(`  ${YELLOW}⚠${RESET} ${msg}`); warned++; }
function info(msg)  { console.log(`${CYAN}${msg}${RESET}`); }
function section(title) { console.log(`\n${BOLD}${title}${RESET}`); }

function readJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch (err) {
    fail(`Cannot parse JSON: ${filepath} — ${err.message}`);
    return null;
  }
}

function walkFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(ext)) results.push(full);
    }
  }
  walk(dir);
  return results;
}

function parseFrontmatter(filepath) {
  const raw = fs.readFileSync(filepath, "utf8");
  if (!raw.startsWith("---")) return { frontmatter: {}, content: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: {}, content: raw };
  const block = raw.slice(3, end);
  const frontmatter = {};
  for (const line of block.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, "");
    frontmatter[key] = val;
  }
  return { frontmatter, content: raw.slice(end + 4) };
}

function checkDistExists() {
  section("1. dist/ directory");
  if (!fs.existsSync(DIST)) {
    fail("dist/ does not exist — run npm run build first");
    process.exit(1);
  }
  pass("dist/ exists");
}

function checkRequiredFiles() {
  section("2. Required output files");
  const required = [
    path.join(DIST, "index.html"),
    path.join(DIST, "nav.json"),
    path.join(DIST, "search-index.json"),
  ];
  for (const f of required) {
    if (fs.existsSync(f)) pass(path.relative(DIST, f));
    else fail(`Missing: ${path.relative(DIST, f)}`);
  }

  const cssFiles = [
    path.join(DIST, "assets", "css", "main.css"),
    path.join(DIST, "assets", "css", "lesson.css"),
  ];
  const jsFiles = [
    path.join(DIST, "assets", "js", "nav.js"),
    path.join(DIST, "assets", "js", "search.js"),
    path.join(DIST, "assets", "js", "lesson.js"),
    path.join(DIST, "assets", "js", "gamification.js"),
  ];
  for (const f of [...cssFiles, ...jsFiles]) {
    if (fs.existsSync(f)) pass(path.relative(DIST, f));
    else fail(`Missing asset: ${path.relative(DIST, f)}`);
  }
}

function checkNavJSON() {
  section("3. nav.json integrity");
  const navPath = path.join(DIST, "nav.json");
  const nav = readJSON(navPath);
  if (!nav) return;

  pass("nav.json is valid JSON");

  const allPages = [];
  for (const [section_key, pages] of Object.entries(nav)) {
    if (!Array.isArray(pages)) {
      fail(`Section "${section_key}" is not an array`);
      continue;
    }
    for (const page of pages) {
      allPages.push(page);
      if (!page.title) fail(`Page missing title in section "${section_key}": ${JSON.stringify(page)}`);
      if (!page.url)   fail(`Page missing url in section "${section_key}": ${page.title}`);

      const htmlPath = path.join(DIST, page.url.replace(/^\//, ""));
      if (!fs.existsSync(htmlPath)) {
        fail(`nav.json references missing file: ${page.url}`);
      }
    }
  }

  pass(`${allPages.length} pages registered in nav.json`);

  const sections = Object.keys(nav);
  if (sections.length === 0) warn("nav.json has no sections — no content found in content/");
  else pass(`${sections.length} section(s): ${sections.join(", ")}`);
}

function checkSearchIndex() {
  section("4. search-index.json");
  const idxPath = path.join(DIST, "search-index.json");
  const idx = readJSON(idxPath);
  if (!idx) return;

  pass("search-index.json is valid JSON");

  if (!Array.isArray(idx)) { fail("search-index.json is not an array"); return; }
  pass(`${idx.length} entries in search index`);

  const navPath = path.join(DIST, "nav.json");
  if (!fs.existsSync(navPath)) return;
  const nav = readJSON(navPath);
  if (!nav) return;

  const navUrls = new Set(Object.values(nav).flat().map((p) => p.url));
  const idxUrls = new Set(idx.map((e) => e.url));

  let missing = 0;
  for (const url of navUrls) {
    if (!idxUrls.has(url)) { warn(`Not in search index: ${url}`); missing++; }
  }
  if (missing === 0) pass("All nav.json pages present in search index");

  for (const entry of idx) {
    if (!entry.title) fail(`Search entry missing title: ${entry.url}`);
    if (!entry.url)   fail("Search entry missing url");
  }
}

function checkHTMLFiles() {
  section("5. HTML file structure");
  const htmlFiles = walkFiles(DIST, ".html");

  if (htmlFiles.length === 0) { fail("No HTML files found in dist/"); return; }
  pass(`${htmlFiles.length} HTML files found`);

  let structureErrors = 0;
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, "utf8");
    const rel = path.relative(DIST, file);

    for (const { marker, label } of REQUIRED_HTML_MARKERS) {
      if (!content.includes(marker)) {
        fail(`${rel}: missing ${label}`);
        structureErrors++;
      }
    }

    if (!content.includes("<title>")) warn(`${rel}: missing <title> tag`);
    if (!content.includes('lang="')) warn(`${rel}: missing lang attribute on <html>`);
    if (!content.includes("skip-link")) warn(`${rel}: missing skip navigation link`);
    if (!content.includes("aria-label")) warn(`${rel}: no aria-label attributes found`);
  }

  if (structureErrors === 0) pass("All HTML files pass structure checks");
}

function checkMarkdownFiles() {
  section("6. Markdown front-matter");
  const mdFiles = walkFiles(CONTENT, ".md");

  if (mdFiles.length === 0) { warn("No Markdown files found in content/"); return; }
  pass(`${mdFiles.length} Markdown files found`);

  let fmErrors = 0;
  for (const file of mdFiles) {
    const rel = path.relative(CONTENT, file);
    const { frontmatter } = parseFrontmatter(file);

    for (const field of REQUIRED_FRONTMATTER) {
      if (!frontmatter[field]) {
        fail(`${rel}: missing required front-matter field "${field}"`);
        fmErrors++;
      }
    }

    for (const field of RECOMMENDED_FRONTMATTER) {
      if (!frontmatter[field]) warn(`${rel}: missing recommended field "${field}"`);
    }

    if (frontmatter.grade) {
      const gradeVal = frontmatter.grade.toString().replace(/^K$/i, "0");
      const num = Number(gradeVal);
      if (isNaN(num) || num < 0 || num > 12) {
        warn(`${rel}: grade "${frontmatter.grade}" is outside expected range K–12`);
      }
    }

    if (frontmatter.difficulty) {
      const valid = ["beginner", "intermediate", "advanced", "expert"];
      if (!valid.includes(frontmatter.difficulty.toLowerCase())) {
        warn(`${rel}: difficulty "${frontmatter.difficulty}" not in [${valid.join(", ")}]`);
      }
    }

    if (frontmatter.tags) {
      const tags = frontmatter.tags.replace(/^\[|\]$/g, "");
      if (!tags.trim()) warn(`${rel}: tags field is empty`);
    }
  }

  if (fmErrors === 0) pass("All Markdown files have required front-matter");
}

function checkNavJSONMatchesContent() {
  section("7. nav.json ↔ content/ consistency");
  const mdFiles = walkFiles(CONTENT, ".md");
  const navPath = path.join(DIST, "nav.json");
  if (!fs.existsSync(navPath)) { fail("nav.json not found — skipping consistency check"); return; }

  const nav = readJSON(navPath);
  if (!nav) return;

  const navCount   = Object.values(nav).flat().length;
  const mdCount    = mdFiles.length;

  if (navCount === mdCount) {
    pass(`nav.json count (${navCount}) matches Markdown file count (${mdCount})`);
  } else {
    fail(`nav.json has ${navCount} entries but ${mdCount} Markdown files exist — rebuild may be stale`);
  }
}

function checkAssetPaths() {
  section("8. Asset path resolution");
  const htmlFiles = walkFiles(DIST, ".html");
  let broken = 0;

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, "utf8");
    const dir = path.dirname(file);

    const assetRefs = [...content.matchAll(/(?:href|src)="([^"]+\.(css|js|png|jpg|svg|ico))"/g)];
    for (const [, ref] of assetRefs) {
      if (ref.startsWith("http")) continue;
      const resolved = path.resolve(dir, ref);
      if (!fs.existsSync(resolved)) {
        fail(`Broken asset in ${path.relative(DIST, file)}: ${ref}`);
        broken++;
      }
    }
  }

  if (broken === 0) pass("All local asset paths resolve correctly");
}

function checkNoBuildArtifactsInSource() {
  section("9. Repository hygiene");
  const distInSrc = path.join(ROOT, "dist", ".git");
  if (fs.existsSync(distInSrc)) warn("dist/ appears to contain a .git directory");
  else pass("dist/ is clean of .git artifacts");

  const nodeModulesInDist = path.join(DIST, "node_modules");
  if (fs.existsSync(nodeModulesInDist)) fail("node_modules found inside dist/ — do not copy node_modules to output");
  else pass("No node_modules in dist/");
}

function printSummary() {
  const total = passed + failed + warned;
  console.log("\n" + "─".repeat(50));
  console.log(`${BOLD}Results${RESET}`);
  console.log(`  ${GREEN}Passed  ${RESET} ${passed}`);
  console.log(`  ${YELLOW}Warnings${RESET} ${warned}`);
  console.log(`  ${RED}Failed  ${RESET} ${failed}`);
  console.log("─".repeat(50));

  if (failed > 0) {
    console.error(`\n${RED}${BOLD}Validation failed with ${failed} error(s).${RESET}`);
    process.exit(1);
  } else if (warned > 0) {
    console.warn(`\n${YELLOW}Validation passed with ${warned} warning(s).${RESET}`);
  } else {
    console.log(`\n${GREEN}${BOLD}All checks passed.${RESET}`);
  }
}

info("\n◈  Altair K-12 Validator");
info("─".repeat(50));

checkDistExists();
checkRequiredFiles();
checkNavJSON();
checkSearchIndex();
checkHTMLFiles();
checkMarkdownFiles();
checkNavJSONMatchesContent();
checkAssetPaths();
checkNoBuildArtifactsInSource();
printSummary();
