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

export function useTotpMultiFactorSecretGenerationFormAction() {
  const ui = useUI();

  return useCallback(async () => {
    return await generateTotpSecret(ui);
  }, [ui]);
}

type UseTotpMultiFactorEnrollmentForm = {
  onSuccess: (secret: TotpSecret, displayName: string) => void;
};

export function useTotpMultiFactorSecretGenerationForm({ onSuccess }: UseTotpMultiFactorEnrollmentForm) {
  const action = useTotpMultiFactorSecretGenerationFormAction();
  const schema = useMultiFactorTotpAuthNumberFormSchema();

  return form.useAppForm({
    defaultValues: {
      displayName: "",
    },
    validators: {
      onBlur: schema,
      onSubmit: schema,
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

export function useMultiFactorEnrollmentVerifyTotpFormAction() {
  const ui = useUI();
  return useCallback(
    async ({ secret, verificationCode }: { secret: TotpSecret; verificationCode: string; displayName: string }) => {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, verificationCode);
      return await enrollWithMultiFactorAssertion(ui, assertion, verificationCode);
    },
    [ui]
  );
}

type UseMultiFactorEnrollmentVerifyTotpForm = {
  secret: TotpSecret;
  displayName: string;
  onSuccess: () => void;
};

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
      onSubmit: schema,
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

type MultiFactorEnrollmentVerifyTotpFormProps = {
  secret: TotpSecret;
  displayName: string;
  onSuccess: () => void;
};

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
        <p>TODO: Scan this QR code with your authenticator app</p>
      </div>
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

export type TotpMultiFactorEnrollmentFormProps = {
  onSuccess?: () => void;
};

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
