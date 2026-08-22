import baseConfig from "./vitest.config.mjs";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...baseConfig,
  define: {
    __ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY__: JSON.stringify(process.env.ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY),
    __ZAIKO_LOCAL_SUPABASE_SECRET_KEY__: JSON.stringify(process.env.ZAIKO_LOCAL_SUPABASE_SECRET_KEY),
    __ZAIKO_LOCAL_SUPABASE_URL__: JSON.stringify(process.env.ZAIKO_LOCAL_SUPABASE_URL),
  },
  test: {
    ...baseConfig.test,
    environment: "node",
    include: ["tests/supabase/**/*.test.ts"],
    setupFiles: [],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
