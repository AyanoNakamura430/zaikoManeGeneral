import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const root = await mkdtemp(join(tmpdir(), "zaiko-playwright-self-test-"));
const playwrightModule = pathToFileURL(
  join(process.cwd(), "node_modules/@playwright/test/index.mjs"),
);
const config = join(root, "config.mjs");
const outputDir = join(root, "test-results").replaceAll("\\", "/");
await writeFile(
  config,
  `import { defineConfig } from '${pathToFileURL(join(process.cwd(), "node_modules/@playwright/test/index.mjs"))}'; export default defineConfig({ testDir: '${root.replaceAll("\\", "/")}', outputDir: '${outputDir}', workers: 1, retries: 0, forbidOnly: true, reporter: 'list' });`,
);
const run = async (source) => {
  const file = join(root, `${Math.random().toString(36).slice(2)}.spec.mjs`);
  await writeFile(file, source);
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["node_modules/@playwright/test/cli.js", "test", "--config", config],
      {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", (error) =>
      resolve({ code: 1, stderr: `${stderr}${error.message}` }),
    );
    child.once("close", async (code) => {
      await rm(file, { force: true });
      resolve({ code: code ?? 1, stderr });
    });
  });
};
try {
  for (const [name, source, expected] of [
    [
      "pass",
      `import { test, expect } from '${playwrightModule}'; test('pass',()=>expect(1).toBe(1));`,
      0,
    ],
    [
      "fail",
      `import { test, expect } from '${playwrightModule}'; test('fail',()=>expect(1).toBe(2));`,
      1,
    ],
    [
      "only",
      `import { test } from '${playwrightModule}'; test.only('only',()=>{});`,
      1,
    ],
    ["empty", "", 1],
  ]) {
    const result = await run(source);
    const code = result.code;
    if (code !== expected)
      throw new Error(
        `${name} expected ${expected}, received ${code}: ${result.stderr}`,
      );
  }
  console.log("playwright runner self-test: passed");
} finally {
  await rm(root, { recursive: true, force: true });
}
