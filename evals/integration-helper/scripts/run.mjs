#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const evalRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(evalRoot, "..", "..");
const evalsPath = path.join(evalRoot, "evals.json");
const fixtureRoot = path.join(evalRoot, "fixtures");
const workspaceRoot = path.join(evalRoot, "workspace");
const skillSourcePath = path.join(repoRoot, ".agents", "skills", "integration-helper");
const judgeSchemaPath = path.join(evalRoot, "judge.schema.json");
const defaultScratchRoot = "/private/tmp/firebaseui-web-integration-helper-eval";
const variants = ["with_skill", "without_skill", "docs_dump"];

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const suite = JSON.parse(await readFile(evalsPath, "utf8"));

if (args.list) {
  console.log(`Skill: ${suite.skill_name}`);
  for (const testCase of suite.evals) {
    console.log(`- ${testCase.id}: ${testCase.name}`);
  }
  process.exit(0);
}

const selectedCases = selectCases(suite.evals, args.case);
const selectedVariants = selectVariants(args.variant);
const iteration = args.iteration ?? (await nextIterationNumber());
const iterationDir = path.join(workspaceRoot, `iteration-${iteration}`);
const scratchRoot = path.resolve(args.tmpRoot ?? defaultScratchRoot);
const startedAt = new Date().toISOString();

if (args.dryRun) {
  console.log(JSON.stringify({ iteration, selectedCases: selectedCases.map((c) => c.id), selectedVariants, scratchRoot }, null, 2));
  process.exit(0);
}

if (existsSync(iterationDir) && !args.force) {
  throw new Error(`Refusing to overwrite ${iterationDir}. Use --force or --iteration with a new number.`);
}

if (args.force) {
  await rm(iterationDir, { recursive: true, force: true });
}

await mkdir(iterationDir, { recursive: true });

const docsContext = await buildDocsContext();
const benchmark = {
  skill_name: suite.skill_name,
  started_at: startedAt,
  completed_at: null,
  iteration,
  variants: selectedVariants,
  cases: {},
  run_summary: {},
  deltas: {},
};

for (const testCase of selectedCases) {
  benchmark.cases[testCase.id] = {};

  for (const variant of selectedVariants) {
    console.log(`Running ${testCase.id} / ${variant}`);
    const result = await runCaseVariant({
      testCase,
      variant,
      iteration,
      iterationDir,
      scratchRoot,
      docsContext,
      skipLlmJudge: args.skipLlmJudge,
    });

    benchmark.cases[testCase.id][variant] = summarizeRun(result);
    await writeBenchmark(iterationDir, benchmark);
  }
}

benchmark.completed_at = new Date().toISOString();
benchmark.run_summary = summarizeBenchmark(benchmark.cases, selectedVariants);
benchmark.deltas = computeDeltas(benchmark.cases);
await writeBenchmark(iterationDir, benchmark);

console.log(`Eval complete: ${iterationDir}`);
console.log(JSON.stringify(benchmark.run_summary, null, 2));

async function runCaseVariant({
  testCase,
  variant,
  iteration,
  iterationDir,
  scratchRoot,
  docsContext,
  skipLlmJudge,
}) {
  const caseDir = path.join(iterationDir, testCase.id);
  const runDir = path.join(caseDir, variant);
  const outputsDir = path.join(runDir, "outputs");
  const scratchDir = path.join(scratchRoot, `iteration-${iteration}`, testCase.id, variant);

  await mkdir(runDir, { recursive: true });
  await rm(scratchDir, { recursive: true, force: true });
  await mkdir(path.dirname(scratchDir), { recursive: true });
  await copyDirectory(path.join(fixtureRoot, testCase.fixture), scratchDir);

  if (variant === "with_skill") {
    await copyDirectory(skillSourcePath, path.join(scratchDir, ".agents", "skills", "integration-helper"));
  }

  const prompt = buildRunPrompt({ testCase, variant, docsContext });
  await writeFile(path.join(runDir, "prompt.md"), prompt);
  await writeFile(
    path.join(runDir, "scratch.json"),
    JSON.stringify({ scratch_dir: scratchDir, fixture: testCase.fixture }, null, 2),
  );

  const codexResult = await runCodex({
    cwd: scratchDir,
    prompt,
    transcriptPath: path.join(runDir, "transcript.jsonl"),
    stderrPath: path.join(runDir, "stderr.log"),
    sandbox: "workspace-write",
  });

  await writeFile(path.join(runDir, "final-response.md"), codexResult.finalMessage || "");
  await writeFile(path.join(runDir, "timing.json"), JSON.stringify(codexResult.timing, null, 2));

  await rm(outputsDir, { recursive: true, force: true });
  await copyDirectory(scratchDir, outputsDir, {
    skipDirectoryNames: new Set([".agents", ".git", "node_modules", ".next", "dist", "build", ".angular"]),
  });

  const deterministic = await gradeDeterministic(testCase, outputsDir);
  let llm = {
    skipped: true,
    assertion_results: [],
    summary: { passed: 0, failed: 0, total: 0, pass_rate: null },
    overall_quality_score: null,
    utility_notes: "LLM judge skipped.",
  };
  let judgeTiming = null;

  if (!skipLlmJudge) {
    const judgeResult = await runLlmJudge({
      testCase,
      variant,
      outputsDir,
      finalMessage: codexResult.finalMessage,
      runDir,
      scratchRoot,
    });
    llm = judgeResult.grading;
    judgeTiming = judgeResult.timing;
  }

  const grading = combineGrades({ deterministic, llm, judgeTiming });
  await writeFile(path.join(runDir, "grading.json"), JSON.stringify(grading, null, 2));

  return {
    timing: codexResult.timing,
    grading,
  };
}

function buildRunPrompt({ testCase, variant, docsContext }) {
  const variantInstruction =
    variant === "with_skill"
      ? "A project skill is available at .agents/skills/integration-helper. Use that skill for FirebaseUI Web integration guidance."
      : variant === "docs_dump"
        ? "Do not use agent skills for this run. Use only the task, the fixture files, and the documentation context included below."
        : "Do not use agent skills for this run. Use only the task and fixture files.";

  const docsBlock =
    variant === "docs_dump"
      ? `\n\n## Documentation Context\n\n${docsContext}\n`
      : "";

  return `# Eval task: ${testCase.name}

${variantInstruction}

You are in a scratch app directory. Implement the requested change by editing files in this directory only. Keep the fixture's framework and style. Use public FirebaseUI Web v7 package imports. Do not import internal repository aliases such as "~/". Do not install dependencies; update package.json when dependencies are needed. If a Firebase Console provider must be enabled for the flow, mention it in EVAL_NOTES.md or the final response.

## User task

${testCase.prompt}

## Expected output

${testCase.expected_output}
${docsBlock}
When finished, reply with a concise summary of what changed and any commands you would run to verify it.`;
}

async function buildDocsContext() {
  const docs = [
    ["README.md", path.join(repoRoot, "README.md")],
    ["MIGRATION.md", path.join(repoRoot, "MIGRATION.md")],
    ["CUSTOM_AUTHENTICATION.md", path.join(repoRoot, "CUSTOM_AUTHENTICATION.md")],
    ["integration-helper/SKILL.md", path.join(skillSourcePath, "SKILL.md")],
    ["integration-helper/references/framework-setup.md", path.join(skillSourcePath, "references", "framework-setup.md")],
    ["integration-helper/references/auth-flows.md", path.join(skillSourcePath, "references", "auth-flows.md")],
    [
      "integration-helper/references/customization-and-migration.md",
      path.join(skillSourcePath, "references", "customization-and-migration.md"),
    ],
  ];

  const parts = [];
  for (const [label, filePath] of docs) {
    const content = await readFile(filePath, "utf8");
    parts.push(`### ${label}\n\n${content}`);
  }
  return parts.join("\n\n---\n\n");
}

async function runCodex({ cwd, prompt, transcriptPath, stderrPath, sandbox, outputSchema }) {
  const args = [
    "--ask-for-approval",
    "never",
    "--sandbox",
    sandbox,
    "exec",
    "--json",
    "--ephemeral",
    "--skip-git-repo-check",
    "-C",
    cwd,
  ];

  if (outputSchema) {
    args.push("--output-schema", outputSchema);
  }

  args.push("-");

  const started = Date.now();
  const child = spawn("codex", args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  child.stdin.on("error", () => {});
  child.stdin.end(prompt);

  const exitCode = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });

  const durationMs = Date.now() - started;
  await writeFile(transcriptPath, stdout);
  await writeFile(stderrPath, stderr);

  const events = parseJsonl(stdout);
  const finalMessage = events
    .filter((event) => event.type === "item.completed" && event.item?.type === "agent_message")
    .map((event) => event.item.text)
    .at(-1);
  const usage = events.findLast?.((event) => event.type === "turn.completed" && event.usage)?.usage
    ?? [...events].reverse().find((event) => event.type === "turn.completed" && event.usage)?.usage
    ?? {};
  const toolActionCount = countActionEvents(events);
  const referenceDiscipline = collectReferenceDiscipline(stdout);
  const turnError =
    events.find((event) => event.type === "turn.failed")?.error?.message
    ?? events.find((event) => event.type === "error")?.message
    ?? null;

  return {
    exitCode,
    finalMessage,
    events,
    timing: normalizeTiming({ usage, durationMs, exitCode, toolActionCount, referenceDiscipline, turnError }),
  };
}

function normalizeTiming({ usage, durationMs, exitCode, toolActionCount, referenceDiscipline, turnError }) {
  const inputTokens = usage.input_tokens ?? 0;
  const cachedInputTokens = usage.cached_input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const reasoningOutputTokens = usage.reasoning_output_tokens ?? 0;

  return {
    input_tokens: inputTokens,
    cached_input_tokens: cachedInputTokens,
    uncached_input_tokens: Math.max(inputTokens - cachedInputTokens, 0),
    output_tokens: outputTokens,
    reasoning_output_tokens: reasoningOutputTokens,
    total_tokens: inputTokens + outputTokens,
    duration_ms: durationMs,
    exit_code: exitCode,
    successful_turn: exitCode === 0 && turnError === null,
    turn_error: turnError,
    tool_action_count: toolActionCount,
    reference_discipline: referenceDiscipline,
  };
}

function countActionEvents(events) {
  const actionItemIds = new Set();
  for (const event of events) {
    if (!["item.started", "item.completed"].includes(event.type)) continue;
    if (!["command_execution", "file_change"].includes(event.item?.type)) continue;
    actionItemIds.add(event.item.id);
  }
  return actionItemIds.size;
}

function collectReferenceDiscipline(transcriptText) {
  const referencePatterns = [
    /\.agents\/skills\/integration-helper\/SKILL\.md/g,
    /\.agents\/skills\/integration-helper\/references\/framework-setup\.md/g,
    /\.agents\/skills\/integration-helper\/references\/auth-flows\.md/g,
    /\.agents\/skills\/integration-helper\/references\/customization-and-migration\.md/g,
  ];
  const broadDocPatterns = [
    /(^|[^/])README\.md/g,
    /(^|[^/])MIGRATION\.md/g,
    /(^|[^/])CUSTOM_AUTHENTICATION\.md/g,
  ];

  return {
    integration_helper_mentions: countPatternMentions(transcriptText, referencePatterns),
    broad_doc_mentions: countPatternMentions(transcriptText, broadDocPatterns),
  };
}

function countPatternMentions(text, patterns) {
  return patterns.reduce((count, pattern) => count + [...text.matchAll(pattern)].length, 0);
}

function parseJsonl(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{"))
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function gradeDeterministic(testCase, outputsDir) {
  const assertionResults = [];
  const files = await collectTextFiles(outputsDir);
  const allText = files.map((file) => `\n--- ${path.relative(outputsDir, file.path)} ---\n${file.content}`).join("\n");

  for (const assertion of testCase.deterministic_assertions ?? []) {
    const result = await runDeterministicAssertion(assertion, outputsDir, files, allText);
    assertionResults.push({
      id: assertion.id,
      text: assertion.description,
      ...result,
    });
  }

  return {
    assertion_results: assertionResults,
    summary: summarizeAssertions(assertionResults),
  };
}

async function runDeterministicAssertion(assertion, outputsDir, files, allText) {
  if (assertion.type === "package_dependency") {
    const packageJsonPath = path.join(outputsDir, assertion.package_json_path ?? "package.json");
    if (!existsSync(packageJsonPath)) {
      return { passed: false, evidence: "package.json was not found." };
    }
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    const dependencyGroups = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
    const group = dependencyGroups.find((key) => packageJson[key]?.[assertion.name]);
    return group
      ? { passed: true, evidence: `Found ${assertion.name} in ${group}.` }
      : { passed: false, evidence: `Did not find ${assertion.name} in package dependency fields.` };
  }

  if (assertion.type === "path_exists") {
    const target = path.join(outputsDir, assertion.path);
    return existsSync(target)
      ? { passed: true, evidence: `Found ${assertion.path}.` }
      : { passed: false, evidence: `Missing ${assertion.path}.` };
  }

  if (assertion.type === "any_file_contains") {
    const regex = new RegExp(assertion.pattern, "i");
    const match = files.find((file) => regex.test(file.content));
    return match
      ? { passed: true, evidence: `Matched ${assertion.pattern} in ${path.relative(outputsDir, match.path)}.` }
      : { passed: false, evidence: `No text file matched ${assertion.pattern}.` };
  }

  if (assertion.type === "forbidden_any_file_contains") {
    const regex = new RegExp(assertion.pattern, "i");
    const match = files.find((file) => regex.test(file.content));
    return match
      ? { passed: false, evidence: `Forbidden pattern ${assertion.pattern} matched ${path.relative(outputsDir, match.path)}.` }
      : { passed: true, evidence: `Forbidden pattern ${assertion.pattern} was not found.` };
  }

  if (assertion.type === "all_files_do_not_contain") {
    const regex = new RegExp(assertion.pattern, "i");
    return regex.test(allText)
      ? { passed: false, evidence: `Forbidden pattern ${assertion.pattern} was found.` }
      : { passed: true, evidence: `Forbidden pattern ${assertion.pattern} was not found.` };
  }

  return { passed: false, evidence: `Unknown assertion type: ${assertion.type}.` };
}

async function runLlmJudge({ testCase, variant, outputsDir, finalMessage, runDir, scratchRoot }) {
  const outputSummary = await buildOutputSummary(outputsDir);
  const prompt = `You are grading a local Agent Skill eval run. Grade only the provided output evidence. Require concrete evidence for PASS. Do not assume missing files exist.

Case: ${testCase.name}
Variant: ${variant}

Expected output:
${testCase.expected_output}

Assertions:
${(testCase.llm_assertions ?? []).map((assertion, index) => `${index + 1}. ${assertion}`).join("\n")}

Agent final response:
${finalMessage || "(empty)"}

Output files:
${outputSummary}

Return JSON matching the requested schema. Use assertion ids L1, L2, etc.`;

  const judgeDir = path.join(scratchRoot, "judge", stableId(`${testCase.id}-${variant}-${Date.now()}`));
  await mkdir(judgeDir, { recursive: true });

  const codexResult = await runCodex({
    cwd: judgeDir,
    prompt,
    transcriptPath: path.join(runDir, "judge-transcript.jsonl"),
    stderrPath: path.join(runDir, "judge-stderr.log"),
    sandbox: "read-only",
    outputSchema: judgeSchemaPath,
  });

  let grading;
  try {
    grading = JSON.parse(codexResult.finalMessage);
  } catch {
    grading = {
      assertion_results: [],
      summary: { passed: 0, failed: 0, total: 0, pass_rate: 0 },
      overall_quality_score: 1,
      utility_notes: "Judge did not return parseable JSON.",
    };
  }

  return {
    grading,
    timing: codexResult.timing,
  };
}

function combineGrades({ deterministic, llm, judgeTiming }) {
  const deterministicSummary = deterministic.summary;
  const llmSummary = llm.summary ?? { passed: 0, failed: 0, total: 0, pass_rate: null };
  const llmTotal = llmSummary.total ?? 0;
  const totalPassed = deterministicSummary.passed + (llmSummary.passed ?? 0);
  const total = deterministicSummary.total + llmTotal;

  return {
    deterministic,
    llm,
    judge_timing: judgeTiming,
    summary: {
      passed: totalPassed,
      failed: total - totalPassed,
      total,
      pass_rate: total === 0 ? 0 : totalPassed / total,
      deterministic_pass_rate: deterministicSummary.pass_rate,
      llm_pass_rate: llm.skipped ? null : llmSummary.pass_rate,
      overall_quality_score: llm.overall_quality_score ?? null,
    },
  };
}

async function buildOutputSummary(outputsDir) {
  const files = await collectTextFiles(outputsDir);
  const tree = files.map((file) => path.relative(outputsDir, file.path)).sort().join("\n");
  let remaining = 28000;
  const excerpts = [];

  for (const file of files.sort((a, b) => a.path.localeCompare(b.path))) {
    if (remaining <= 0) break;
    const relativePath = path.relative(outputsDir, file.path);
    const excerpt = file.content.slice(0, Math.min(file.content.length, 4000, remaining));
    remaining -= excerpt.length;
    excerpts.push(`--- ${relativePath} ---\n${excerpt}`);
  }

  return `Tree:\n${tree}\n\nExcerpts:\n${excerpts.join("\n\n")}`;
}

async function collectTextFiles(root) {
  const files = [];
  await walk(root, async (filePath, dirent) => {
    if (!dirent.isFile()) return;
    if (!isTextFile(filePath)) return;
    const content = await readFile(filePath, "utf8");
    files.push({ path: filePath, content });
  });
  return files;
}

function isTextFile(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);
  return (
    [
      ".css",
      ".html",
      ".js",
      ".jsx",
      ".json",
      ".md",
      ".mjs",
      ".scss",
      ".ts",
      ".tsx",
      ".txt",
      ".yaml",
      ".yml",
    ].includes(ext) || basename === "Dockerfile"
  );
}

async function copyDirectory(source, destination, options = {}) {
  const skipDirectoryNames = options.skipDirectoryNames ?? new Set();
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && skipDirectoryNames.has(entry.name)) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath, options);
    } else if (entry.isFile()) {
      await mkdir(path.dirname(destinationPath), { recursive: true });
      await cp(sourcePath, destinationPath);
    }
  }
}

async function walk(root, callback) {
  if (!existsSync(root)) return;
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (["node_modules", ".git", ".agents", ".next", "dist", "build", ".angular"].includes(entry.name)) continue;
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await walk(entryPath, callback);
    } else {
      await callback(entryPath, entry);
    }
  }
}

function summarizeAssertions(assertionResults) {
  const total = assertionResults.length;
  const passed = assertionResults.filter((result) => result.passed).length;
  return {
    passed,
    failed: total - passed,
    total,
    pass_rate: total === 0 ? 0 : passed / total,
  };
}

function summarizeRun(result) {
  return {
    timing: result.timing,
    pass_rate: result.grading.summary.pass_rate,
    deterministic_pass_rate: result.grading.summary.deterministic_pass_rate,
    llm_pass_rate: result.grading.summary.llm_pass_rate,
    overall_quality_score: result.grading.summary.overall_quality_score,
  };
}

function summarizeBenchmark(cases, selectedVariants) {
  const summary = {};
  for (const variant of selectedVariants) {
    const runs = Object.values(cases)
      .map((caseRuns) => caseRuns[variant])
      .filter(Boolean);
    const successfulRuns = runs.filter((run) => run.timing.successful_turn);
    summary[variant] = {
      successful_turn_rate: stats(runs.map((run) => (run.timing.successful_turn ? 1 : 0))),
      pass_rate: stats(runs.map((run) => run.pass_rate)),
      deterministic_pass_rate: stats(runs.map((run) => run.deterministic_pass_rate)),
      llm_pass_rate: stats(runs.map((run) => run.llm_pass_rate)),
      quality_score: stats(runs.map((run) => run.overall_quality_score).filter((value) => typeof value === "number")),
      tokens: stats(successfulRuns.map((run) => run.timing.total_tokens)),
      input_tokens: stats(successfulRuns.map((run) => run.timing.input_tokens)),
      uncached_input_tokens: stats(successfulRuns.map((run) => run.timing.uncached_input_tokens)),
      output_tokens: stats(successfulRuns.map((run) => run.timing.output_tokens)),
      duration_ms: stats(runs.map((run) => run.timing.duration_ms)),
      tool_action_count: stats(runs.map((run) => run.timing.tool_action_count)),
    };
  }
  return summary;
}

function computeDeltas(cases) {
  const deltas = {};
  for (const [caseId, caseRuns] of Object.entries(cases)) {
    const withSkill = caseRuns.with_skill;
    const withoutSkill = caseRuns.without_skill;
    const docsDump = caseRuns.docs_dump;
    deltas[caseId] = {};

    if (withSkill?.timing.successful_turn && docsDump?.timing.successful_turn) {
      deltas[caseId].with_skill_vs_docs_dump = {
        token_delta: withSkill.timing.total_tokens - docsDump.timing.total_tokens,
        token_savings_ratio:
          docsDump.timing.total_tokens === 0
            ? null
            : 1 - withSkill.timing.total_tokens / docsDump.timing.total_tokens,
        pass_rate_delta: withSkill.pass_rate - docsDump.pass_rate,
        quality_delta:
          typeof withSkill.overall_quality_score === "number" && typeof docsDump.overall_quality_score === "number"
            ? withSkill.overall_quality_score - docsDump.overall_quality_score
            : null,
      };
    }

    if (withSkill?.timing.successful_turn && withoutSkill?.timing.successful_turn) {
      deltas[caseId].with_skill_vs_without_skill = {
        token_delta: withSkill.timing.total_tokens - withoutSkill.timing.total_tokens,
        pass_rate_delta: withSkill.pass_rate - withoutSkill.pass_rate,
        quality_delta:
          typeof withSkill.overall_quality_score === "number" && typeof withoutSkill.overall_quality_score === "number"
            ? withSkill.overall_quality_score - withoutSkill.overall_quality_score
            : null,
      };
    }
  }
  return deltas;
}

function stats(values) {
  const clean = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (clean.length === 0) {
    return { mean: null, stddev: null, min: null, max: null, count: 0 };
  }
  const mean = clean.reduce((sum, value) => sum + value, 0) / clean.length;
  const variance = clean.reduce((sum, value) => sum + (value - mean) ** 2, 0) / clean.length;
  return {
    mean,
    stddev: Math.sqrt(variance),
    min: Math.min(...clean),
    max: Math.max(...clean),
    count: clean.length,
  };
}

async function writeBenchmark(iterationDir, benchmark) {
  await writeFile(path.join(iterationDir, "benchmark.json"), JSON.stringify(benchmark, null, 2));
}

async function nextIterationNumber() {
  if (!existsSync(workspaceRoot)) return 1;
  const entries = await readdir(workspaceRoot, { withFileTypes: true });
  const numbers = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => /^iteration-(\d+)$/.exec(entry.name)?.[1])
    .filter(Boolean)
    .map(Number);
  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
}

function selectCases(allCases, requestedCases) {
  if (requestedCases.length === 0) return allCases;
  const byId = new Map(allCases.map((testCase) => [testCase.id, testCase]));
  return requestedCases.map((id) => {
    const testCase = byId.get(id);
    if (!testCase) throw new Error(`Unknown case: ${id}`);
    return testCase;
  });
}

function selectVariants(requestedVariants) {
  if (requestedVariants.length === 0) return variants;
  for (const variant of requestedVariants) {
    if (!variants.includes(variant)) {
      throw new Error(`Unknown variant: ${variant}. Expected one of ${variants.join(", ")}.`);
    }
  }
  return requestedVariants;
}

function stableId(input) {
  return createHash("sha256").update(input).digest("hex").slice(0, 12);
}

function parseArgs(argv) {
  const parsed = {
    case: [],
    variant: [],
    dryRun: false,
    force: false,
    help: false,
    iteration: null,
    list: false,
    skipLlmJudge: false,
    tmpRoot: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--case") parsed.case.push(readValue(argv, ++index, arg));
    else if (arg === "--variant") parsed.variant.push(readValue(argv, ++index, arg));
    else if (arg === "--iteration") parsed.iteration = Number(readValue(argv, ++index, arg));
    else if (arg === "--tmp-root") parsed.tmpRoot = readValue(argv, ++index, arg);
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--force") parsed.force = true;
    else if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--list") parsed.list = true;
    else if (arg === "--skip-llm-judge") parsed.skipLlmJudge = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (parsed.iteration !== null && (!Number.isInteger(parsed.iteration) || parsed.iteration < 1)) {
    throw new Error("--iteration must be a positive integer.");
  }

  return parsed;
}

function readValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function printHelp() {
  console.log(`Usage: node scripts/run.mjs [options]

Options:
  --list                 List eval cases.
  --case <id>            Run one case. Repeat to run multiple cases.
  --variant <name>       Run one variant: with_skill, without_skill, docs_dump.
  --iteration <n>        Write to a specific iteration number.
  --tmp-root <path>      Scratch root outside the repo. Defaults to ${defaultScratchRoot}.
  --skip-llm-judge       Skip model-based grading.
  --dry-run              Print the selected matrix without invoking Codex.
  --force                Overwrite an existing iteration directory.
  --help                 Show this help.
`);
}
