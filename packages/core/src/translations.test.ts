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
