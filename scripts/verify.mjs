import { createHash } from "node:crypto";
import { lstat, mkdtemp, mkdir, readFile, readlink, realpath, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const protectedDirectories = ["dist", ".vite", "node_modules/.vite", "coverage", "test-results", "playwright-report"];
const allowedTasks = new Set(["build", "coverage", "format", "lint", "lint-gates", "self-test", "test-typecheck", "typecheck", "unit", "unit-self-test"]);
const npmTasks = new Map([
  ["coverage", "test:coverage"],
  ["format", "format:check"],
  ["lint", "lint"],
  ["lint-gates", "lint:gates"],
  ["test-typecheck", "typecheck:test"],
  ["typecheck", "typecheck"],
  ["unit", "test:unit"],
  ["unit-self-test", "test:unit-self-test"],
]);
const testTasks = new Set(["coverage", "unit", "unit-self-test"]);

function runProcess(command, args, cwd, capture = false, environment = process.env) {
  return new Promise((resolveProcess, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: environment,
      shell: false,
      windowsHide: true,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
    }
    child.once("error", reject);
    child.once("close", (code, signal) => resolveProcess({ code: code ?? 1, signal, stdout, stderr }));
  });
}

async function gitOutput(cwd, args) {
  const result = await runProcess("git", args, cwd, true);
  if (result.code !== 0) throw new Error(`Git command failed: git ${args[0]}`);
  return result.stdout;
}

function nulPaths(output) {
  return output.split("\0").filter(Boolean);
}

function isSecretPath(relativePath) {
  return relativePath.split(/[\\/]/).some((component) => component.startsWith(".env"));
}

async function fileRecord(root, relativePath) {
  const absolutePath = join(root, ...relativePath.split("/"));
  const info = await lstat(absolutePath);
  if (isSecretPath(relativePath)) {
    const type = info.isSymbolicLink() ? "link" : info.isFile() ? "file" : info.isDirectory() ? "directory" : "other";
    return `secret-metadata:${type}:${info.size}:${info.mtimeMs}`;
  }
  if (info.isSymbolicLink()) {
    const target = await readlink(absolutePath);
    return `link:${info.size}:${createHash("sha256").update(target).digest("hex")}`;
  }
  if (!info.isFile()) return `other:${info.mode}`;
  const content = await readFile(absolutePath);
  return `file:${info.size}:${createHash("sha256").update(content).digest("hex")}`;
}

async function gitManifest(root) {
  const output = await gitOutput(root, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  const manifest = new Map();
  for (const path of nulPaths(output)) {
    try {
      manifest.set(path.replaceAll("\\", "/"), await fileRecord(root, path.replaceAll("\\", "/")));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      manifest.set(path.replaceAll("\\", "/"), "missing");
    }
  }
  return manifest;
}

async function collectDirectory(root, relativeDirectory, manifest) {
  const absoluteDirectory = join(root, ...relativeDirectory.split("/"));
  try {
    const directoryInfo = await lstat(absoluteDirectory);
    if (directoryInfo.isSymbolicLink()) {
      manifest.set(relativeDirectory, await fileRecord(root, relativeDirectory));
      return;
    }
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  let entries;
  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const child = `${relativeDirectory}/${entry.name}`.replace(/^\.\//, "");
    if (entry.isSymbolicLink()) {
      manifest.set(child, await fileRecord(root, child));
    } else if (entry.isDirectory()) {
      await collectDirectory(root, child, manifest);
    } else if (entry.isFile()) {
      manifest.set(child, await fileRecord(root, child));
    }
  }
}

async function collectTsBuildInfo(root, relativeDirectory, manifest) {
  const absoluteDirectory = relativeDirectory ? join(root, ...relativeDirectory.split("/")) : root;
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  for (const entry of entries) {
    const child = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name.startsWith(".env")) continue;
      if (protectedDirectories.some((path) => child === path || child.startsWith(`${path}/`))) continue;
      await collectTsBuildInfo(root, child, manifest);
    } else if (entry.isFile() && entry.name.endsWith(".tsbuildinfo") && !isSecretPath(child)) {
      manifest.set(child, await fileRecord(root, child));
    }
  }
}

async function protectedManifest(root) {
  const manifest = new Map();
  for (const directory of protectedDirectories) await collectDirectory(root, directory, manifest);
  await collectTsBuildInfo(root, "", manifest);
  return manifest;
}

async function snapshot(root) {
  const porcelain = await gitOutput(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  return { porcelain, files: await gitManifest(root), protected: await protectedManifest(root) };
}

function mapChanges(before, after, category) {
  const changes = [];
  for (const path of new Set([...before.keys(), ...after.keys()])) {
    if (!before.has(path)) changes.push({ category, path, kind: "created" });
    else if (!after.has(path)) changes.push({ category, path, kind: "deleted" });
    else if (before.get(path) !== after.get(path)) changes.push({ category, path, kind: "modified" });
  }
  return changes;
}

function snapshotChanges(before, after) {
  const changes = [...mapChanges(before.files, after.files, "worktree"), ...mapChanges(before.protected, after.protected, "protected")];
  if (before.porcelain !== after.porcelain && changes.length === 0) {
    changes.push({ category: "git", path: "(index or status metadata)", kind: "modified" });
  }
  const unique = new Map(changes.map((change) => [`${change.category}:${change.path}:${change.kind}`, change]));
  return [...unique.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function isWithin(parent, child) {
  const rel = relative(parent, child);
  return rel !== "" && !rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel);
}

async function createSafeTemp(label, workspace) {
  const tempRoot = await realpath(tmpdir());
  const created = await mkdtemp(join(tempRoot, `zaiko-verify-${label}-`));
  const canonical = await realpath(created);
  const canonicalWorkspace = await realpath(workspace);
  if (!isWithin(tempRoot, canonical) || canonical === tempRoot || canonical === canonicalWorkspace || isWithin(canonicalWorkspace, canonical)) {
    throw new Error("Refusing unsafe temporary directory");
  }
  const info = await lstat(canonical);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("Temporary root is not a real directory");
  return { tempRoot, path: canonical };
}

async function cleanupSafeTemp(temp, workspace) {
  const tempRoot = await realpath(tmpdir());
  const canonicalWorkspace = await realpath(workspace);
  if (temp.tempRoot !== tempRoot || !isWithin(tempRoot, temp.path) || temp.path === canonicalWorkspace || isWithin(canonicalWorkspace, temp.path)) {
    throw new Error("Refusing unsafe temporary cleanup");
  }
  const cleanupInfo = await lstat(temp.path);
  if (!cleanupInfo.isDirectory() || cleanupInfo.isSymbolicLink()) throw new Error("Refusing temporary cleanup through a link");
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await rm(temp.path, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function validatedNpmCli() {
  const npmCli = process.env.npm_execpath;
  if (!npmCli || !isAbsolute(npmCli)) {
    throw new Error("Run build through the canonical npm script so npm_execpath is available");
  }
  const canonical = await realpath(npmCli);
  const info = await lstat(canonical);
  if (!info.isFile() || info.isSymbolicLink() || basename(canonical).toLowerCase() !== "npm-cli.js") {
    throw new Error("npm_execpath does not identify the npm CLI");
  }
  return canonical;
}

async function verifyCommand({ label, workspace, command, args, displayCommand, environment, emit = true }) {
  let before;
  let commandResult = { code: 1 };
  let changes = [];
  let temp;
  let internalError;
  let cleanupError;
  try {
    before = await snapshot(workspace);
    temp = await createSafeTemp(label, workspace);
    const resolvedArgs = typeof args === "function" ? args(temp.path) : args;
    const resolvedEnvironment = typeof environment === "function" ? environment(temp.path) : environment;
    commandResult = await runProcess(command, resolvedArgs, workspace, !emit, resolvedEnvironment);
  } catch (error) {
    internalError = error;
  } finally {
    if (before) {
      try { changes = snapshotChanges(before, await snapshot(workspace)); }
      catch (error) { internalError ??= error; }
    }
    if (temp) {
      try { await cleanupSafeTemp(temp, workspace); }
      catch (error) { cleanupError = error; }
    }
  }
  const exitCode = internalError || cleanupError ? 3 : changes.length > 0 ? 2 : commandResult.code === 0 ? 0 : 1;
  if (emit) {
    console.log(`task: ${label}`);
    console.log(`command: ${displayCommand}`);
    console.log(`command result: ${commandResult.code === 0 ? "passed" : "failed"} (exit ${commandResult.code})`);
    console.log(`artifact safety: ${changes.length === 0 ? "passed" : "failed"}`);
    console.log(`mutations: ${changes.length}`);
    for (const change of changes) console.log(`  ${change.category} ${change.kind}: ${change.path}`);
    console.log(`cleanup: ${cleanupError ? "failed" : "passed"}`);
    if (internalError) console.error(`internal error: ${internalError.message}`);
    if (cleanupError) console.error(`cleanup error: ${cleanupError.message}`);
    console.log(`final: ${exitCode === 0 ? "passed" : "failed"} (exit ${exitCode})`);
  }
  return { exitCode, commandResult, changes, internalError, cleanupError };
}

async function initializeFixture(root) {
  await mkdir(root, { recursive: true });
  await writeFile(join(root, ".gitignore"), "dist/\n", "utf8");
  await writeFile(join(root, "tracked.txt"), "clean\n", "utf8");
  for (const args of [["init", "--quiet"], ["config", "user.email", "verify@example.invalid"], ["config", "user.name", "Verification Self Test"], ["add", "."], ["commit", "--quiet", "-m", "fixture"]]) {
    const result = await runProcess("git", args, root, true);
    if (result.code !== 0) throw new Error(`Self-test fixture Git setup failed: git ${args[0]}`);
  }
}

async function runFixtureCase(parent, name, setup, source, expectedExit, expectedPath) {
  const root = join(parent, name);
  await initializeFixture(root);
  await setup(root);
  const result = await verifyCommand({
    label: `self-test-${name}`,
    workspace: root,
    command: process.execPath,
    args: ["--input-type=module", "--eval", source],
    displayCommand: "node <fixed self-test command>",
    emit: false,
  });
  if (result.exitCode !== expectedExit) throw new Error(`${name}: expected exit ${expectedExit}, received ${result.exitCode}`);
  if (expectedPath && !result.changes.some((change) => change.path === expectedPath)) throw new Error(`${name}: expected mutation was not detected`);
}

async function runSelfTest() {
  const workspaceBefore = await snapshot(repositoryRoot);
  const outer = await createSafeTemp("self-test-suite", repositoryRoot);
  let failure;
  try {
    await runFixtureCase(outer.path, "success", async () => {}, "process.exit(0)", 0);
    await runFixtureCase(outer.path, "command-failure", async () => {}, "process.exit(7)", 1);
    await runFixtureCase(outer.path, "dirty-preserved", async (root) => writeFile(join(root, "tracked.txt"), "dirty\n"), "process.exit(0)", 0);
    await runFixtureCase(outer.path, "dirty-mutated", async (root) => writeFile(join(root, "tracked.txt"), "dirty\n"), "import { appendFile } from 'node:fs/promises'; await appendFile('tracked.txt', 'changed\\n')", 2, "tracked.txt");
    await runFixtureCase(outer.path, "untracked-created", async () => {}, "import { writeFile } from 'node:fs/promises'; await writeFile('new.txt', 'new\\n')", 2, "new.txt");
    await runFixtureCase(outer.path, "protected-mutated", async (root) => { await mkdir(join(root, "dist")); await writeFile(join(root, "dist", "existing.txt"), "before\n"); }, "import { writeFile } from 'node:fs/promises'; await writeFile('dist/existing.txt', 'after\\n')", 2, "dist/existing.txt");
    await runFixtureCase(outer.path, "protected-created", async () => {}, "import { mkdir, writeFile } from 'node:fs/promises'; await mkdir('dist'); await writeFile('dist/new.txt', 'new\\n')", 2, "dist/new.txt");
    await runFixtureCase(outer.path, "protected-deleted", async (root) => { await mkdir(join(root, "dist")); await writeFile(join(root, "dist", "existing.txt"), "before\n"); }, "import { rm } from 'node:fs/promises'; await rm('dist/existing.txt')", 2, "dist/existing.txt");
    await runFixtureCase(outer.path, "tsbuildinfo-created", async () => {}, "import { writeFile } from 'node:fs/promises'; await writeFile('project.tsbuildinfo', 'state\\n')", 2, "project.tsbuildinfo");
    await runFixtureCase(outer.path, "index-only", async () => {}, "import { spawnSync } from 'node:child_process'; const result = spawnSync('git', ['rm', '--cached', '--quiet', 'tracked.txt'], { shell: false }); process.exit(result.status ?? 1)", 2, "(index or status metadata)");
    await runFixtureCase(outer.path, "symlink-retargeted", async (root) => {
      await mkdir(join(root, "target-a"));
      await mkdir(join(root, "target-b"));
      await symlink(join(root, "target-a"), join(root, "dist"), "junction");
    }, "import { rm, symlink } from 'node:fs/promises'; import { resolve } from 'node:path'; await rm('dist'); await symlink(resolve('target-b'), 'dist', 'junction')", 2, "dist");
    console.log("task: self-test");
    console.log("command: fixed OS-temp Git fixture suite");
    console.log("command result: passed (exit 0)");
  } catch (error) {
    failure = error;
  }
  let cleanupError;
  try { await cleanupSafeTemp(outer, repositoryRoot); }
  catch (error) { cleanupError = error; }
  let workspaceChanges = [];
  try { workspaceChanges = snapshotChanges(workspaceBefore, await snapshot(repositoryRoot)); }
  catch (error) { failure ??= error; }
  console.log(`artifact safety: ${workspaceChanges.length === 0 ? "passed" : "failed"}`);
  console.log(`mutations: ${workspaceChanges.length} (workspace)`);
  for (const change of workspaceChanges) console.log(`  ${change.category} ${change.kind}: ${change.path}`);
  console.log(`cleanup: ${cleanupError ? "failed" : "passed"}`);
  if (failure) console.error(`internal error: ${failure.message}`);
  if (cleanupError) console.error(`cleanup error: ${cleanupError.message}`);
  const exitCode = failure || cleanupError ? 3 : workspaceChanges.length > 0 ? 2 : 0;
  console.log(`final: ${exitCode === 0 ? "passed" : "failed"} (exit ${exitCode})`);
  return exitCode;
}

async function main() {
  const [task, ...extra] = process.argv.slice(2);
  if (!allowedTasks.has(task) || extra.length > 0) {
    console.error("Usage: node scripts/verify.mjs <build|coverage|format|lint|lint-gates|self-test|test-typecheck|typecheck|unit|unit-self-test>");
    return 3;
  }
  if (task === "self-test") return runSelfTest();
  let npmCli;
  try { npmCli = await validatedNpmCli(); }
  catch (error) {
    console.error(`internal error: ${error.message}`);
    return 3;
  }
  const result = task === "build"
    ? await verifyCommand({
      label: "build",
      workspace: repositoryRoot,
      command: process.execPath,
      args: (temp) => [npmCli, "run", "build", "--", "--outDir", join(temp, "build"), "--emptyOutDir"],
      displayCommand: "npm run build -- --outDir <OS temp>/build --emptyOutDir",
    })
    : await verifyCommand({
      label: task,
      workspace: repositoryRoot,
      command: process.execPath,
      args: [npmCli, "run", npmTasks.get(task)],
      displayCommand: `npm run ${npmTasks.get(task)}`,
      environment: testTasks.has(task) ? (temp) => ({ ...process.env, ZAIKO_TEST_OUTPUT_DIR: temp }) : undefined,
    });
  return result.exitCode;
}

process.exitCode = await main();
