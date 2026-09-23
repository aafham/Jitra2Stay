const { defineConfig } = require("@playwright/test");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "**/*.spec.cjs",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 30000,
  expect: { timeout: 5000 },
  outputDir: path.join(root, "artifacts", "test-results"),
  reporter: [["list"], ["html", { open: "never", outputFolder: path.join(root, "artifacts", "playwright-report") }]],
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:4173",
    browserName: "chromium",
    channel: process.env.TEST_BROWSER_CHANNEL || undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-GB",
    timezoneId: "Asia/Kuala_Lumpur"
  },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    cwd: root,
    command: "node tools/serve.cjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 10000
  }
});
