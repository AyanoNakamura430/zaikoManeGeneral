import baseConfig from "./vitest.config.mjs";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: "jsdom",
    include: ["tests/integration/**/*.test.tsx"],
    setupFiles: ["tests/setup/integration.ts"],
  },
});
