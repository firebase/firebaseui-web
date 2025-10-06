import { describe, it, expect, vi } from "vitest";
import { createMockUI } from "~/tests/utils";
import {
  createEmailLinkAuthFormSchema,
  createForgotPasswordAuthFormSchema,
  createPhoneAuthFormSchema,
  createSignInAuthFormSchema,
  createSignUpAuthFormSchema,
} from "./schemas";
import { registerLocale } from "@firebase-ui/translations";
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

describe("createPhoneAuthFormSchema", () => {
  it("should create a phone auth form schema and show missing phone number error", () => {
    const testLocale = registerLocale("test", {
      errors: {
        missingPhoneNumber: "createPhoneAuthFormSchema + missingPhoneNumber",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createPhoneAuthFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      phoneNumber: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    expect(result.error?.issues[0]?.message).toBe("createPhoneAuthFormSchema + missingPhoneNumber");
  });

  it("should create a phone auth form schema and show an error if the phone number is too long", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidPhoneNumber: "createPhoneAuthFormSchema + invalidPhoneNumber",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createPhoneAuthFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      phoneNumber: "12345678901",
      verificationCode: "123",
      recaptchaVerifier: null,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    expect(result.error?.issues[0]?.message).toBe("createPhoneAuthFormSchema + invalidPhoneNumber");
  });

  it("should create a phone auth form schema and show an error if the verification code is too short", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidVerificationCode: "createPhoneAuthFormSchema + invalidVerificationCode",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createPhoneAuthFormSchema(mockUI);

    const result = schema.safeParse({
      phoneNumber: "1234567890",
      verificationCode: "123",
      recaptchaVerifier: {} as RecaptchaVerifier, // Workaround for RecaptchaVerifier failing with Node env.
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(
      result.error?.issues.some((issue) => issue.message === "createPhoneAuthFormSchema + invalidVerificationCode")
    ).toBe(true);
  });
});
