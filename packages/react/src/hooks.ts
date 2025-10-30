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
import type { RecaptchaVerifier } from "firebase/auth";
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
} from "@firebase-ui/core";
import { FirebaseUIContext } from "./context";

/**
 * Get the UI configuration from the context.
 */
export function useUI() {
  const ui = useContext(FirebaseUIContext);

  if (!ui) {
    throw new Error(
      "No FirebaseUI context found. Your application must be wrapped in a <FirebaseUIProvider> component."
    );
  }

  return ui;
}

export function useRedirectError() {
  const ui = useUI();
  return useMemo(() => {
    if (!ui.redirectError) {
      return;
    }

    return ui.redirectError instanceof Error ? ui.redirectError.message : String(ui.redirectError);
  }, [ui.redirectError]);
}

export function useSignInAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createSignInAuthFormSchema(ui), [ui]);
}

export function useSignUpAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createSignUpAuthFormSchema(ui), [ui]);
}

export function useForgotPasswordAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createForgotPasswordAuthFormSchema(ui), [ui]);
}

export function useEmailLinkAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createEmailLinkAuthFormSchema(ui), [ui]);
}

export function usePhoneAuthNumberFormSchema() {
  const ui = useUI();
  return useMemo(() => createPhoneAuthNumberFormSchema(ui), [ui]);
}

export function usePhoneAuthVerifyFormSchema() {
  const ui = useUI();
  return useMemo(() => createPhoneAuthVerifyFormSchema(ui), [ui]);
}

export function useMultiFactorPhoneAuthNumberFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorPhoneAuthNumberFormSchema(ui), [ui]);
}

export function useMultiFactorPhoneAuthVerifyFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorPhoneAuthVerifyFormSchema(ui), [ui]);
}

export function useMultiFactorTotpAuthNumberFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorTotpAuthNumberFormSchema(ui), [ui]);
}

export function useMultiFactorTotpAuthVerifyFormSchema() {
  const ui = useUI();
  return useMemo(() => createMultiFactorTotpAuthVerifyFormSchema(ui), [ui]);
}

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
