import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.ZAIKO_E2E_PORT || 41739);
const outputDir = process.env.ZAIKO_TEST_OUTPUT_DIR;
if (!outputDir) throw new Error("ZAIKO_TEST_OUTPUT_DIR is required");

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.mjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: "list",
  outputDir: `${outputDir}/playwright-results`,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
});
