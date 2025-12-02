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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerFramework } from "./register-framework";

vi.mock("firebase/app", () => ({
  registerVersion: vi.fn(),
}));

import { registerVersion } from "firebase/app";

describe("registerFramework", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call registerVersion with correct parameters", () => {
    const framework = "react";
    const version = "1.0.0";

    registerFramework(framework, version);

    expect(registerVersion).toHaveBeenCalledWith("firebase-ui-web", version, framework);
    expect(registerVersion).toHaveBeenCalledTimes(1);
  });

  it("should handle different framework types", () => {
    const frameworks = ["react", "angular"];
    const version = "2.0.0";

    frameworks.forEach((framework) => {
      registerFramework(framework, version);
    });

    expect(registerVersion).toHaveBeenCalledTimes(frameworks.length);
    frameworks.forEach((framework) => {
      expect(registerVersion).toHaveBeenCalledWith("firebase-ui-web", version, framework);
    });
  });

  it("should handle different version formats", () => {
    const framework = "react";
    const versions = ["1.0.0", "2.1.3", "0.0.1", "10.20.30"];

    versions.forEach((version) => {
      registerFramework(framework, version);
    });

    expect(registerVersion).toHaveBeenCalledTimes(versions.length);
    versions.forEach((version) => {
      expect(registerVersion).toHaveBeenCalledWith("firebase-ui-web", version, framework);
    });
  });

  it("should handle special characters in parameters", () => {
    const framework = "react";
    const version = "1.0.0-beta.1";

    registerFramework(framework, version);

    expect(registerVersion).toHaveBeenCalledWith("firebase-ui-web", version, framework);
    expect(registerVersion).toHaveBeenCalledTimes(1);
  });
});
