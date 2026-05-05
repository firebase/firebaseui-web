/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { spawn } from "node:child_process";

import { collectReferenceDiscipline, normalizeTiming } from "./shared.mjs";

export const codexRunner = {
  id: "codex",
  label: "Codex CLI",
  supportsStructuredOutputSchema: true,
  async run({
    cwd,
    prompt,
    sandbox,
    outputSchemaPath = null,
    referenceTracker = null,
  }) {
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

    if (outputSchemaPath) {
      args.push("--output-schema", outputSchemaPath);
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
    const events = parseJsonl(stdout);
    const finalAssistantText = events
      .filter((event) => event.type === "item.completed" && event.item?.type === "agent_message")
      .map((event) => event.item.text)
      .at(-1);
    const usage =
      events.findLast?.((event) => event.type === "turn.completed" && event.usage)?.usage
      ?? [...events].reverse().find((event) => event.type === "turn.completed" && event.usage)?.usage
      ?? {};
    const turnError =
      events.find((event) => event.type === "turn.failed")?.error?.message
      ?? events.find((event) => event.type === "error")?.message
      ?? null;

    return {
      runnerId: "codex",
      finalAssistantText,
      rawTranscript: stdout,
      rawStderr: stderr,
      metadata: {
        event_count: events.length,
      },
      timing: normalizeTiming({
        usage,
        durationMs,
        exitCode,
        successfulTurn: exitCode === 0 && turnError === null,
        toolActionCount: countActionEvents(events),
        referenceDiscipline: collectReferenceDiscipline(stdout, referenceTracker),
        turnError,
      }),
    };
  },
};

function countActionEvents(events) {
  const actionItemIds = new Set();
  for (const event of events) {
    if (!["item.started", "item.completed"].includes(event.type)) continue;
    if (!["command_execution", "file_change"].includes(event.item?.type)) continue;
    actionItemIds.add(event.item.id);
  }
  return actionItemIds.size;
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
