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

import { useContext, useMemo, useEffect } from "react";
import {
  createEmailLinkAuthFormSchema,
  createForgotPasswordAuthFormSchema,
  createPhoneAuthNumberFormSchema,
  createPhoneAuthVerifyFormSchema,
  createSignInAuthFormSchema,
  createSignUpAuthFormSchema,
  getBehavior,
  hasBehavior,
} from "@invertase/firebaseui-core";
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

export function useRecaptchaVerifier(ref: React.RefObject<HTMLDivElement | null>) {
  const ui = useUI();

  const verifier = useMemo(() => {
    return ref.current && hasBehavior(ui, "recaptchaVerification")
      ? getBehavior(ui, "recaptchaVerification")(ui, ref.current)
      : null;
  }, [ref, ui]);

  useEffect(() => {
    if (verifier) {
      verifier.render();
    }
  }, [verifier]);

  return verifier;
}
