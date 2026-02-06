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
  formatPhoneNumber,
  getTranslation,
  verifyPhoneNumber,
  confirmPhoneNumber,
} from "@firebase-oss/ui-core";
import { type RecaptchaVerifier, type UserCredential } from "firebase/auth";
import { useCallback, useRef, useState } from "react";
import { usePhoneAuthNumberFormSchema, usePhoneAuthVerifyFormSchema, useRecaptchaVerifier, useUI } from "~/hooks";
import { form } from "~/components/form";
import { Policies } from "~/components/policies";
import { CountrySelector, type CountrySelectorRef } from "~/components/country-selector";

/**
 * Creates a memoized action function for verifying a phone number.
 *
 * @returns A callback function that verifies a phone number using the provided reCAPTCHA verifier.
 */
export function usePhoneNumberFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ phoneNumber, recaptchaVerifier }: { phoneNumber: string; recaptchaVerifier: RecaptchaVerifier }) => {
      return await verifyPhoneNumber(ui, phoneNumber, recaptchaVerifier);
    },
    [ui]
  );
}

/** Options for the phone number form hook. */
type UsePhoneNumberForm = {
  /** The reCAPTCHA verifier instance. */
  recaptchaVerifier: RecaptchaVerifier;
  /** Callback function called when phone verification is successful. */
  onSuccess: (verificationId: string) => void;
  /** Optional function to format the phone number before verification. */
  formatPhoneNumber?: (phoneNumber: string) => string;
};

/**
 * Creates a form hook for phone number verification.
 *
 * @param options - The phone number form options.
 * @returns A form instance configured for phone number input and verification.
 */
export function usePhoneNumberForm({ recaptchaVerifier, onSuccess, formatPhoneNumber }: UsePhoneNumberForm) {
  const action = usePhoneNumberFormAction();
  const schema = usePhoneAuthNumberFormSchema();

  return form.useAppForm({
    defaultValues: {
      phoneNumber: "",
    },
    validators: {
      onChange: schema,
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

/** Props for the PhoneNumberForm component. */
type PhoneNumberFormProps = {
  /** Callback function called when phone verification is successful. */
  onSubmit: (verificationId: string) => void;
};

/**
 * A form component for entering and verifying a phone number.
 *
 * Includes a country selector and reCAPTCHA verification.
 *
 * @returns The phone number form component.
 */
export function PhoneNumberForm(props: PhoneNumberFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const countrySelector = useRef<CountrySelectorRef>(null);
  const form = usePhoneNumberForm({
    recaptchaVerifier: recaptchaVerifier!,
    onSuccess: props.onSubmit,
    formatPhoneNumber: (phoneNumber) => formatPhoneNumber(phoneNumber, countrySelector.current!.getCountry()),
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
          <form.AppField name="phoneNumber">
            {(field) => (
              <field.Input
                label={getTranslation(ui, "labels", "phoneNumber")}
                type="tel"
                before={<CountrySelector ref={countrySelector} />}
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

/**
 * Creates a memoized action function for verifying a phone verification code.
 *
 * @returns A callback function that confirms the phone number using the verification ID and code.
 */
export function useVerifyPhoneNumberFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ verificationId, verificationCode }: { verificationId: string; verificationCode: string }) => {
      return await confirmPhoneNumber(ui, verificationId, verificationCode);
    },
    [ui]
  );
}

/** Options for the verify phone number form hook. */
type UseVerifyPhoneNumberForm = {
  /** The verification ID from the phone verification step. */
  verificationId: string;
  /** Callback function called when verification is successful. */
  onSuccess: (credential: UserCredential) => void;
};

/**
 * Creates a form hook for phone verification code input.
 *
 * @param options - The verify phone number form options.
 * @returns A form instance configured for verification code input.
 */
export function useVerifyPhoneNumberForm({ verificationId, onSuccess }: UseVerifyPhoneNumberForm) {
  const schema = usePhoneAuthVerifyFormSchema();
  const action = useVerifyPhoneNumberFormAction();

  return form.useAppForm({
    defaultValues: {
      verificationId,
      verificationCode: "",
    },
    validators: {
      onChange: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const credential = await action(value);
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
  verificationId: string;
};

function VerifyPhoneNumberForm(props: VerifyPhoneNumberFormProps) {
  const ui = useUI();
  const form = useVerifyPhoneNumberForm({ verificationId: props.verificationId, onSuccess: props.onSuccess });

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
            {(field) => (
              <field.Input
                label={getTranslation(ui, "labels", "verificationCode")}
                description={getTranslation(ui, "prompts", "smsVerificationPrompt")}
                type="text"
              />
            )}
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

/** Props for the PhoneAuthForm component. */
export type PhoneAuthFormProps = {
  /** Optional callback function called when sign-in is successful. */
  onSignIn?: (credential: UserCredential) => void;
};

/**
 * A form component for phone authentication.
 *
 * Handles the two-step process: first entering the phone number, then verifying the SMS code.
 *
 * @returns The phone auth form component.
 */
export function PhoneAuthForm(props: PhoneAuthFormProps) {
  const [verificationId, setVerificationId] = useState<string | null>(null);

  if (!verificationId) {
    return <PhoneNumberForm onSubmit={setVerificationId} />;
  }

  return (
    <VerifyPhoneNumberForm
      verificationId={verificationId}
      onSuccess={(credential) => {
        props.onSignIn?.(credential);
      }}
    />
  );
}
