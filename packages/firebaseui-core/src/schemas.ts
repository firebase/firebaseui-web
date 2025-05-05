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

import { z } from 'zod';
import { RecaptchaVerifier } from 'firebase/auth';
import { type TranslationsConfig, getTranslation } from '@firebase-ui/translations';

export const LoginTypes = ['email', 'phone', 'anonymous', 'emailLink', 'google'] as const;
export type LoginType = (typeof LoginTypes)[number];
export type AuthMode = 'signIn' | 'signUp';

export function createEmailFormSchema(translations?: TranslationsConfig) {
  return z.object({
    email: z.string().email({ message: getTranslation('errors', 'invalidEmail', translations) }),
    password: z.string().min(8, { message: getTranslation('errors', 'weakPassword', translations) }),
  });
}

export function createForgotPasswordFormSchema(translations?: TranslationsConfig) {
  return z.object({
    email: z.string().email({ message: getTranslation('errors', 'invalidEmail', translations) }),
  });
}

export function createEmailLinkFormSchema(translations?: TranslationsConfig) {
  return z.object({
    email: z.string().email({ message: getTranslation('errors', 'invalidEmail', translations) }),
  });
}

export function createPhoneFormSchema(translations?: TranslationsConfig) {
  return z.object({
    phoneNumber: z
      .string()
      .min(1, { message: getTranslation('errors', 'missingPhoneNumber', translations) })
      .min(10, { message: getTranslation('errors', 'invalidPhoneNumber', translations) }),
    verificationCode: z.string().refine((val) => !val || val.length >= 6, {
      message: getTranslation('errors', 'invalidVerificationCode', translations),
    }),
    recaptchaVerifier: z.instanceof(RecaptchaVerifier),
  });
}

export type EmailFormSchema = z.infer<ReturnType<typeof createEmailFormSchema>>;
export type ForgotPasswordFormSchema = z.infer<ReturnType<typeof createForgotPasswordFormSchema>>;
export type EmailLinkFormSchema = z.infer<ReturnType<typeof createEmailLinkFormSchema>>;
export type PhoneFormSchema = z.infer<ReturnType<typeof createPhoneFormSchema>>;
