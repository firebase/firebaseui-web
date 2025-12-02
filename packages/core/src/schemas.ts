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

import * as z from "zod";
import { getTranslation } from "./translations";
import { type FirebaseUI } from "./config";
import { hasBehavior } from "./behaviors";

/**
 * Creates a Zod schema for sign-in form validation.
 *
 * Validates email format and password minimum length (6 characters).
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for sign-in form validation.
 */
export function createSignInAuthFormSchema(ui: FirebaseUI) {
  return z.object({
    email: z.email(getTranslation(ui, "errors", "invalidEmail")),
    password: z.string().min(6, getTranslation(ui, "errors", "weakPassword")),
  });
}

/**
 * Creates a Zod schema for sign-up form validation.
 *
 * Validates email format, password minimum length (6 characters), and optionally requires a display name
 * if the `requireDisplayName` behavior is enabled.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for sign-up form validation.
 */
export function createSignUpAuthFormSchema(ui: FirebaseUI) {
  const requireDisplayName = hasBehavior(ui, "requireDisplayName");
  const displayNameRequiredMessage = getTranslation(ui, "errors", "displayNameRequired");

  return z.object({
    email: z.email(getTranslation(ui, "errors", "invalidEmail")),
    password: z.string().min(6, getTranslation(ui, "errors", "weakPassword")),
    displayName: requireDisplayName
      ? z.string().min(1, displayNameRequiredMessage)
      : z.string().min(1, displayNameRequiredMessage).optional(),
  });
}

/**
 * Creates a Zod schema for forgot password form validation.
 *
 * Validates email format.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for forgot password form validation.
 */
export function createForgotPasswordAuthFormSchema(ui: FirebaseUI) {
  return z.object({
    email: z.email(getTranslation(ui, "errors", "invalidEmail")),
  });
}

/**
 * Creates a Zod schema for email link authentication form validation.
 *
 * Validates email format.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for email link authentication form validation.
 */
export function createEmailLinkAuthFormSchema(ui: FirebaseUI) {
  return z.object({
    email: z.email(getTranslation(ui, "errors", "invalidEmail")),
  });
}

/**
 * Creates a Zod schema for phone number form validation.
 *
 * Validates that the phone number is provided and has a maximum length of 10 characters.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for phone number form validation.
 */
export function createPhoneAuthNumberFormSchema(ui: FirebaseUI) {
  return z.object({
    phoneNumber: z
      .string()
      .min(1, getTranslation(ui, "errors", "missingPhoneNumber"))
      .max(10, getTranslation(ui, "errors", "invalidPhoneNumber")),
  });
}

/**
 * Creates a Zod schema for phone verification code form validation.
 *
 * Validates that the verification ID is provided and the verification code is at least 6 characters long.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for phone verification form validation.
 */
export function createPhoneAuthVerifyFormSchema(ui: FirebaseUI) {
  return z.object({
    verificationId: z.string().min(1, getTranslation(ui, "errors", "missingVerificationId")),
    verificationCode: z.string().refine((val) => !val || val.length >= 6, {
      error: getTranslation(ui, "errors", "invalidVerificationCode"),
    }),
  });
}

/**
 * Creates a Zod schema for multi-factor phone authentication number form validation.
 *
 * Extends the phone number schema with a required display name field.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for multi-factor phone authentication number form validation.
 */
export function createMultiFactorPhoneAuthNumberFormSchema(ui: FirebaseUI) {
  const base = createPhoneAuthNumberFormSchema(ui);
  return base.extend({
    displayName: z.string().min(1, getTranslation(ui, "errors", "displayNameRequired")),
  });
}

/**
 * Creates a Zod schema for multi-factor phone authentication assertion form validation.
 *
 * Uses the same validation as the phone number form schema.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for multi-factor phone authentication assertion form validation.
 */
export function createMultiFactorPhoneAuthAssertionFormSchema(ui: FirebaseUI) {
  return createPhoneAuthNumberFormSchema(ui);
}

/**
 * Creates a Zod schema for multi-factor phone authentication verification form validation.
 *
 * Uses the same validation as the phone verification form schema.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for multi-factor phone authentication verification form validation.
 */
export function createMultiFactorPhoneAuthVerifyFormSchema(ui: FirebaseUI) {
  return createPhoneAuthVerifyFormSchema(ui);
}

/**
 * Creates a Zod schema for multi-factor TOTP authentication number form validation.
 *
 * Validates that a display name is provided.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for multi-factor TOTP authentication number form validation.
 */
export function createMultiFactorTotpAuthNumberFormSchema(ui: FirebaseUI) {
  return z.object({
    displayName: z.string().min(1, getTranslation(ui, "errors", "displayNameRequired")),
  });
}

/**
 * Creates a Zod schema for multi-factor TOTP authentication verification form validation.
 *
 * Validates that the verification code is exactly 6 characters long.
 *
 * @param ui - The FirebaseUI instance.
 * @returns A Zod schema for multi-factor TOTP authentication verification form validation.
 */
export function createMultiFactorTotpAuthVerifyFormSchema(ui: FirebaseUI) {
  return z.object({
    verificationCode: z.string().refine((val) => val.length === 6, {
      error: getTranslation(ui, "errors", "invalidVerificationCode"),
    }),
  });
}

/** The inferred type for the sign-in authentication form schema. */
export type SignInAuthFormSchema = z.infer<ReturnType<typeof createSignInAuthFormSchema>>;
/** The inferred type for the sign-up authentication form schema. */
export type SignUpAuthFormSchema = z.infer<ReturnType<typeof createSignUpAuthFormSchema>>;
/** The inferred type for the forgot password authentication form schema. */
export type ForgotPasswordAuthFormSchema = z.infer<ReturnType<typeof createForgotPasswordAuthFormSchema>>;
/** The inferred type for the email link authentication form schema. */
export type EmailLinkAuthFormSchema = z.infer<ReturnType<typeof createEmailLinkAuthFormSchema>>;
/** The inferred type for the phone authentication number form schema. */
export type PhoneAuthNumberFormSchema = z.infer<ReturnType<typeof createPhoneAuthNumberFormSchema>>;
/** The inferred type for the phone authentication verification form schema. */
export type PhoneAuthVerifyFormSchema = z.infer<ReturnType<typeof createPhoneAuthVerifyFormSchema>>;
/** The inferred type for the multi-factor phone authentication number form schema. */
export type MultiFactorPhoneAuthNumberFormSchema = z.infer<
  ReturnType<typeof createMultiFactorPhoneAuthNumberFormSchema>
>;
/** The inferred type for the multi-factor TOTP authentication number form schema. */
export type MultiFactorTotpAuthNumberFormSchema = z.infer<ReturnType<typeof createMultiFactorTotpAuthNumberFormSchema>>;
/** The inferred type for the multi-factor TOTP authentication verification form schema. */
export type MultiFactorTotpAuthVerifyFormSchema = z.infer<ReturnType<typeof createMultiFactorTotpAuthVerifyFormSchema>>;
