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
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  verifyPhoneNumber,
} from "@firebase-oss/ui-core";
import { CountrySelector, type CountrySelectorRef } from "@/components/country-selector";
import {
  useMultiFactorPhoneAuthNumberFormSchema,
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useUI,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type MultiFactorEnrollmentPhoneNumberFormProps = {
  onSubmit: (verificationId: string, displayName?: string) => void;
};

function MultiFactorEnrollmentPhoneNumberForm(props: MultiFactorEnrollmentPhoneNumberFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const countrySelector = useRef<CountrySelectorRef>(null);
  const schema = useMultiFactorPhoneAuthNumberFormSchema();

  const form = useForm<{ displayName: string; phoneNumber: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: { displayName: string; phoneNumber: string }) => {
    try {
      const formatted = formatPhoneNumber(values.phoneNumber, countrySelector.current!.getCountry());
      const mfaUser = multiFactor(ui.auth.currentUser!);
      const confirmationResult = await verifyPhoneNumber(ui, formatted, recaptchaVerifier!, mfaUser);
      props.onSubmit(confirmationResult, values.displayName);
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
          name="displayName"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{getTranslation(ui, "labels", "displayName")}</FieldLabel>
              <Input {...field} type="text" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="phoneNumber"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{getTranslation(ui, "labels", "phoneNumber")}</FieldLabel>
              <div className="flex items-center gap-2">
                <CountrySelector ref={countrySelector} />
                <Input {...field} type="tel" className="flex-grow" />
              </div>
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "sendCode")}
        </Button>
        {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
      </form>
    </FormProvider>
  );
}

type MultiFactorEnrollmentVerifyPhoneNumberFormProps = {
  verificationId: string;
  displayName?: string;
  onSuccess: () => void;
};

export function MultiFactorEnrollmentVerifyPhoneNumberForm(props: MultiFactorEnrollmentVerifyPhoneNumberFormProps) {
  const ui = useUI();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();

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
      const credential = PhoneAuthProvider.credential(values.verificationId, values.verificationCode);
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      await enrollWithMultiFactorAssertion(ui, assertion, props.displayName);
      props.onSuccess();
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
