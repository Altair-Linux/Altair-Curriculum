const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".webp": "image/webp",
  ".ico":  "image/x-icon",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
  ".txt":  "text/plain; charset=utf-8",
};

const clients = new Set();
let rebuildTimer = null;
let isBuilding = false;

function build() {
  if (isBuilding) return;
  isBuilding = true;
  console.log("\n🔨 Rebuilding...");
  try {
    execSync("node scripts/generate.js", { cwd: ROOT, stdio: "inherit" });
    console.log("✅ Build complete — reloading browsers");
    broadcast({ type: "reload" });
  } catch (err) {
    console.error("❌ Build failed:", err.message);
    broadcast({ type: "error", message: err.message });
  } finally {
    isBuilding = false;
  }
}

function scheduleBuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(build, 300);
}

function broadcast(payload) {
  const data = "data: " + JSON.stringify(payload) + "\n\n";
  for (const res of clients) {
    try { res.write(data); } catch { clients.delete(res); }
  }
}

function watchDir(dir, label) {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, (event, filename) => {
    if (!filename) return;
    const ext = path.extname(filename);
    if ([".md", ".html", ".css", ".js", ".json"].includes(ext)) {
      console.log(`📝 ${label}: ${filename}`);
      scheduleBuild();
    }
  });
  console.log(`👁  Watching ${label}`);
}

function serveFile(res, filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const stat = fs.statSync(filepath);
  res.writeHead(200, {
    "Content-Type":  mime,
    "Content-Length": stat.size,
    "Cache-Control": "no-store",
  });
  fs.createReadStream(filepath).pipe(res);
}

function injectReload(html) {
  const script = `
<script>
(function(){
  var es = new EventSource('/__livereload');
  es.onmessage = function(e){
    var d = JSON.parse(e.data);
    if(d.type === 'reload') window.location.reload();
  };
  es.onerror = function(){
    setTimeout(function(){ window.location.reload(); }, 2000);
  };
})();
</script>`;
  return html.replace("</body>", script + "\n</body>");
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  if (pathname === "/__livereload") {
    res.writeHead(200, {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write(": connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  let filepath = path.join(DIST, pathname);

  if (!fs.existsSync(filepath)) {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(`<h1>404 — Not Found</h1><p>${pathname}</p><p><a href="/">Home</a></p>`);
    return;
  }

  const stat = fs.statSync(filepath);

  if (stat.isDirectory()) {
    const index = path.join(filepath, "index.html");
    if (fs.existsSync(index)) {
      filepath = index;
    } else {
      res.writeHead(403, { "Content-Type": "text/html" });
      res.end("<h1>403 — Directory listing disabled</h1>");
      return;
    }
  }

  const ext = path.extname(filepath).toLowerCase();

  if (ext === ".html") {
    const raw = fs.readFileSync(filepath, "utf8");
    const injected = injectReload(raw);
    res.writeHead(200, {
      "Content-Type":  "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(injected);
    return;
  }

  try {
    serveFile(res, filepath);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error: " + err.message);
  }
});

server.listen(PORT, () => {
  console.log("\n🚀 Altair Dev Server");
  console.log(`   http://localhost:${PORT}\n`);

  watchDir(path.join(ROOT, "content"),   "content");
  watchDir(path.join(ROOT, "templates"), "templates");
  watchDir(path.join(ROOT, "assets"),    "assets");
  watchDir(path.join(ROOT, "public"),    "public");

  if (!fs.existsSync(DIST) || fs.readdirSync(DIST).length === 0) {
    console.log("📦 dist/ is empty — running initial build...\n");
    build();
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is in use. Set PORT=<number> to use a different port.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down dev server");
  server.close(() => process.exit(0));
});
