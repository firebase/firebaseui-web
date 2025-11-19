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

import {
  FirebaseUIError,
  completeEmailLinkSignIn,
  getTranslation,
  sendSignInLinkToEmail,
} from "@invertase/firebaseui-core";
import type { UserCredential } from "firebase/auth";
import { useEmailLinkAuthFormSchema, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { useCallback, useEffect, useState } from "react";

/** Props for the EmailLinkAuthForm component. */
export type EmailLinkAuthFormProps = {
  /** Callback function called when the sign-in link email is sent. */
  onEmailSent?: () => void;
  /** Callback function called when sign-in is completed via the email link. */
  onSignIn?: (credential: UserCredential) => void;
};

/**
 * Creates a memoized action function for sending a sign-in link to an email address.
 *
 * @returns A callback function that sends a sign-in link to the specified email address.
 */
export function useEmailLinkAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ email }: { email: string }) => {
      try {
        return await sendSignInLinkToEmail(ui, email);
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
 * Creates a form hook for email link authentication.
 *
 * @param onSuccess - Optional callback function called when the sign-in link email is sent.
 * @returns A form instance configured for email link authentication.
 */
export function useEmailLinkAuthForm(onSuccess?: EmailLinkAuthFormProps["onEmailSent"]) {
  const schema = useEmailLinkAuthFormSchema();
  const action = useEmailLinkAuthFormAction();

  return form.useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: schema,
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
 * Hook that automatically completes the email link sign-in process when the component mounts.
 *
 * Checks if the current URL contains a valid email link sign-in link and completes the authentication.
 *
 * @param onSignIn - Optional callback function called when sign-in is completed.
 */
export function useEmailLinkAuthFormCompleteSignIn(onSignIn?: EmailLinkAuthFormProps["onSignIn"]) {
  const ui = useUI();

  useEffect(() => {
    const completeSignIn = async () => {
      const credential = await completeEmailLinkSignIn(ui, window.location.href);
      if (credential) {
        onSignIn?.(credential);
      }
    };

    void completeSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO(ehesp): ui triggers re-render
  }, [onSignIn]);
}

/**
 * A form component for email link authentication.
 *
 * Sends a sign-in link to the user's email address and automatically completes sign-in
 * if the user arrives via an email link.
 *
 * @returns The email link auth form component.
 */
export function EmailLinkAuthForm({ onEmailSent, onSignIn }: EmailLinkAuthFormProps) {
  const ui = useUI();
  const [emailSent, setEmailSent] = useState(false);

  const form = useEmailLinkAuthForm(() => {
    setEmailSent(true);
    onEmailSent?.();
  });

  useEmailLinkAuthFormCompleteSignIn(onSignIn);

  if (emailSent) {
    return <div className="fui-success">{getTranslation(ui, "messages", "signInLinkSent")}</div>;
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
          <form.SubmitButton>{getTranslation(ui, "labels", "sendSignInLink")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
      </form.AppForm>
    </form>
  );
}
