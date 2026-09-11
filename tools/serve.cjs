"use strict";

// Preview exactly the publish directory, never the repository root.
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const publishDir = path.resolve(__dirname, "..", "dist");
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".avif": "image/avif", ".webp": "image/webp", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

function createServer() {
  return http.createServer((req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end("Method not allowed");
      return;
    }
    let requested;
    try { requested = decodeURIComponent((req.url || "/").split("?")[0]); }
    catch { res.writeHead(400); res.end("Bad request"); return; }
    const relativePath = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
    const candidate = path.resolve(publishDir, relativePath);
    const isWithinPublishDir = candidate.startsWith(`${publishDir}${path.sep}`);
    const unsafePath = relativePath.split(/[\\/]/).some(part => part.startsWith(".")) || relativePath.includes("\0") || relativePath.includes("\\");
    let exists = false;
    try {
      exists = !unsafePath && isWithinPublishDir && fs.statSync(candidate).isFile()
        && fs.realpathSync(candidate).startsWith(`${fs.realpathSync(publishDir)}${path.sep}`);
    } catch { /* Use custom 404 below. */ }
    const filename = exists ? candidate : path.join(publishDir, "404.html");
    if (!fs.existsSync(filename)) { res.writeHead(404); res.end("Not found. Run npm run build first."); return; }
    res.writeHead(exists ? 200 : 404, { "Content-Type": types[path.extname(filename)] || "application/octet-stream" });
    if (req.method === "HEAD") { res.end(); return; }
    const stream = fs.createReadStream(filename);
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  });
}

if (require.main === module) {
  if (!fs.existsSync(path.join(publishDir, "index.html"))) {
    console.error("dist/index.html is missing. Run npm run build first.");
    process.exit(1);
  }
  const portIndex = process.argv.indexOf("--port");
  const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 4173);
  const server = createServer();
  server.on("error", error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, "127.0.0.1", () => console.log(`Jitra2Stay preview: http://127.0.0.1:${port} (dist only)`));
}

module.exports = { createServer, publishDir };
