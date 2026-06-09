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

import { useRef, useState } from "react";
import { type UserCredential, type MultiFactorInfo } from "firebase/auth";

import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useUI,
  useSmsMultiFactorAssertionPhoneFormAction,
  useSmsMultiFactorAssertionVerifyFormAction,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type PhoneMultiFactorInfo = MultiFactorInfo & {
  phoneNumber?: string;
};

type SmsMultiFactorAssertionPhoneFormProps = {
  hint: MultiFactorInfo;
  onSubmit: (verificationId: string) => void;
};

function SmsMultiFactorAssertionPhoneForm(props: SmsMultiFactorAssertionPhoneFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const action = useSmsMultiFactorAssertionPhoneFormAction();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setError(null);
      const verificationId = await action({ hint: props.hint, recaptchaVerifier: recaptchaVerifier! });
      props.onSubmit(verificationId);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      setError(message);
    }
  };

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>{getTranslation(ui, "labels", "phoneNumber")}</FieldLabel>
        <FieldDescription>
          {getTranslation(ui, "messages", "mfaSmsAssertionPrompt", {
            phoneNumber: (props.hint as PhoneMultiFactorInfo).phoneNumber || "",
          })}
        </FieldDescription>
      </Field>
      <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
      <Button onClick={onSubmit} disabled={ui.state !== "idle"}>
        {getTranslation(ui, "labels", "sendCode")}
      </Button>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}

type SmsMultiFactorAssertionVerifyFormProps = {
  verificationId: string;
  onSuccess: (credential: UserCredential) => void;
};

function SmsMultiFactorAssertionVerifyForm(props: SmsMultiFactorAssertionVerifyFormProps) {
  const ui = useUI();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();
  const action = useSmsMultiFactorAssertionVerifyFormAction();

  const form = useForm<{ verificationId: string; verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationId: props.verificationId,
      verificationCode: "",
    },
  });

  const onSubmit = async (values: { verificationId: string; verificationCode: string }) => {
    try {
      const credential = await action({
        verificationId: values.verificationId,
        verificationCode: values.verificationCode,
      });
      props.onSuccess(credential);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Controller
          control={form.control}
          name="verificationCode"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{getTranslation(ui, "labels", "verificationCode")}</FieldLabel>
              <FieldDescription>{getTranslation(ui, "prompts", "smsVerificationPrompt")}</FieldDescription>
              <InputOTP maxLength={6} {...field}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "verifyCode")}
        </Button>
        {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
      </form>
    </FormProvider>
  );
}

export type SmsMultiFactorAssertionFormProps = {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
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
      onSuccess={(credential) => {
        props.onSuccess?.(credential);
      }}
    />
  );
}
