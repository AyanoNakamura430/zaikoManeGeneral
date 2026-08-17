import { describe, expect, it } from "vitest";

describe("Vitest unit-test foundation", () => {
  it("executes TypeScript tests in the Node environment", () => {
    expect({ runner: "vitest", environment: "node" }).toEqual({
      runner: "vitest",
      environment: "node",
    });
  });
});
