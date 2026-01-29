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

import { FirebaseUIError, getTranslation, sendPasswordResetEmail } from "@firebase-oss/ui-core";
import { useForgotPasswordAuthFormSchema, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { useCallback, useState } from "react";

/** Props for the ForgotPasswordAuthForm component. */
export type ForgotPasswordAuthFormProps = {
  /** Callback function called when the password reset email is sent. */
  onPasswordSent?: () => void;
  /** Callback function called when the back to sign in link is clicked. */
  onBackToSignInClick?: () => void;
};

/**
 * Creates a memoized action function for sending a password reset email.
 *
 * @returns A callback function that sends a password reset email to the specified address.
 */
export function useForgotPasswordAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ email }: { email: string }) => {
      try {
        return await sendPasswordResetEmail(ui, email);
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
 * Creates a form hook for forgot password authentication.
 *
 * @param onSuccess - Optional callback function called when the password reset email is sent.
 * @returns A form instance configured for forgot password.
 */
export function useForgotPasswordAuthForm(onSuccess?: ForgotPasswordAuthFormProps["onPasswordSent"]) {
  const schema = useForgotPasswordAuthFormSchema();
  const action = useForgotPasswordAuthFormAction();

  return form.useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await action(value);
          return onSuccess?.();
        } catch (error) {
          return error instanceof Error ? error.message : String(error);
        }
      },
    },
  });
}

/**
 * A form component for requesting a password reset email.
 *
 * Displays a success message after the email is sent.
 *
 * @returns The forgot password form component.
 */
export function ForgotPasswordAuthForm({ onBackToSignInClick, onPasswordSent }: ForgotPasswordAuthFormProps) {
  const ui = useUI();
  const [emailSent, setEmailSent] = useState(false);
  const form = useForgotPasswordAuthForm(() => {
    setEmailSent(true);
    onPasswordSent?.();
  });

  if (emailSent) {
    return <div className="fui-success">{getTranslation(ui, "messages", "checkEmailForReset")}</div>;
  }

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
          <form.AppField name="email">
            {(field) => <field.Input label={getTranslation(ui, "labels", "emailAddress")} type="email" />}
          </form.AppField>
        </fieldset>
        <Policies />
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "resetPassword")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
        {onBackToSignInClick ? (
          <form.Action onClick={onBackToSignInClick}>&larr; {getTranslation(ui, "labels", "backToSignIn")}</form.Action>
        ) : null}
      </form.AppForm>
    </form>
  );
}
