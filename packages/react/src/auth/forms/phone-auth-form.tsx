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
  confirmPhoneNumber,
  CountryCode,
  countryData,
  FirebaseUIError,
  formatPhoneNumberWithCountry,
  getTranslation,
  signInWithPhoneNumber,
} from "@firebase-ui/core";
import { ConfirmationResult, RecaptchaVerifier, UserCredential } from "firebase/auth";
import { useCallback, useRef, useState } from "react";
import { usePhoneAuthFormSchema, useRecaptchaVerifier, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { CountrySelector } from "~/components/country-selector";

export function usePhoneNumberFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ phoneNumber, recaptchaVerifier }: { phoneNumber: string; recaptchaVerifier: RecaptchaVerifier }) => {
      return await signInWithPhoneNumber(ui, phoneNumber, recaptchaVerifier);
    },
    [ui]
  );
}

type UsePhoneNumberForm = {
  recaptchaVerifier: RecaptchaVerifier;
  onSuccess: (confirmationResult: ConfirmationResult) => void;
  formatPhoneNumber?: (phoneNumber: string) => string;
};

export function usePhoneNumberForm({ recaptchaVerifier, onSuccess, formatPhoneNumber }: UsePhoneNumberForm) {
  const action = usePhoneNumberFormAction();
  const schema = usePhoneAuthFormSchema().pick({ phoneNumber: true });

  return form.useAppForm({
    defaultValues: {
      phoneNumber: "",
    },
    validators: {
      onBlur: schema,
      onSubmit: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const formatted = formatPhoneNumber ? formatPhoneNumber(value.phoneNumber) : value.phoneNumber;
          const confirmationResult = await action({ phoneNumber: formatted, recaptchaVerifier });
          return onSuccess(confirmationResult);
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

type PhoneNumberFormProps = {
  onSubmit: (confirmationResult: ConfirmationResult) => void;
};

export function PhoneNumberForm(props: PhoneNumberFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const form = usePhoneNumberForm({
    recaptchaVerifier: recaptchaVerifier!,
    onSuccess: props.onSubmit,
    formatPhoneNumber: (phoneNumber) => formatPhoneNumberWithCountry(phoneNumber, selectedCountry),
  });

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryData[0].code);

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
          <form.AppField name="phoneNumber">
            {(field) => (
              <field.Input
                label={getTranslation(ui, "labels", "phoneNumber")}
                type="tel"
                before={
                  <CountrySelector
                    value={selectedCountry}
                    onChange={(code) => setSelectedCountry(code as CountryCode)}
                    className="fui-phone-input__country-selector"
                  />
                }
              />
            )}
          </form.AppField>
        </fieldset>
        <fieldset>
          <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
        </fieldset>
        <Policies />
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "sendCode")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
      </form.AppForm>
    </form>
  );
}

export function useVerifyPhoneNumberFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ confirmation, code }: { confirmation: ConfirmationResult; code: string }) => {
      return await confirmPhoneNumber(ui, confirmation, code);
    },
    [ui]
  );
}

type UseVerifyPhoneNumberForm = {
  confirmation: ConfirmationResult;
  onSuccess: (credential: UserCredential) => void;
};

export function useVerifyPhoneNumberForm({ confirmation, onSuccess }: UseVerifyPhoneNumberForm) {
  const schema = usePhoneAuthFormSchema().pick({ verificationCode: true });
  const action = useVerifyPhoneNumberFormAction();

  return form.useAppForm({
    defaultValues: {
      verificationCode: "",
    },
    validators: {
      onSubmit: schema,
      onBlur: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const credential = await action({ confirmation, code: value.verificationCode });
          return onSuccess(credential);
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

type VerifyPhoneNumberFormProps = {
  onSuccess: (credential: UserCredential) => void;
  confirmation: ConfirmationResult;
};

function VerifyPhoneNumberForm(props: VerifyPhoneNumberFormProps) {
  const ui = useUI();
  const form = useVerifyPhoneNumberForm({ confirmation: props.confirmation, onSuccess: props.onSuccess });

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
            {(field) => <field.Input label={getTranslation(ui, "labels", "verificationCode")} type="text" />}
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

export type PhoneAuthFormProps = {
  onSignIn?: (credential: UserCredential) => void;
};

export function PhoneAuthForm(props: PhoneAuthFormProps) {
  const [result, setResult] = useState<ConfirmationResult | null>(null);

  if (!result) {
    return <PhoneNumberForm onSubmit={setResult} />;
  }

  return (
    <VerifyPhoneNumberForm
      confirmation={result}
      onSuccess={(credential) => {
        props.onSignIn?.(credential);
      }}
    />
  );
}
