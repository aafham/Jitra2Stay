const fs = require("fs");
const http = require("http");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const siteOrigin = "https://jitra2stay.com";
const htmlPages = ["index.html", "policies.html", "thank-you.html", "404.html", "ms.html", "en.html"];
const publicFiles = ["index.html", "policies.html", "thank-you.html", "404.html", "ms.html", "en.html", "app.js", "app.config.js", "sitemap.xml", "robots.txt"];
const staticPaths = [
  "/",
  "/policies.html",
  "/thank-you.html",
  "/404.html",
  "/ms.html",
  "/en.html",
  "/sitemap.xml",
  "/robots.txt",
  "/OWNER-DATA-CHECKLIST.md",
  "/PRE-LIVE-QA.md",
  "/CONTENT-REVIEW.md",
  "/MAINTENANCE.md",
  "/QA-REPORT.md",
  "/HANDOVER.md",
  "/CHANGELOG.md"
];

const results = [];

const pass = (name, detail = "") => results.push({ ok: true, name, detail });
const fail = (name, detail = "") => results.push({ ok: false, name, detail });

const read = (file) => fs.readFileSync(path.join(rootDir, file), "utf8");
const exists = (file) => fs.existsSync(path.join(rootDir, file));

const getHrefValues = (html) => [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
const getImageRefs = (html) => [...html.matchAll(/(?:src|poster|href)="(images\/[^"]+)"/g)].map((match) => match[1]);

const checkFilesExist = () => {
  [
    "index.html",
    "style.css",
    "app.js",
    "app.config.js",
    "policies.html",
    "thank-you.html",
    "404.html",
    "sitemap.xml",
    "robots.txt",
    "OWNER-DATA-CHECKLIST.md",
    "PRE-LIVE-QA.md",
    "CONTENT-REVIEW.md",
    "MAINTENANCE.md",
    "QA-REPORT.md",
    "HANDOVER.md",
    "CHANGELOG.md"
  ].forEach((file) => {
    exists(file) ? pass(`required file exists: ${file}`) : fail(`required file exists: ${file}`);
  });
};

const checkSensitiveInfo = () => {
  const patterns = [
    { name: "WiFi password", pattern: /(wifi|wi-fi)[\s\S]{0,40}(password|pass|kata laluan)/i },
    { name: "bank account number", pattern: /(account\s*number|no\.?\s*akaun|nombor\s*akaun|account\s*no)/i },
    { name: "owner password config", pattern: /ownerPassword\s*[:=]/i },
    { name: "admin page reference", pattern: /admin\.html/i },
    { name: "login form", pattern: /<form[\s\S]{0,400}(login|password)/i },
    { name: "possible Malaysian IC number", pattern: /\b\d{6}-\d{2}-\d{4}\b/ }
  ];

  const findings = [];
  publicFiles.forEach((file) => {
    const content = read(file);
    patterns.forEach(({ name, pattern }) => {
      if (pattern.test(content)) {
        findings.push(`${file}: ${name}`);
      }
    });
  });

  findings.length === 0
    ? pass("public files do not expose sensitive info")
    : fail("public files do not expose sensitive info", findings.join("; "));
};

const countAttr = (html, attr) => (html.match(new RegExp(`\\s${attr}=`, "g")) || []).length;

const checkTranslationPairs = () => {
  const html = read("index.html");
  const pairs = [
    ["data-bm", "data-en"],
    ["data-bm-alt", "data-en-alt"],
    ["data-bm-href", "data-en-href"],
    ["data-bm-placeholder", "data-en-placeholder"],
    ["data-bm-title", "data-en-title"],
    ["data-bm-aria-label", "data-en-aria-label"]
  ];

  const mismatches = pairs
    .map(([bm, en]) => ({ bm, en, bmCount: countAttr(html, bm), enCount: countAttr(html, en) }))
    .filter((item) => item.bmCount !== item.enCount);

  mismatches.length === 0
    ? pass("BM/EN translation attributes are paired")
    : fail("BM/EN translation attributes are paired", mismatches.map((item) => `${item.bm}/${item.en}: ${item.bmCount}/${item.enCount}`).join("; "));
};

const checkHomepage = () => {
  const html = read("index.html");
  const h1Count = (html.match(/<h1\b/g) || []).length;
  h1Count === 1 ? pass("homepage has exactly one h1") : fail("homepage has exactly one h1", `found ${h1Count}`);

  ["lodgingSchema", "mainContent", "heroTitle", "semak-tarikh", "kadar", "lokasi", "hubungi"].forEach((id) => {
    html.includes(`id="${id}"`) ? pass(`homepage id exists: ${id}`) : fail(`homepage id exists: ${id}`);
  });

  html.includes("Homestay Dekat Hospital Jitra")
    ? pass("local SEO intent copy exists")
    : fail("local SEO intent copy exists");

  html.includes("Boleh booking last minute?") && html.includes("Boleh sewa ikut bilangan bilik?")
    ? pass("search-intent FAQ exists")
    : fail("search-intent FAQ exists");

  html.includes("<noscript>") && html.includes("no-js-banner")
    ? pass("homepage has no-JS fallback")
    : fail("homepage has no-JS fallback");
};

const checkAnchorsAndImages = () => {
  const html = read("index.html");
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
  const anchors = getHrefValues(html).filter((href) => href.startsWith("#")).map((href) => href.slice(1));
  const missingAnchors = anchors.filter((id) => !ids.has(id));

  missingAnchors.length === 0
    ? pass("homepage internal anchors resolve", `${anchors.length} checked`)
    : fail("homepage internal anchors resolve", missingAnchors.join(", "));

  const missingImages = getImageRefs(html).filter((imagePath) => !exists(imagePath));
  missingImages.length === 0
    ? pass("homepage image references exist")
    : fail("homepage image references exist", missingImages.join(", "));
};

const checkLinks = () => {
  const badBlank = [];
  const badWhatsApp = [];

  htmlPages.forEach((file) => {
    const html = read(file);
    const blankLinks = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((match) => match[0]);
    blankLinks
      .filter((tag) => !/rel="[^"]*noopener/.test(tag))
      .forEach((tag) => badBlank.push(`${file}: ${tag}`));

    getHrefValues(html)
      .filter((href) => href.startsWith("https://wa.me/60194410666"))
      .filter((href) => !href.includes("text="))
      .forEach((href) => badWhatsApp.push(`${file}: ${href}`));
  });

  badBlank.length === 0
    ? pass('target="_blank" links include noopener')
    : fail('target="_blank" links include noopener', badBlank.join("\n"));

  badWhatsApp.length === 0
    ? pass("WhatsApp links include default text")
    : fail("WhatsApp links include default text", badWhatsApp.join("\n"));
};

const checkSeoFiles = () => {
  const sitemap = read("sitemap.xml");
  const robots = read("robots.txt");
  const requiredUrls = ["/", "/ms.html", "/en.html", "/policies.html"];
  const missingUrls = requiredUrls.filter((urlPath) => !sitemap.includes(`${siteOrigin}${urlPath === "/" ? "/" : urlPath}`));

  missingUrls.length === 0
    ? pass("sitemap contains required public URLs")
    : fail("sitemap contains required public URLs", missingUrls.join(", "));

  robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)
    ? pass("robots points to sitemap")
    : fail("robots points to sitemap");

  htmlPages.forEach((file) => {
    const html = read(file);
    const hasTitle = /<title>[^<]+<\/title>/.test(html);
    const hasViewport = html.includes('name="viewport"');
    const needsReferrer = ["index.html", "policies.html", "thank-you.html", "404.html"].includes(file);
    const hasReferrer = html.includes('name="referrer" content="strict-origin-when-cross-origin"');
    hasTitle ? pass(`${file} has title`) : fail(`${file} has title`);
    hasViewport ? pass(`${file} has viewport`) : fail(`${file} has viewport`);
    if (needsReferrer) {
      hasReferrer ? pass(`${file} has referrer policy`) : fail(`${file} has referrer policy`);
    }
  });
};

const checkSpecialPages = () => {
  const notFound = read("404.html");
  const policies = read("policies.html");

  notFound.includes("Page tidak dijumpai") && notFound.includes("WhatsApp Jitra2Stay")
    ? pass("404 page has recovery actions")
    : fail("404 page has recovery actions");

  policies.includes("@media print") && policies.includes(".actions")
    ? pass("policies page has print styles")
    : fail("policies page has print styles");
};

const checkImageSizes = () => {
  const imageDir = path.join(rootDir, "images");
  const imageFiles = fs.readdirSync(imageDir).filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
  const tooLarge = imageFiles
    .map((file) => ({ file, size: fs.statSync(path.join(imageDir, file)).size }))
    .filter((item) => item.size > 350 * 1024);

  tooLarge.length === 0
    ? pass("current images are below 350KB each", `${imageFiles.length} checked`)
    : fail("current images are below 350KB each", tooLarge.map((item) => `${item.file}: ${item.size}`).join(", "));
};

const startStaticServer = () => new Promise((resolve, reject) => {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const filePath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
    const absolutePath = path.resolve(rootDir, filePath);

    if (!absolutePath.startsWith(rootDir) || !fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200);
    fs.createReadStream(absolutePath).pipe(res);
  });

  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    resolve({ server, port: address.port });
  });
});

const requestPath = (port, urlPath) => new Promise((resolve, reject) => {
  const req = http.get({ hostname: "127.0.0.1", port, path: urlPath }, (res) => {
    res.resume();
    res.on("end", () => resolve(res.statusCode));
  });
  req.on("error", reject);
  req.setTimeout(5000, () => {
    req.destroy(new Error(`Timeout loading ${urlPath}`));
  });
});

const checkPageLoads = async () => {
  const { server, port } = await startStaticServer();
  try {
    const statuses = await Promise.all(staticPaths.map(async (urlPath) => ({
      path: urlPath,
      status: await requestPath(port, urlPath)
    })));
    const bad = statuses.filter((item) => item.status !== 200);
    bad.length === 0
      ? pass("local static server loads required paths", `${statuses.length} checked`)
      : fail("local static server loads required paths", bad.map((item) => `${item.path}: ${item.status}`).join(", "));
  } finally {
    server.close();
  }
};

const main = async () => {
  checkFilesExist();
  checkHomepage();
  checkSensitiveInfo();
  checkTranslationPairs();
  checkAnchorsAndImages();
  checkLinks();
  checkSeoFiles();
  checkSpecialPages();
  checkImageSizes();
  await checkPageLoads();

  results.forEach((result) => {
    console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
  });

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} QA check(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${results.length} QA checks passed.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
