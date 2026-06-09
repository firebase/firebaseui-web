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

import type { SignInAuthFormSchema } from "@firebase-oss/ui-core";
import {
  useSignInAuthFormAction,
  useSignInAuthFormSchema,
  useUI,
  type SignInAuthFormProps,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "./policies";

export type { SignInAuthFormProps };

export function SignInAuthForm(props: SignInAuthFormProps) {
  const ui = useUI();
  const schema = useSignInAuthFormSchema();
  const action = useSignInAuthFormAction();

  const form = useForm<SignInAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInAuthFormSchema) {
    try {
      const credential = await action(values);
      props.onSignIn?.(credential);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{getTranslation(ui, "labels", "emailAddress")}</FieldLabel>
              <Input {...field} type="email" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <span className="grow">{getTranslation(ui, "labels", "password")}</span>
                {props.onForgotPasswordClick ? (
                  <Button type="button" variant="link" onClick={props.onForgotPasswordClick} size="sm">
                    <span className="text-xs">{getTranslation(ui, "labels", "forgotPassword")}</span>
                  </Button>
                ) : null}
              </FieldLabel>
              <Input {...field} type="password" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Policies />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "signIn")}
        </Button>
        {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
        {props.onSignUpClick ? (
          <>
            <Button type="button" variant="link" size="sm" onClick={props.onSignUpClick}>
              <span className="text-xs">
                {getTranslation(ui, "prompts", "noAccount")} {getTranslation(ui, "labels", "signUp")}
              </span>
            </Button>
          </>
        ) : null}
      </form>
    </FormProvider>
  );
}
