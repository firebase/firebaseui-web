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

"use client";

import { FirebaseUIError, getTranslation, createUserWithEmailAndPassword, hasBehavior } from "@firebase-oss/ui-core";
import type { UserCredential } from "firebase/auth";
import { useSignUpAuthFormSchema, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { useCallback } from "react";
import { type z } from "zod";

/**
 * Checks if the requireDisplayName behavior is enabled.
 *
 * @returns True if display name is required, false otherwise.
 */
export function useRequireDisplayName() {
  const ui = useUI();
  return hasBehavior(ui, "requireDisplayName");
}

/** Props for the SignUpAuthForm component. */
export type SignUpAuthFormProps = {
  /** Callback function called when sign-up is successful. */
  onSignUp?: (credential: UserCredential) => void;
  /** Callback function called when the sign in link is clicked. */
  onSignInClick?: () => void;
};

/**
 * Creates a memoized action function for signing up with email and password.
 *
 * @returns A callback function that creates a new user account with email and password.
 */
export function useSignUpAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
      try {
        return await createUserWithEmailAndPassword(ui, email, password, displayName);
      } catch (error) {
        if (error instanceof FirebaseUIError) {
          throw new Error(error.message);
        }

        console.error(error);
        throw new Error(getTranslation(ui, "errors", "unknownError"));
      }
    },
    [ui]
  );
}

/**
 * Creates a form hook for sign-up authentication.
 *
 * @param onSuccess - Optional callback function called when sign-up is successful.
 * @returns A form instance configured for sign-up.
 */
export function useSignUpAuthForm(onSuccess?: SignUpAuthFormProps["onSignUp"]) {
  const schema = useSignUpAuthFormSchema();
  const action = useSignUpAuthFormAction();
  const requireDisplayName = useRequireDisplayName();

  return form.useAppForm({
    defaultValues: {
      email: "",
      password: "",
      displayName: requireDisplayName ? "" : undefined,
    } as z.infer<typeof schema>,
    validators: {
      onChange: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const credential = await action(value);
          return onSuccess?.(credential);
        } catch (error) {
          return error instanceof Error ? error.message : String(error);
        }
      },
    },
  });
}

/**
 * A form component for signing up with email and password.
 *
 * Optionally includes a display name field if the requireDisplayName behavior is enabled.
 *
 * @returns The sign-up form component.
 */
export function SignUpAuthForm({ onSignInClick, onSignUp }: SignUpAuthFormProps) {
  const ui = useUI();
  const form = useSignUpAuthForm(onSignUp);
  const requireDisplayName = useRequireDisplayName();

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
        {requireDisplayName ? (
          <fieldset>
            <form.AppField name="displayName">
              {(field) => <field.Input label={getTranslation(ui, "labels", "displayName")} />}
            </form.AppField>
          </fieldset>
        ) : null}
        <fieldset>
          <form.AppField name="email">
            {(field) => <field.Input label={getTranslation(ui, "labels", "emailAddress")} type="email" />}
          </form.AppField>
        </fieldset>
        <fieldset>
          <form.AppField name="password">
            {(field) => <field.Input label={getTranslation(ui, "labels", "password")} type="password" />}
          </form.AppField>
        </fieldset>
        <Policies />
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "createAccount")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
        {onSignInClick ? (
          <form.Action onClick={onSignInClick}>
            {getTranslation(ui, "prompts", "haveAccount")} {getTranslation(ui, "labels", "signIn")}
          </form.Action>
        ) : null}
      </form.AppForm>
    </form>
  );
}
