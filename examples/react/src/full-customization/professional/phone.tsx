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

import { useState } from "react";
import { useNavigate } from "react-router";
import { type CountryData, formatPhoneNumber } from "@firebase-oss/ui-core";
import { useDefaultCountry, usePhoneNumberFormAction, useVerifyPhoneNumberFormAction } from "@firebase-oss/ui-react";

import { useAuthTask, useResettableRecaptcha } from "../components";
import { paths } from "../state";
import { ProButton, ProCodeField, ProError, ProPage, ProPhoneField } from "./kit";

export function ProPhone() {
  const navigate = useNavigate();
  const [country, setCountry] = useState<CountryData>(useDefaultCountry());
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const recaptcha = useResettableRecaptcha();
  const sendCode = usePhoneNumberFormAction();
  const verifyCode = useVerifyPhoneNumberFormAction();
  const task = useAuthTask();

  const phoneNumber = formatPhoneNumber(phone, country);
  const send = () => {
    const recaptchaVerifier = recaptcha.verifier;
    if (!recaptchaVerifier) return;
    return task.run(async () => {
      try {
        setVerificationId(await sendCode({ phoneNumber, recaptchaVerifier }));
      } finally {
        recaptcha.reset();
      }
    });
  };

  return (
    <>
      {verificationId ? (
        <ProPage
          onBack={() => setVerificationId(null)}
          icon="tag"
          title="Enter the code"
          subtitle={`We sent a 6-digit code to ${phoneNumber}.`}
        >
          <form
            className="pro-stack"
            onSubmit={(event) => {
              event.preventDefault();
              void task.run(() => verifyCode({ verificationId, verificationCode: code }));
            }}
          >
            <ProCodeField value={code} onChange={setCode} />
            <ProError>{task.error}</ProError>
            <ProButton type="submit" disabled={code.length !== 6} loading={task.pending}>
              Verify
            </ProButton>
          </form>
          <ProButton variant="text" onClick={() => void send()} disabled={task.pending || !recaptcha.verifier}>
            Resend code
          </ProButton>
          <ProButton
            variant="text"
            onClick={() => {
              setVerificationId(null);
              setCode("");
            }}
          >
            Use a different number
          </ProButton>
        </ProPage>
      ) : (
        <ProPage
          onBack={() => navigate(paths.email)}
          icon="phone"
          title="Sign in with your phone"
          subtitle="We'll text you a 6-digit code to confirm it's you. Message and data rates may apply."
        >
          <form
            className="pro-stack"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <ProPhoneField country={country} onCountryChange={setCountry} value={phone} onChange={setPhone} />
            <ProError>{task.error}</ProError>
            <ProButton type="submit" disabled={!phone || !recaptcha.verifier} loading={task.pending}>
              Send code
            </ProButton>
          </form>
        </ProPage>
      )}
      {recaptcha.container}
    </>
  );
}
