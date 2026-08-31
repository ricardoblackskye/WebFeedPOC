import fs from "fs";

// Read the GitHub event payload
const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.error("GITHUB_EVENT_PATH environment variable is not set.");
  process.exit(1);
}

let event;
try {
  const eventContent = fs.readFileSync(eventPath, "utf8"); // Synchronous is acceptable at startup
  event = JSON.parse(eventContent);
} catch (error) {
  console.error("Failed to read or parse GitHub event:", error);
  process.exit(1);
}

// Extract PR information
let prNumber;
let repoOwner;
let repoName;
let prDiffUrl;

if (event.pull_request) {
  prNumber = event.pull_request.number;
  repoOwner = event.pull_request.base.repo.owner.login;
  repoName = event.pull_request.base.repo.name;
  prDiffUrl = event.pull_request.diff_url;
} else if (event.issue && event.issue.pull_request) {
  // Handle issue events that are actually PRs (like labeled, etc.)
  prNumber = event.issue.number;
  repoOwner = event.repository.owner.login;
  repoName = event.repository.name;
  // We need to get the diff URL from the API or construct it
  prDiffUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}.diff`;
} else {
  console.error("Event does not contain pull request information:", event);
  process.exit(1);
}

console.log(`Processing PR #${prNumber} in ${repoOwner}/${repoName}`);

// Fetch the PR diff
let prDiff;
try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  const diffResponse = await fetch(prDiffUrl, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.diff",
      "User-Agent": "webfeed-poc-pr-reviewer/1.0",
    },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!diffResponse.ok) {
    throw new Error(
      `Failed to fetch diff: ${diffResponse.status} ${diffResponse.statusText}`,
    );
  }

  prDiff = await diffResponse.text();
  console.log(`Fetched diff of length ${prDiff.length}`);
} catch (error) {
  console.error("Error fetching PR diff:", error);
  process.exit(1);
}

// Sanitize PR diff to prevent prompt injection (escape backticks)
const sanitizedPrDiff = prDiff.replace(/`/g, "\\`");

// Call OpenRouter API to generate review, with fallback for rate limits / transient errors
let review;
try {
  review = await generateAiReview(prNumber, repoOwner, repoName, prDiff, sanitizedPrDiff);
} catch (error) {
  console.error(`Error calling OpenRouter: ${error.message}`);
  console.warn("Using fallback review.");
  review = generateFallbackReview(prNumber, repoOwner, repoName, prDiff);
}

// Generate the AI review by calling OpenRouter. Performs up to two attempts:
// a normal one, then (on failure or a low-quality/refusal response) a stricter
// prompt. Returns a string (the AI review, or the fallback review if the model
// is unavailable or never returns a usable review).
async function generateAiReview(number, owner, repo, diff, sanitizedDiff) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is not set; using fallback review.");
    return generateFallbackReview(number, owner, repo, diff);
  }

  const userPrompt = `Please review the following diff and provide your feedback with specific line number citations:\n\n\`\`\`diff\n${sanitizedDiff}\n\`\`\``;

  const SYSTEM_NORMAL =
    "You are a senior software engineer reviewing this code diff. Look for architectural anti-patterns, security risks, and off-by-one errors. You MUST reference the exact line numbers from the diff headers (@@ -x,y +a,b @@) in your feedback.";
  const SYSTEM_STRICT =
    "You are a senior software engineer performing a CODE REVIEW of a diff provided below inside a fenced ```diff block. " +
    "Output a markdown code review with concrete findings (architectural anti-patterns, security risks, bugs). " +
    "Cite exact line numbers from the diff headers (@@ -x,y +a,b @@). " +
    "Do NOT say you need the diff or ask for more context — the diff is already given above. " +
    "If the diff looks fine, say so and list only minor suggestions.";

  // Reject degenerate/refusal responses that don't actually review the code.
  const looksLikeReview = (text) => {
    if (text.trim().length < 150) return false;
    return /review|issue|risk|suggest|concern|bug|improv|line|@@|```|anti-pattern|security|refactor|\btodo\b/i.test(
      text,
    );
  };

  // Returns { ok:true, content } for a usable review, or { ok:false }.
  const attempt = async (systemPrompt) => {
    let openrouterResponse;
    try {
      openrouterResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.MODEL_NAME,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
            max_tokens: 2500,
          }),
        },
      );
    } catch (fetchError) {
      console.warn(`OpenRouter request threw: ${fetchError.message}`);
      return { ok: false };
    }

    console.log(`OpenRouter response status: ${openrouterResponse.status}`);

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.warn(
        `OpenRouter call failed (${openrouterResponse.status}). Response: ${errorText.slice(0, 500)}`,
      );
      return { ok: false };
    }

    let data;
    try {
      data = await openrouterResponse.json();
    } catch (e) {
      console.warn("OpenRouter returned a non-JSON 200 response; using fallback review.");
      return { ok: false };
    }

    const choice = data.choices && data.choices[0];
    const message = choice && choice.message;
    const content =
      (message && message.content) || (message && message.reasoning) || "";
    if (!content.trim()) {
      console.warn(
        `OpenRouter returned an empty/invalid review payload (choices present: ${Boolean(data.choices)}). Body head: ${JSON.stringify(data).slice(0, 500)}`,
      );
      return { ok: false };
    }
    if (!looksLikeReview(content)) {
      console.warn(
        `OpenRouter returned a low-quality/non-review response (len ${content.length}); will retry with stricter prompt. Head: ${content.slice(0, 200)}`,
      );
      return { ok: false };
    }
    return { ok: true, content };
  };

  let result = await attempt(SYSTEM_NORMAL);
  if (!result.ok) {
    console.warn("Retrying OpenRouter call with stricter prompt...");
    result = await attempt(SYSTEM_STRICT);
  }
  if (!result.ok) {
    console.warn("OpenRouter review unavailable after retry, using fallback review.");
    return generateFallbackReview(number, owner, repo, diff);
  }
  console.log(`Generated review of length ${result.content.length}`);
  return result.content;
}

// Generate a deterministic fallback review when the model is unavailable
function generateFallbackReview(number, owner, repo, diff) {
  const lineCount = diff.split("\n").length;
  const addedLines = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const removedLines = diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).length;
  const filesChanged = (diff.match(/diff --git/g) || []).length;

  return [
    "## Automated PR Review (Fallback Mode)",
    "",
    "> ⚠️ The AI model was unavailable (rate-limited or offline). This is a structural review only — please review manually for deeper analysis.",
    "",
    `**PR #${number}** in \`${owner}/${repo}\``,
    "",
    "### Summary",
    `- Files changed: ${filesChanged || "N/A"}`,
    `- Lines added: ${addedLines}`,
    `- Lines removed: ${removedLines}`,
    `- Total diff lines: ${lineCount}`,
    "",
    "### Checklist",
    "- [ ] No secrets or credentials committed",
    "- [ ] Error handling covers edge cases",
    "- [ ] Tests added for new behavior",
    "- [ ] Documentation updated if needed",
    "- [ ] No breaking changes to public APIs",
    "",
    "Please address the above items and request a re-review once the AI model is available.",
  ].join("\n");
}

// Handle large diffs by truncating if necessary (though we already sent the full diff,
// we could add a note if it was very large)
if (prDiff.length > 100000) {
  console.log(
    `Warning: PR diff was large (${prDiff.length} bytes), consider implementing summarization for very large PRs`,
  );
}

// Post the review as a comment on the PR
try {
  const commentResponse = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${prNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: review }),
    },
  );

  if (!commentResponse.ok) {
    const errorText = await commentResponse.text();
    throw new Error(
      `Failed to post comment: ${commentResponse.status} ${commentResponse.statusText}\nResponse: ${errorText}`,
    );
  }

  const result = await commentResponse.json();
  console.log(`Posted comment: ${result.html_url}`);
} catch (error) {
  console.error("Error posting comment:", error);
  process.exit(1);
}

console.log("PR reviewer completed successfully.");
