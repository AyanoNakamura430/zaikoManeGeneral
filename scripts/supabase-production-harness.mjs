import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cp, lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configuredOutput = process.env.ZAIKO_TEST_OUTPUT_DIR;
const isInside = (parent, child) => {
  const value = relative(parent, child);
  return value !== "" && value !== ".." && !value.startsWith(`..${sep}`) && !isAbsolute(value);
};
if (!configuredOutput || !isAbsolute(configuredOutput)) throw new Error("Run through the artifact-safe verify script.");
const outputRoot = await realpath(configuredOutput);
const temporaryRoot = await realpath(tmpdir());
const workspaceRoot = await realpath(repositoryRoot);
if (!isInside(temporaryRoot, outputRoot) || outputRoot === temporaryRoot || isInside(workspaceRoot, outputRoot)) {
  throw new Error("Refusing a production database harness outside the validated OS temporary boundary.");
}

const temporaryProject = join(outputRoot, "production-project");
await mkdir(temporaryProject, { recursive: true });
await cp(join(repositoryRoot, "supabase"), join(temporaryProject, "supabase"), { recursive: true });
const configPath = join(temporaryProject, "supabase", "config.toml");
const config = await readFile(configPath, "utf8");
const uniqueConfig = config.replace('project_id = "zaiko-mane-general"', `project_id = "zaiko-wp19-${randomUUID()}"`);
if (uniqueConfig === config) throw new Error("The temporary project identity was not replaced.");
await writeFile(configPath, uniqueConfig, "utf8");

const cliPath = await realpath(join(repositoryRoot, "node_modules", "supabase", "dist", "supabase.js"));
const vitestPath = await realpath(join(repositoryRoot, "node_modules", "vitest", "vitest.mjs"));
for (const executable of [cliPath, vitestPath]) {
  const info = await lstat(executable);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error("A harness executable is not a regular file.");
}
const safeEnvironment = {
  ...process.env,
  DO_NOT_TRACK: "1",
  SUPABASE_HOME: join(outputRoot, "supabase-home"),
  SUPABASE_TELEMETRY_DISABLED: "1",
};
await mkdir(safeEnvironment.SUPABASE_HOME, { recursive: true });
function run(command, args, environment = safeEnvironment) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd: repositoryRoot, env: environment, shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", rejectRun);
    child.once("close", (code) => resolveRun({ code: code ?? 1, stdout, stderr }));
  });
}
const cli = (args) => run(process.execPath, [cliPath, ...args, "--workdir", temporaryProject, "--yes"]);
const assertStage = (name, result) => {
  if (result.code !== 0) throw new Error(`${name} failed; captured provider output is intentionally suppressed.`);
  console.log(`PASS: ${name}`);
};
const excluded = ["realtime","imgproxy","postgres-meta","studio","edge-runtime","logflare","vector","supavisor","mailpit"].join(",");
let startAttempted = false, failure, stopFailure;
try {
  startAttempted = true;
  assertStage("production local stack start", await cli(["start", "--exclude", excluded]));
  assertStage("production migration discovery", await cli(["migration", "list", "--local"]));
  assertStage("first production migration reset", await cli(["db", "reset", "--local", "--no-seed"]));
  assertStage("second production migration reset", await cli(["db", "reset", "--local", "--no-seed"]));
  const schema = await cli(["db", "query", "--local", "select to_regclass('public.items') as items, to_regclass('public.categories') as categories", "--output-format", "json"]);
  assertStage("production schema check", schema);
  if (!schema.stdout.includes("items") || !schema.stdout.includes("categories")) throw new Error("Production core relations are missing.");
  assertStage(
    "production database advisors",
    await cli(["db", "advisors", "--local", "--type", "all", "--fail-on", "error"]),
  );
  const status = await cli(["status", "--output", "json"]);
  assertStage("production local status", status);
  const local = JSON.parse(status.stdout);
  const apiUrl = local.API_URL ?? local.api_url;
  const publicKey = local.PUBLISHABLE_KEY ?? local.ANON_KEY ?? local.anon_key;
  const secretKey = local.SECRET_KEY ?? local.SERVICE_ROLE_KEY ?? local.service_role_key;
  if (![apiUrl, publicKey, secretKey].every((value) => typeof value === "string" && value.length > 0)) throw new Error("Local credentials are unavailable.");
  const tests = await run(process.execPath, [vitestPath, "run", "--config", join(repositoryRoot, "vitest.supabase-production.config.mjs")], {
    ...safeEnvironment,
    ZAIKO_LOCAL_SUPABASE_URL: apiUrl,
    ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY: publicKey,
    ZAIKO_LOCAL_SUPABASE_SECRET_KEY: secretKey,
  });
  if (tests.code !== 0) {
    const sanitized = `${tests.stdout}\n${tests.stderr}`.replaceAll(apiUrl, "[local-api]").replaceAll(publicKey, "[redacted-public-key]").replaceAll(secretKey, "[redacted-secret-key]");
    console.error(sanitized);
    throw new Error("Production database assertions failed; local credentials were redacted.");
  }
  console.log("PASS: production database assertions");
} catch (error) { failure = error; }
finally {
  if (startAttempted) {
    const stopped = await cli(["stop", "--no-backup"]);
    if (stopped.code !== 0) stopFailure = new Error("Production local stack cleanup failed; provider output is suppressed.");
    else console.log("PASS: production local stack stop and cleanup");
  }
}
if (failure) console.error(failure.message);
if (stopFailure) console.error(stopFailure.message);
if (failure || stopFailure) process.exitCode = 1;
