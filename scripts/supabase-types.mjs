import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedPath = join(
  repositoryRoot,
  "src",
  "infrastructure",
  "supabase",
  "database.generated.ts",
);
const sourceSupabase = join(repositoryRoot, "supabase");
const configuredOutput = process.env.ZAIKO_TEST_OUTPUT_DIR;
const [mode, ...extraArguments] = process.argv.slice(2);
const generatedHeader = [
  "// GENERATED FILE - DO NOT EDIT. Regenerate with npm run update:database-types.",
  "/* eslint-disable @typescript-eslint/no-redundant-type-constituents */",
  "",
].join("\n");

const isInside = (parent, child) => {
  const value = relative(parent, child);
  return (
    value !== "" &&
    value !== ".." &&
    !value.startsWith(`..${sep}`) &&
    !isAbsolute(value)
  );
};

if (
  !(mode === "check" || mode === "update" || mode === "self-test") ||
  extraArguments.length > 0
) {
  throw new Error(
    "Expected exactly one generated-type mode: check, update, or self-test.",
  );
}
if (mode !== "update" && (!configuredOutput || !isAbsolute(configuredOutput))) {
  throw new Error(
    "Run generated-type checks through the artifact-safe verification script.",
  );
}
if (mode === "update" && configuredOutput) {
  throw new Error(
    "The explicit update command manages its own temporary output boundary.",
  );
}

const ownedOutput =
  mode === "update"
    ? await mkdtemp(join(await realpath(tmpdir()), "zaiko-wp19-types-"))
    : null;
const outputRoot = await realpath(configuredOutput ?? ownedOutput);
const temporaryRoot = await realpath(tmpdir());
const workspaceRoot = await realpath(repositoryRoot);
if (
  !isInside(temporaryRoot, outputRoot) ||
  outputRoot === temporaryRoot ||
  isInside(workspaceRoot, outputRoot)
) {
  throw new Error(
    "Refusing a type-generation directory outside the validated OS temporary boundary.",
  );
}

const sameBytes = (left, right) => Buffer.compare(left, right) === 0;

class GeneratedTypesDriftError extends Error {}

function assertGeneratedTypesMatch(committed, candidate) {
  if (!sameBytes(committed, candidate)) {
    throw new GeneratedTypesDriftError(
      "Generated database types drifted; run the explicit update command.",
    );
  }
}

async function runSelfTest() {
  const committed = await readFile(generatedPath);
  const exactCandidate = join(outputRoot, "exact.generated.ts");
  const driftedCandidate = join(outputRoot, "drifted.generated.ts");
  await writeFile(exactCandidate, committed);
  await writeFile(
    driftedCandidate,
    Buffer.concat([
      committed,
      Buffer.from("// intentional drift fixture\n", "utf8"),
    ]),
  );
  assertGeneratedTypesMatch(committed, await readFile(exactCandidate));
  try {
    assertGeneratedTypesMatch(committed, await readFile(driftedCandidate));
    throw new Error("An intentional generated-type drift was not detected.");
  } catch (error) {
    if (!(error instanceof GeneratedTypesDriftError)) throw error;
  }
  console.log(
    "PASS: exact generated types are accepted and intentional drift is rejected",
  );
}

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        DO_NOT_TRACK: "1",
        SUPABASE_HOME: join(outputRoot, "supabase-home"),
        SUPABASE_TELEMETRY_DISABLED: "1",
      },
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
    child.once("close", (code) =>
      resolveRun({ code: code ?? 1, stdout, stderr }),
    );
  });
}

async function generateFromLocalMigrations() {
  const temporaryProject = join(outputRoot, "supabase-project");
  await mkdir(temporaryProject, { recursive: true });
  await mkdir(join(outputRoot, "supabase-home"), { recursive: true });
  await cp(sourceSupabase, join(temporaryProject, "supabase"), {
    recursive: true,
    filter: (source) => !source.includes(`${sep}.temp`),
  });
  const temporaryConfig = join(temporaryProject, "supabase", "config.toml");
  const configContents = await readFile(temporaryConfig, "utf8");
  const uniqueProjectId = `zaiko-wp19-${randomUUID()}`;
  const uniqueConfig = configContents.replace(
    'project_id = "zaiko-mane-general"',
    `project_id = "${uniqueProjectId}"`,
  );
  if (uniqueConfig === configContents) {
    throw new Error(
      "The temporary Supabase project identity was not replaced.",
    );
  }
  await writeFile(temporaryConfig, uniqueConfig, "utf8");

  const supabaseCli = await realpath(
    join(repositoryRoot, "node_modules", "supabase", "dist", "supabase.js"),
  );
  const cliInfo = await lstat(supabaseCli);
  if (!cliInfo.isFile() || cliInfo.isSymbolicLink()) {
    throw new Error("The Supabase CLI is not a regular file.");
  }
  const cli = (args) =>
    run(process.execPath, [
      supabaseCli,
      ...args,
      "--workdir",
      temporaryProject,
      "--yes",
    ]);
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

  let failure;
  let stopFailure;
  let generatedFile;
  let startAttempted = false;
  try {
    startAttempted = true;
    const start = await cli(["start", "--exclude", excludedServices]);
    if (start.code !== 0)
      throw new Error(
        "Local stack start failed; provider output is suppressed.",
      );
    const reset = await cli(["db", "reset", "--local", "--no-seed"]);
    if (reset.code !== 0)
      throw new Error(
        "Local migration reset failed; provider output is suppressed.",
      );
    const generated = await cli([
      "gen",
      "types",
      "--local",
      "--lang",
      "typescript",
      "--schema",
      "public",
    ]);
    if (
      generated.code !== 0 ||
      !generated.stdout.includes("export type Database")
    ) {
      throw new Error(
        "Local database type generation failed; provider output is suppressed.",
      );
    }
    const formatted = await prettier.format(generated.stdout.trim(), {
      parser: "typescript",
    });
    generatedFile = Buffer.from(`${generatedHeader}${formatted}`, "utf8");
  } catch (error) {
    failure = error;
  } finally {
    if (startAttempted) {
      const stopped = await cli(["stop", "--no-backup"]);
      if (stopped.code !== 0) {
        stopFailure = new Error(
          "Local stack cleanup failed; provider output is suppressed.",
        );
      }
    }
  }

  if (failure) console.error(failure.message);
  if (stopFailure) console.error(stopFailure.message);
  if (failure || stopFailure || !generatedFile) {
    throw new Error("Generated-type operation did not complete safely.");
  }
  return generatedFile;
}

try {
  if (mode === "self-test") {
    await runSelfTest();
  } else {
    const generated = await generateFromLocalMigrations();
    if (mode === "update") {
      await mkdir(dirname(generatedPath), { recursive: true });
      await writeFile(generatedPath, generated);
      console.log("PASS: generated database types updated explicitly");
    } else {
      const committed = await readFile(generatedPath);
      assertGeneratedTypesMatch(committed, generated);
      console.log("PASS: generated database types match local migrations");
    }
  }
} finally {
  if (ownedOutput) {
    await rm(ownedOutput, { recursive: true, force: true });
  }
}
