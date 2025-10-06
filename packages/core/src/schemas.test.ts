import { describe, it, expect } from "vitest";
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
  it("should create a sign up auth form schema with valid error messages", () => {
    const testLocale = registerLocale("test", {
      errors: {
        invalidEmail: "createSignUpAuthFormSchema + invalidEmail",
        weakPassword: "createSignUpAuthFormSchema + weakPassword",
      },
    });

    const mockUI = createMockUI({
      locale: testLocale,
    });

    const schema = createSignUpAuthFormSchema(mockUI);

    // Cause the schema to fail...
    // TODO(ehesp): If no value is provided, the schema error is just "Required" - should this also be translated?
    const result = schema.safeParse({
      email: "",
      password: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues.length).toBe(2);

    expect(result.error?.issues[0]?.message).toBe("createSignUpAuthFormSchema + invalidEmail");
    expect(result.error?.issues[1]?.message).toBe("createSignUpAuthFormSchema + weakPassword");
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
