#!/usr/bin/env node
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compileReferenceTracker } from "../runners/shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const evalRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(evalRoot, "..", "..");
const canonicalEvalsPath = path.join(repoRoot, ".agents", "skills", "integration-helper", "evals.json");
if (!existsSync(canonicalEvalsPath)) {
  throw new Error(`Expected integration-helper eval suite at ${canonicalEvalsPath}.`);
}
const evalsPath = canonicalEvalsPath;
const fixtureRoot = path.join(evalRoot, "fixtures");
const workspaceRoot = path.join(evalRoot, "workspace");
const judgeSchemaPath = path.join(evalRoot, "judge.schema.json");
const packageJsonPath = path.join(evalRoot, "package.json");
const defaultScratchRoot = path.join(os.tmpdir(), "firebaseui-web-integration-helper-eval");
const runnerLoaders = {
  codex: () => import("../runners/codex.mjs").then((module) => module.codexRunner),
  cursor: () => import("../runners/cursor.mjs").then((module) => module.cursorRunner),
  opencode: () => import("../runners/opencode.mjs").then((module) => module.opencodeRunner),
};
const runnerIds = Object.keys(runnerLoaders);

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const suite = JSON.parse(await readFile(evalsPath, "utf8"));
const harnessPackage = JSON.parse(await readFile(packageJsonPath, "utf8"));
const variants = suite.variants ?? ["with_skill", "without_skill", "docs_dump"];
const selectedCases = selectCases(suite.evals, args.case);
const selectedVariants = selectVariants(args.variant, variants);
const iteration = args.iteration ?? (await nextIterationNumber());
const iterationDir = path.join(workspaceRoot, `iteration-${iteration}`);
const scratchRoot = path.resolve(args.tmpRoot ?? defaultScratchRoot);
const startedAt = new Date().toISOString();
const judgeRunnerId = args.skipLlmJudge || args.judgeRunner === "none"
  ? null
  : (args.judgeRunner ?? args.runner);

if (args.list) {
  console.log(`Skill: ${suite.skill_name}`);
  console.log(`Supported runners: ${runnerIds.join(", ")}`);
  for (const testCase of suite.evals) {
    console.log(`- ${testCase.id}: ${testCase.name}`);
  }
  process.exit(0);
}

const skillSourcePath = resolveSkillSourcePath({ suite, repoRoot, skillPathArg: args.skillPath });
const docsContext = args.docsMode === "none"
  ? ""
  : await buildDocsContext({ suite, repoRoot, skillSourcePath });
const referenceTracker = compileReferenceTracker(suite.tracked_reference_sets);
const harnessGitSha = await resolveGitSha(repoRoot);

if (args.dryRun) {
  console.log(JSON.stringify({
    iteration,
    runner: args.runner,
    judgeRunner: judgeRunnerId,
    selectedCases: selectedCases.map((testCase) => testCase.id),
    selectedVariants,
    scratchRoot,
    skillSourcePath,
  }, null, 2));
  process.exit(0);
}

if (existsSync(iterationDir) && !args.force) {
  throw new Error(`Refusing to overwrite ${iterationDir}. Use --force or --iteration with a new number.`);
}

if (args.force) {
  await rm(iterationDir, { recursive: true, force: true });
}

await mkdir(iterationDir, { recursive: true });

const benchmark = {
  skill_name: suite.skill_name,
  started_at: startedAt,
  completed_at: null,
  iteration,
  runner: args.runner,
  judge_runner: judgeRunnerId,
  harness_version: harnessPackage.version ?? null,
  git_sha: harnessGitSha,
  variants: selectedVariants,
  cases: {},
  run_summary: {},
  deltas: {},
};

for (const testCase of selectedCases) {
  benchmark.cases[testCase.id] = {};

  for (const variant of selectedVariants) {
    console.log(`Running ${testCase.id} / ${variant} with ${args.runner}`);
    const result = await runCaseVariant({
      suite,
      testCase,
      variant,
      iteration,
      iterationDir,
      scratchRoot,
      docsContext,
      skillSourcePath,
      runnerId: args.runner,
      judgeRunnerId,
      runnerOptions: buildRunnerOptions(args),
      referenceTracker,
      harnessVersion: harnessPackage.version ?? null,
      harnessGitSha,
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
  suite,
  testCase,
  variant,
  iteration,
  iterationDir,
  scratchRoot,
  docsContext,
  skillSourcePath,
  runnerId,
  judgeRunnerId,
  runnerOptions,
  referenceTracker,
  harnessVersion,
  harnessGitSha,
}) {
  const caseDir = path.join(iterationDir, testCase.id);
  const runDir = path.join(caseDir, variant);
  const outputsDir = path.join(runDir, "outputs");
  const scratchDir = path.join(scratchRoot, `iteration-${iteration}`, testCase.id, variant);
  const startedAtIso = new Date().toISOString();

  await mkdir(runDir, { recursive: true });
  await rm(scratchDir, { recursive: true, force: true });
  await mkdir(path.dirname(scratchDir), { recursive: true });
  await copyDirectory(path.join(fixtureRoot, testCase.fixture), scratchDir);

  if (variant === "with_skill") {
    await copyDirectory(skillSourcePath, path.join(scratchDir, ".agents", "skills", suite.skill_name), {
      skipFileNames: new Set(["evals.json"]),
    });
  }

  const prompt = buildRunPrompt({ suite, testCase, variant, docsContext });
  await writeFile(path.join(runDir, "prompt.md"), prompt);
  await writeFile(
    path.join(runDir, "scratch.json"),
    JSON.stringify({ scratch_dir: scratchDir, fixture: testCase.fixture }, null, 2),
  );

  try {
    const runResult = await runAgent({
      runnerId,
      cwd: scratchDir,
      prompt,
      sandbox: "workspace-write",
      outputSchemaPath: null,
      referenceTracker,
      runnerOptions,
    });

    await writeFile(path.join(runDir, "transcript.jsonl"), runResult.rawTranscript ?? "");
    await writeFile(path.join(runDir, "stderr.log"), runResult.rawStderr ?? "");
    await writeFile(path.join(runDir, "final-response.md"), runResult.finalAssistantText || "");
    await writeFile(path.join(runDir, "timing.json"), JSON.stringify(runResult.timing, null, 2));

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
    let judgeMetadata = null;

    if (judgeRunnerId && runResult.timing.successful_turn) {
      const judgeResult = await runLlmJudge({
        testCase,
        variant,
        outputsDir,
        finalMessage: runResult.finalAssistantText,
        runDir,
        scratchRoot,
        runnerId: judgeRunnerId,
        runnerOptions,
      });
      llm = judgeResult.grading;
      judgeTiming = judgeResult.timing;
      judgeMetadata = judgeResult.metadata;
    } else if (judgeRunnerId) {
      llm = {
        skipped: true,
        assertion_results: [],
        summary: { passed: 0, failed: 0, total: 0, pass_rate: null },
        overall_quality_score: null,
        utility_notes: `Judge skipped because the main ${runnerId} run did not finish successfully.`,
      };
    }

    const grading = combineGrades({ deterministic, llm, judgeTiming });
    await writeFile(path.join(runDir, "grading.json"), JSON.stringify(grading, null, 2));
    await writeFile(
      path.join(runDir, "manifest.json"),
      JSON.stringify({
        skill_name: suite.skill_name,
        case_id: testCase.id,
        variant,
        fixture: testCase.fixture,
        runner: runnerId,
        judge_runner: judgeRunnerId,
        harness_version: harnessVersion,
        git_sha: harnessGitSha,
        scratch_dir: scratchDir,
        started_at: startedAtIso,
        completed_at: new Date().toISOString(),
        runner_metadata: runResult.metadata ?? {},
        judge_runner_metadata: judgeMetadata,
      }, null, 2),
    );

    return {
      timing: runResult.timing,
      grading,
    };
  } catch (error) {
    const message = formatError(error);
    throw new Error(
      `Eval failed for ${testCase.id}/${variant} with runner ${runnerId}: ${message}`,
      { cause: error },
    );
  }
}

function buildRunPrompt({ suite, testCase, variant, docsContext }) {
  const skillMountPath = `.agents/skills/${suite.skill_name}`;
  const variantInstruction =
    variant === "with_skill"
      ? `A project skill is available at ${skillMountPath}. Use that skill for FirebaseUI Web integration guidance.`
      : variant === "docs_dump"
        ? "Do not use agent skills for this run. Use only the task, the fixture files, and the documentation context included below."
        : "Do not use agent skills for this run. Use only the task and fixture files.";

  const docsBlock =
    variant === "docs_dump" && docsContext
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

async function buildDocsContext({ suite, repoRoot, skillSourcePath }) {
  const docs = suite.docs_bundle ?? [];
  const parts = [];
  const configuredSkillPath = suite.skill_path ? path.normalize(suite.skill_path) : null;

  for (const doc of docs) {
    const normalizedDocPath = path.normalize(doc.path);
    const filePath =
      configuredSkillPath && (normalizedDocPath === configuredSkillPath || normalizedDocPath.startsWith(`${configuredSkillPath}${path.sep}`))
        ? path.join(skillSourcePath, path.relative(configuredSkillPath, normalizedDocPath))
        : path.resolve(repoRoot, doc.path);
    const content = await readFile(filePath, "utf8");
    parts.push(`### ${doc.label ?? doc.path}\n\n${content}`);
  }

  return parts.join("\n\n---\n\n");
}

function resolveSkillSourcePath({ suite, repoRoot, skillPathArg }) {
  const configuredPath = skillPathArg ?? suite.skill_path ?? path.join(".agents", "skills", suite.skill_name);
  const resolvedPath = path.resolve(repoRoot, configuredPath);
  if (!existsSync(resolvedPath)) {
    throw new Error(`Skill source path does not exist: ${resolvedPath}`);
  }
  return resolvedPath;
}

function buildRunnerOptions(args) {
  return {
    cursorApiKey: args.cursorApiKey ?? null,
    cursorModel: args.cursorModel ?? null,
    opencodeAgent: args.opencodeAgent ?? null,
    opencodeCommand: args.opencodeCommand ?? null,
    opencodeModel: args.opencodeModel ?? null,
    opencodeTimeoutMs: args.opencodeTimeoutMs ?? null,
    opencodeVariant: args.opencodeVariant ?? null,
  };
}

async function runAgent({
  runnerId,
  cwd,
  prompt,
  sandbox,
  outputSchemaPath,
  referenceTracker,
  runnerOptions,
}) {
  const runner = await getRunner(runnerId);
  return await runner.run({
    cwd,
    prompt,
    sandbox,
    outputSchemaPath,
    referenceTracker,
    runnerOptions,
  });
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
    let packageJson;
    try {
      packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    } catch (error) {
      return {
        passed: false,
        evidence: `package.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
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

async function runLlmJudge({
  testCase,
  variant,
  outputsDir,
  finalMessage,
  runDir,
  scratchRoot,
  runnerId,
  runnerOptions,
}) {
  const outputSummary = await buildOutputSummary(outputsDir);
  const runner = await getRunner(runnerId);
  const schemaText = await readFile(judgeSchemaPath, "utf8");
  let prompt = `You are grading a local Agent Skill eval run. Grade only the provided output evidence. Require concrete evidence for PASS. Do not assume missing files exist.

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

  if (!runner.supportsStructuredOutputSchema) {
    prompt += `\n\nReturn only valid JSON. Do not wrap it in markdown. The JSON must satisfy this schema:\n\n\`\`\`json\n${schemaText}\n\`\`\`\n`;
  }

  const judgeDir = path.join(scratchRoot, "judge", stableId(`${testCase.id}-${variant}-${Date.now()}`));
  await mkdir(judgeDir, { recursive: true });

  const judgeRun = await runAgent({
    runnerId,
    cwd: judgeDir,
    prompt,
    sandbox: "read-only",
    outputSchemaPath: runner.supportsStructuredOutputSchema ? judgeSchemaPath : null,
    referenceTracker: null,
    runnerOptions,
  });
  await writeFile(path.join(runDir, "judge-transcript.jsonl"), judgeRun.rawTranscript ?? "");
  await writeFile(path.join(runDir, "judge-stderr.log"), judgeRun.rawStderr ?? "");

  let grading;
  try {
    grading = JSON.parse(judgeRun.finalAssistantText);
  } catch {
    grading = {
      assertion_results: [],
      summary: { passed: 0, failed: 0, total: 0, pass_rate: 0 },
      overall_quality_score: null,
      utility_notes: "Judge did not return parseable JSON.",
    };
  }

  return {
    grading,
    timing: judgeRun.timing,
    metadata: judgeRun.metadata ?? {},
  };
}

async function getRunner(runnerId) {
  const loader = runnerLoaders[runnerId];
  if (!loader) {
    throw new Error(`Unknown runner: ${runnerId}. Expected one of ${runnerIds.join(", ")}.`);
  }
  return loader();
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
  const skipFileNames = options.skipFileNames ?? new Set();
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && skipDirectoryNames.has(entry.name)) continue;
    if (entry.isFile() && skipFileNames.has(entry.name)) continue;
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
        token_delta: numericDelta(withSkill.timing.total_tokens, docsDump.timing.total_tokens),
        token_savings_ratio:
          typeof withSkill.timing.total_tokens !== "number" || typeof docsDump.timing.total_tokens !== "number" || docsDump.timing.total_tokens === 0
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
        token_delta: numericDelta(withSkill.timing.total_tokens, withoutSkill.timing.total_tokens),
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

function numericDelta(left, right) {
  return typeof left === "number" && typeof right === "number" ? left - right : null;
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

function selectVariants(requestedVariants, variants) {
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

function formatError(error) {
  if (error instanceof Error) {
    return error.name && error.message
      ? `${error.name}: ${error.message}`
      : error.message || error.name;
  }
  return String(error);
}

function parseArgs(argv) {
  const parsed = {
    case: [],
    cursorApiKey: null,
    cursorModel: null,
    docsMode: "inline",
    variant: [],
    dryRun: false,
    force: false,
    help: false,
    iteration: null,
    judgeRunner: null,
    list: false,
    opencodeAgent: null,
    opencodeCommand: null,
    opencodeModel: null,
    opencodeTimeoutMs: null,
    opencodeVariant: null,
    runner: "codex",
    skillPath: null,
    skipLlmJudge: false,
    tmpRoot: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--case") parsed.case.push(readValue(argv, ++index, arg));
    else if (arg === "--cursor-api-key") parsed.cursorApiKey = readValue(argv, ++index, arg);
    else if (arg === "--cursor-model") parsed.cursorModel = readValue(argv, ++index, arg);
    else if (arg === "--docs-mode") parsed.docsMode = readValue(argv, ++index, arg);
    else if (arg === "--variant") parsed.variant.push(readValue(argv, ++index, arg));
    else if (arg === "--iteration") parsed.iteration = Number(readValue(argv, ++index, arg));
    else if (arg === "--judge-runner") parsed.judgeRunner = readValue(argv, ++index, arg);
    else if (arg === "--opencode-agent") parsed.opencodeAgent = readValue(argv, ++index, arg);
    else if (arg === "--opencode-command") parsed.opencodeCommand = readValue(argv, ++index, arg);
    else if (arg === "--opencode-model") parsed.opencodeModel = readValue(argv, ++index, arg);
    else if (arg === "--opencode-timeout-ms") parsed.opencodeTimeoutMs = Number(readValue(argv, ++index, arg));
    else if (arg === "--opencode-variant") parsed.opencodeVariant = readValue(argv, ++index, arg);
    else if (arg === "--runner") parsed.runner = readValue(argv, ++index, arg);
    else if (arg === "--skill-path") parsed.skillPath = readValue(argv, ++index, arg);
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

  if (!runnerIds.includes(parsed.runner)) {
    throw new Error(`--runner must be one of ${runnerIds.join(", ")}.`);
  }

  if (parsed.judgeRunner !== null && parsed.judgeRunner !== "none" && !runnerIds.includes(parsed.judgeRunner)) {
    throw new Error(`--judge-runner must be one of ${runnerIds.join(", ")} or none.`);
  }

  if (!["inline", "none"].includes(parsed.docsMode)) {
    throw new Error("--docs-mode must be inline or none.");
  }

  if (parsed.opencodeTimeoutMs !== null && (!Number.isFinite(parsed.opencodeTimeoutMs) || parsed.opencodeTimeoutMs < 1)) {
    throw new Error("--opencode-timeout-ms must be a positive number.");
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
  --runner <id>          Runner: ${runnerIds.join(", ")}. Defaults to codex.
  --judge-runner <id>    Judge runner: ${runnerIds.join(", ")} or none. Defaults to the main runner.
  --case <id>            Run one case. Repeat to run multiple cases.
  --variant <name>       Run one variant: with_skill, without_skill, docs_dump.
  --iteration <n>        Write to a specific iteration number.
  --skill-path <path>    Override the source skill directory.
  --tmp-root <path>      Scratch root outside the repo. Defaults to ${defaultScratchRoot}.
  --docs-mode <mode>     inline or none. Defaults to inline.
  --cursor-model <id>    Cursor model id for the cursor runner. Defaults to composer-2 or CURSOR_MODEL.
  --cursor-api-key <key> Cursor API key override. Defaults to CURSOR_API_KEY.
  --opencode-command <c> OpenCode command. Defaults to OPENCODE_COMMAND, local opencode-ai, or opencode.
  --opencode-model <id>  OpenCode model in provider/model form. Defaults to OPENCODE_MODEL.
  --opencode-agent <id>  OpenCode agent id. Defaults to OPENCODE_AGENT.
  --opencode-variant <v> OpenCode model variant. Defaults to OPENCODE_VARIANT.
  --opencode-timeout-ms <n> OpenCode run timeout. Defaults to OPENCODE_TIMEOUT_MS or 600000.
  --skip-llm-judge       Skip model-based grading.
  --dry-run              Print the selected matrix without invoking a runner.
  --force                Overwrite an existing iteration directory.
  --help                 Show this help.
`);
}

async function resolveGitSha(cwd) {
  try {
    const stdout = await execFileText("git", ["-C", cwd, "rev-parse", "HEAD"]);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

function execFileText(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
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
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `${command} exited with code ${exitCode}`));
      }
    });
  });
}
