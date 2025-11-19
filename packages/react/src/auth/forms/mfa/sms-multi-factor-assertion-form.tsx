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
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  type UserCredential,
  type MultiFactorInfo,
  type RecaptchaVerifier,
} from "firebase/auth";

import {
  signInWithMultiFactorAssertion,
  FirebaseUIError,
  getTranslation,
  verifyPhoneNumber,
} from "@invertase/firebaseui-core";
import { form } from "~/components/form";
import { useMultiFactorPhoneAuthVerifyFormSchema, useRecaptchaVerifier, useUI } from "~/hooks";

type PhoneMultiFactorInfo = MultiFactorInfo & {
  phoneNumber?: string;
};

/**
 * Creates a memoized action function for verifying a phone number during SMS multi-factor assertion.
 *
 * @returns A callback function that verifies a phone number using the provided hint and reCAPTCHA verifier.
 */
export function useSmsMultiFactorAssertionPhoneFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ hint, recaptchaVerifier }: { hint: MultiFactorInfo; recaptchaVerifier: RecaptchaVerifier }) => {
      return await verifyPhoneNumber(ui, "", recaptchaVerifier, undefined, hint);
    },
    [ui]
  );
}

/** Options for the SMS multi-factor assertion phone form hook. */
type UseSmsMultiFactorAssertionPhoneForm = {
  /** The multi-factor info hint containing phone number information. */
  hint: MultiFactorInfo;
  /** The reCAPTCHA verifier instance. */
  recaptchaVerifier: RecaptchaVerifier;
  /** Callback function called when phone verification is successful. */
  onSuccess: (verificationId: string) => void;
};

/**
 * Creates a form hook for SMS multi-factor assertion phone number verification.
 *
 * @param options - The phone form options.
 * @returns A form instance configured for phone number verification.
 */
export function useSmsMultiFactorAssertionPhoneForm({
  hint,
  recaptchaVerifier,
  onSuccess,
}: UseSmsMultiFactorAssertionPhoneForm) {
  const action = useSmsMultiFactorAssertionPhoneFormAction();

  return form.useAppForm({
    validators: {
      onSubmitAsync: async () => {
        try {
          const verificationId = await action({ hint, recaptchaVerifier });
          return onSuccess(verificationId);
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

type SmsMultiFactorAssertionPhoneFormProps = {
  hint: MultiFactorInfo;
  onSubmit: (verificationId: string) => void;
};

function SmsMultiFactorAssertionPhoneForm(props: SmsMultiFactorAssertionPhoneFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const form = useSmsMultiFactorAssertionPhoneForm({
    hint: props.hint,
    recaptchaVerifier: recaptchaVerifier!,
    onSuccess: props.onSubmit,
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
          <label>
            <div data-input-description>
              {getTranslation(ui, "messages", "mfaSmsAssertionPrompt", {
                phoneNumber: (props.hint as PhoneMultiFactorInfo).phoneNumber || "",
              })}
            </div>
          </label>
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
 * Creates a memoized action function for verifying the SMS verification code during multi-factor assertion.
 *
 * @returns A callback function that verifies the code and signs in with the multi-factor assertion.
 */
export function useSmsMultiFactorAssertionVerifyFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ verificationId, verificationCode }: { verificationId: string; verificationCode: string }) => {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      return await signInWithMultiFactorAssertion(ui, assertion);
    },
    [ui]
  );
}

/** Options for the SMS multi-factor assertion verify form hook. */
type UseSmsMultiFactorAssertionVerifyForm = {
  /** The verification ID from the phone verification step. */
  verificationId: string;
  /** Callback function called when verification is successful. */
  onSuccess: (credential: UserCredential) => void;
};

/**
 * Creates a form hook for SMS multi-factor assertion verification code input.
 *
 * @param options - The verify form options.
 * @returns A form instance configured for verification code input.
 */
export function useSmsMultiFactorAssertionVerifyForm({
  verificationId,
  onSuccess,
}: UseSmsMultiFactorAssertionVerifyForm) {
  const action = useSmsMultiFactorAssertionVerifyFormAction();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();

  return form.useAppForm({
    defaultValues: {
      verificationId,
      verificationCode: "",
    },
    validators: {
      onBlur: schema,
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

type SmsMultiFactorAssertionVerifyFormProps = {
  verificationId: string;
  onSuccess: (credential: UserCredential) => void;
};

function SmsMultiFactorAssertionVerifyForm(props: SmsMultiFactorAssertionVerifyFormProps) {
  const ui = useUI();
  const form = useSmsMultiFactorAssertionVerifyForm({
    verificationId: props.verificationId,
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
                label={getTranslation(ui, "labels", "verificationCode")}
                type="text"
                description={getTranslation(ui, "prompts", "smsVerificationPrompt")}
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

/** Props for the SmsMultiFactorAssertionForm component. */
export type SmsMultiFactorAssertionFormProps = {
  /** The multi-factor info hint containing phone number information. */
  hint: MultiFactorInfo;
  /** Optional callback function called when multi-factor assertion is successful. */
  onSuccess?: (credential: UserCredential) => void;
};

/**
 * A form component for SMS multi-factor authentication assertion.
 *
 * Handles the two-step process: first verifying the phone number, then verifying the SMS code.
 *
 * @returns The SMS multi-factor assertion form component.
 */
export function SmsMultiFactorAssertionForm(props: SmsMultiFactorAssertionFormProps) {
  const [verification, setVerification] = useState<{
    verificationId: string;
  } | null>(null);

  if (!verification) {
    return (
      <SmsMultiFactorAssertionPhoneForm
        hint={props.hint}
        onSubmit={(verificationId) => setVerification({ verificationId })}
      />
    );
  }

  return (
    <SmsMultiFactorAssertionVerifyForm
      verificationId={verification.verificationId}
      onSuccess={(credential) => {
        props.onSuccess?.(credential);
      }}
    />
  );
}
