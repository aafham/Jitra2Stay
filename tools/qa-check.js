"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { createServer, publishDir } = require("./serve.cjs");
const config = require("../site.config.cjs");
const siteOrigin = new URL(config.business.siteUrl).origin;
const pages = ["index.html", "ms.html", "en.html", "policies.html", "policies-en.html", "thank-you.html", "thank-you-en.html", "404.html",
  ...config.guides.flatMap(guide => [`${guide.slug}.html`, `${guide.slug}-en.html`])];
const publicFiles = new Set([...pages, "style.css", "app.js", "gallery.js", "gallery.css", "navigation.js", "navigation.css", "share.js", "faq.js", "faq.css", "location.js", "location.css", "rates.css", "planning.css", "documents.css", "nearby.js", "nearby.css", "mobile.css", "app.config.js", "robots.txt", "sitemap.xml"]);
const results = [];
const check = (condition, name, detail = "") => results.push({ ok: Boolean(condition), name, detail: condition ? "" : detail });
const read = file => fs.readFileSync(path.join(publishDir, file), "utf8");
const exists = file => fs.existsSync(path.join(publishDir, file));
const decode = value => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), decode(match[2])]));
const tags = (html, tagName) => [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map(match => attributes(match[0]));
const walk = (directory, prefix = "") => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const relative = prefix + entry.name;
  return entry.isDirectory() ? walk(path.join(directory, entry.name), `${relative}/`) : [relative];
});

function pageMetadata(file) {
  const language = file === "en.html" || file.endsWith("-en.html") ? "en" : "ms";
  const canonicalPath = file === "index.html" || file === "ms.html" ? "/" : `/${file}`;
  const baseFile = file === "en.html" || file === "ms.html" ? "index.html" : file.replace(/-en\.html$/, ".html");
  const bmPath = baseFile === "index.html" ? "/" : `/${baseFile}`;
  const enPath = baseFile === "index.html" ? "/en.html" : `/${baseFile.replace(/\.html$/, "-en.html")}`;
  return { language, canonical: siteOrigin + canonicalPath, ms: siteOrigin + bmPath, en: siteOrigin + enPath };
}

function inspectPage(file) {
  const html = read(file);
  const meta = pageMetadata(file);
  const links = tags(html, "link");
  const metas = tags(html, "meta");
  check(tags(html, "html")[0]?.lang === meta.language, `${file}: rendered document language`);
  check(/<title>[^<]+<\/title>/.test(html), `${file}: nonempty title`);
  check(tags(html, "h1").length === 1, `${file}: exactly one h1`);
  check(tags(html, "main").length === 1, `${file}: exactly one main landmark`);
  check(metas.some(item => item.name === "viewport"), `${file}: mobile viewport`);
  check(metas.some(item => item.name === "description" && item.content?.length >= 40), `${file}: description`);
  check(links.some(item => item.rel === "canonical" && item.href === meta.canonical), `${file}: canonical matches configured origin`, meta.canonical);
  if (file !== "404.html" && !file.startsWith("thank-you")) {
    for (const language of ["ms", "en"]) check(links.some(item => item.rel === "alternate" && item.hreflang === language && item.href === meta[language]), `${file}: ${language} language alternate`);
  }
  if (file === "404.html" || file.startsWith("thank-you")) check(metas.some(item => item.name === "robots" && item.content.includes("noindex")), `${file}: utility page excluded from indexing`);
  check(!/jitra2stay\.com/i.test(html), `${file}: no obsolete domain`);
  check(!/http-equiv\s*=\s*["']refresh/i.test(html), `${file}: no automatic meta refresh`);
  check(!/<(?:html|body)[^>]*\b(?:hidden|style=["'][^"']*display:\s*none)/i.test(html), `${file}: static content visible by default`);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  check(ids.length === new Set(ids).size, `${file}: unique element ids`);

  const missingLinks = [];
  const localLinks = [...tags(html, "a"), ...links, ...tags(html, "script"), ...tags(html, "img"), ...tags(html, "source")];
  for (const tag of localLinks) {
    const refs = [tag.href, tag.src, ...(tag.srcset || "").split(",").map(value => value.trim().split(/\s+/)[0])].filter(Boolean);
    for (const ref of refs) {
      if (/^(?:https?:|mailto:|tel:|data:)/.test(ref)) continue;
      const url = new URL(ref, `${siteOrigin}/${file}`);
      const target = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
      if (!exists(target)) { missingLinks.push(ref); continue; }
      if (url.hash && target.endsWith(".html") && !read(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) missingLinks.push(ref);
    }
    if (tag.target === "_blank") check((tag.rel || "").split(/\s+/).includes("noopener"), `${file}: new-tab link protects opener`, tag.href);
    if (tag.href?.startsWith("https://wa.me/")) {
      const url = new URL(tag.href);
      check(url.pathname === `/${config.business.phone}` && Boolean(url.searchParams.get("text")), `${file}: configured WhatsApp destination and draft`, tag.href);
    }
  }
  check(missingLinks.length === 0, `${file}: local links, anchors and image candidates resolve`, [...new Set(missingLinks)].join(", "));
  const invalidImages = tags(html, "img").filter(img => !("alt" in img) || !(Number(img.width) > 0) || !(Number(img.height) > 0));
  check(invalidImages.length === 0, `${file}: images have alt and intrinsic dimensions`, invalidImages.map(img => img.src).join(", "));
  for (const script of [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)]) {
    try { const schema = JSON.parse(script[1]); check(Boolean(schema["@context"]), `${file}: parseable structured data`); }
    catch (error) { check(false, `${file}: parseable structured data`, error.message); }
  }
}

const requestPath = (port, route) => new Promise((resolve, reject) => {
  const req = http.get({ hostname: "127.0.0.1", port, path: route }, response => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => resolve({ status: response.statusCode, body, type: response.headers["content-type"] }));
  });
  req.on("error", reject);
  req.setTimeout(5000, () => req.destroy(new Error(`Timeout: ${route}`)));
});

async function inspectServer() {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    const publicRoutes = ["/", ...pages.map(file => `/${file}`), "/app.js", "/style.css", "/sitemap.xml", "/robots.txt"];
    const responses = await Promise.all(publicRoutes.map(async route => ({ route, ...await requestPath(port, route) })));
    check(responses.every(response => response.status === 200), "publish server returns public pages and assets", responses.filter(response => response.status !== 200).map(response => response.route).join(", "));
    const blocked = ["/missing-page", "/tools/qa-check.js", "/site.config.cjs", "/package.json", "/README.md", "/OWNER-DATA-CHECKLIST.md", "/AUDIT-2026-09-11.md", "/.git/config", "/images/raw/hero.jpg", "/../site.config.cjs", "/%2e%2e%2fsite.config.cjs", "/images%5c..%5c..%5csite.config.cjs"];
    for (const route of blocked) {
      const response = await requestPath(port, route);
      check(response.status === 404 && response.body === read("404.html"), `publish server returns genuine custom 404: ${route}`);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
}

async function main() {
  if (!fs.existsSync(publishDir)) throw new Error("Build output is missing. Run npm run build before npm run qa.");
  const files = walk(publishDir);
  for (const file of publicFiles) check(exists(file), `required publish file: ${file}`);
  const unexpected = files.filter(file => !publicFiles.has(file) && !/^images\/(?!raw\/)[a-z0-9_./-]+\.(avif|webp|jpe?g|png|svg|ico)$/i.test(file));
  check(unexpected.length === 0, "publish allowlist excludes source, raw images, docs and build tools", unexpected.join(", "));
  check(!files.some(file => /(^|\/)(?:node_modules|\.git|raw|tests|tools)\//.test(file)), "publish output contains no private/source directories");
  for (const file of pages.filter(exists)) inspectPage(file);
  const sitemap = read("sitemap.xml");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decode(match[1]));
  const indexable = pages.filter(file => !["ms.html", "404.html", "thank-you.html", "thank-you-en.html"].includes(file)).map(file => pageMetadata(file).canonical);
  check(sitemapUrls.length === indexable.length && new Set(sitemapUrls).size === indexable.length && indexable.every(url => sitemapUrls.includes(url)), "sitemap includes each indexable canonical page exactly once");
  check(read("robots.txt").includes(`Sitemap: ${siteOrigin}/sitemap.xml`), "robots uses configured production origin");
  const images = files.filter(file => /\.(avif|webp|jpe?g|png)$/i.test(file));
  const oversized = images.filter(file => fs.statSync(path.join(publishDir, file)).size > 350 * 1024);
  check(images.length > 0 && oversized.length === 0, "published raster images fit 350 KiB budget", oversized.join(", "));
  for (const home of ["index.html", "en.html", "ms.html"]) {
    const html = read(home);
    const priorityImages = tags(html, "img").filter(img => img.fetchpriority === "high");
    check(priorityImages.length === 1 && priorityImages[0].loading !== "lazy", `${home}: one eager priority hero`);
    check(tags(html, "link").filter(link => link.rel === "preload" && link.as === "image").length <= 1, `${home}: no competing image preloads`);
    check(!/\bdata-(?:bm|en)=/.test(html), `${home}: language is rendered at build time`);
  }
  await inspectServer();
  const failures = results.filter(result => !result.ok);
  for (const result of failures) console.error(`FAIL ${result.name}${result.detail ? `: ${result.detail}` : ""}`);
  console.log(`${results.length - failures.length}/${results.length} static QA checks passed (${pages.length} pages, links, metadata, publish boundary, images and HTTP status).`);
  if (failures.length) process.exitCode = 1;
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
