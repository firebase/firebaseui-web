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

import { FirebaseUIError, completeEmailLinkSignIn, getTranslation, sendSignInLinkToEmail } from "@firebase-ui/core";
import type { UserCredential } from "firebase/auth";
import { useEmailLinkAuthFormSchema, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { useCallback, useEffect, useState } from "react";

export type EmailLinkAuthFormProps = {
  onEmailSent?: () => void;
  onSignIn?: (credential: UserCredential) => void;
};

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

export function useEmailLinkAuthForm(onSuccess?: EmailLinkAuthFormProps["onEmailSent"]) {
  const schema = useEmailLinkAuthFormSchema();
  const action = useEmailLinkAuthFormAction();

  return form.useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: schema,
      onSubmit: schema,
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
  }, [ui, onSignIn]);
}

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
          <form.AppField name="email">{(field) => <field.Input label="Email" type="email" />}</form.AppField>
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
