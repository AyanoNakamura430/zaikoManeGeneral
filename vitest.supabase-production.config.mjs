import base from "./vitest.config.mjs";
import { defineConfig } from "vitest/config";
export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ["tests/supabase-production/**/*.test.ts"],
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: [],
  },
});
