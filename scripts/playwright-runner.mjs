import { lstat, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { createServer } from "node:net";
import { spawn } from "node:child_process";

const workspace = resolve(process.cwd());
const configuredOutput = process.env.ZAIKO_TEST_OUTPUT_DIR;
const isInside = (parent, child) => {
  const value = relative(parent, child);
  return (
    value !== "" &&
    value !== ".." &&
    !value.startsWith(`..${sep}`) &&
    !isAbsolute(value)
  );
};

if (!configuredOutput || !isAbsolute(configuredOutput)) {
  throw new Error("Run E2E through the artifact-safe verification script.");
}
const output = await realpath(configuredOutput);
const temporaryRoot = await realpath(tmpdir());
const workspaceRoot = await realpath(workspace);
const outputInfo = await lstat(output);
if (
  !outputInfo.isDirectory() ||
  outputInfo.isSymbolicLink() ||
  !isInside(temporaryRoot, output) ||
  output === temporaryRoot ||
  isInside(workspaceRoot, output)
) {
  throw new Error(
    "Refusing E2E output outside the validated OS temporary boundary.",
  );
}

const playwrightCli = await realpath(
  join(workspace, "node_modules", "@playwright", "test", "cli.js"),
);
const cliInfo = await lstat(playwrightCli);
if (
  !cliInfo.isFile() ||
  cliInfo.isSymbolicLink() ||
  basename(playwrightCli) !== "cli.js"
) {
  throw new Error("The Playwright CLI is not a regular project-local file.");
}

const port = await new Promise((resolvePort, rejectPort) => {
  const probe = createServer();
  probe.once("error", rejectPort);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    if (!address || typeof address === "string") {
      probe.close(() =>
        rejectPort(new Error("Could not allocate an E2E fixture port.")),
      );
      return;
    }
    probe.close(() => resolvePort(address.port));
  });
});

const server = spawn(
  process.execPath,
  [join(workspace, "scripts", "e2e-fixture-server.mjs")],
  {
    cwd: workspace,
    env: { ...process.env, ZAIKO_E2E_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

async function waitForServer() {
  await new Promise((resolveReady, rejectReady) => {
    const timeout = setTimeout(
      () =>
        rejectReady(new Error("Timed out waiting for the E2E fixture server.")),
      10_000,
    );
    const fail = (error) => {
      clearTimeout(timeout);
      rejectReady(
        error instanceof Error
          ? error
          : new Error("The E2E fixture server exited before readiness."),
      );
    };
    server.once("error", fail);
    server.once("exit", () =>
      fail(new Error("The E2E fixture server exited before readiness.")),
    );
    server.stdout.setEncoding("utf8");
    server.stdout.on("data", (chunk) => {
      if (!chunk.includes("fixture server ready")) return;
      clearTimeout(timeout);
      resolveReady();
    });
  });
}

async function stopOwnedServer() {
  if (!server.pid || server.exitCode !== null) return;

  const waitForExit = (timeoutMs) =>
    new Promise((resolveExit) => {
      if (server.exitCode !== null) return resolveExit(true);
      const timeout = setTimeout(() => resolveExit(false), timeoutMs);
      server.once("exit", () => {
        clearTimeout(timeout);
        resolveExit(true);
      });
    });

  server.kill("SIGTERM");
  if (await waitForExit(3_000)) return;

  if (process.platform === "win32") {
    const killCode = await new Promise((resolveStop, rejectStop) => {
      const killer = spawn(
        process.env.ComSpec,
        ["/d", "/s", "/c", `taskkill /pid ${server.pid} /t /f`],
        { stdio: "ignore", windowsHide: true },
      );
      killer.once("error", rejectStop);
      killer.once("close", (code) => resolveStop(code ?? 1));
    });
    if (killCode !== 0 && server.exitCode === null) {
      throw new Error("Could not force-stop the owned E2E fixture server.");
    }
  } else if (!server.kill("SIGKILL") && server.exitCode === null) {
    throw new Error("Could not force-stop the owned E2E fixture server.");
  }

  if (!(await waitForExit(5_000))) {
    throw new Error("Timed out stopping the owned E2E fixture server.");
  }
}

let result = 1;
try {
  await waitForServer();
  result = await new Promise((resolveRun) => {
    const child = spawn(
      process.execPath,
      [
        playwrightCli,
        "test",
        "--config",
        join(workspace, "playwright.config.mjs"),
      ],
      {
        cwd: workspace,
        env: { ...process.env, ZAIKO_E2E_PORT: String(port) },
        stdio: "inherit",
        windowsHide: true,
      },
    );
    child.once("error", () => resolveRun(1));
    child.once("close", (code) => resolveRun(code ?? 1));
  });
} finally {
  await stopOwnedServer();
}

process.exitCode = result;
