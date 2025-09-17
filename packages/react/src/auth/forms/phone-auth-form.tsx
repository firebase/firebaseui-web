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

import {
  confirmPhoneNumber,
  CountryCode,
  countryData,
  FirebaseUIError,
  formatPhoneNumberWithCountry,
  getTranslation,
  signInWithPhoneNumber,
} from "@firebase-ui/core";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePhoneAuthFormSchema, useUI } from "~/hooks";
import { form } from "~/components/form";
import { CountrySelector } from "~/components/country-selector";
import { Policies } from "~/components/policies";

export function usePhoneAuthFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ phoneNumber, recaptchaVerifier }: { phoneNumber: string; recaptchaVerifier: RecaptchaVerifier }) => {
      try {
        return await signInWithPhoneNumber(ui, phoneNumber, recaptchaVerifier);
      } catch (error) {
        if (error instanceof FirebaseUIError) {
          throw new Error(error.message);
        }

        console.error(error);
        throw new Error(getTranslation(ui, "errors", "unknownError"));
      }
    },
    [ui]
  );
}

export function usePhoneVerificationFormAction() {
  const ui = useUI();

  return useCallback(
    async ({ confirmationResult, code }: { confirmationResult: ConfirmationResult; code: string }) => {
      try {
        return await confirmPhoneNumber(ui, confirmationResult, code);
      } catch (error) {
        if (error instanceof FirebaseUIError) {
          throw new Error(error.message);
        }

        console.error(error);
        throw new Error(getTranslation(ui, "errors", "unknownError"));
      }
    },
    [ui]
  );
}

export function usePhoneResendAction() {
  const ui = useUI();

  return useCallback(
    async ({ phoneNumber, recaptchaVerifier }: { phoneNumber: string; recaptchaVerifier: RecaptchaVerifier }) => {
      try {
        return await signInWithPhoneNumber(ui, phoneNumber, recaptchaVerifier);
      } catch (error) {
        if (error instanceof FirebaseUIError) {
          throw new Error(error.message);
        }

        console.error(error);
        throw new Error(getTranslation(ui, "errors", "unknownError"));
      }
    },
    [ui]
  );
}

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  recaptchaVerifier: RecaptchaVerifier | null;
  recaptchaContainerRef: React.RefObject<HTMLDivElement | null>;
}

function PhoneNumberForm({ onSubmit, recaptchaVerifier, recaptchaContainerRef }: PhoneNumberFormProps) {
  const ui = useUI();

  // TODO(ehesp): How does this support allowed countries?
  // TODO(ehesp): How does this support default country?
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryData[0].code);

  const schema = usePhoneAuthFormSchema();
  const phoneFormSchema = schema.pick({ phoneNumber: true });

  const phoneForm = form.useAppForm({
    defaultValues: {
      phoneNumber: "",
    },
    validators: {
      onBlur: phoneFormSchema,
      onSubmit: phoneFormSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          const formattedNumber = formatPhoneNumberWithCountry(value.phoneNumber, selectedCountry);
          await onSubmit(formattedNumber);
        } catch (error) {
          return error instanceof Error ? error.message : String(error);
        }
      },
    },
  });

  // TODO(ehesp): Country data onChange types are not matching

  return (
    <form
      className="fui-form"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await phoneForm.handleSubmit();
      }}
    >
      <phoneForm.AppForm>
        <fieldset>
          <phoneForm.AppField
            name="phoneNumber"
            children={(field) => (
              <label htmlFor={field.name}>
                <span>{getTranslation(ui, "labels", "phoneNumber")}</span>
                <div className="fui-phone-input">
                  <CountrySelector
                    value={selectedCountry}
                    onChange={(code) => setSelectedCountry(code as CountryCode)}
                    className="fui-phone-input__country-selector"
                  />
                  <input
                    aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                    id={field.name}
                    name={field.name}
                    type="tel"
                    value={field.state.value}
                    onBlur={() => field.handleBlur()}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="fui-phone-input__number-input"
                  />
                </div>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <div className="fui-form__error">
                    {field.state.meta.errors.map((error) => error?.message || "Error").join(", ")}
                  </div>
                )}
              </label>
            )}
          />
        </fieldset>

        <fieldset>
          <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
        </fieldset>

        <Policies />

        <fieldset>
          <phoneForm.SubmitButton disabled={!recaptchaVerifier || ui.state !== "idle"}>
            {getTranslation(ui, "labels", "sendCode")}
          </phoneForm.SubmitButton>
          <phoneForm.ErrorMessage />
        </fieldset>
      </phoneForm.AppForm>
    </form>
  );
}

export function useResendTimer(initialDelay: number) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initialDelay]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeLeft(initialDelay);
    setIsActive(true);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsActive(false);
        }
        return next;
      });
    }, 1000);
  }, [initialDelay]);

  const canResend = !isActive && timeLeft === 0;

  return { timeLeft, canResend, startTimer };
}

interface VerificationFormProps {
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isResending: boolean;
  canResend: boolean;
  timeLeft: number;
  recaptchaContainerRef: React.RefObject<HTMLDivElement | null>;
}

function VerificationForm({
  onSubmit,
  onResend,
  isResending,
  canResend,
  timeLeft,
  recaptchaContainerRef,
}: VerificationFormProps) {
  const ui = useUI();

  const schema = usePhoneAuthFormSchema();
  const verificationFormSchema = schema.pick({ verificationCode: true });

  const verificationForm = form.useAppForm({
    defaultValues: {
      verificationCode: "",
    },
    validators: {
      onBlur: verificationFormSchema,
      onSubmit: verificationFormSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await onSubmit(value.verificationCode);
        } catch (error) {
          return error instanceof Error ? error.message : String(error);
        }
      },
    },
  });

  return (
    <form
      className="fui-form"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await verificationForm.handleSubmit();
      }}
    >
      <verificationForm.AppForm>
        <fieldset>
          <verificationForm.AppField name="verificationCode" children={(field) => <field.Input label="Verification Code" type="text" />} />
        </fieldset>

        <fieldset>
          <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
        </fieldset>

        <Policies />

        <fieldset>
          <verificationForm.SubmitButton disabled={ui.state !== "idle"}>
            {getTranslation(ui, "labels", "verifyCode")}
          </verificationForm.SubmitButton>
          <verificationForm.Action
            type="button"
            disabled={isResending || !canResend || ui.state !== "idle"}
            onClick={onResend}
          >
            {isResending
              ? getTranslation(ui, "labels", "sending")
              : !canResend
                ? `${getTranslation(ui, "labels", "resendCode")} (${timeLeft}s)`
                : getTranslation(ui, "labels", "resendCode")}
          </verificationForm.Action>
          <verificationForm.ErrorMessage />
        </fieldset>
      </verificationForm.AppForm>
    </form>
  );
}

export type PhoneAuthFormProps = {
  resendDelay?: number;
}

export function PhoneAuthForm({ resendDelay = 30 }: PhoneAuthFormProps) {
  const ui = useUI();

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const { timeLeft, canResend, startTimer } = useResendTimer(resendDelay);

  const phoneAuthAction = usePhoneAuthFormAction();
  const phoneVerificationAction = usePhoneVerificationFormAction();
  const phoneResendAction = usePhoneResendAction();

  useEffect(() => {
    if (!recaptchaContainerRef.current) return;

    const verifier = new RecaptchaVerifier(ui.auth, recaptchaContainerRef.current, {
      // size: ui.recaptchaMode ?? "normal", TODO(ehesp): Get this from the useRecaptchaVerifier hook once implemented
      size: "normal",
    });

    setRecaptchaVerifier(verifier);

    return () => {
      verifier.clear();
      setRecaptchaVerifier(null);
    };
  }, [ui]);

  const handlePhoneSubmit = async (number: string) => {
    try {
      if (!recaptchaVerifier) {
        throw new Error("ReCAPTCHA not initialized");
      }

      const result = await phoneAuthAction({ phoneNumber: number, recaptchaVerifier });
      setPhoneNumber(number);
      setConfirmationResult(result);
      startTimer();
    } catch (error) {
      // Error handling is now managed by the form system
      console.error("Phone submission failed:", error);
      throw error;
    }
  };

  const handleResend = async () => {
    if (isResending || !canResend || !phoneNumber || !recaptchaContainerRef.current) {
      return;
    }

    setIsResending(true);

    try {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }

      const verifier = new RecaptchaVerifier(ui.auth, recaptchaContainerRef.current, {
        // size: ui.recaptchaMode ?? "normal", // TODO(ehesp): Get this from the useRecaptchaVerifier hook once implemented
        size: "normal",
      });
      setRecaptchaVerifier(verifier);

      const result = await phoneResendAction({ phoneNumber, recaptchaVerifier: verifier });
      setConfirmationResult(result);
      startTimer();
    } catch (error) {
      console.error("Phone resend failed:", error);
      // Error handling is now managed by the form system
    } finally {
      setIsResending(false);
    }
  };

  const handleVerificationSubmit = async (code: string) => {
    if (!confirmationResult) {
      throw new Error("Confirmation result not initialized");
    }

    try {
      await phoneVerificationAction({ confirmationResult, code });
    } catch (error) {
      // Error handling is now managed by the form system
      console.error("Phone verification failed:", error);
      throw error;
    }
  };

  return (
    <div className="fui-form-container">
      {confirmationResult ? (
        <VerificationForm
          onSubmit={handleVerificationSubmit}
          onResend={handleResend}
          isResending={isResending}
          canResend={canResend}
          timeLeft={timeLeft}
          recaptchaContainerRef={recaptchaContainerRef}
        />
      ) : (
        <PhoneNumberForm
          onSubmit={handlePhoneSubmit}
          recaptchaVerifier={recaptchaVerifier}
          recaptchaContainerRef={recaptchaContainerRef}
        />
      )}
    </div>
  );
}
