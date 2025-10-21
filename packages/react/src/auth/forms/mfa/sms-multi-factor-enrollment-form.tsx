import { useCallback, useRef, useState } from "react";
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, type RecaptchaVerifier } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  verifyPhoneNumber,
} from "@firebase-ui/core";
import { CountrySelector, type CountrySelectorRef } from "~/components/country-selector";
import { form } from "~/components/form";
import {
  useMultiFactorPhoneAuthNumberFormSchema,
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useUI,
} from "~/hooks";

export function useSmsMultiFactorEnrollmentPhoneAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ phoneNumber, recaptchaVerifier }: { phoneNumber: string; recaptchaVerifier: RecaptchaVerifier }) => {
      const mfaUser = multiFactor(ui.auth.currentUser!);
      const session = await mfaUser.getSession();
      return await verifyPhoneNumber(ui, phoneNumber, recaptchaVerifier, session);
    },
    [ui]
  );
}

type UseSmsMultiFactorEnrollmentPhoneNumberForm = {
  recaptchaVerifier: RecaptchaVerifier;
  onSuccess: (verificationId: string, displayName?: string) => void;
  formatPhoneNumber?: (phoneNumber: string) => string;
};

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
      onSubmit: schema,
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

type UseMultiFactorEnrollmentVerifyPhoneNumberForm = {
  verificationId: string;
  displayName?: string;
  onSuccess: () => void;
};

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
      onSubmit: schema,
      onBlur: schema,
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

type MultiFactorEnrollmentVerifyPhoneNumberFormProps = {
  verificationId: string;
  displayName?: string;
  onSuccess: () => void;
};

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
            {(field) => <field.Input label={getTranslation(ui, "labels", "verificationCode")} type="text" />}
          </form.AppField>
        </fieldset>
      </form.AppForm>
    </form>
  );
}

export type SmsMultiFactorEnrollmentFormProps = {
  onSuccess?: () => void;
};

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
