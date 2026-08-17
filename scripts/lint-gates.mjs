import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import { architectureConfigs } from "../eslint.config.mjs";

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: { parser: tseslint.parser },
    },
    ...architectureConfigs,
  ],
});

const cases = [
  {
    name: "domain rejects React",
    filePath: "src/domain/item.ts",
    code: 'import { useState } from "react"; export const value = useState;',
    expectedRule: "no-restricted-imports",
  },
  {
    name: "application rejects infrastructure",
    filePath: "src/application/load-items.ts",
    code: 'import { client } from "../infrastructure/client"; export const value = client;',
    expectedRule: "no-restricted-imports",
  },
  {
    name: "feature rejects direct Supabase",
    filePath: "src/features/items/screen.tsx",
    code: 'import { createClient } from "@supabase/supabase-js"; export const value = createClient;',
    expectedRule: "no-restricted-imports",
  },
  {
    name: "adapter rejects feature UI",
    filePath: "src/adapters/items.ts",
    code: 'import { Screen } from "../features/items/screen"; export const value = Screen;',
    expectedRule: "no-restricted-imports",
  },
  {
    name: "infrastructure rejects application",
    filePath: "src/infrastructure/client.ts",
    code: 'import { loadItems } from "../application/load-items"; export const value = loadItems;',
    expectedRule: "no-restricted-imports",
  },
  {
    name: "domain allows Domain import",
    filePath: "src/domain/item.ts",
    code: 'import type { Category } from "./category"; export type Item = { category: Category };',
  },
  {
    name: "adapter allows Supabase provider",
    filePath: "src/adapters/items.ts",
    code: 'import { createClient } from "@supabase/supabase-js"; export const value = createClient;',
  },
  {
    name: "composition allows Supabase provider",
    filePath: "src/composition/root.ts",
    code: 'import { createClient } from "@supabase/supabase-js"; export const value = createClient;',
  },
];

let failures = 0;
for (const testCase of cases) {
  const [result] = await eslint.lintText(testCase.code, { filePath: testCase.filePath });
  const ruleIds = result.messages.map((message) => message.ruleId).filter(Boolean);
  const passed = testCase.expectedRule ? ruleIds.includes(testCase.expectedRule) : result.errorCount === 0;
  console.log(`${passed ? "PASS" : "FAIL"}: ${testCase.name}`);
  if (!passed) {
    failures += 1;
    console.error(`  expected: ${testCase.expectedRule ?? "no errors"}`);
    console.error(`  received rules: ${ruleIds.join(", ") || "none"}`);
    for (const message of result.messages) console.error(`  ${message.ruleId ?? "configuration"}: ${message.message}`);
  }
}

if (failures > 0) {
  console.error(`Architecture lint gate self-test failed: ${failures} case(s)`);
  process.exitCode = 1;
} else {
  console.log(`Architecture lint gate self-test passed: ${cases.length} case(s)`);
}
