import { describe, expect, it, vi } from "vitest";

// Mock the translations module first
vi.mock("@firebase-oss/ui-translations", async (original) => ({
  ...(await original()),
  getTranslation: vi.fn(),
}));

import { getTranslation as _getTranslation, registerLocale } from "@firebase-oss/ui-translations";
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
    expect(_getTranslation).toHaveBeenCalledWith(testLocale, "errors", "userNotFound");
  });
});
