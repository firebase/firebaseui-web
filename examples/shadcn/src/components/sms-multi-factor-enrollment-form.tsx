"use client";

import { useRef, useState } from "react";
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  verifyPhoneNumber,
} from "@invertase/firebaseui-core";
import { CountrySelector, type CountrySelectorRef } from "@/components/country-selector";
import {
  useMultiFactorPhoneAuthNumberFormSchema,
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useUI,
} from "@invertase/firebaseui-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "displayName")}</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "phoneNumber")}</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <CountrySelector ref={countrySelector} />
                  <Input {...field} type="tel" className="flex-grow" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "sendCode")}
        </Button>
        {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
      </form>
    </Form>
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "verificationCode")}</FormLabel>
              <FormControl>
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "verifyCode")}
        </Button>
        {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
      </form>
    </Form>
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
