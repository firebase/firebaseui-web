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

import type { SignUpAuthFormSchema } from "@firebase-oss/ui-core";
import {
  useSignUpAuthFormAction,
  useSignUpAuthFormSchema,
  useUI,
  type SignUpAuthFormProps,
  useRequireDisplayName,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "./policies";

export type { SignUpAuthFormProps };

export function SignUpAuthForm(props: SignUpAuthFormProps) {
  const ui = useUI();
  const schema = useSignUpAuthFormSchema();
  const action = useSignUpAuthFormAction();
  const requireDisplayName = useRequireDisplayName();

  const form = useForm<SignUpAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      displayName: requireDisplayName ? "" : undefined,
    },
  });

  async function onSubmit(values: SignUpAuthFormSchema) {
    try {
      const credential = await action(values);
      props.onSignUp?.(credential);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        {requireDisplayName ? (
          <Controller
            control={form.control}
            name="displayName"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{getTranslation(ui, "labels", "displayName")}</FieldLabel>
                <Input {...field} />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}
          />
        ) : null}
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
              <FieldLabel>{getTranslation(ui, "labels", "password")}</FieldLabel>
              <Input {...field} type="password" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Policies />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "createAccount")}
        </Button>
        {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
        {props.onSignInClick ? (
          <Button type="button" variant="link" size="sm" onClick={props.onSignInClick}>
            <span className="text-xs">
              {getTranslation(ui, "prompts", "haveAccount")} {getTranslation(ui, "labels", "signIn")}
            </span>
          </Button>
        ) : null}
      </form>
    </FormProvider>
  );
}
