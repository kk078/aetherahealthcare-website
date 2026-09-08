import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { plugins: { 'unused-imports': unusedImports }, rules: { 'unused-imports/no-unused-imports': 'error' } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "public/workers/**",
    ".wrangler/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
