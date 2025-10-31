import { useCallback, useRef, useState } from "react";
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  type MultiFactorInfo,
  type RecaptchaVerifier,
} from "firebase/auth";

import { signInWithMultiFactorAssertion, FirebaseUIError, getTranslation, verifyPhoneNumber } from "@firebase-oss/ui-core";
import { form } from "~/components/form";
import {
  useMultiFactorPhoneAuthNumberFormSchema,
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useUI,
} from "~/hooks";

type PhoneMultiFactorInfo = MultiFactorInfo & {
  phoneNumber?: string;
};

export function useSmsMultiFactorAssertionPhoneFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ hint, recaptchaVerifier }: { hint: MultiFactorInfo; recaptchaVerifier: RecaptchaVerifier }) => {
      return await verifyPhoneNumber(ui, "", recaptchaVerifier, undefined, hint);
    },
    [ui]
  );
}

type UseSmsMultiFactorAssertionPhoneForm = {
  hint: MultiFactorInfo;
  recaptchaVerifier: RecaptchaVerifier;
  onSuccess: (verificationId: string) => void;
};

export function useSmsMultiFactorAssertionPhoneForm({
  hint,
  recaptchaVerifier,
  onSuccess,
}: UseSmsMultiFactorAssertionPhoneForm) {
  const action = useSmsMultiFactorAssertionPhoneFormAction();
  const schema = useMultiFactorPhoneAuthNumberFormSchema();

  return form.useAppForm({
    defaultValues: {
      phoneNumber: (hint as PhoneMultiFactorInfo).phoneNumber || "",
    },
    validators: {
      onBlur: schema,
      onSubmit: schema,
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
          <form.AppField name="phoneNumber">
            {(field) => (
              <field.Input
                label={getTranslation(ui, "labels", "phoneNumber")}
                type="tel"
                disabled
                value={(props.hint as PhoneMultiFactorInfo).phoneNumber || ""}
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

type UseSmsMultiFactorAssertionVerifyForm = {
  verificationId: string;
  onSuccess: () => void;
};

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
      onSubmit: schema,
      onBlur: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await action(value);
          return onSuccess();
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

type SmsMultiFactorAssertionVerifyFormProps = {
  verificationId: string;
  onSuccess: () => void;
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

export type SmsMultiFactorAssertionFormProps = {
  hint: MultiFactorInfo;
  onSuccess?: () => void;
};

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
      onSuccess={() => {
        props.onSuccess?.();
      }}
    />
  );
}
