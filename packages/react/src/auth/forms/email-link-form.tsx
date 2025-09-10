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
  createEmailLinkFormSchema,
  getTranslation,
  sendSignInLinkToEmail,
} from "@firebase-ui/core";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import { useAuth, useUI } from "~/hooks";
import { Button } from "../../components/button";
import { FieldInfo } from "../../components/field-info";
import { Policies } from "../../components/policies";

interface EmailLinkFormProps {}

export function EmailLinkForm(_: EmailLinkFormProps) {
  const ui = useUI();
  const auth = useAuth(ui);

  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [firstValidationOccured, setFirstValidationOccured] = useState(false);

  const emailLinkFormSchema = useMemo(
    () => createEmailLinkFormSchema(ui.translations),
    [ui.translations]
  );

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: emailLinkFormSchema,
      onSubmit: emailLinkFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await sendSignInLinkToEmail(ui, value.email);
        setEmailSent(true);
      } catch (error) {
        if (error instanceof FirebaseUIError) {
          setFormError(error.message);
          return;
        }

        console.error(error);
        setFormError(getTranslation(ui, "errors", "unknownError"));
      }
    },
  });

  // Handle email link sign-in if URL contains the link
  useEffect(() => {
    const completeSignIn = async () => {
      try {
        await completeEmailLinkSignIn(ui, window.location.href);
      } catch (error) {
        if (error instanceof FirebaseUIError) {
          setFormError(error.message);
        }
      }
    };

    void completeSignIn();
  }, [auth, ui.translations]);

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
      <fieldset>
        <form.Field
          name="email"
          children={(field) => (
            <>
              <label htmlFor={field.name}>
                <span>{getTranslation(ui, "labels", "emailAddress")}</span>
                <input
                  aria-invalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={() => {
                    setFirstValidationOccured(true);
                    field.handleBlur();
                  }}
                  onInput={(e) => {
                    field.handleChange((e.target as HTMLInputElement).value);
                    if (firstValidationOccured) {
                      field.handleBlur();
                      form.update();
                    }
                  }}
                />
                <FieldInfo field={field} />
              </label>
            </>
          )}
        />
      </fieldset>

      <Policies />

      <fieldset>
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "sendSignInLink")}
        </Button>
        {formError && <div className="fui-form__error">{formError}</div>}
      </fieldset>
    </form>
  );
}
