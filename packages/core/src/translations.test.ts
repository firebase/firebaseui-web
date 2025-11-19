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

import { describe, expect, it, vi } from "vitest";

// Mock the translations module first
vi.mock("@invertase/firebaseui-translations", async (original) => ({
  ...(await original()),
  getTranslation: vi.fn(),
}));

import { getTranslation as _getTranslation, registerLocale } from "@invertase/firebaseui-translations";
import { getTranslation } from "./translations";
import { createMockUI } from "~/tests/utils";

describe("getTranslation", () => {
  it("should return the correct translation", () => {
    const testLocale = registerLocale("test", {
      errors: {
        userNotFound: "test + userNotFound",
      },
    });

    vi.mocked(_getTranslation).mockReturnValue("test + userNotFound");

    const mockUI = createMockUI({ locale: testLocale });
    const translation = getTranslation(mockUI, "errors", "userNotFound");

    expect(translation).toBe("test + userNotFound");
    expect(_getTranslation).toHaveBeenCalledWith(testLocale, "errors", "userNotFound", undefined);
  });

  it("should pass replacements to the underlying getTranslation function", () => {
    const testLocale = registerLocale("test", {
      messages: {
        termsAndPrivacy: "By continuing, you agree to our {tos} and {privacy}.",
      },
    });

    vi.mocked(_getTranslation).mockReturnValue("By continuing, you agree to our Terms of Service and Privacy Policy.");

    const mockUI = createMockUI({ locale: testLocale });
    const replacements = {
      tos: "Terms of Service",
      privacy: "Privacy Policy",
    };
    const translation = getTranslation(mockUI, "messages", "termsAndPrivacy", replacements);

    expect(translation).toBe("By continuing, you agree to our Terms of Service and Privacy Policy.");
    expect(_getTranslation).toHaveBeenCalledWith(testLocale, "messages", "termsAndPrivacy", replacements);
  });
});
