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
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
      <FormItem>
        <FormLabel>{getTranslation(ui, "labels", "phoneNumber")}</FormLabel>
        <FormDescription>
          {getTranslation(ui, "messages", "mfaSmsAssertionPrompt", {
            phoneNumber: (props.hint as PhoneMultiFactorInfo).phoneNumber || "",
          })}
        </FormDescription>
      </FormItem>
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <FormField
          control={form.control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getTranslation(ui, "labels", "verificationCode")}</FormLabel>
              <FormDescription>{getTranslation(ui, "prompts", "smsVerificationPrompt")}</FormDescription>
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
