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

import { z } from "zod";
import { RecaptchaVerifier } from "firebase/auth";
import { getTranslation } from "./translations";
import { FirebaseUIConfiguration } from "./config";

export const LoginTypes = ["email", "phone", "anonymous", "emailLink", "google"] as const;
export type LoginType = (typeof LoginTypes)[number];
export type AuthMode = "signIn" | "signUp";

export function createSignInAuthFormSchema(ui: FirebaseUIConfiguration) {
  return z.object({
    email: z.string().email({ message: getTranslation(ui, "errors", "invalidEmail") }),
    password: z.string().min(8, { message: getTranslation(ui, "errors", "weakPassword") }),
  });
}

export function createSignUpAuthFormSchema(ui: FirebaseUIConfiguration) {
  return z.object({
    email: z.string().email({ message: getTranslation(ui, "errors", "invalidEmail") }),
    password: z.string().min(8, { message: getTranslation(ui, "errors", "weakPassword") }),
  });
}

export function createForgotPasswordAuthFormSchema(ui: FirebaseUIConfiguration) {
  return z.object({
    email: z.string().email({ message: getTranslation(ui, "errors", "invalidEmail") }),
  });
}

export function createEmailLinkAuthFormSchema(ui: FirebaseUIConfiguration) {
  return z.object({
    email: z.string().email({ message: getTranslation(ui, "errors", "invalidEmail") }),
  });
}

export function createPhoneAuthFormSchema(ui: FirebaseUIConfiguration) {
  return z.object({
    phoneNumber: z
      .string()
      .min(1, { message: getTranslation(ui, "errors", "missingPhoneNumber") })
      .max(10, { message: getTranslation(ui, "errors", "invalidPhoneNumber") }),
    verificationCode: z.string().refine((val) => !val || val.length >= 6, {
      message: getTranslation(ui, "errors", "invalidVerificationCode"),
    }),
    recaptchaVerifier: z.instanceof(RecaptchaVerifier),
  });
}

export type SignInAuthFormSchema = z.infer<ReturnType<typeof createSignInAuthFormSchema>>;
export type SignUpAuthFormSchema = z.infer<ReturnType<typeof createSignUpAuthFormSchema>>;
export type ForgotPasswordAuthFormSchema = z.infer<ReturnType<typeof createForgotPasswordAuthFormSchema>>;
export type EmailLinkAuthFormSchema = z.infer<ReturnType<typeof createEmailLinkAuthFormSchema>>;
export type PhoneAuthFormSchema = z.infer<ReturnType<typeof createPhoneAuthFormSchema>>;
