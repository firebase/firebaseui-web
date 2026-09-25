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

import {
  Actions,
  Button,
  CodeForm,
  ErrorText,
  Links,
  Page,
  PhoneFields,
  TextLink,
  useAuthTask,
  useResettableRecaptcha,
} from "../components";
import { paths } from "../state";

export function PhoneStep() {
  const navigate = useNavigate();
  const [country, setCountry] = useState<CountryData>(useDefaultCountry());
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // The reCAPTCHA container sits outside both steps so it survives the switch to the code step.
  const recaptcha = useResettableRecaptcha();
  const sendCode = usePhoneNumberFormAction();
  const verifyCode = useVerifyPhoneNumberFormAction();
  const task = useAuthTask();

  const phoneNumber = formatPhoneNumber(phone, country);
  const send = () => {
    // The verifier is briefly null while a fresh one renders after each send.
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
        <Page title="Enter your code" prompt={`We sent a code to ${phoneNumber}.`}>
          <CodeForm
            task={task}
            onSubmit={(verificationCode) => verifyCode({ verificationId, verificationCode })}
            links={
              <>
                <TextLink onClick={() => void send()} disabled={task.pending || !recaptcha.verifier}>
                  Resend code
                </TextLink>
                <TextLink onClick={() => setVerificationId(null)}>Use a different number</TextLink>
              </>
            }
          />
        </Page>
      ) : (
        <Page title="Login by phone number" prompt="Enter your phone number to continue.">
          <form
            className="fc-form"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <PhoneFields country={country} onCountryChange={setCountry} value={phone} onChange={setPhone} />
            <p className="fc-body">
              By signing in with phone number, an SMS may be sent. Message &amp; data rates may apply.
            </p>
            <ErrorText>{task.error}</ErrorText>
            <Links>
              <TextLink onClick={() => navigate(paths.email)}>Use a different sign in method</TextLink>
            </Links>
            <Actions>
              <Button type="submit" disabled={!phone || !recaptcha.verifier} loading={task.pending}>
                Send code
              </Button>
            </Actions>
          </form>
        </Page>
      )}
      {recaptcha.container}
    </>
  );
}
