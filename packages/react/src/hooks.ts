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

import { useContext, useMemo, useEffect, useState } from "react";
import type { RecaptchaVerifier } from "firebase/auth";
import { createEmailLinkAuthFormSchema, createForgotPasswordAuthFormSchema, createPhoneAuthFormSchema, createSignInAuthFormSchema, createSignUpAuthFormSchema, getBehavior, hasBehavior } from "@firebase-ui/core";
import { FirebaseUIContext } from "./context";

/**
 * Get the UI configuration from the context.
 */
export function useUI() {
  const ui = useContext(FirebaseUIContext);

  if (!ui) {
    throw new Error("No FirebaseUI context found. Your application must be wrapped in a <FirebaseUIProvider> component.");
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

export function usePhoneAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createPhoneAuthFormSchema(ui), [ui]);
}

export function useRecaptchaVerifier(ref: React.RefObject<HTMLDivElement | null>) {
  const ui = useUI();
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  useEffect(() => {
    const element = ref.current;
    
    if (!element || !hasBehavior(ui, "recaptchaVerification")) {
      setRecaptchaVerifier(null);
      return;
    }

    const verifier = getBehavior(ui, "recaptchaVerification")(ui, element);

    verifier.render().then(() => {
      setRecaptchaVerifier(verifier);
    });

    return () => {
      verifier.clear();
    };
  }, []);
  
  return recaptchaVerifier;
}