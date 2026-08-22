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

if (!configuredOutput || !isAbsolute(configuredOutput)) {
  throw new Error("Run the Supabase harness through the artifact-safe verify script.");
}

const outputRoot = await realpath(configuredOutput);
const temporaryRoot = await realpath(tmpdir());
const workspaceRoot = await realpath(repositoryRoot);
if (!isInside(temporaryRoot, outputRoot) || outputRoot === temporaryRoot || isInside(workspaceRoot, outputRoot)) {
  throw new Error("Refusing a Supabase harness directory outside the validated OS temporary boundary.");
}

const sourceProject = join(repositoryRoot, "tests", "supabase", "project");
const temporaryProject = join(outputRoot, "supabase-project");
await mkdir(temporaryProject, { recursive: true });
await cp(sourceProject, temporaryProject, { recursive: true, filter: (source) => !source.includes(`${sep}.temp`) });
const temporaryConfig = join(temporaryProject, "supabase", "config.toml");
const configContents = await readFile(temporaryConfig, "utf8");
const uniqueProjectId = `zaiko-wp7-${randomUUID()}`;
const uniqueConfig = configContents.replace('project_id = "zaiko-wp7-harness"', `project_id = "${uniqueProjectId}"`);
if (uniqueConfig === configContents) throw new Error("The temporary Supabase project identity was not replaced.");
await writeFile(temporaryConfig, uniqueConfig, "utf8");
const copiedMigration = join(
  temporaryProject,
  "supabase",
  "migrations",
  "20260822000000_wp7_harness.sql",
);
const migrationInfo = await lstat(copiedMigration);
if (!migrationInfo.isFile() || migrationInfo.isSymbolicLink()) {
  throw new Error("The test-only migration was not copied into the temporary project.");
}

const supabaseCli = await realpath(join(repositoryRoot, "node_modules", "supabase", "dist", "supabase.js"));
const vitestCli = await realpath(join(repositoryRoot, "node_modules", "vitest", "vitest.mjs"));
for (const executable of [supabaseCli, vitestCli]) {
  const info = await lstat(executable);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error("A harness executable is not a regular file.");
}

function run(command, args, environment = process.env) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: environment,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", rejectRun);
    child.once("close", (code) => resolveRun({ code: code ?? 1, stdout, stderr }));
  });
}

const cli = (args) => run(process.execPath, [supabaseCli, ...args, "--workdir", temporaryProject, "--yes"]);
const assertStage = (name, result) => {
  if (result.code !== 0) throw new Error(`${name} failed; captured provider output is intentionally suppressed.`);
  console.log(`PASS: ${name}`);
};

const excludedServices = [
  "realtime",
  "imgproxy",
  "postgres-meta",
  "studio",
  "edge-runtime",
  "logflare",
  "vector",
  "supavisor",
  "mailpit",
].join(",");

let startAttempted = false;
let failure;
let stopFailure;
try {
  startAttempted = true;
  const start = await cli(["start", "--exclude", excludedServices]);
  assertStage("local stack start", start);

  const migrationList = await cli(["migration", "list", "--local"]);
  assertStage("local migration discovery", migrationList);
  console.log(migrationList.stdout.trim());

  const firstReset = await cli(["db", "reset", "--local", "--no-seed"]);
  assertStage("first local migration reset", firstReset);
  const secondReset = await cli(["db", "reset", "--local", "--no-seed"]);
  assertStage("second local migration reset", secondReset);
  const migrationListAfterReset = await cli(["migration", "list", "--local"]);
  assertStage("post-reset migration history", migrationListAfterReset);
  console.log(migrationListAfterReset.stdout.trim());

  const schemaCheck = await cli([
    "db",
    "query",
    "--local",
    "select to_regclass('public.harness_accounts') as relation",
    "--output-format",
    "json",
  ]);
  assertStage("local migration schema check", schemaCheck);
  const schemaResult = `${schemaCheck.stdout}\n${schemaCheck.stderr}`;
  console.log(`schema check result: ${schemaResult.trim()}`);
  if (!schemaResult.includes("harness_accounts")) {
    throw new Error("The local migration did not create the harness schema.");
  }

  const status = await cli(["status", "--output", "json"]);
  assertStage("local status", status);
  const local = JSON.parse(status.stdout);
  const apiUrl = local.API_URL ?? local.api_url;
  const publicKey = local.PUBLISHABLE_KEY ?? local.ANON_KEY ?? local.anon_key;
  const secretKey = local.SECRET_KEY ?? local.SERVICE_ROLE_KEY ?? local.service_role_key;
  if (![apiUrl, publicKey, secretKey].every((value) => typeof value === "string" && value.length > 0)) {
    throw new Error("Local status did not provide the required API credentials.");
  }

  const tests = await run(
    process.execPath,
    [vitestCli, "run", "--config", join(repositoryRoot, "vitest.supabase.config.mjs")],
    {
      ...process.env,
      ZAIKO_LOCAL_SUPABASE_URL: apiUrl,
      ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY: publicKey,
      ZAIKO_LOCAL_SUPABASE_SECRET_KEY: secretKey,
    },
  );
  if (tests.code !== 0) {
    const sanitized = `${tests.stdout}\n${tests.stderr}`
      .replaceAll(apiUrl, "[local-api]")
      .replaceAll(publicKey, "[redacted-public-key]")
      .replaceAll(secretKey, "[redacted-secret-key]");
    console.error(sanitized);
    throw new Error("Database security assertions failed; local credentials were redacted.");
  }
  console.log("PASS: database, RLS, GRANT, and Storage assertions");
} catch (error) {
  failure = error;
} finally {
  if (startAttempted) {
    const stopped = await cli(["stop", "--no-backup"]);
    if (stopped.code !== 0) stopFailure = new Error("Local stack cleanup failed; captured provider output is intentionally suppressed.");
    else console.log("PASS: local stack stop and volume cleanup");
  }
}

if (failure) console.error(failure.message);
if (stopFailure) console.error(stopFailure.message);
if (failure || stopFailure) process.exitCode = 1;
