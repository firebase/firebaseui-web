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

import { describe, it, expect, vi } from "vitest";
import { createMockUI } from "~/tests/utils";
import {
  createEmailLinkAuthFormSchema,
  createForgotPasswordAuthFormSchema,
  createMultiFactorPhoneAuthAssertionFormSchema,
  createPhoneAuthNumberFormSchema,
  createPhoneAuthVerifyFormSchema,
  createSignInAuthFormSchema,
  createSignUpAuthFormSchema,
} from "./schemas";
import { registerLocale } from "@firebase-oss/ui-translations";
import { RecaptchaVerifier } from "firebase/auth";

describe("createSignInAuthFormSchema", () => {
  it("should create a sign in auth form schema with valid error messages", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidEmail: "createSignInAuthFormSchema + invalidEmail",
        weakPassword: "createSignInAuthFormSchema + weakPassword",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createSignInAuthFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      email: "",
      password: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues.length).toBe(2);

    expect(result.error?.issues[0]?.message).toBe("createSignInAuthFormSchema + invalidEmail");
    expect(result.error?.issues[1]?.message).toBe("createSignInAuthFormSchema + weakPassword");
  });
});

describe("createSignUpAuthFormSchema", () => {
  it("should create a sign up auth form schema with valid error messages when requireDisplayName behavior is not enabled", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidEmail: "createSignUpAuthFormSchema + invalidEmail",
        weakPassword: "createSignUpAuthFormSchema + weakPassword",
        displayNameRequired: "createSignUpAuthFormSchema + displayNameRequired",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
      behaviors: {}, // No requireDisplayName behavior
    });

    const schema = createSignUpAuthFormSchema(mockUI);

    const validResult = schema.safeParse({
      email: "test@example.com",
      password: "password123",
    });

    expect(validResult.success).toBe(true);

    const validWithDisplayNameResult = schema.safeParse({
      email: "test@example.com",
      password: "password123",
      displayName: "John Doe",
    });

    expect(validWithDisplayNameResult.success).toBe(true);

    const invalidResult = schema.safeParse({
      email: "",
      password: "",
    });

    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toBeDefined();
    expect(invalidResult.error?.issues.length).toBe(2);

    expect(invalidResult.error?.issues[0]?.message).toBe("createSignUpAuthFormSchema + invalidEmail");
    expect(invalidResult.error?.issues[1]?.message).toBe("createSignUpAuthFormSchema + weakPassword");
  });

  it("should create a sign up auth form schema with required displayName when requireDisplayName behavior is enabled", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidEmail: "createSignUpAuthFormSchema + invalidEmail",
        weakPassword: "createSignUpAuthFormSchema + weakPassword",
        displayNameRequired: "createSignUpAuthFormSchema + displayNameRequired",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
      behaviors: {
        requireDisplayName: { type: "callable" as const, handler: vi.fn() },
      } as any,
    });

    const schema = createSignUpAuthFormSchema(mockUI);

    const validResult = schema.safeParse({
      email: "test@example.com",
      password: "password123",
      displayName: "John Doe",
    });

    expect(validResult.success).toBe(true);

    const missingDisplayNameResult = schema.safeParse({
      email: "test@example.com",
      password: "password123",
      displayName: "",
    });

    expect(missingDisplayNameResult.success).toBe(false);
    expect(missingDisplayNameResult.error).toBeDefined();
    expect(missingDisplayNameResult.error?.issues.length).toBe(1);
    expect(missingDisplayNameResult.error?.issues[0]?.message).toBe("createSignUpAuthFormSchema + displayNameRequired");

    const emptyDisplayNameResult = schema.safeParse({
      email: "test@example.com",
      password: "password123",
      displayName: "",
    });

    expect(emptyDisplayNameResult.success).toBe(false);
    expect(emptyDisplayNameResult.error).toBeDefined();
    expect(emptyDisplayNameResult.error?.issues.length).toBe(1);
    expect(emptyDisplayNameResult.error?.issues[0]?.message).toBe("createSignUpAuthFormSchema + displayNameRequired");

    const invalidEmailPasswordResult = schema.safeParse({
      email: "",
      password: "",
      displayName: "John Doe",
    });

    expect(invalidEmailPasswordResult.success).toBe(false);
    expect(invalidEmailPasswordResult.error).toBeDefined();
    expect(invalidEmailPasswordResult.error?.issues.length).toBe(2);
    expect(invalidEmailPasswordResult.error?.issues[0]?.message).toBe("createSignUpAuthFormSchema + invalidEmail");
    expect(invalidEmailPasswordResult.error?.issues[1]?.message).toBe("createSignUpAuthFormSchema + weakPassword");
  });
});

describe("createForgotPasswordAuthFormSchema", () => {
  it("should create a forgot password form schema with valid error messages", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidEmail: "createForgotPasswordAuthFormSchema + invalidEmail",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createForgotPasswordAuthFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      email: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues.length).toBe(1);

    expect(result.error?.issues[0]?.message).toBe("createForgotPasswordAuthFormSchema + invalidEmail");
  });
});

describe("createEmailLinkAuthFormSchema", () => {
  it("should create a forgot password form schema with valid error messages", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidEmail: "createEmailLinkAuthFormSchema + invalidEmail",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createEmailLinkAuthFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      email: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues.length).toBe(1);

    expect(result.error?.issues[0]?.message).toBe("createEmailLinkAuthFormSchema + invalidEmail");
  });
});

describe("createPhoneAuthNumberFormSchema", () => {
  it("should create a phone auth number form schema and show missing phone number error", () => {
    const testLocale = registerLocale("test", {
      errors: {
        missingPhoneNumber: "createPhoneAuthNumberFormSchema + missingPhoneNumber",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createPhoneAuthNumberFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      phoneNumber: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    expect(result.error?.issues[0]?.message).toBe("createPhoneAuthNumberFormSchema + missingPhoneNumber");
  });

  it("should create a phone auth number form schema and show an error if the phone number is too long", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidPhoneNumber: "createPhoneAuthNumberFormSchema + invalidPhoneNumber",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createPhoneAuthNumberFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      phoneNumber: "12345678901",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    expect(result.error?.issues[0]?.message).toBe("createPhoneAuthNumberFormSchema + invalidPhoneNumber");
  });
});

describe("createPhoneAuthVerifyFormSchema", () => {
  it("should create a phone auth verify form schema and show missing verification ID error", () => {
    const testLocale = registerLocale("test", {
      errors: {
        missingVerificationId: "createPhoneAuthVerifyFormSchema + missingVerificationId",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createPhoneAuthVerifyFormSchema(mockUI);

    const result = schema.safeParse({
      verificationId: "",
      verificationCode: "123456",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    expect(result.error?.issues[0]?.message).toBe("createPhoneAuthVerifyFormSchema + missingVerificationId");
  });

  it("should create a phone auth verify form schema and show an error if the verification code is too short", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidVerificationCode: "createPhoneAuthVerifyFormSchema + invalidVerificationCode",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createPhoneAuthVerifyFormSchema(mockUI);

    const result = schema.safeParse({
      verificationId: "test-verification-id",
      verificationCode: "123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(
      result.error?.issues.some(
        (issue) => issue.message === "createPhoneAuthVerifyFormSchema + invalidVerificationCode"
      )
    ).toBe(true);
  });
});

describe("createMultiFactorPhoneAuthAssertionFormSchema", () => {
  it("should create a multi-factor phone auth assertion form schema and show missing phone number error", () => {
    const testLocale = registerLocale("test", {
      errors: {
        missingPhoneNumber: "createMultiFactorPhoneAuthAssertionFormSchema + missingPhoneNumber",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createMultiFactorPhoneAuthAssertionFormSchema(mockUI);

    const result = schema.safeParse({
      phoneNumber: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues[0]?.message).toBe("createMultiFactorPhoneAuthAssertionFormSchema + missingPhoneNumber");
  });

  it("should create a multi-factor phone auth assertion form schema and show an error if the phone number is too long", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidPhoneNumber: "createMultiFactorPhoneAuthAssertionFormSchema + invalidPhoneNumber",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createMultiFactorPhoneAuthAssertionFormSchema(mockUI);

    const result = schema.safeParse({
      phoneNumber: "12345678901",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues[0]?.message).toBe("createMultiFactorPhoneAuthAssertionFormSchema + invalidPhoneNumber");
  });

  it("should accept valid phone number without requiring displayName", () => {
    const testLocale = registerLocale("test", {
      errors: {
        missingPhoneNumber: "missing",
        invalidPhoneNumber: "invalid",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createMultiFactorPhoneAuthAssertionFormSchema(mockUI);

    const result = schema.safeParse({
      phoneNumber: "1234567890",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ phoneNumber: "1234567890" });
    }
  });
});
