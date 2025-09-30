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
import { RefObject, useCallback, useRef, useState } from "react";
import { usePhoneAuthFormSchema, useRecaptchaVerifier, useUI } from "~/hooks";
import { form } from "~/components/form";
import { CountrySelector } from "~/components/country-selector";
import { Policies } from "~/components/policies";

export type PhoneAuthFormProps = {
  resendDelay?: number;
  onSignIn?: (credential: UserCredential) => void;
};

export function PhoneAuthForm(props: PhoneAuthFormProps) {
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  if (!confirmationResult) {
    return <PhoneNumberForm onSubmit={(result) => setConfirmationResult(result)} />;
  }

  return (
    <VerificationForm
      confirmationResult={confirmationResult}
      onSignIn={(credential) => {
        props.onSignIn?.(credential);
      }}
    />
  );
}

export function usePhoneNumberFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ phoneNumber, recaptchaVerifier }: { phoneNumber: string; recaptchaVerifier: RecaptchaVerifier }) => {
      return await signInWithPhoneNumber(ui, phoneNumber, recaptchaVerifier);
    },
    [ui]
  );
}

export function usePhoneNumberForm(
  ref: RefObject<HTMLDivElement | null>,
  onSuccess: (result: ConfirmationResult) => void,
  format?: (phoneNumber: string) => string
) {
  const ui = useUI();
  const schema = usePhoneAuthFormSchema();
  const phoneFormSchema = schema.pick({ phoneNumber: true });
  const recaptchaVerifier = useRecaptchaVerifier(ref);
  const action = usePhoneNumberFormAction();

  return form.useAppForm({
    defaultValues: {
      phoneNumber: "",
    },
    validators: {
      onBlur: phoneFormSchema,
      onSubmit: phoneFormSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          const formattedNumber = format ? format(value.phoneNumber) : value.phoneNumber;
          const credential = await action({ phoneNumber: formattedNumber, recaptchaVerifier: recaptchaVerifier! });
          return onSuccess(credential);
        } catch (error) {
          if (error instanceof FirebaseUIError) {
            return error.message;
          }

          console.error(error);
          return getTranslation(ui, "errors", "unknownError");
        }
      },
    },
  });
}

type PhoneNumberFormProps = {
  onSubmit: (confirmationResult: ConfirmationResult) => void;
};

function PhoneNumberForm(props: PhoneNumberFormProps) {
  const ui = useUI();

  // TODO: Default? Allowlist?
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryData[0].code);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const form = usePhoneNumberForm(recaptchaContainerRef, props.onSubmit, (phoneNumber) => {
    return formatPhoneNumberWithCountry(phoneNumber, selectedCountry);
  });

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
          <form.AppField
            name="phoneNumber"
            children={(field) => (
              <>
                <field.Input
                  label={getTranslation(ui, "labels", "phoneNumber")}
                  type="tel"
                  before={
                    <CountrySelector
                      value={selectedCountry}
                      onChange={(code) => setSelectedCountry(code as CountryCode)}
                    />
                  }
                />
              </>
            )}
          />
        </fieldset>

        <div ref={recaptchaContainerRef} />

        <fieldset>
          <Policies />
        </fieldset>

        <fieldset>
          <form.SubmitButton disabled={ui.state !== "idle"}>
            {getTranslation(ui, "labels", "sendCode")}
          </form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
      </form.AppForm>
    </form>
  );
}

export function usePhoneResendAction() {}

export function useVerificationFormAction() {
  const ui = useUI();
  return useCallback(
    async ({ confirmationResult, code }: { confirmationResult: ConfirmationResult; code: string }) => {
      console.log('confirmationResult', confirmationResult);
      console.log('code', code);
      return await confirmPhoneNumber(ui, confirmationResult, code);
    },
    [ui]
  );
}

export function useVerificationForm(confirmationResult: ConfirmationResult, onSuccess: (credential: UserCredential) => void) {
  const ui = useUI();
  const schema = usePhoneAuthFormSchema();
  const verificationFormSchema = schema.pick({ verificationCode: true });
  const action = useVerificationFormAction();

  return form.useAppForm({
    defaultValues: {
      verificationCode: "",
    },
    validators: {
      onSubmit: verificationFormSchema,
      onBlur: verificationFormSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          const credential = await action({
            confirmationResult,
            code: value.verificationCode,
          });
          console.log('credential', credential);
          return onSuccess(credential);
        } catch (error) {
          if (error instanceof FirebaseUIError) {
            return error.message;
          }

          console.error(error);
          return getTranslation(ui, "errors", "unknownError");
        }
      },
    },
  });
}

type VerificationFormProps = {
  confirmationResult: ConfirmationResult;
  onSignIn: (credential: UserCredential) => void;
};

function VerificationForm(props: VerificationFormProps) {
  const ui = useUI();
  const form = useVerificationForm(props.confirmationResult, props.onSignIn);

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
          <form.AppField
            name="verificationCode"
            children={(field) => <field.Input label={getTranslation(ui, "labels", "verificationCode")} type="text" />}
          />
        </fieldset>

        <fieldset>
          <form.SubmitButton disabled={ui.state !== "idle"}>
            {getTranslation(ui, "labels", "verifyCode")}
          </form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
      </form.AppForm>
    </form>
  );
}

