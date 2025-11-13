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

import { useCallback, useState } from "react";
import { TotpMultiFactorGenerator, type TotpSecret } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  generateTotpQrCode,
  generateTotpSecret,
  getTranslation,
} from "@invertase/firebaseui-core";
import { form } from "~/components/form";
import { useMultiFactorTotpAuthNumberFormSchema, useMultiFactorTotpAuthVerifyFormSchema, useUI } from "~/hooks";

/**
 * Creates a memoized action function for generating a TOTP secret for multi-factor enrollment.
 *
 * @returns A callback function that generates a TOTP secret.
 */
export function useTotpMultiFactorSecretGenerationFormAction() {
  const ui = useUI();

  return useCallback(async () => {
    return await generateTotpSecret(ui);
  }, [ui]);
}

/** Options for the TOTP multi-factor enrollment form hook. */
export type UseTotpMultiFactorEnrollmentForm = {
  /** Callback function called when the TOTP secret is generated. */
  onSuccess: (secret: TotpSecret, displayName: string) => void;
};

/**
 * Creates a form hook for TOTP multi-factor enrollment secret generation.
 *
 * @param options - The TOTP enrollment form options.
 * @returns A form instance configured for display name input and secret generation.
 */
export function useTotpMultiFactorSecretGenerationForm({ onSuccess }: UseTotpMultiFactorEnrollmentForm) {
  const action = useTotpMultiFactorSecretGenerationFormAction();
  const schema = useMultiFactorTotpAuthNumberFormSchema();

  return form.useAppForm({
    defaultValues: {
      displayName: "",
    },
    validators: {
      onBlur: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const secret = await action();
          return onSuccess(secret, value.displayName);
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

type TotpMultiFactorSecretGenerationFormProps = {
  onSubmit: (secret: TotpSecret, displayName: string) => void;
};

function TotpMultiFactorSecretGenerationForm(props: TotpMultiFactorSecretGenerationFormProps) {
  const ui = useUI();
  const form = useTotpMultiFactorSecretGenerationForm({
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
          <form.AppField name="displayName">
            {(field) => <field.Input label={getTranslation(ui, "labels", "displayName")} type="text" />}
          </form.AppField>
        </fieldset>
        <fieldset>
          <form.SubmitButton>{getTranslation(ui, "labels", "generateQrCode")}</form.SubmitButton>
          <form.ErrorMessage />
        </fieldset>
      </form.AppForm>
    </form>
  );
}

/**
 * Creates a memoized action function for verifying the TOTP code during multi-factor enrollment.
 *
 * @returns A callback function that verifies the TOTP code and enrolls it as a multi-factor authentication method.
 */
export function useMultiFactorEnrollmentVerifyTotpFormAction() {
  const ui = useUI();
  return useCallback(
    async ({
      secret,
      verificationCode,
      displayName,
    }: {
      secret: TotpSecret;
      verificationCode: string;
      displayName: string;
    }) => {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, verificationCode);
      return await enrollWithMultiFactorAssertion(ui, assertion, displayName);
    },
    [ui]
  );
}

/** Options for the multi-factor enrollment verify TOTP form hook. */
type UseMultiFactorEnrollmentVerifyTotpForm = {
  /** The TOTP secret generated in the previous step. */
  secret: TotpSecret;
  /** The display name for the enrolled MFA method. */
  displayName: string;
  /** Callback function called when enrollment is successful. */
  onSuccess: () => void;
};

/**
 * Creates a form hook for TOTP multi-factor enrollment verification code input.
 *
 * @param options - The verify TOTP form options.
 * @returns A form instance configured for TOTP verification code input during MFA enrollment.
 */
export function useMultiFactorEnrollmentVerifyTotpForm({
  secret,
  displayName,
  onSuccess,
}: UseMultiFactorEnrollmentVerifyTotpForm) {
  const schema = useMultiFactorTotpAuthVerifyFormSchema();
  const action = useMultiFactorEnrollmentVerifyTotpFormAction();

  return form.useAppForm({
    defaultValues: {
      verificationCode: "",
    },
    validators: {
      onBlur: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await action({ secret, verificationCode: value.verificationCode, displayName });
          return onSuccess();
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

/** Props for the MultiFactorEnrollmentVerifyTotpForm component. */
type MultiFactorEnrollmentVerifyTotpFormProps = {
  /** The TOTP secret generated in the previous step. */
  secret: TotpSecret;
  /** The display name for the enrolled MFA method. */
  displayName: string;
  /** Callback function called when enrollment is successful. */
  onSuccess: () => void;
};

/**
 * A form component for verifying the TOTP code during multi-factor enrollment.
 *
 * Displays a QR code and secret key for the user to scan with their authenticator app,
 * then allows them to verify the enrollment with a TOTP code.
 *
 * @returns The verify TOTP form component.
 */
export function MultiFactorEnrollmentVerifyTotpForm(props: MultiFactorEnrollmentVerifyTotpFormProps) {
  const ui = useUI();
  const form = useMultiFactorEnrollmentVerifyTotpForm({
    ...props,
    onSuccess: props.onSuccess,
  });

  const qrCodeDataUrl = generateTotpQrCode(ui, props.secret, props.displayName);

  return (
    <form
      className="fui-form"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <div className="fui-qr-code-container">
        <img src={qrCodeDataUrl} alt="TOTP QR Code" />
        <code>{props.secret.secretKey.toString()}</code>
        <p>{getTranslation(ui, "prompts", "mfaTotpQrCodePrompt")}</p>
      </div>
      <form.AppForm>
        <fieldset>
          <form.AppField name="verificationCode">
            {(field) => (
              <field.Input
                label={getTranslation(ui, "labels", "verificationCode")}
                type="text"
                description={getTranslation(ui, "prompts", "mfaTotpEnrollmentVerificationPrompt")}
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

/** Props for the TotpMultiFactorEnrollmentForm component. */
export type TotpMultiFactorEnrollmentFormProps = {
  /** Optional callback function called when enrollment is successful. */
  onSuccess?: () => void;
};

/**
 * A form component for TOTP multi-factor authentication enrollment.
 *
 * Handles the two-step process: first generating a TOTP secret and QR code, then verifying the TOTP code.
 *
 * @returns The TOTP multi-factor enrollment form component.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export function TotpMultiFactorEnrollmentForm(props: TotpMultiFactorEnrollmentFormProps) {
  const ui = useUI();

  const [enrollment, setEnrollment] = useState<{
    secret: TotpSecret;
    displayName: string;
  } | null>(null);

  if (!ui.auth.currentUser) {
    throw new Error("User must be authenticated to enroll with multi-factor authentication");
  }

  if (!enrollment) {
    return (
      <TotpMultiFactorSecretGenerationForm onSubmit={(secret, displayName) => setEnrollment({ secret, displayName })} />
    );
  }

  return (
    <MultiFactorEnrollmentVerifyTotpForm
      {...enrollment}
      onSuccess={() => {
        props.onSuccess?.();
      }}
    />
  );
}
