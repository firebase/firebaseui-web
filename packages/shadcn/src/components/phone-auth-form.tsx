"use client";

import {
  CountrySelector,
  type PhoneAuthFormProps,
  usePhoneAuthNumberFormSchema,
  usePhoneAuthVerifyFormSchema,
  usePhoneNumberFormAction,
  useRecaptchaVerifier,
  useUI,
  useVerifyPhoneNumberFormAction,
} from "@invertase/firebaseui-react";
import { useState } from "react";
import type { UserCredential } from "firebase/auth";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  type PhoneAuthNumberFormSchema,
  type PhoneAuthVerifyFormSchema,
} from "@invertase/firebaseui-core";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "@/components/policies";
import { type CountrySelectorRef } from "@/components/country-selector";

type VerifyPhoneNumberFormProps = {
  verificationId: string;
  onSuccess: (credential: UserCredential) => void;
};

function VerifyPhoneNumberForm(props: VerifyPhoneNumberFormProps) {
  const ui = useUI();
  const schema = usePhoneAuthVerifyFormSchema();
  const action = useVerifyPhoneNumberFormAction();

  const form = useForm<PhoneAuthVerifyFormSchema>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      verificationId: props.verificationId,
      verificationCode: "",
    },
  });

  async function onSubmit(values: PhoneAuthVerifyFormSchema) {
    try {
      const credential = await action(values);
      props.onSuccess(credential);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "verificationCode")}</FormLabel>
              <FormControl>
                <Input {...field} />
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

type PhoneNumberFormProps = {
  onSubmit: (verificationId: string) => void;
};

function PhoneNumberForm(props: PhoneNumberFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const countrySelector = useRef<CountrySelectorRef>(null);
  const action = usePhoneNumberFormAction();
  const schema = usePhoneAuthNumberFormSchema();

  const form = useForm<PhoneAuthNumberFormSchema>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  async function onSubmit(values: PhoneAuthNumberFormSchema) {
    try {
      const formatted = formatPhoneNumber(values.phoneNumber, countrySelector.current!.getCountry());
      const verificationId = await action({ phoneNumber: formatted, recaptchaVerifier: recaptchaVerifier! });
      props.onSubmit(verificationId);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "phoneNumber")}</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <CountrySelector ref={countrySelector} />
                  <Input {...field} type="tel" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div ref={recaptchaContainerRef} />
        <Policies />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "sendCode")}
        </Button>
        {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
      </form>
    </Form>
  );
}

export type { PhoneAuthFormProps };

export function PhoneAuthForm(props: PhoneAuthFormProps) {
  const [verificationId, setVerificationId] = useState<string | null>(null);

  if (!verificationId) {
    return <PhoneNumberForm onSubmit={setVerificationId} />;
  }

  return (
    <VerifyPhoneNumberForm
      verificationId={verificationId}
      onSuccess={(credential) => {
        props.onSignIn?.(credential);
      }}
    />
  );
}
