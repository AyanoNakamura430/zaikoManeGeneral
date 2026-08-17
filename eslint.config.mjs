import eslint from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const strictSource = ["src/**/*.ts", "src/**/*.tsx"];
const testSource = ["tests/**/*.ts", "tests/**/*.tsx"];
const legacyExclusions = [
  "src/main.tsx",
  "src/app/App.tsx",
  "src/app/components/ui/**",
  "src/app/components/figma/**",
  "src/imports/**",
];

const restriction = (regex, message) => [
  "error",
  {
    patterns: [{ regex, message }],
  },
];

const providerPattern = "^@supabase/supabase-js(?:/.*)?$";
const reactPattern = "^(?:react|react-router)(?:/.*)?$";
const layer = (name) => `^(?:@/|src/|(?:\\.\\.?/)+)(?:[^/]+/)*${name}(?:/|$)`;

export const architectureConfigs = [
  {
    files: strictSource,
    ignores: ["src/adapters/**", "src/infrastructure/**", "src/composition/**", "src/app/composition/**", "src/lib/supabase.ts"],
    rules: {
      "no-restricted-imports": restriction(providerPattern, "Use a port; direct Supabase imports belong only in adapters, infrastructure, or the composition root."),
    },
  },
  {
    files: ["src/domain/**/*.ts", "src/domain/**/*.tsx"],
    rules: {
      "no-restricted-imports": restriction(`${reactPattern}|${providerPattern}|${layer("application")}|${layer("features")}|${layer("adapters")}|${layer("infrastructure")}|${layer("app")}`, "Domain code must remain pure and depend on no outer layer."),
    },
  },
  {
    files: ["src/application/**/*.ts", "src/application/**/*.tsx"],
    rules: {
      "no-restricted-imports": restriction(`${reactPattern}|${providerPattern}|${layer("features")}|${layer("adapters")}|${layer("infrastructure")}|${layer("app")}`, "Application code may depend only on Domain and ports, not UI or provider implementations."),
    },
  },
  {
    files: ["src/features/**/*.ts", "src/features/**/*.tsx"],
    rules: {
      "no-restricted-imports": restriction(`${providerPattern}|${layer("adapters")}|${layer("infrastructure")}|^(?:@/|src/)features/`, "Feature UI must use Application ports and must not reach provider or other feature internals."),
    },
  },
  {
    files: ["src/adapters/**/*.ts", "src/adapters/**/*.tsx"],
    rules: {
      "no-restricted-imports": restriction(`${reactPattern}|${layer("features")}|${layer("application")}|${layer("app")}`, "Adapters must not depend on UI or Application workflows."),
    },
  },
  {
    files: ["src/infrastructure/**/*.ts", "src/infrastructure/**/*.tsx"],
    rules: {
      "no-restricted-imports": restriction(`${reactPattern}|${layer("features")}|${layer("application")}|${layer("adapters")}|${layer("app")}`, "Infrastructure must not depend on UI, Application workflows, or adapters."),
    },
  },
];

export default tseslint.config(
  {
    ignores: ["dist/**", ".vite/**", "node_modules/**", "coverage/**", "test-results/**", "playwright-report/**", ...legacyExclusions],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: [...strictSource, ...testSource],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
    },
  },
  ...architectureConfigs,
);
