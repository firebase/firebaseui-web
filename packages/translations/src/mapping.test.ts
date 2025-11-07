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
import { getTranslation, ERROR_CODE_MAP, type ErrorCode } from "./mapping";
import { registerLocale, enUs } from "./index";
import type { Translations } from "./types";

describe("mapping.ts", () => {
  describe("ERROR_CODE_MAP", () => {
    it("should have all required error code mappings", () => {
      expect(ERROR_CODE_MAP).toBeDefined();
      expect(typeof ERROR_CODE_MAP).toBe("object");
    });

    it("should map Firebase auth error codes to translation keys", () => {
      expect(ERROR_CODE_MAP["auth/user-not-found"]).toBe("userNotFound");
      expect(ERROR_CODE_MAP["auth/wrong-password"]).toBe("wrongPassword");
      expect(ERROR_CODE_MAP["auth/invalid-email"]).toBe("invalidEmail");
      expect(ERROR_CODE_MAP["auth/user-disabled"]).toBe("userDisabled");
      expect(ERROR_CODE_MAP["auth/network-request-failed"]).toBe("networkRequestFailed");
      expect(ERROR_CODE_MAP["auth/too-many-requests"]).toBe("tooManyRequests");
      expect(ERROR_CODE_MAP["auth/email-already-in-use"]).toBe("emailAlreadyInUse");
      expect(ERROR_CODE_MAP["auth/weak-password"]).toBe("weakPassword");
      expect(ERROR_CODE_MAP["auth/operation-not-allowed"]).toBe("operationNotAllowed");
    });

    it("should map phone-related error codes", () => {
      expect(ERROR_CODE_MAP["auth/invalid-phone-number"]).toBe("invalidPhoneNumber");
      expect(ERROR_CODE_MAP["auth/missing-phone-number"]).toBe("missingPhoneNumber");
      expect(ERROR_CODE_MAP["auth/quota-exceeded"]).toBe("quotaExceeded");
      expect(ERROR_CODE_MAP["auth/code-expired"]).toBe("codeExpired");
      expect(ERROR_CODE_MAP["auth/invalid-verification-code"]).toBe("invalidVerificationCode");
    });

    it("should map verification and captcha error codes", () => {
      expect(ERROR_CODE_MAP["auth/captcha-check-failed"]).toBe("captchaCheckFailed");
      expect(ERROR_CODE_MAP["auth/missing-verification-id"]).toBe("missingVerificationId");
      expect(ERROR_CODE_MAP["auth/missing-email"]).toBe("missingEmail");
      expect(ERROR_CODE_MAP["auth/invalid-action-code"]).toBe("invalidActionCode");
    });

    it("should map credential and account error codes", () => {
      expect(ERROR_CODE_MAP["auth/credential-already-in-use"]).toBe("credentialAlreadyInUse");
      expect(ERROR_CODE_MAP["auth/requires-recent-login"]).toBe("requiresRecentLogin");
      expect(ERROR_CODE_MAP["auth/provider-already-linked"]).toBe("providerAlreadyLinked");
      expect(ERROR_CODE_MAP["auth/account-exists-with-different-credential"]).toBe(
        "accountExistsWithDifferentCredential"
      );
    });

    it("should map display name error codes", () => {
      expect(ERROR_CODE_MAP["auth/display-name-required"]).toBe("displayNameRequired");
    });

    it("should have correct type structure", () => {
      const errorKeys = Object.values(ERROR_CODE_MAP);
      const validErrorKeys = [
        "userNotFound",
        "wrongPassword",
        "invalidEmail",
        "unverifiedEmail",
        "userDisabled",
        "missingVerificationCode",
        "invalidCredential",
        "networkRequestFailed",
        "tooManyRequests",
        "emailAlreadyInUse",
        "weakPassword",
        "operationNotAllowed",
        "invalidPhoneNumber",
        "missingPhoneNumber",
        "quotaExceeded",
        "codeExpired",
        "captchaCheckFailed",
        "missingVerificationId",
        "missingEmail",
        "invalidActionCode",
        "credentialAlreadyInUse",
        "requiresRecentLogin",
        "providerAlreadyLinked",
        "invalidVerificationCode",
        "accountExistsWithDifferentCredential",
        "displayNameRequired",
        "secondFactorAlreadyInUse",
      ];

      errorKeys.forEach((key) => {
        expect(validErrorKeys).toContain(key);
      });
    });
  });

  describe("ErrorCode type", () => {
    it("should be derived from ERROR_CODE_MAP keys", () => {
      const testErrorCodes: ErrorCode[] = [
        "auth/user-not-found",
        "auth/wrong-password",
        "auth/invalid-email",
        "auth/network-request-failed",
      ];

      testErrorCodes.forEach((code) => {
        expect(ERROR_CODE_MAP[code]).toBeDefined();
      });
    });
  });

  describe("getTranslation", () => {
    it("should return translation from locale when available", () => {
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

      const locale = registerLocale("fr-FR", customTranslations);

      expect(getTranslation(locale, "errors", "userNotFound")).toBe("Utilisateur non trouvé");
      expect(getTranslation(locale, "errors", "wrongPassword")).toBe("Mot de passe incorrect");
      expect(getTranslation(locale, "labels", "emailAddress")).toBe("Adresse e-mail");
      expect(getTranslation(locale, "labels", "password")).toBe("Mot de passe");
    });

    it("should fall back to English when translation not found in locale", () => {
      const partialTranslations: Translations = {
        errors: {
          userNotFound: "Custom error message",
        },
        // missing wrongPassword, should fall back to English
      };

      const locale = registerLocale("fr-FR", partialTranslations);

      // Should return custom translation when available
      expect(getTranslation(locale, "errors", "userNotFound")).toBe("Custom error message");

      // Should fall back to English when not available
      expect(getTranslation(locale, "errors", "wrongPassword")).toBe("Incorrect password");
      expect(getTranslation(locale, "labels", "emailAddress")).toBe("Email Address");
    });

    it("should use fallback locale when translation not found", () => {
      const fallbackTranslations: Translations = {
        errors: {
          userNotFound: "Fallback error message",
          wrongPassword: "Fallback password error",
        },
      };

      const primaryTranslations: Translations = {
        errors: {
          userNotFound: "Primary error message",
          // missing wrongPassword, should use fallback
        },
      };

      const fallbackLocale = registerLocale("en-US", fallbackTranslations);
      const primaryLocale = registerLocale("fr-FR", primaryTranslations, fallbackLocale);

      // Should return primary translation when available
      expect(getTranslation(primaryLocale, "errors", "userNotFound")).toBe("Primary error message");

      // Should use fallback when not available in primary
      expect(getTranslation(primaryLocale, "errors", "wrongPassword")).toBe("Fallback password error");
    });

    it("should handle nested fallbacks correctly", () => {
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

      // Should return level 3 translation when available
      expect(getTranslation(level3, "errors", "invalidEmail")).toBe("Level 3 error");

      // Should fall back to level 2 when not in level 3
      expect(getTranslation(level3, "errors", "wrongPassword")).toBe("Level 2 error");

      // Should fall back to level 1 when not in level 2 or 3
      expect(getTranslation(level3, "errors", "userNotFound")).toBe("Level 1 error");

      // Should fall back to English when not in any level
      expect(getTranslation(level3, "errors", "networkRequestFailed")).toBe(
        "Unable to connect to the server. Please check your internet connection"
      );
    });

    it("should work with all translation categories", () => {
      const customTranslations: Translations = {
        errors: {
          userNotFound: "Custom error",
        },
        messages: {
          passwordResetEmailSent: "Custom message",
        },
        labels: {
          emailAddress: "Custom label",
        },
        prompts: {
          noAccount: "Custom prompt",
        },
      };

      const locale = registerLocale("fr-FR", customTranslations);

      expect(getTranslation(locale, "errors", "userNotFound")).toBe("Custom error");
      expect(getTranslation(locale, "messages", "passwordResetEmailSent")).toBe("Custom message");
      expect(getTranslation(locale, "labels", "emailAddress")).toBe("Custom label");
      expect(getTranslation(locale, "prompts", "noAccount")).toBe("Custom prompt");
    });

    it("should handle empty translations gracefully", () => {
      const emptyTranslations: Translations = {};
      const locale = registerLocale("fr-FR", emptyTranslations);

      // Should fall back to English for all translations
      expect(getTranslation(locale, "errors", "userNotFound")).toBe("No account found with this email address");
      expect(getTranslation(locale, "labels", "emailAddress")).toBe("Email Address");
      expect(getTranslation(locale, "messages", "dividerOr")).toBe("or");
      expect(getTranslation(locale, "prompts", "noAccount")).toBe("Don't have an account?");
    });

    it("should handle undefined translation categories", () => {
      const partialTranslations: Translations = {
        errors: {
          userNotFound: "Custom error",
        },
        // messages, labels, prompts are undefined
      };

      const locale = registerLocale("fr-FR", partialTranslations);

      // Should return custom translation when available
      expect(getTranslation(locale, "errors", "userNotFound")).toBe("Custom error");

      // Should fall back to English for undefined categories
      expect(getTranslation(locale, "labels", "emailAddress")).toBe("Email Address");
      expect(getTranslation(locale, "messages", "dividerOr")).toBe("or");
      expect(getTranslation(locale, "prompts", "noAccount")).toBe("Don't have an account?");
    });

    it("should maintain type safety", () => {
      const customTranslations: Translations = {
        errors: {
          userNotFound: "Custom error",
        },
      };

      const locale = registerLocale("fr-FR", customTranslations);

      // These should compile without errors and work correctly
      const errorTranslation = getTranslation(locale, "errors", "userNotFound");
      const labelTranslation = getTranslation(locale, "labels", "emailAddress");
      const messageTranslation = getTranslation(locale, "messages", "dividerOr");
      const promptTranslation = getTranslation(locale, "prompts", "noAccount");

      expect(typeof errorTranslation).toBe("string");
      expect(typeof labelTranslation).toBe("string");
      expect(typeof messageTranslation).toBe("string");
      expect(typeof promptTranslation).toBe("string");
    });

    it("should replace placeholders with replacement values", () => {
      const locale = registerLocale("en-US", {});

      const result1 = getTranslation(locale, "messages", "mfaSmsAssertionPrompt", {
        phoneNumber: "+1234567890",
      });
      expect(result1).toBe("A verification code will be sent to +1234567890 to complete the authentication process.");

      const result2 = getTranslation(locale, "messages", "termsAndPrivacy", {
        tos: "Terms of Service",
        privacy: "Privacy Policy",
      });
      expect(result2).toBe("By continuing, you agree to our Terms of Service and Privacy Policy.");
    });

    it("should leave placeholders unchanged when replacement is missing", () => {
      const locale = registerLocale("en-US", {});

      const result1 = getTranslation(locale, "messages", "mfaSmsAssertionPrompt", {
        // phoneNumber is missing
      });
      expect(result1).toBe("A verification code will be sent to {phoneNumber} to complete the authentication process.");

      const result2 = getTranslation(locale, "messages", "termsAndPrivacy", {
        tos: "Terms of Service",
        // privacy is missing
      });
      expect(result2).toBe("By continuing, you agree to our Terms of Service and {privacy}.");
    });

    it("should work with replacements in custom locales", () => {
      const customTranslations: Translations = {
        messages: {
          termsAndPrivacy: "En continuant, vous acceptez nos {tos} et {privacy}.",
        },
      };

      const locale = registerLocale("fr-FR", customTranslations);

      const result = getTranslation(locale, "messages", "termsAndPrivacy", {
        tos: "Conditions d'utilisation",
        privacy: "Politique de confidentialité",
      });
      expect(result).toBe("En continuant, vous acceptez nos Conditions d'utilisation et Politique de confidentialité.");
    });

    it("should work with replacements in fallback locales", () => {
      const fallbackTranslations: Translations = {
        messages: {
          termsAndPrivacy: "Fallback: {tos} and {privacy}",
        },
      };

      const primaryTranslations: Translations = {
        messages: {
          mfaSmsAssertionPrompt: "Primary: {phoneNumber}",
        },
      };

      const fallbackLocale = registerLocale("en-US", fallbackTranslations);
      const primaryLocale = registerLocale("fr-FR", primaryTranslations, fallbackLocale);

      const result1 = getTranslation(primaryLocale, "messages", "mfaSmsAssertionPrompt", {
        phoneNumber: "+1234567890",
      });
      expect(result1).toBe("Primary: +1234567890");

      const result2 = getTranslation(primaryLocale, "messages", "termsAndPrivacy", {
        tos: "Terms",
        privacy: "Privacy",
      });
      expect(result2).toBe("Fallback: Terms and Privacy");
    });

    it("should handle empty replacements object", () => {
      const locale = registerLocale("en-US", {});

      const result = getTranslation(locale, "messages", "mfaSmsAssertionPrompt", {});
      expect(result).toBe("A verification code will be sent to {phoneNumber} to complete the authentication process.");
    });

    it("should handle strings without placeholders", () => {
      const locale = registerLocale("en-US", {});

      const result = getTranslation(locale, "errors", "userNotFound", {
        someKey: "someValue",
      });
      expect(result).toBe("No account found with this email address");
    });
  });

  describe("integration tests", () => {
    it("should work with enUs locale", () => {
      // Test that the default English locale works correctly
      expect(getTranslation(enUs, "errors", "userNotFound")).toBe("No account found with this email address");
      expect(getTranslation(enUs, "labels", "emailAddress")).toBe("Email Address");
      expect(getTranslation(enUs, "messages", "dividerOr")).toBe("or");
      expect(getTranslation(enUs, "prompts", "noAccount")).toBe("Don't have an account?");
    });

    it("should handle complex fallback chains", () => {
      const englishTranslations: Translations = {
        errors: {
          userNotFound: "English error",
        },
      };

      const frenchTranslations: Translations = {
        errors: {
          wrongPassword: "French password error",
        },
      };

      const spanishTranslations: Translations = {
        errors: {
          invalidEmail: "Spanish email error",
        },
      };

      const english = registerLocale("en-US", englishTranslations);
      const french = registerLocale("fr-FR", frenchTranslations, english);
      const spanish = registerLocale("es-ES", spanishTranslations, french);

      // Test the fallback chain
      expect(getTranslation(spanish, "errors", "invalidEmail")).toBe("Spanish email error");
      expect(getTranslation(spanish, "errors", "wrongPassword")).toBe("French password error");
      expect(getTranslation(spanish, "errors", "userNotFound")).toBe("English error");
      expect(getTranslation(spanish, "errors", "networkRequestFailed")).toBe(
        "Unable to connect to the server. Please check your internet connection"
      );
    });
  });
});
