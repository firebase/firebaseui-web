/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectReferenceDiscipline, normalizeTiming } from "./shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

export const opencodeRunner = {
  id: "opencode",
  label: "OpenCode CLI",
  supportsStructuredOutputSchema: false,
  async run({
    cwd,
    prompt,
    sandbox,
    outputSchemaPath = null,
    referenceTracker = null,
    runnerOptions = {},
  }) {
    const commandParts = splitCommand(
      runnerOptions.opencodeCommand
        ?? process.env.OPENCODE_COMMAND
        ?? defaultOpenCodeCommand(),
    );
    const command = commandParts[0];
    const args = [
      ...commandParts.slice(1),
      "run",
      "--format",
      "json",
      "--dir",
      cwd,
    ];
    const model = normalizeOpenCodeModel(runnerOptions.opencodeModel ?? process.env.OPENCODE_MODEL ?? null);
    const agent = runnerOptions.opencodeAgent ?? process.env.OPENCODE_AGENT ?? null;
    const variant = runnerOptions.opencodeVariant ?? process.env.OPENCODE_VARIANT ?? null;
    const timeoutMs = normalizeTimeout(
      runnerOptions.opencodeTimeoutMs ?? process.env.OPENCODE_TIMEOUT_MS,
    );

    if (model) args.push("--model", model);
    if (agent) args.push("--agent", agent);
    if (variant) args.push("--variant", variant);
    if (sandbox !== "read-only") args.push("--dangerously-skip-permissions");

    const effectivePrompt = outputSchemaPath
      ? `${prompt}\n\nReturn only valid JSON matching this schema:\n\n\`\`\`json\n${await readText(
          outputSchemaPath,
        )}\n\`\`\`\n`
      : prompt;
    args.push(effectivePrompt);

    const started = Date.now();
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: openCodeEnv(),
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

    let timedOut = false;
    let killTimeout = null;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      killTimeout = setTimeout(() => {
        child.kill("SIGKILL");
      }, 5000);
    }, timeoutMs);
    const { exitCode, signal } = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", (code, closeSignal) => resolve({ exitCode: code, signal: closeSignal }));
    });
    clearTimeout(timeout);
    if (killTimeout) clearTimeout(killTimeout);

    const durationMs = Date.now() - started;
    const events = parseJsonl(stdout);
    const finalAssistantText = collectText(events);
    const usage = collectUsage(events);
    const turnError = collectError(events, stderr, { timedOut, signal, timeoutMs, exitCode });

    return {
      runnerId: "opencode",
      finalAssistantText,
      rawTranscript: stdout,
      rawStderr: stderr,
      metadata: {
        event_count: events.length,
        model,
        agent,
        variant,
        command,
        sandbox_requested: sandbox,
        sandbox_enforced: false,
        permissions_auto_approved: sandbox !== "read-only",
        timeout_ms: timeoutMs,
      },
      timing: normalizeTiming({
        usage,
        durationMs,
        exitCode,
        successfulTurn: exitCode === 0 && turnError === null,
        toolActionCount: countToolUseEvents(events),
        referenceDiscipline: collectReferenceDiscipline(stdout, referenceTracker),
        turnError,
      }),
    };
  },
};

async function readText(filePath) {
  return await readFile(filePath, "utf8");
}

function collectText(events) {
  return events
    .filter((event) => event.type === "text" && typeof event.part?.text === "string")
    .map((event) => event.part.text)
    .join("")
    .trim();
}

function collectUsage(events) {
  const usage = {
    input_tokens: 0,
    cached_input_tokens: 0,
    output_tokens: 0,
    reasoning_output_tokens: 0,
  };
  let sawTokens = false;

  for (const event of events) {
    if (event.type !== "step_finish") continue;
    const tokens = event.part?.tokens;
    if (!tokens) continue;
    sawTokens = true;
    usage.input_tokens += numberOrZero(tokens.input);
    usage.cached_input_tokens += numberOrZero(tokens.cache?.read);
    usage.output_tokens += numberOrZero(tokens.output);
    usage.reasoning_output_tokens += numberOrZero(tokens.reasoning);
  }

  return sawTokens ? usage : {};
}

function countToolUseEvents(events) {
  const callIds = new Set();
  for (const event of events) {
    if (event.type !== "tool_use") continue;
    if (event.part?.callID) callIds.add(event.part.callID);
  }
  return callIds.size;
}

function collectError(events, stderr, { timedOut, signal, timeoutMs, exitCode }) {
  if (timedOut) {
    return `OpenCode run timed out after ${timeoutMs}ms.`;
  }

  const errorEvent = events.find((event) => event.type === "error");
  if (errorEvent) {
    return errorEvent.error?.data?.message
      ?? errorEvent.error?.message
      ?? errorEvent.error?.name
      ?? "OpenCode run reported an error.";
  }

  const trimmedStderr = stderr.trim();
  if (trimmedStderr.includes("ProviderModelNotFoundError")) {
    return trimmedStderr.split(/\r?\n/)[0];
  }

  if (signal) {
    return `OpenCode process ended with signal ${signal}.`;
  }

  if (typeof exitCode === "number" && exitCode !== 0) {
    return trimmedStderr || `OpenCode process exited with code ${exitCode}.`;
  }

  return null;
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

function numberOrZero(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeTimeout(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : DEFAULT_TIMEOUT_MS;
}

function openCodeEnv() {
  const env = {
    ...process.env,
    OPENCODE_DISABLE_AUTOUPDATE: process.env.OPENCODE_DISABLE_AUTOUPDATE ?? "true",
  };

  if (env.GEMINI_API_KEY && !env.GOOGLE_API_KEY) {
    env.GOOGLE_API_KEY = env.GEMINI_API_KEY;
  }
  if (env.GEMINI_API_KEY && !env.GOOGLE_GENERATIVE_AI_API_KEY) {
    env.GOOGLE_GENERATIVE_AI_API_KEY = env.GEMINI_API_KEY;
  }

  return env;
}

function normalizeOpenCodeModel(model) {
  if (!model || model.includes("/")) return model;
  if (!model.startsWith("gemini-")) {
    console.warn(
      `OpenCode model "${model}" has no provider prefix; treating it as "google/${model}". Use provider/model form for non-Gemini models.`,
    );
  }
  return `google/${model}`;
}

function defaultOpenCodeCommand() {
  const executable = process.platform === "win32" ? "opencode.cmd" : "opencode";
  const localBin = path.resolve(__dirname, "..", "node_modules", ".bin", executable);
  return existsSync(localBin) ? localBin : "opencode";
}

function splitCommand(command) {
  return command
    .match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)
    ?.map((part) => part.replace(/^(['"])(.*)\1$/, "$2"))
    .filter(Boolean)
    ?? [defaultOpenCodeCommand()];
}
