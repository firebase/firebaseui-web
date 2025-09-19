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

// Set up Zone.js testing environment
import { TestBed } from "@angular/core/testing";

// Ensure Zone.js testing environment is properly configured
beforeEach(() => {
  // Reset Zone.js state before each test
  if (typeof Zone !== "undefined") {
    Zone.current.fork({}).run(() => {
      // Run each test in a fresh zone
    });
  }
});

// Import Angular testing utilities
import { getTestBed, TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

// Import Vitest utilities
import { expect, vi, afterEach, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Initialize the testing environment with Zone.js support
if (!TestBed.platform) {
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false },
  });
}

// Reset TestBed after each test to prevent configuration conflicts
afterEach(() => {
  TestBed.resetTestingModule();
});

// Make Vitest globals available
declare global {
  const spyOn: typeof vi.spyOn;
  const pending: (reason?: string) => void;
  const jasmine: any;
}

// Define global test utilities
globalThis.spyOn = (obj: any, method: string) => {
  const spy = vi.spyOn(obj, method);
  // Add Jasmine-compatible methods
  spy.and = {
    callFake: (fn: Function) => {
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
  spy.calls = {
    reset: () => spy.mockClear(),
    all: () => spy.mock.calls,
    count: () => spy.mock.calls.length,
    mostRecent: () => spy.mock.calls[spy.mock.calls.length - 1] || { args: [] },
    first: () => spy.mock.calls[0] || { args: [] },
  };
  return spy;
};
globalThis.pending = (reason?: string) => {
  throw new Error(`Test pending: ${reason || "No reason provided"}`);
};

// Mock Jasmine for compatibility
globalThis.jasmine = {
  createSpyObj: (name: string, methods: string[], properties?: any) => {
    const obj: any = {};
    methods.forEach((method) => {
      const spy = vi.fn();
      // Add Jasmine-compatible methods
      spy.and = {
        returnValue: (value: any) => {
          spy.mockReturnValue(value);
          return spy;
        },
        callFake: (fn: Function) => {
          spy.mockImplementation(fn);
          return spy;
        },
        callThrough: () => {
          spy.mockImplementation((...args: any[]) => obj[method](...args));
          return spy;
        },
      };
      obj[method] = spy;
    });
    if (properties) {
      Object.assign(obj, properties);
    }
    return obj;
  },
  createSpy: (name: string) => {
    const spy = vi.fn();
    // Add Jasmine-compatible methods
    spy.and = {
      returnValue: (value: any) => {
        spy.mockReturnValue(value);
        return spy;
      },
      callFake: (fn: Function) => {
        spy.mockImplementation(fn);
        return spy;
      },
      callThrough: () => {
        spy.mockImplementation((...args: any[]) => spy(...args));
        return spy;
      },
    };
    return spy;
  },
};

// Mock global objects that might be needed for Firebase UI testing
Object.defineProperty(window, "signInWithEmailAndPassword", {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

Object.defineProperty(window, "createEmailFormSchema", {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

Object.defineProperty(window, "signInWithPopup", {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

Object.defineProperty(window, "signInWithRedirect", {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

Object.defineProperty(window, "signInWithPhoneNumber", {
  value: vi.fn(),
  writable: true,
  configurable: true,
});
