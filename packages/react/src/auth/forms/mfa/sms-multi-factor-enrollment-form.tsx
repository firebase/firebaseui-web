import {
  CountryCode,
  countryData,
  FirebaseUIError,
  formatPhoneNumberWithCountry,
  getTranslation,
  signInWithMultiFactorAssertion,
  verifyPhoneNumber,
} from "@firebase-ui/core";
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from "firebase/auth";
import { useCallback, useRef, useState } from "react";
import { CountrySelector } from "~/components/country-selector";
import { form } from "~/components/form";
import { useMultiFactorPhoneAuthVerifyFormSchema, useRecaptchaVerifier, useUI } from "~/hooks";
import { usePhoneNumberForm } from "../phone-auth-form";

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

type MultiFactorEnrollmentPhoneNumberFormProps = {
  onSubmit: (verificationId: string) => void;
};

function MultiFactorEnrollmentPhoneNumberForm(props: MultiFactorEnrollmentPhoneNumberFormProps) {
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
    async ({ verificationId, verificationCode }: { verificationId: string; verificationCode: string }) => {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      return await signInWithMultiFactorAssertion(ui, assertion);
    },
    [ui]
  );
}

type UseMultiFactorEnrollmentVerifyPhoneNumberForm = {
  verificationId: string;
  onSuccess: () => void;
};

export function useMultiFactorEnrollmentVerifyPhoneNumberForm({
  verificationId,
  onSuccess,
}: UseMultiFactorEnrollmentVerifyPhoneNumberForm) {
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();
  const action = useMultiFactorEnrollmentVerifyPhoneNumberFormAction();

  return form.useAppForm({
    defaultValues: {
      displayName: "",
      verificationCode: "",
    },
    validators: {
      onSubmit: schema,
      onBlur: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await action({ verificationId, verificationCode: value.verificationCode });
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
  onSuccess: () => void;
};

export function MultiFactorEnrollmentVerifyPhoneNumberForm(props: MultiFactorEnrollmentVerifyPhoneNumberFormProps) {
  const ui = useUI();
  const form = useMultiFactorEnrollmentVerifyPhoneNumberForm({
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
          <form.AppField name="displayName">
            {(field) => <field.Input label={getTranslation(ui, "labels", "displayName")} type="text" />}
          </form.AppField>
        </fieldset>
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
  const [verificationId, setVerificationId] = useState<string | null>(null);

  if (!verificationId) {
    return <MultiFactorEnrollmentPhoneNumberForm onSubmit={setVerificationId} />;
  }

  return (
    <MultiFactorEnrollmentVerifyPhoneNumberForm
      verificationId={verificationId}
      onSuccess={() => {
        props.onSuccess?.();
      }}
    />
  );
}
