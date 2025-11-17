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

import { useCallback } from "react";
import { TotpMultiFactorGenerator, type MultiFactorInfo, type UserCredential } from "firebase/auth";
import { signInWithMultiFactorAssertion, FirebaseUIError, getTranslation } from "@invertase/firebaseui-core";
import { form } from "~/components/form";
import { useMultiFactorTotpAuthVerifyFormSchema, useUI } from "~/hooks";

/**
 * Creates a memoized action function for verifying a TOTP code during multi-factor assertion.
 *
 * @returns A callback function that verifies the TOTP code and signs in with the multi-factor assertion.
 */
export function useTotpMultiFactorAssertionFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ verificationCode, hint }: { verificationCode: string; hint: MultiFactorInfo }) => {
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, verificationCode);
      return await signInWithMultiFactorAssertion(ui, assertion);
    },
    [ui]
  );
}

/** Options for the TOTP multi-factor assertion form hook. */
export type UseTotpMultiFactorAssertionForm = {
  /** The multi-factor info hint containing TOTP information. */
  hint: MultiFactorInfo;
  /** Callback function called when verification is successful. */
  onSuccess: (credential: UserCredential) => void;
};

/**
 * Creates a form hook for TOTP multi-factor assertion verification code input.
 *
 * @param options - The TOTP assertion form options.
 * @returns A form instance configured for TOTP verification code input.
 */
export function useTotpMultiFactorAssertionForm({ hint, onSuccess }: UseTotpMultiFactorAssertionForm) {
  const action = useTotpMultiFactorAssertionFormAction();
  const schema = useMultiFactorTotpAuthVerifyFormSchema();

  return form.useAppForm({
    defaultValues: {
      verificationCode: "",
    },
    validators: {
      onBlur: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const credential = await action({ verificationCode: value.verificationCode, hint });
          return onSuccess(credential);
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

/** Props for the TotpMultiFactorAssertionForm component. */
export type TotpMultiFactorAssertionFormProps = {
  /** The multi-factor info hint containing TOTP information. */
  hint: MultiFactorInfo;
  /** Optional callback function called when multi-factor assertion is successful. */
  onSuccess?: (credential: UserCredential) => void;
};

/**
 * A form component for TOTP multi-factor authentication assertion.
 *
 * Allows users to enter a 6-digit TOTP code from their authenticator app.
 *
 * @returns The TOTP multi-factor assertion form component.
 */
export function TotpMultiFactorAssertionForm(props: TotpMultiFactorAssertionFormProps) {
  const ui = useUI();
  const form = useTotpMultiFactorAssertionForm({
    hint: props.hint,
    onSuccess: (credential) => {
      props.onSuccess?.(credential);
    },
  });

  return (
    <form
      className="fui-form"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <form.AppForm>
        <fieldset>
          <form.AppField name="verificationCode">
            {(field) => (
              <field.Input
                description={getTranslation(ui, "prompts", "enterVerificationCode")}
                label={getTranslation(ui, "labels", "verificationCode")}
                type="text"
                placeholder="123456"
                maxLength={6}
              />
            )}
          </form.AppField>
        </fieldset>
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "verifyCode")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
      </form.AppForm>
    </form>
  );
}
