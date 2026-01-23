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

import { useCallback, useRef, useState } from "react";
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, type RecaptchaVerifier } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  verifyPhoneNumber,
} from "@firebase-oss/ui-core";
import { CountrySelector, type CountrySelectorRef } from "~/components/country-selector";
import { form } from "~/components/form";
import {
  useMultiFactorPhoneAuthNumberFormSchema,
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useUI,
} from "~/hooks";

/**
 * Creates a memoized action function for verifying a phone number during SMS multi-factor enrollment.
 *
 * @returns A callback function that verifies a phone number for MFA enrollment using the provided reCAPTCHA verifier.
 */
export function useSmsMultiFactorEnrollmentPhoneAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ phoneNumber, recaptchaVerifier }: { phoneNumber: string; recaptchaVerifier: RecaptchaVerifier }) => {
      const mfaUser = multiFactor(ui.auth.currentUser!);
      return await verifyPhoneNumber(ui, phoneNumber, recaptchaVerifier, mfaUser);
    },
    [ui]
  );
}

/** Options for the SMS multi-factor enrollment phone number form hook. */
export type UseSmsMultiFactorEnrollmentPhoneNumberForm = {
  /** The reCAPTCHA verifier instance. */
  recaptchaVerifier: RecaptchaVerifier;
  /** Callback function called when phone verification is successful. */
  onSuccess: (verificationId: string, displayName?: string) => void;
  /** Optional function to format the phone number before verification. */
  formatPhoneNumber?: (phoneNumber: string) => string;
};

/**
 * Creates a form hook for SMS multi-factor enrollment phone number verification.
 *
 * @param options - The phone number form options.
 * @returns A form instance configured for phone number input and verification for MFA enrollment.
 */
export function useSmsMultiFactorEnrollmentPhoneNumberForm({
  recaptchaVerifier,
  onSuccess,
  formatPhoneNumber,
}: UseSmsMultiFactorEnrollmentPhoneNumberForm) {
  const action = useSmsMultiFactorEnrollmentPhoneAuthFormAction();
  const schema = useMultiFactorPhoneAuthNumberFormSchema();

  return form.useAppForm({
    defaultValues: {
      displayName: "",
      phoneNumber: "",
    },
    validators: {
      onBlur: schema,
      onChange: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const formatted = formatPhoneNumber ? formatPhoneNumber(value.phoneNumber) : value.phoneNumber;
          const confirmationResult = await action({ phoneNumber: formatted, recaptchaVerifier });
          return onSuccess(confirmationResult, value.displayName);
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

type MultiFactorEnrollmentPhoneNumberFormProps = {
  onSubmit: (verificationId: string, displayName?: string) => void;
};

function MultiFactorEnrollmentPhoneNumberForm(props: MultiFactorEnrollmentPhoneNumberFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const countrySelector = useRef<CountrySelectorRef>(null);
  const form = useSmsMultiFactorEnrollmentPhoneNumberForm({
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
          <form.AppField name="displayName">
            {(field) => <field.Input label={getTranslation(ui, "labels", "displayName")} type="text" />}
          </form.AppField>
        </fieldset>
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
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "sendCode")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
      </form.AppForm>
    </form>
  );
}

/**
 * Creates a memoized action function for verifying the SMS verification code during multi-factor enrollment.
 *
 * @returns A callback function that verifies the code and enrolls the phone number as a multi-factor authentication method.
 */
export function useMultiFactorEnrollmentVerifyPhoneNumberFormAction() {
  const ui = useUI();
  return useCallback(
    async ({
      verificationId,
      verificationCode,
      displayName,
    }: {
      verificationId: string;
      verificationCode: string;
      displayName?: string;
    }) => {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      return await enrollWithMultiFactorAssertion(ui, assertion, displayName);
    },
    [ui]
  );
}

/** Options for the multi-factor enrollment verify phone number form hook. */
type UseMultiFactorEnrollmentVerifyPhoneNumberForm = {
  /** The verification ID from the phone verification step. */
  verificationId: string;
  /** Optional display name for the enrolled MFA method. */
  displayName?: string;
  /** Callback function called when enrollment is successful. */
  onSuccess: () => void;
};

/**
 * Creates a form hook for SMS multi-factor enrollment verification code input.
 *
 * @param options - The verify phone number form options.
 * @returns A form instance configured for verification code input during MFA enrollment.
 */
export function useMultiFactorEnrollmentVerifyPhoneNumberForm({
  verificationId,
  displayName,
  onSuccess,
}: UseMultiFactorEnrollmentVerifyPhoneNumberForm) {
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();
  const action = useMultiFactorEnrollmentVerifyPhoneNumberFormAction();

  return form.useAppForm({
    defaultValues: {
      verificationId,
      verificationCode: "",
    },
    validators: {
      onBlur: schema,
      onChange: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await action({ ...value, displayName });
          return onSuccess();
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

/** Props for the MultiFactorEnrollmentVerifyPhoneNumberForm component. */
type MultiFactorEnrollmentVerifyPhoneNumberFormProps = {
  /** The verification ID from the phone verification step. */
  verificationId: string;
  /** Optional display name for the enrolled MFA method. */
  displayName?: string;
  /** Callback function called when enrollment is successful. */
  onSuccess: () => void;
};

/**
 * A form component for verifying the SMS code during multi-factor enrollment.
 *
 * @returns The verify phone number form component.
 */
export function MultiFactorEnrollmentVerifyPhoneNumberForm(props: MultiFactorEnrollmentVerifyPhoneNumberFormProps) {
  const ui = useUI();
  const form = useMultiFactorEnrollmentVerifyPhoneNumberForm({
    ...props,
    onSuccess: props.onSuccess,
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
          <form.AppField name="verificationCode">
            {(field) => (
              <field.Input
                description={getTranslation(ui, "prompts", "smsVerificationPrompt")}
                label={getTranslation(ui, "labels", "verificationCode")}
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

/** Props for the SmsMultiFactorEnrollmentForm component. */
export type SmsMultiFactorEnrollmentFormProps = {
  /** Optional callback function called when enrollment is successful. */
  onSuccess?: () => void;
};

/**
 * A form component for SMS multi-factor authentication enrollment.
 *
 * Handles the two-step process: first entering the phone number and display name, then verifying the SMS code.
 *
 * @returns The SMS multi-factor enrollment form component.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export function SmsMultiFactorEnrollmentForm(props: SmsMultiFactorEnrollmentFormProps) {
  const ui = useUI();

  const [verification, setVerification] = useState<{
    verificationId: string;
    displayName?: string;
  } | null>(null);

  if (!ui.auth.currentUser) {
    throw new Error("User must be authenticated to enroll with multi-factor authentication");
  }

  if (!verification) {
    return (
      <MultiFactorEnrollmentPhoneNumberForm
        onSubmit={(verificationId, displayName) => setVerification({ verificationId, displayName })}
      />
    );
  }

  return (
    <MultiFactorEnrollmentVerifyPhoneNumberForm
      {...verification}
      onSuccess={() => {
        props.onSuccess?.();
      }}
    />
  );
}
