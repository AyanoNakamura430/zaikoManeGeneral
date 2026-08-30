import base from "./vitest.config.mjs";
import { defineConfig } from "vitest/config";
export default defineConfig({ ...base, test: { ...base.test, include: ["tests/supabase-production/**/*.test.ts"], environment: "node" } });
