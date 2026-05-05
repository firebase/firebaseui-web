/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { readFile } from "node:fs/promises";

import { collectReferenceDiscipline, normalizeTiming } from "./shared.mjs";

const DEFAULT_CURSOR_MODEL = "composer-2";

export const cursorRunner = {
  id: "cursor",
  label: "Cursor SDK",
  supportsStructuredOutputSchema: false,
  async run({
    cwd,
    prompt,
    sandbox = "workspace-write",
    outputSchemaPath = null,
    referenceTracker = null,
    runnerOptions = {},
  }) {
    const apiKey = runnerOptions.cursorApiKey ?? process.env.CURSOR_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Cursor runner requires CURSOR_API_KEY or --cursor-api-key to be set.",
      );
    }

    const modelId = runnerOptions.cursorModel ?? process.env.CURSOR_MODEL ?? DEFAULT_CURSOR_MODEL;
    const { Agent } = await loadCursorSdk();
    const effectivePrompt = outputSchemaPath
      ? `${prompt}\n\nReturn only valid JSON matching this schema:\n\n\`\`\`json\n${await readFile(
          outputSchemaPath,
          "utf8",
        )}\n\`\`\`\n`
      : prompt;

    const transcriptLines = [];
    const assistantTextChunks = [];
    const toolCallIds = new Set();
    let turnError = null;
    let lastTaskText = null;
    let agent = null;

    const started = Date.now();
    try {
      agent = await Agent.create({
        apiKey,
        model: { id: modelId },
        local: { cwd },
      });
      const run = await agent.send(effectivePrompt);
      transcriptLines.push(toJsonl({
        type: "run.started",
        run_id: run.id,
        model: modelId,
        sandbox_requested: sandbox,
      }));

      if (run.supports("stream")) {
        for await (const event of run.stream()) {
          transcriptLines.push(toJsonl(event));

          if (event.type === "assistant") {
            for (const block of event.message.content) {
              if (block.type === "text") {
                assistantTextChunks.push(block.text);
              }
            }
          }

          if (event.type === "tool_call" && event.call_id) {
            toolCallIds.add(event.call_id);
          }

          if (event.type === "status" && event.status === "ERROR") {
            turnError = event.message ?? "Cursor run reported an error status.";
          }

          if (event.type === "task" && event.text) {
            lastTaskText = event.text;
          }
        }
      }

      const result = await run.wait();
      transcriptLines.push(toJsonl({
        type: "run.completed",
        run_id: result.id,
        status: result.status,
        result: result.result ?? null,
        duration_ms: result.durationMs ?? null,
      }));

      const finalAssistantText =
        assistantTextChunks.join("").trim()
        || result.result
        || await collectConversationText(run);
      const durationMs = result.durationMs ?? (Date.now() - started);
      const successfulTurn = result.status === "finished";
      const derivedTurnError =
        turnError
        ?? (result.status === "error" ? lastTaskText ?? "Cursor run ended with error status." : null)
        ?? (result.status === "cancelled" ? "Cursor run was cancelled." : null);

      return {
        runnerId: "cursor",
        finalAssistantText,
        rawTranscript: `${transcriptLines.join("\n")}\n`,
        rawStderr: "",
        metadata: {
          run_id: result.id,
          status: result.status,
          model: modelId,
          sandbox_requested: sandbox,
          sandbox_enforced: false,
        },
        timing: normalizeTiming({
          usage: null,
          durationMs,
          exitCode: successfulTurn ? 0 : 1,
          successfulTurn,
          toolActionCount: toolCallIds.size,
          referenceDiscipline: collectReferenceDiscipline(
              assistantTextChunks.join("\n"),
            referenceTracker,
          ),
          turnError: derivedTurnError,
        }),
      };
    } finally {
      if (agent && typeof agent[Symbol.asyncDispose] === "function") {
        await agent[Symbol.asyncDispose]();
      }
    }
  },
};

async function collectConversationText(run) {
  if (!run.supports("conversation")) {
    return "";
  }

  try {
    const turns = await run.conversation();
    return turns
      .filter((turn) => turn.type === "agentConversationTurn")
      .flatMap((turn) => turn.turn.steps)
      .filter((step) => step.type === "assistantMessage")
      .map((step) => step.message.text)
      .join("\n\n");
  } catch {
    return "";
  }
}

function toJsonl(value) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return JSON.stringify({
      type: "transcript.serialization_error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function loadCursorSdk() {
  try {
    return await import("@cursor/sdk");
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Cursor runner could not load @cursor/sdk. Ensure the package is installed and its native dependencies are built for this machine. Original error: ${details}`,
    );
  }
}
