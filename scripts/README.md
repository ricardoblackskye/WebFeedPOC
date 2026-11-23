# Scripts Module

## Overview
The `scripts/` package encapsulates build-time orchestration, static site pre-rendering, and automated continuous integration code review pipelines for the application. It includes `prerender.mjs` for SSR compilation and SEO static HTML/sitemap generation, and `pr-reviewer.js` for automated GitHub pull request reviews with secret redaction and AI fallback mechanisms.

## Interface
- `prerender()` in [`prerender.mjs`](./prerender.mjs): Orchestrates dual Vite compilation (client + SSR), executes Wix catalog hydration, writes static route HTML files (`dist/**/*.html`), generates `dist/sitemap.xml`, and cleans up server artifacts.
- `injectHead(template, head)` in [`prerender.mjs`](./prerender.mjs): Injects React Helmet metadata and title tags into HTML templates.
- `generateSitemap(routes)` in [`prerender.mjs`](./prerender.mjs): Formats XML sitemap according to schema 0.9.
- `redact(text)` in [`pr-reviewer.js`](./pr-reviewer.js): Sanitizes tokens, Bearer headers, GitHub tokens, OpenRouter API keys, and secret credentials.
- `fail(context, err)` in [`pr-reviewer.js`](./pr-reviewer.js): Logs redacted error output and terminates with exit code 1.
- `isCodeReview(text)` in [`pr-reviewer.js`](./pr-reviewer.js): Validates whether text is a substantive markdown code review.
- `triggerRemoteEveWebhook(rawEventPayload)` in [`pr-reviewer.js`](./pr-reviewer.js): Dispatches signed GitHub webhook events to the remote Eve review agent.
- `truncDiffForPrompt(diff)` in [`pr-reviewer.js`](./pr-reviewer.js): Truncates git diff strings exceeding 60,000 characters.
- `validatePrDiff(prDiff)` in [`pr-reviewer.js`](./pr-reviewer.js): Type assertion asserting valid diff string.
- `generateAiReview(number, owner, repo, diff, sanitizedDiff)` in [`pr-reviewer.js`](./pr-reviewer.js): Executes review inference against OpenRouter API with retry and fallback handling.
- `generateFallbackReview(number, owner, repo, diff)` in [`pr-reviewer.js`](./pr-reviewer.js): Produces deterministic structural markdown review and security checklist.
- `postComment(owner, repo, number, body)` in [`pr-reviewer.js`](./pr-reviewer.js): Posts comments to the GitHub PR issues API.
- `runPRReviewer()` in [`pr-reviewer.js`](./pr-reviewer.js): Main CI entry point.

## Invariants
- All error logs and unhandled rejections across `pr-reviewer.js` must pass through `redact()` before output.
- `prerender.mjs` verifies 100% of discovered routes; any route failure triggers a non-zero exit code.
- Wix API catalog fetch failures during pre-render fall back gracefully to an empty catalog (`[]`) to allow client-side hydration without breaking builds.
- PR diff payloads to the LLM are capped at 60,000 characters.
- Pre-render output is strictly confined to `dist/`; application source files are never mutated.

## Side Effects
- Filesystem writes to `dist/**/*.html`, `dist/sitemap.xml`, and deletion of temporary `dist/server`.
- Outbound network requests to Wix Stores API (catalog fetch), GitHub REST API (fetching diffs, posting comments), Eve webhook endpoint, and OpenRouter API (completions).

## Verification
- Run: `npm test`
