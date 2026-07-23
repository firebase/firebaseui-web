/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TestBed } from "@angular/core/testing";
import { FirebaseApps } from "@angular/fire/app";
import {
  injectClearLegacySignInRecovery,
  injectLegacySignInRecovery,
  injectTranslation,
  provideFirebaseUI,
} from "./provider";
import { getTranslation, type TranslationCategory, type TranslationKey } from "@firebase-oss/ui-core";

const mockUI = {
  locale: {
    locale: "en-US",
    translations: {},
  },
  legacySignInRecovery: {
    email: "test@example.com",
    signInMethods: ["google.com"],
  },
  clearLegacySignInRecovery: jest.fn(),
};

describe("injectTranslation", () => {
  const mockStore = {
    get: () => mockUI,
    subscribe: jest.fn(() => () => {}),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseApps, useValue: [{ name: "test-app" }] },
        provideFirebaseUI(() => mockStore as any),
      ],
    });
  });

  it("calls getTranslation with the correct ui state, category, and key", () => {
    (getTranslation as jest.Mock).mockReturnValue("Sign In");

    TestBed.runInInjectionContext(() => {
      const result = injectTranslation("labels", "signIn");

      expect(result()).toBe("Sign In");
      expect(getTranslation).toHaveBeenCalledWith(mockUI, "labels", "signIn");
    });
  });

  it("returns different translations for different categories", () => {
    (getTranslation as jest.Mock)
      .mockReturnValueOnce("An unknown error occurred")
      .mockReturnValueOnce("Don't have an account?");

    TestBed.runInInjectionContext(() => {
      const errorTranslation = injectTranslation("errors", "unknownError");
      const promptTranslation = injectTranslation("prompts", "noAccount");

      // Computed signals are lazily evaluated, so getTranslation is called in read order.
      expect(errorTranslation()).toBe("An unknown error occurred");
      expect(promptTranslation()).toBe("Don't have an account?");
    });
  });

  it("returns a computed signal that can be read", () => {
    (getTranslation as jest.Mock).mockReturnValue("test value");

    TestBed.runInInjectionContext(() => {
      const result = injectTranslation("messages", "dividerOr");

      expect(typeof result).toBe("function");
      expect(result()).toBe("test value");
    });
  });

  it("passes the current UI state from the store to getTranslation", () => {
    (getTranslation as jest.Mock).mockReturnValue("");

    TestBed.runInInjectionContext(() => {
      injectTranslation("labels", "emailAddress")();

      expect(getTranslation).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: expect.objectContaining({ locale: "en-US" }),
        }),
        "labels",
        "emailAddress"
      );
    });
  });
});

describe("legacy sign-in recovery injectors", () => {
  const mockStore = {
    get: () => mockUI,
    subscribe: jest.fn(() => () => {}),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseApps, useValue: [{ name: "test-app" }] },
        provideFirebaseUI(() => mockStore as any),
      ],
    });
  });

  it("returns the current legacy sign-in recovery state", () => {
    TestBed.runInInjectionContext(() => {
      const recovery = injectLegacySignInRecovery();

      expect(recovery()).toEqual({
        email: "test@example.com",
        signInMethods: ["google.com"],
      });
    });
  });

  it("returns a callback that clears the recovery state", () => {
    TestBed.runInInjectionContext(() => {
      const clearRecovery = injectClearLegacySignInRecovery();
      clearRecovery();

      expect(mockUI.clearLegacySignInRecovery).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * Compile-time type safety tests for TranslationCategory and TranslationKey.
 *
 * These verify that the generic constraints used by injectTranslation correctly
 * restrict the category and key parameters to valid translation entries.
 *
 * If the types ever regress, the @ts-expect-error directives become "unused"
 * and cause compilation errors.
 */

// Valid category values.
const _labels: TranslationCategory = "labels";
const _errors: TranslationCategory = "errors";
const _prompts: TranslationCategory = "prompts";
const _messages: TranslationCategory = "messages";

// Valid key for each category.
const _signIn: TranslationKey<"labels"> = "signIn";
const _unknownError: TranslationKey<"errors"> = "unknownError";
const _noAccount: TranslationKey<"prompts"> = "noAccount";
const _dividerOr: TranslationKey<"messages"> = "dividerOr";

// @ts-expect-error - "badCategory" is not a valid TranslationCategory
const _badCategory: TranslationCategory = "badCategory";

// @ts-expect-error - "nonExistentKey" is not a valid key for "labels"
const _badLabelKey: TranslationKey<"labels"> = "nonExistentKey";

// @ts-expect-error - "signIn" is a "labels" key, not valid for "errors"
const _wrongCategoryKey: TranslationKey<"errors"> = "signIn";

// @ts-expect-error - "noAccount" is a "prompts" key, not valid for "labels"
const _crossCategoryKey: TranslationKey<"labels"> = "noAccount";
