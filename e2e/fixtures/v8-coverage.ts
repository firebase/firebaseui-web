/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CDPSession, Page } from "@playwright/test";
import { COVERAGE_DIR, resetCoverageArtifacts } from "./coverage-artifacts.mjs";

export { resetCoverageArtifacts };

const RAW_FILE = path.join(COVERAGE_DIR, "raw.jsonl");
const SUMMARY_FILE = path.join(COVERAGE_DIR, "summary.json");

type CoverageEntry = {
  label: string;
  project: string;
  urlCount: number;
  /** Sum of (range byte length × execution count) across V8 scripts — not raw byte size. */
  weightedExecUnits: number;
  timestamp: string;
};

export async function startV8Coverage(page: Page): Promise<CDPSession | null> {
  try {
    const client = await page.context().newCDPSession(page);
    await client.send("Profiler.enable");
    await client.send("Profiler.startPreciseCoverage", { callCount: true, detailed: true });
    return client;
  } catch {
    return null;
  }
}

type CoverageScript = {
  url: string;
  functions: Array<{
    ranges: Array<{ startOffset: number; endOffset: number; count: number }>;
  }>;
};

function weightedExecUnits(scripts: CoverageScript[]): number {
  return scripts.reduce(
    (sum, script) =>
      sum +
      script.functions.reduce(
        (fnSum, fn) =>
          fnSum +
          fn.ranges.reduce(
            (rangeSum, range) =>
              range.count > 0 ? rangeSum + (range.endOffset - range.startOffset) * range.count : rangeSum,
            0
          ),
        0
      ),
    0
  );
}

export async function stopV8Coverage(client: CDPSession, label: string, project: string): Promise<void> {
  try {
    const { result } = await client.send("Profiler.takePreciseCoverage");
    await client.send("Profiler.stopPreciseCoverage");
    await client.detach();

    mkdirSync(COVERAGE_DIR, { recursive: true });
    const scripts = result as CoverageScript[];
    const urlCount = scripts.length;
    const entry: CoverageEntry = {
      label,
      project,
      urlCount,
      weightedExecUnits: weightedExecUnits(scripts),
      timestamp: new Date().toISOString(),
    };
    // raw.jsonl is highly compressible (repetitive JSON); upload-artifact zips it.
    appendFileSync(RAW_FILE, `${JSON.stringify({ entry, result })}\n`, "utf8");
  } catch {
    // Coverage is best-effort proof-of-exercise, not a gate.
  }
}

/** Writes a run-level summary for artifact comparison across CI runs. */
export function finalizeCoverageReport(): void {
  if (!existsSync(RAW_FILE)) {
    return;
  }

  const lines = readFileSync(RAW_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { entry: CoverageEntry });

  const byProject = new Map<string, { tests: number; urlCount: number; weightedExecUnits: number }>();

  for (const { entry } of lines) {
    const current = byProject.get(entry.project) ?? { tests: 0, urlCount: 0, weightedExecUnits: 0 };
    current.tests += 1;
    current.urlCount += entry.urlCount;
    current.weightedExecUnits += entry.weightedExecUnits;
    byProject.set(entry.project, current);
  }

  mkdirSync(COVERAGE_DIR, { recursive: true });
  writeFileSync(
    SUMMARY_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: "V8 precise coverage from browser smoke tests; weightedExecUnits compares exercised script volume across runs, not Istanbul line coverage of package sources.",
        projects: Object.fromEntries(byProject),
        totals: {
          tests: lines.length,
          urlCount: [...byProject.values()].reduce((sum, row) => sum + row.urlCount, 0),
          weightedExecUnits: [...byProject.values()].reduce((sum, row) => sum + row.weightedExecUnits, 0),
        },
      },
      null,
      2
    ),
    "utf8"
  );
}
