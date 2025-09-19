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

import "zone.js";
import "zone.js/testing";
import { getTestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Initialize Angular testing environment
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

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
