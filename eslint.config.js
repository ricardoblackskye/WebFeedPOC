import js from "@eslint/js"
import tseslint from "typescript-eslint"
import globals from "globals"

// Minimal, convention-respecting linter: catches real errors (unused vars,
// undefined references, syntax problems) without enforcing the stylistic rules
// the project deliberately avoids (comma-dangle / space-before-function-paren),
// which is why `standard` was not a fit here.
export default [
  {
    ignores: [
      "node_modules",
      "dist",
      "dist-ssr",
      "coverage",
      "playwright-report",
      "test-results",
      "megalinter-reports",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.cjs",
      "scripts/**",
      "api/**",
      "**/*wix*",
      "**/*stripe*",
      "**/*pr-reviewer*",
      "e2e/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest globals used by the test files
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        assert: "readonly",
      },
    },
  },
]
