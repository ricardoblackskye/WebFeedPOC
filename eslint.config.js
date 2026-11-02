import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      'dist-ssr',
      'coverage',
      'playwright-report',
      'test-results',
      'megalinter-reports',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.config.cjs',
      'scripts/**',
      'api/**',
      '**/*wix*',
      '**/*stripe*',
      '**/*pr-reviewer*',
      'e2e/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        assert: 'readonly'
      }
    }
  }
]
