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

import { describe, it, expect } from "vitest";
import { registerLocale, enUs, type Locale, type RegisteredLocale, csCz } from "./index";
import { enUS } from "./locales/en-us";
import { csCZ } from "./locales/cs-cz";
import type { Translations } from "./types";
import { getTranslation, ERROR_CODE_MAP } from "./mapping";
import * as types from "./types";

describe("index.ts", () => {
  describe("registerLocale", () => {
    it("should register a locale with valid inputs", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
        labels: {
          emailAddress: "Test email label",
        },
      };

      const result = registerLocale("en-US", mockTranslations);

      expect(result).toEqual({
        locale: "en-US",
        translations: mockTranslations,
      });
    });

    it("should register a locale with different locale formats", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
      };

      const locales: Locale[] = ["en-US", "fr-FR", "es-ES", "custom-locale"];

      locales.forEach((locale) => {
        const result = registerLocale(locale, mockTranslations);
        expect(result.locale).toBe(locale);
        expect(result.translations).toBe(mockTranslations);
      });
    });

    it("should handle empty translations object", () => {
      const emptyTranslations: Translations = {};

      const result = registerLocale("en-US", emptyTranslations);

      expect(result).toEqual({
        locale: "en-US",
        translations: {},
      });
    });

    it("should handle partial translations", () => {
      const partialTranslations: Translations = {
        errors: {
          userNotFound: "User not found",
        },
        // messages, labels, and prompts are undefined
      };

      const result = registerLocale("en-US", partialTranslations);

      expect(result.translations).toEqual(partialTranslations);
      expect(result.translations.errors?.userNotFound).toBe("User not found");
      expect(result.translations.messages).toBeUndefined();
      expect(result.translations.labels).toBeUndefined();
      expect(result.translations.prompts).toBeUndefined();
    });

    it("should preserve reference to original translations object", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
      };

      const result = registerLocale("en-US", mockTranslations);

      // The translations should be the same reference
      expect(result.translations).toBe(mockTranslations);
    });

    it("should register a locale with fallback", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
      };

      const fallbackLocale = registerLocale("en-US", mockTranslations);
      const result = registerLocale("fr-FR", mockTranslations, fallbackLocale);

      expect(result.locale).toBe("fr-FR");
      expect(result.translations).toBe(mockTranslations);
      expect(result.fallback).toBe(fallbackLocale);
    });

    it("should handle nested fallbacks", () => {
      const level1Translations: Translations = {
        errors: {
          userNotFound: "Level 1 error",
        },
      };

      const level2Translations: Translations = {
        errors: {
          wrongPassword: "Level 2 error",
        },
      };

      const level3Translations: Translations = {
        errors: {
          invalidEmail: "Level 3 error",
        },
      };

      const level1 = registerLocale("en-US", level1Translations);
      const level2 = registerLocale("fr-FR", level2Translations, level1);
      const level3 = registerLocale("es-ES", level3Translations, level2);

      expect(level3.fallback).toBe(level2);
      expect(level2.fallback).toBe(level1);
      expect(level1.fallback).toBeUndefined();
    });
  });

  describe("enUs export", () => {
    it("should export enUs with correct structure", () => {
      expect(enUs).toBeDefined();
      expect(enUs.locale).toBe("en-US");
      expect(enUs.translations).toBeDefined();
    });

    it("should export csCz with correct structure", () => {
      expect(csCz).toBeDefined();
      expect(csCz.locale).toBe("cs-CZ");
      expect(csCz.translations).toBeDefined();
    });

    it("should use the correct enUS translations", () => {
      expect(enUs.translations).toBe(enUS);
    });

    it("should use the correct csCZ translations", () => {
      expect(csCz.translations).toBe(csCZ);
    });

    it("should have all required translation categories", () => {
      expect(enUs.translations.errors).toBeDefined();
      expect(enUs.translations.messages).toBeDefined();
      expect(enUs.translations.labels).toBeDefined();
      expect(enUs.translations.prompts).toBeDefined();
    });

    it("should have valid error translations", () => {
      const errors = enUs.translations.errors;
      expect(errors?.userNotFound).toBe("No account found with this email address");
      expect(errors?.wrongPassword).toBe("Incorrect password");
      expect(errors?.invalidEmail).toBe("Please enter a valid email address");
      expect(errors?.unknownError).toBe("An unexpected error occurred");
    });

    it("should have valid message translations", () => {
      const messages = enUs.translations.messages;
      expect(messages?.passwordResetEmailSent).toBe("Password reset email sent successfully");
      expect(messages?.signInLinkSent).toBe("Sign-in link sent successfully");
      expect(messages?.dividerOr).toBe("or");
    });

    it("should have valid label translations", () => {
      const labels = enUs.translations.labels;
      expect(labels?.emailAddress).toBe("Email Address");
      expect(labels?.password).toBe("Password");
      expect(labels?.signIn).toBe("Sign In");
      expect(labels?.signUp).toBe("Sign Up");
    });

    it("should have valid prompt translations", () => {
      const prompts = enUs.translations.prompts;
      expect(prompts?.noAccount).toBe("Don't have an account?");
      expect(prompts?.haveAccount).toBe("Already have an account?");
      expect(prompts?.signInToAccount).toBe("Sign in to your account");
    });
  });

  describe("type exports", () => {
    it("should export Locale type", () => {
      const validLocales: Locale[] = ["en-US", "fr-FR", "es-ES", "custom-locale"];

      validLocales.forEach((locale) => {
        expect(typeof locale).toBe("string");
      });
    });

    it("should export RegisteredLocale type", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error",
        },
      };

      const registeredLocale: RegisteredLocale = registerLocale("en-US", mockTranslations);

      expect(registeredLocale.locale).toBe("en-US");
      expect(registeredLocale.translations).toBe(mockTranslations);
    });

    it("should have correct type structure for RegisteredLocale", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error",
        },
        labels: {
          emailAddress: "Test label",
        },
      };

      const registeredLocale: RegisteredLocale = registerLocale("test-locale", mockTranslations);

      expect(registeredLocale).toHaveProperty("locale");
      expect(registeredLocale).toHaveProperty("translations");
      expect(typeof registeredLocale.locale).toBe("string");
      expect(typeof registeredLocale.translations).toBe("object");
    });
  });

  describe("mapping exports", () => {
    it("should re-export mapping functions and types", () => {
      expect(getTranslation).toBeDefined();
      expect(typeof getTranslation).toBe("function");
      expect(ERROR_CODE_MAP).toBeDefined();
      expect(typeof ERROR_CODE_MAP).toBe("object");
    });

    it("should have ERROR_CODE_MAP with correct structure", () => {
      expect(ERROR_CODE_MAP["auth/user-not-found"]).toBe("userNotFound");
      expect(ERROR_CODE_MAP["auth/wrong-password"]).toBe("wrongPassword");
      expect(ERROR_CODE_MAP["auth/invalid-email"]).toBe("invalidEmail");
      expect(ERROR_CODE_MAP["auth/network-request-failed"]).toBe("networkRequestFailed");
    });
  });

  describe("type re-exports", () => {
    it("should re-export all types from types module", () => {
      const testTranslations: types.Translations = {
        errors: {
          userNotFound: "Test error",
        },
      };

      expect(testTranslations.errors?.userNotFound).toBe("Test error");

      // Test that we can use other types (these are compile-time checks)
      const testCategory: types.TranslationCategory = "errors";
      const testKey: types.ErrorKey = "userNotFound";

      expect(testCategory).toBe("errors");
      expect(testKey).toBe("userNotFound");
    });
  });

  describe("integration tests", () => {
    it("should work with custom locale registration and usage", () => {
      const customTranslations: Translations = {
        errors: {
          userNotFound: "Utilisateur non trouvé",
          wrongPassword: "Mot de passe incorrect",
        },
        labels: {
          emailAddress: "Adresse e-mail",
          password: "Mot de passe",
        },
      };

      const customLocale = registerLocale("fr-FR", customTranslations);

      expect(customLocale.locale).toBe("fr-FR");
      expect(customLocale.translations.errors?.userNotFound).toBe("Utilisateur non trouvé");
      expect(customLocale.translations.labels?.emailAddress).toBe("Adresse e-mail");
    });

    it("should maintain type safety across all exports", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error",
        },
      };

      const registered: RegisteredLocale = registerLocale("en-US", mockTranslations);
      const locale: Locale = registered.locale;

      expect(typeof locale).toBe("string");
      expect(registered.translations).toBe(mockTranslations);
    });
  });
});
