import { useCallback } from "react";
import { TotpMultiFactorGenerator, type MultiFactorInfo, type UserCredential } from "firebase/auth";
import { signInWithMultiFactorAssertion, FirebaseUIError, getTranslation } from "@invertase/firebaseui-core";
import { form } from "~/components/form";
import { useMultiFactorTotpAuthVerifyFormSchema, useUI } from "~/hooks";

export function useTotpMultiFactorAssertionFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ verificationCode, hint }: { verificationCode: string; hint: MultiFactorInfo }) => {
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, verificationCode);
      return await signInWithMultiFactorAssertion(ui, assertion);
    },
    [ui]
  );
}

export type UseTotpMultiFactorAssertionForm = {
  hint: MultiFactorInfo;
  onSuccess: (credential: UserCredential) => void;
};

export function useTotpMultiFactorAssertionForm({ hint, onSuccess }: UseTotpMultiFactorAssertionForm) {
  const action = useTotpMultiFactorAssertionFormAction();
  const schema = useMultiFactorTotpAuthVerifyFormSchema();

  return form.useAppForm({
    defaultValues: {
      verificationCode: "",
    },
    validators: {
      onBlur: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          const credential = await action({ verificationCode: value.verificationCode, hint });
          return onSuccess(credential);
        } catch (error) {
          return error instanceof FirebaseUIError ? error.message : String(error);
        }
      },
    },
  });
}

export type TotpMultiFactorAssertionFormProps = {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

export function TotpMultiFactorAssertionForm(props: TotpMultiFactorAssertionFormProps) {
  const ui = useUI();
  const form = useTotpMultiFactorAssertionForm({
    hint: props.hint,
    onSuccess: (credential) => {
      props.onSuccess?.(credential);
    },
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
                placeholder="123456"
                maxLength={6}
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
