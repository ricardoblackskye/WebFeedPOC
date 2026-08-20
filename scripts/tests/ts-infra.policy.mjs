import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const root = new URL('../../', import.meta.url)
const pkgPath = new URL('package.json', root)
const tsconfigPath = new URL('tsconfig.json', root)
const viteConfigTsPath = new URL('vite.config.ts', root)
const viteConfigJsPath = new URL('vite.config.js', root)
const jsconfigPath = new URL('jsconfig.json', root)

test('tsconfig.json exists with strict mode enabled', () => {
  assert.ok(existsSync(tsconfigPath), 'expected tsconfig.json to exist')
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'))
  assert.ok(tsconfig.compilerOptions?.strict === true, 'expected tsconfig compilerOptions.strict to be true')
  assert.ok(tsconfig.compilerOptions?.moduleResolution === 'bundler', 'expected moduleResolution: bundler')
  assert.ok(tsconfig.compilerOptions?.target === 'ESNext', 'expected target: ESNext')
})

test('vite.config.ts exists and is the active config file', () => {
  assert.ok(existsSync(viteConfigTsPath), 'expected vite.config.ts to exist')
})

test('vite.config.js has been removed', () => {
  assert.ok(!existsSync(viteConfigJsPath), 'expected vite.config.js to be removed (replaced by .ts)')
})

test('jsconfig.json has been removed (replaced by tsconfig.json)', () => {
  assert.ok(!existsSync(jsconfigPath), 'expected jsconfig.json to be removed (replaced by tsconfig.json)')
})

test('typescript and @types/node are in devDependencies', () => {
  assert.ok(existsSync(pkgPath), 'expected package.json to exist')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  assert.ok(pkg.devDependencies?.typescript !== undefined, 'expected typescript in devDependencies')
  assert.ok(pkg.devDependencies?.['@types/node'] !== undefined, 'expected @types/node in devDependencies')
})

test('mega-linter.yml disables TYPESCRIPT_STANDARD (incompatible with TS version)', () => {
  const mlPath = new URL('.mega-linter.yml', root)
  assert.ok(existsSync(mlPath), 'expected .mega-linter.yml to exist')
  const content = readFileSync(mlPath, 'utf8')
  assert.match(content, /DISABLE_LINTERS/, 'expected DISABLE_LINTERS in .mega-linter.yml')
  assert.match(content, /TYPESCRIPT_STANDARD/, 'expected TYPESCRIPT_STANDARD to be disabled')
})

test('vite build succeeds with TypeScript config', { timeout: 60000 }, () => {
  execSync('npm run build', { cwd: root.pathname, stdio: 'pipe', encoding: 'utf8' })
})