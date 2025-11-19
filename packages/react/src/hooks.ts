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

import { useContext, useMemo, useEffect, useRef } from "react";
import type { RecaptchaVerifier, User } from "firebase/auth";
import {
  createEmailLinkAuthFormSchema,
  createForgotPasswordAuthFormSchema,
  createMultiFactorPhoneAuthNumberFormSchema,
  createMultiFactorPhoneAuthVerifyFormSchema,
  createMultiFactorTotpAuthNumberFormSchema,
  createMultiFactorTotpAuthVerifyFormSchema,
  createPhoneAuthNumberFormSchema,
  createPhoneAuthVerifyFormSchema,
  createSignInAuthFormSchema,
  createSignUpAuthFormSchema,
  getBehavior,
} from "@firebase-oss/ui-core";
import { FirebaseUIContext } from "./context";

/**
 * Gets the FirebaseUI instance from the React context.
 *
 * @returns The FirebaseUI instance from the context.
 * @throws {Error} Throws an error if the hook is used outside of a FirebaseUIProvider.
 */
export function useUI() {
  const ui = useContext(FirebaseUIContext);

  if (!ui) {
    throw new Error(
      `No FirebaseUI context found. Your application must be wrapped in a FirebaseUIProvider:

const ui = initializeUI(...);

<FirebaseUIProvider ui={ui}>
  <App />
</FirebaseUIProvider>
`
    );
  }

  return ui;
}

/**
 * Sets up a callback that is called when a user is authenticated (non-anonymous).
 *
 * @param callback - Optional callback function that receives the authenticated user.
 */
export function useOnUserAuthenticated(callback?: (user: User) => void) {
  const ui = useUI();
  const auth = ui.auth;

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (user && !user.isAnonymous) {
        callback?.(user);
      }
    });
  }, [auth, callback]);
}

/**
 * Gets the redirect error message, if any, from the FirebaseUI instance.
 *
 * @returns The error message as a string, or undefined if there is no redirect error.
 */
export function useRedirectError() {
  const ui = useUI();
  return useMemo(() => {
    if (!ui.redirectError) {
      return;
    }

    return ui.redirectError instanceof Error ? ui.redirectError.message : String(ui.redirectError);
  }, [ui.redirectError]);
}

/**
 * Gets a memoized Zod schema for sign-in form validation.
 *
 * @returns A Zod schema for sign-in form validation.
 */
export function useSignInAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createSignInAuthFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for sign-up form validation.
 *
 * @returns A Zod schema for sign-up form validation.
 */
export function useSignUpAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createSignUpAuthFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for forgot password form validation.
 *
 * @returns A Zod schema for forgot password form validation.
 */
export function useForgotPasswordAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createForgotPasswordAuthFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for email link authentication form validation.
 *
 * @returns A Zod schema for email link authentication form validation.
 */
export function useEmailLinkAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createEmailLinkAuthFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for phone number form validation.
 *
 * @returns A Zod schema for phone number form validation.
 */
export function usePhoneAuthNumberFormSchema() {
  const ui = useUI();
  return useMemo(() => createPhoneAuthNumberFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for phone verification code form validation.
 *
 * @returns A Zod schema for phone verification form validation.
 */
export function usePhoneAuthVerifyFormSchema() {
  const ui = useUI();
  return useMemo(() => createPhoneAuthVerifyFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for multi-factor phone authentication number form validation.
 *
 * @returns A Zod schema for multi-factor phone authentication number form validation.
 */
export function useMultiFactorPhoneAuthNumberFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorPhoneAuthNumberFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for multi-factor phone authentication verification form validation.
 *
 * @returns A Zod schema for multi-factor phone authentication verification form validation.
 */
export function useMultiFactorPhoneAuthVerifyFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorPhoneAuthVerifyFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for multi-factor TOTP authentication number form validation.
 *
 * @returns A Zod schema for multi-factor TOTP authentication number form validation.
 */
export function useMultiFactorTotpAuthNumberFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorTotpAuthNumberFormSchema(ui), [ui]);
}

/**
 * Gets a memoized Zod schema for multi-factor TOTP authentication verification form validation.
 *
 * @returns A Zod schema for multi-factor TOTP authentication verification form validation.
 */
export function useMultiFactorTotpAuthVerifyFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorTotpAuthVerifyFormSchema(ui), [ui]);
}

/**
 * Creates and manages a reCAPTCHA verifier instance for phone authentication.
 *
 * The verifier is automatically rendered to the provided element and cleaned up when the element changes.
 *
 * @param ref - A React ref to the HTML element where the reCAPTCHA should be rendered.
 * @returns The reCAPTCHA verifier instance, or null if the element is not available.
 */
export function useRecaptchaVerifier(ref: React.RefObject<HTMLDivElement | null>) {
  const ui = useUI();
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const uiRef = useRef(ui);
  const prevElementRef = useRef<HTMLDivElement | null>(null);

  uiRef.current = ui;

  useEffect(() => {
    const currentElement = ref.current;
    const currentUI = uiRef.current;

    if (currentElement !== prevElementRef.current) {
      prevElementRef.current = currentElement;
      if (currentElement) {
        verifierRef.current = getBehavior(currentUI, "recaptchaVerification")(currentUI, currentElement);
        verifierRef.current.render();
      } else {
        verifierRef.current = null;
      }
    }
  }, [ref]);

  return verifierRef.current;
}
