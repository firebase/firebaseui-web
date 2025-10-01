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

    expect(registerVersion).toHaveBeenCalledWith("firebase-ui", version, framework);
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
      expect(registerVersion).toHaveBeenCalledWith("firebase-ui", version, framework);
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
      expect(registerVersion).toHaveBeenCalledWith("firebase-ui", version, framework);
    });
  });

  it("should handle empty string parameters", () => {
    const framework = "";
    const version = "";

    registerFramework(framework, version);

    expect(registerVersion).toHaveBeenCalledWith("firebase-ui", "", "");
    expect(registerVersion).toHaveBeenCalledTimes(1);
  });

  it("should handle special characters in parameters", () => {
    const framework = "react";
    const version = "1.0.0-beta.1";

    registerFramework(framework, version);

    expect(registerVersion).toHaveBeenCalledWith("firebase-ui", version, framework);
    expect(registerVersion).toHaveBeenCalledTimes(1);
  });
});
