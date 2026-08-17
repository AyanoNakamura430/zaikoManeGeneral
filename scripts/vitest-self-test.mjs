import { lstat, mkdir, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawn } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const configuredOutput = process.env.ZAIKO_TEST_OUTPUT_DIR;

if (!configuredOutput || !isAbsolute(configuredOutput)) {
  throw new Error("Run the Vitest self-test through the artifact-safe verify script.");
}

const outputRoot = await realpath(configuredOutput);
const temporaryRoot = await realpath(tmpdir());
const workspaceRoot = await realpath(repositoryRoot);
const relativeToTemp = relative(temporaryRoot, outputRoot);
const relativeToWorkspace = relative(workspaceRoot, outputRoot);
const isInside = (value) => value !== "" && value !== ".." && !value.startsWith(`..${sep}`) && !isAbsolute(value);
if (!isInside(relativeToTemp) || outputRoot === temporaryRoot || outputRoot === workspaceRoot || isInside(relativeToWorkspace)) {
  throw new Error("Refusing to create Vitest fixtures outside the validated OS temporary boundary.");
}

const vitestCli = await realpath(join(repositoryRoot, "node_modules", "vitest", "vitest.mjs"));
const vitestConfig = await realpath(join(repositoryRoot, "vitest.config.mjs"));
const cliInfo = await lstat(vitestCli);
if (!cliInfo.isFile() || cliInfo.isSymbolicLink()) throw new Error("Vitest CLI is not a regular file.");

function runVitest(root) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [vitestCli, "run", "--root", root, "--config", vitestConfig], {
      cwd: repositoryRoot,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.once("error", rejectRun);
    child.once("close", (code) => resolveRun({ exitCode: code ?? 1, output }));
  });
}

const cases = [
  {
    name: "success",
    source: 'import { expect, test } from "vitest";\ntest("passes", () => expect(1).toBe(1));\n',
    expectedExit: 0,
  },
  {
    name: "failure",
    source: 'import { expect, test } from "vitest";\ntest("fails", () => expect(1).toBe(2));\n',
    expectedExit: 1,
  },
  {
    name: "only-rejected",
    source: 'import { expect, test } from "vitest";\ntest.only("exclusive", () => expect(1).toBe(1));\n',
    expectedExit: 1,
  },
  {
    name: "no-tests-rejected",
    expectedExit: 1,
  },
];

let failures = 0;
for (const testCase of cases) {
  const caseRoot = join(outputRoot, "runner-fixtures", testCase.name);
  const testRoot = join(caseRoot, "tests", "unit");
  await mkdir(testRoot, { recursive: true });
  if (testCase.source) await writeFile(join(testRoot, `${testCase.name}.test.ts`), testCase.source, "utf8");
  const result = await runVitest(caseRoot);
  const passed = result.exitCode === testCase.expectedExit;
  console.log(`${passed ? "PASS" : "FAIL"}: ${testCase.name}`);
  if (!passed) {
    failures += 1;
    console.error(`  expected exit ${testCase.expectedExit}, received ${result.exitCode}`);
    console.error(result.output);
  }
}

if (failures > 0) {
  console.error(`Vitest runner self-test failed: ${failures} case(s)`);
  process.exitCode = 1;
} else {
  console.log(`Vitest runner self-test passed: ${cases.length} case(s)`);
}
