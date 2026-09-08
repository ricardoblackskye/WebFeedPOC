import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "node:crypto";
import {
  redact,
  isCodeReview,
  triggerRemoteEveWebhook,
  generateFallbackReview,
  postComment,
  truncDiffForPrompt,
  MAX_DIFF_CHARS,
} from "../scripts/pr-reviewer.js";

describe("PR Reviewer Unit Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isCodeReview validator", () => {
    it("rejects generic acknowledgment messages", () => {
      expect(isCodeReview("PR #157 synchronize acknowledged")).toBe(false);
      expect(isCodeReview("Event received")).toBe(false);
      expect(isCodeReview("Webhook request accepted and queued")).toBe(false);
      expect(isCodeReview("PR #157 opened received event")).toBe(false);
    });

    it("rejects non-string or short (<50 chars) input", () => {
      expect(isCodeReview(null)).toBe(false);
      expect(isCodeReview(undefined)).toBe(false);
      expect(isCodeReview(12345)).toBe(false);
      expect(isCodeReview("Short string")).toBe(false);
      expect(isCodeReview("Looking good!")).toBe(false);
    });

    it("accepts valid structured code reviews", () => {
      const validReview1 = `## Automated PR Review
- Lines added: 10
- Lines removed: 2
- [ ] Checklist item 1
- [ ] Checklist item 2`;

      const validReview2 = `## Code Review Findings
@@ -10,5 +10,5 @@
- const x = 1;
+ const x = 2;
Looks good overall, reference exact line numbers above.`;

      expect(isCodeReview(validReview1)).toBe(true);
      expect(isCodeReview(validReview2)).toBe(true);
    });
  });

  describe("redact helper", () => {
    it("redacts sensitive tokens and keys from error messages", () => {
      expect(redact("Error with sk-or-1234567890abcdef")).toBe("Error with ***REDACTED***");
      expect(redact("Bearer ghp_abcdef1234567890123456")).toBe("Bearer ***REDACTED***");
      expect(redact('{"token":"secret_value_123"}')).toBe('{"token":"***REDACTED***"}');
      expect(redact('{"api_key":"sk_live_9999"}')).toBe('{"api_key":"***REDACTED***"}');
      expect(redact('{"secret":"my_webhook_secret"}')).toBe('{"secret":"***REDACTED***"}');
    });

    it("handles null, undefined, or empty text gracefully", () => {
      expect(redact(null)).toBe(null);
      expect(redact(undefined)).toBe(undefined);
      expect(redact("")).toBe("");
    });
  });

  describe("truncDiffForPrompt helper", () => {
    it("returns diff unmodified if under MAX_DIFF_CHARS", () => {
      const shortDiff = "diff --git a/file.js b/file.js\n+console.log('test')";
      expect(truncDiffForPrompt(shortDiff)).toBe(shortDiff);
    });

    it("truncates diff if exceeding MAX_DIFF_CHARS", () => {
      const longDiff = "x".repeat(MAX_DIFF_CHARS + 500);
      const truncated = truncDiffForPrompt(longDiff);
      expect(truncated.length).toBeLessThan(longDiff.length);
      expect(truncated).toContain("truncated 500 chars; full diff not sent to model");
    });
  });

  describe("generateFallbackReview helper", () => {
    it("generates structured markdown review with correct line/file counts", () => {
      const mockDiff = [
        "diff --git a/src/app.js b/src/app.js",
        "+const a = 1;",
        "-const a = 0;",
        "diff --git a/src/utils.js b/src/utils.js",
        "+const b = 2;",
      ].join("\n");

      const result = generateFallbackReview(42, "myowner", "myrepo", mockDiff);

      expect(result).toContain("## Automated PR Review (Fallback Mode)");
      expect(result).toContain("**PR #42** in `myowner/myrepo`");
      expect(result).toContain("- Files changed: 2");
      expect(result).toContain("- Lines added: 2");
      expect(result).toContain("- Lines removed: 1");
      expect(result).toContain("- Total diff lines: 5");
    });
  });

  describe("postComment helper", () => {
    it("prepends **Eve's comments:** header to PR comment body", async () => {
      let postedBody = "";
      globalThis.fetch = vi.fn().mockImplementation((url, opts) => {
        const bodyObj = JSON.parse(opts.body);
        postedBody = bodyObj.body;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ html_url: "https://github.com/test/comment/1" }),
        });
      });

      process.env.GITHUB_TOKEN = "test-token";
      await postComment("owner", "repo", 123, "Here is the review content.");

      expect(postedBody).toBe("**Eve's comments:**\n\nHere is the review content.");
    });

    it("does not duplicate **Eve's comments:** header if already present", async () => {
      let postedBody = "";
      globalThis.fetch = vi.fn().mockImplementation((url, opts) => {
        const bodyObj = JSON.parse(opts.body);
        postedBody = bodyObj.body;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ html_url: "https://github.com/test/comment/1" }),
        });
      });

      process.env.GITHUB_TOKEN = "test-token";
      await postComment("owner", "repo", 123, "**Eve's comments:**\n\nAlready formatted.");

      expect(postedBody).toBe("**Eve's comments:**\n\nAlready formatted.");
    });
  });

  describe("triggerRemoteEveWebhook helper", () => {
    it("computes SHA-256 and SHA-1 HMAC signature headers correctly", async () => {
      let sentHeaders = {};
      globalThis.fetch = vi.fn().mockImplementation((url, opts) => {
        sentHeaders = opts.headers;
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ message: "PR #157 synchronize acknowledged" })),
        });
      });

      const payload = JSON.stringify({ action: "synchronize", number: 157 });
      const secret = "test-secret-key";

      process.env.EVE_WEBHOOK_URL = "https://agent-eve-gold.vercel.app/api/github/webhook";
      process.env.EVE_WEBHOOK_SECRET = secret;
      process.env.GITHUB_TOKEN = "ghp_testtoken123";

      const result = await triggerRemoteEveWebhook(payload);

      const expectedHmac256 = "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
      const expectedHmac1 = "sha1=" + crypto.createHmac("sha1", secret).update(payload).digest("hex");

      expect(sentHeaders["X-Hub-Signature-256"]).toBe(expectedHmac256);
      expect(sentHeaders["X-Hub-Signature"]).toBe(expectedHmac1);
      expect(sentHeaders["X-Webhook-Secret"]).toBe(secret);
      expect(sentHeaders["Authorization"]).toBe(`Bearer ${secret}`);
      expect(sentHeaders["X-GitHub-Token"]).toBe("ghp_testtoken123");

      // Verifies acknowledgment message is NOT returned as code review (returns ackOnly)
      expect(result).toEqual({ ok: true, ackOnly: true });
    });

    it("returns review when remote response contains valid code review text", async () => {
      const mockReview = `## Remote Eve Code Review
- Lines added: 15
- [ ] Check security permissions
@@ -1,3 +1,4 @@
+ const secure = true;`;

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ review: mockReview })),
      });

      process.env.EVE_WEBHOOK_URL = "https://agent-eve-gold.vercel.app/api/github/webhook";
      process.env.EVE_WEBHOOK_SECRET = "secret";

      const result = await triggerRemoteEveWebhook("{}");

      expect(result).toEqual({ ok: true, review: mockReview });
    });

    it("returns { ok: false } when webhook returns HTTP error status", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Invalid signature"),
      });

      process.env.EVE_WEBHOOK_URL = "https://agent-eve-gold.vercel.app/api/github/webhook";

      const result = await triggerRemoteEveWebhook("{}");
      expect(result).toEqual({ ok: false });
    });
  });
});
