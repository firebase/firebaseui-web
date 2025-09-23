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

// This file is required by vitest.config.ts and sets up the Angular testing environment

// Import Zone.js testing utilities first
import "zone.js";
import "zone.js/testing";

// Import Angular testing utilities
import { TestBed } from "@angular/core/testing";

// Ensure Zone.js testing environment is properly configured
beforeEach(() => {
  // Reset Zone.js state before each test
  if (typeof Zone !== "undefined") {
    Zone.current.fork({ name: "test-zone" }).run(() => {
      // Run each test in a fresh zone
    });
  }
});

// Import Vitest utilities
import { expect, vi, afterEach, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Reset TestBed after each test to prevent configuration conflicts
afterEach(() => {
  TestBed.resetTestingModule();
});

// Make Vitest globals available
declare global {
  const spyOn: typeof vi.spyOn;
  const pending: (reason?: string) => void;
}

// Define global test utilities
(globalThis as any).spyOn = (obj: any, method: string) => {
  const spy = vi.spyOn(obj, method);
  // Add Jasmine-compatible methods
  (spy as any).and = {
    callFake: (fn: (...args: any[]) => any) => {
      spy.mockImplementation(fn);
      return spy;
    },
    returnValue: (value: any) => {
      spy.mockReturnValue(value);
      return spy;
    },
    callThrough: () => {
      spy.mockImplementation((...args: any[]) => obj[method](...args));
      return spy;
    },
  };
  (spy as any).calls = {
    reset: () => spy.mockClear(),
    all: () => spy.mock.calls,
    count: () => spy.mock.calls.length,
    mostRecent: () => spy.mock.calls[spy.mock.calls.length - 1] || { args: [] },
    first: () => spy.mock.calls[0] || { args: [] },
  };
  return spy;
};
(globalThis as any).pending = (reason?: string) => {
  throw new Error(`Test pending: ${reason || "No reason provided"}`);
};
