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
  CountryData,
  countryData,
  createPhoneFormSchema,
  FirebaseUIError,
  formatPhoneNumberWithCountry,
  getTranslation,
  signInWithPhoneNumber,
} from "@firebase-ui/core";
import { useForm } from "@tanstack/react-form";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useAuth, useUI } from "~/hooks";
import { Button } from "../../components/button";
import { CountrySelector } from "../../components/country-selector";
import { FieldInfo } from "../../components/field-info";
import { Policies } from "../../components/policies";

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  formError: string | null;
  recaptchaVerifier: RecaptchaVerifier | null;
  recaptchaContainerRef: React.RefObject<HTMLDivElement | null>;
}

function PhoneNumberForm({
  onSubmit,
  formError,
  recaptchaVerifier,
  recaptchaContainerRef,
}: PhoneNumberFormProps) {
  const ui = useUI();

  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    countryData[0]
  );
  const [firstValidationOccured, setFirstValidationOccured] = useState(false);

  const phoneFormSchema = useMemo(
    () =>
      createPhoneFormSchema(ui.translations).pick({
        phoneNumber: true,
      }),
    [ui.translations]
  );

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    defaultValues: {
      phoneNumber: "",
    },
    validators: {
      onBlur: phoneFormSchema,
      onSubmit: phoneFormSchema,
    },
    onSubmit: async ({ value }) => {
      const formattedNumber = formatPhoneNumberWithCountry(
        value.phoneNumber,
        selectedCountry.dialCode
      );
      await onSubmit(formattedNumber);
    },
  });

  return (
    <form
      className="fui-form"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await phoneForm.handleSubmit();
      }}
    >
      <fieldset>
        <phoneForm.Field
          name="phoneNumber"
          children={(field) => (
            <>
              <label htmlFor={field.name}>
                <span>{getTranslation(ui, "labels", "phoneNumber")}</span>
                <div className="fui-phone-input">
                  <CountrySelector
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    className="fui-phone-input__country-selector"
                  />
                  <input
                    aria-invalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                    id={field.name}
                    name={field.name}
                    type="tel"
                    value={field.state.value}
                    onBlur={() => {
                      setFirstValidationOccured(true);
                      field.handleBlur();
                    }}
                    onInput={(e) => {
                      field.handleChange((e.target as HTMLInputElement).value);
                      if (firstValidationOccured) {
                        field.handleBlur();
                        phoneForm.update();
                      }
                    }}
                    className="fui-phone-input__number-input"
                  />
                </div>
                <FieldInfo field={field} />
              </label>
            </>
          )}
        />
      </fieldset>

      <fieldset>
        <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
      </fieldset>

      <Policies />

      <fieldset>
        <Button
          type="submit"
          disabled={!recaptchaVerifier || ui.state !== "idle"}
        >
          {getTranslation(ui, "labels", "sendCode")}
        </Button>
        {formError && <div className="fui-form__error">{formError}</div>}
      </fieldset>
    </form>
  );
}

function useResendTimer(initialDelay: number) {
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
  formError: string | null;
  isResending: boolean;
  canResend: boolean;
  timeLeft: number;
  recaptchaContainerRef: React.RefObject<HTMLDivElement | null>;
}

function VerificationForm({
  onSubmit,
  onResend,
  formError,
  isResending,
  canResend,
  timeLeft,
  recaptchaContainerRef,
}: VerificationFormProps) {
  const ui = useUI();

  const [firstValidationOccured, setFirstValidationOccured] = useState(false);

  const verificationFormSchema = useMemo(
    () =>
      createPhoneFormSchema(ui.translations).pick({
        verificationCode: true,
      }),
    [ui.translations]
  );

  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    defaultValues: {
      verificationCode: "",
    },
    validators: {
      onBlur: verificationFormSchema,
      onSubmit: verificationFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value.verificationCode);
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
      <fieldset>
        <verificationForm.Field
          name="verificationCode"
          children={(field) => (
            <>
              <label htmlFor={field.name}>
                <span>{getTranslation(ui, "labels", "verificationCode")}</span>
                <input
                  aria-invalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={() => {
                    setFirstValidationOccured(true);
                    field.handleBlur();
                  }}
                  onInput={(e) => {
                    field.handleChange((e.target as HTMLInputElement).value);
                    if (firstValidationOccured) {
                      field.handleBlur();
                      verificationForm.update();
                    }
                  }}
                />
                <FieldInfo field={field} />
              </label>
            </>
          )}
        />
      </fieldset>

      <fieldset>
        <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
      </fieldset>

      <Policies />

      <fieldset>
        <Button type="submit" disabled={ui.state !== "idle"}>
          {getTranslation(ui, "labels", "verifyCode")}
        </Button>
        <Button
          type="button"
          disabled={isResending || !canResend || ui.state !== "idle"}
          onClick={onResend}
          variant="secondary"
        >
          {isResending
            ? getTranslation(ui, "labels", "sending")
            : !canResend
              ? `${getTranslation(ui, "labels", "resendCode")} (${timeLeft}s)`
              : getTranslation(ui, "labels", "resendCode")}
        </Button>
        {formError && <div className="fui-form__error">{formError}</div>}
      </fieldset>
    </form>
  );
}

export interface PhoneFormProps {
  resendDelay?: number;
}

export function PhoneForm({ resendDelay = 30 }: PhoneFormProps) {
  const ui = useUI();
  const auth = useAuth(ui);

  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const { timeLeft, canResend, startTimer } = useResendTimer(resendDelay);

  useEffect(() => {
    if (!recaptchaContainerRef.current) return;

    const verifier = new RecaptchaVerifier(
      auth,
      recaptchaContainerRef.current,
      {
        size: ui.recaptchaMode ?? "normal",
      }
    );

    setRecaptchaVerifier(verifier);

    return () => {
      verifier.clear();
      setRecaptchaVerifier(null);
    };
  }, [auth, ui.recaptchaMode]);

  const handlePhoneSubmit = async (number: string) => {
    setFormError(null);
    try {
      if (!recaptchaVerifier) {
        throw new Error("ReCAPTCHA not initialized");
      }

      const result = await signInWithPhoneNumber(ui, number, recaptchaVerifier);
      setPhoneNumber(number);
      setConfirmationResult(result);
      startTimer();
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        setFormError(error.message);
        return;
      }
      console.error(error);
      setFormError(getTranslation(ui, "errors", "unknownError"));
    }
  };

  const handleResend = async () => {
    if (
      isResending ||
      !canResend ||
      !phoneNumber ||
      !recaptchaContainerRef.current
    ) {
      return;
    }

    setIsResending(true);
    setFormError(null);

    try {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }

      const verifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        {
          size: ui.recaptchaMode ?? "normal",
        }
      );
      setRecaptchaVerifier(verifier);

      const result = await signInWithPhoneNumber(ui, phoneNumber, verifier);
      setConfirmationResult(result);
      startTimer();
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        setFormError(error.message);
      } else {
        console.error(error);
        setFormError(getTranslation(ui, "errors", "unknownError"));
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleVerificationSubmit = async (code: string) => {
    if (!confirmationResult) {
      throw new Error("Confirmation result not initialized");
    }

    setFormError(null);

    try {
      await confirmPhoneNumber(ui, confirmationResult, code);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        setFormError(error.message);
        return;
      }
      console.error(error);
      setFormError(getTranslation(ui, "errors", "unknownError"));
    }
  };

  return (
    <div className="fui-form-container">
      {confirmationResult ? (
        <VerificationForm
          onSubmit={handleVerificationSubmit}
          onResend={handleResend}
          formError={formError}
          isResending={isResending}
          canResend={canResend}
          timeLeft={timeLeft}
          recaptchaContainerRef={recaptchaContainerRef}
        />
      ) : (
        <PhoneNumberForm
          onSubmit={handlePhoneSubmit}
          formError={formError}
          recaptchaVerifier={recaptchaVerifier}
          recaptchaContainerRef={recaptchaContainerRef}
        />
      )}
    </div>
  );
}
