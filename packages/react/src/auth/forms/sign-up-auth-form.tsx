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

import { FirebaseUIError, getTranslation, createUserWithEmailAndPassword } from "@firebase-ui/core";
import type { UserCredential } from "firebase/auth";
import { useSignUpAuthFormSchema, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { useCallback } from "react";

export type SignUpAuthFormProps = {
  onSignUp?: (credential: UserCredential) => void;
  onBackToSignInClick?: () => void;
};

export function useSignUpAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        return await createUserWithEmailAndPassword(ui, email, password);
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

export function useSignUpAuthForm(onSuccess?: SignUpAuthFormProps["onSignUp"]) {
  const schema = useSignUpAuthFormSchema();
  const action = useSignUpAuthFormAction();

  return form.useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: schema,
      onSubmit: schema,
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

export function SignUpAuthForm({ onBackToSignInClick, onSignUp }: SignUpAuthFormProps) {
  const ui = useUI();
  const form = useSignUpAuthForm(onSignUp);

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
        <fieldset>
          <form.AppField name="password">{(field) => <field.Input label="Password" type="password" />}</form.AppField>
        </fieldset>
        <Policies />
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "createAccount")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
        {onBackToSignInClick ? (
          <form.Action onClick={onBackToSignInClick}>
            {getTranslation(ui, "prompts", "haveAccount")} {getTranslation(ui, "labels", "signIn")}
          </form.Action>
        ) : null}
      </form.AppForm>
    </form>
  );
}
