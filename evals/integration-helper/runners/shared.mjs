/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
export function compileReferenceTracker(referenceSets = {}) {
  return Object.fromEntries(
    Object.entries(referenceSets).map(([metricName, patterns]) => [
      metricName,
      patterns.map((pattern) => new RegExp(pattern, "g")),
    ]),
  );
}

export function collectReferenceDiscipline(text, tracker) {
  if (!tracker || typeof text !== "string" || text.length === 0) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(tracker).map(([metricName, patterns]) => [
      metricName,
      patterns.reduce((count, pattern) => count + [...text.matchAll(pattern)].length, 0),
    ]),
  );
}

export function normalizeTiming({
  usage,
  durationMs,
  exitCode,
  successfulTurn,
  toolActionCount,
  referenceDiscipline,
  turnError,
}) {
  const inputTokens = normalizeMetric(usage?.input_tokens);
  const cachedInputTokens = normalizeMetric(usage?.cached_input_tokens);
  const outputTokens = normalizeMetric(usage?.output_tokens);
  const reasoningOutputTokens = normalizeMetric(usage?.reasoning_output_tokens);

  return {
    input_tokens: inputTokens,
    cached_input_tokens: cachedInputTokens,
    uncached_input_tokens:
      inputTokens === null ? null : Math.max(inputTokens - (cachedInputTokens ?? 0), 0),
    output_tokens: outputTokens,
    reasoning_output_tokens: reasoningOutputTokens,
    total_tokens:
      inputTokens === null || outputTokens === null
        ? null
        : inputTokens + outputTokens,
    duration_ms: normalizeMetric(durationMs),
    exit_code: exitCode ?? null,
    successful_turn: Boolean(successfulTurn),
    turn_error: turnError ?? null,
    tool_action_count: normalizeMetric(toolActionCount),
    reference_discipline: referenceDiscipline ?? {},
  };
}

export function normalizeMetric(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
