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

import { FirebaseUIError, getTranslation, signInWithEmailAndPassword } from "@firebase-ui/core";
import type { UserCredential } from "firebase/auth";
import { useSignInAuthFormSchema, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { useCallback } from "react";

export type SignInAuthFormProps = {
  onSignIn?: (credential: UserCredential) => void;
  onForgotPasswordClick?: () => void;
  onSignUpClick?: () => void;
};

export function useSignInAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        return await signInWithEmailAndPassword(ui, email, password);
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

export function useSignInAuthForm(onSuccess?: SignInAuthFormProps["onSignIn"]) {
  const schema = useSignInAuthFormSchema();
  const action = useSignInAuthFormAction();

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

export function SignInAuthForm({ onSignIn, onForgotPasswordClick, onSignUpClick }: SignInAuthFormProps) {
  const ui = useUI();
  const form = useSignInAuthForm(onSignIn);

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
        <fieldset>
          <form.AppField name="password">
            {(field) => (
              <field.Input label={getTranslation(ui, "labels", "password")} type="password">
                {onForgotPasswordClick ? (
                  <form.Action onClick={onForgotPasswordClick}>
                    {getTranslation(ui, "labels", "forgotPassword")}
                  </form.Action>
                ) : null}
              </field.Input>
            )}
          </form.AppField>
        </fieldset>
        <Policies />
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "signIn")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
        {onSignUpClick ? (
          <form.Action onClick={onSignUpClick}>
            {getTranslation(ui, "prompts", "noAccount")} {getTranslation(ui, "labels", "signUp")}
          </form.Action>
        ) : null}
      </form.AppForm>
    </form>
  );
}
