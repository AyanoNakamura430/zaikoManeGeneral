import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const temporaryRoot = realpathSync(tmpdir());
const configuredOutput = process.env.ZAIKO_TEST_OUTPUT_DIR;

if (!configuredOutput || !isAbsolute(configuredOutput)) {
  throw new Error("Run tests through an artifact-safe verify script so ZAIKO_TEST_OUTPUT_DIR is set.");
}

const outputRoot = realpathSync(configuredOutput);
const relativeToTemp = relative(temporaryRoot, outputRoot);
const relativeToWorkspace = relative(repositoryRoot, outputRoot);
const isInside = (value) => value !== "" && value !== ".." && !value.startsWith(`..${sep}`) && !isAbsolute(value);

if (!isInside(relativeToTemp) || outputRoot === temporaryRoot || outputRoot === repositoryRoot || isInside(relativeToWorkspace)) {
  throw new Error("Refusing a Vitest output directory outside the validated OS temporary boundary.");
}

export default defineConfig({
  cacheDir: join(outputRoot, "vite-cache"),
  test: {
    allowOnly: false,
    clearMocks: true,
    environment: "node",
    globals: false,
    include: ["tests/unit/**/*.test.ts"],
    passWithNoTests: false,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      clean: true,
      exclude: ["tests/**"],
      include: ["src/domain/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: join(outputRoot, "coverage"),
    },
  },
});
