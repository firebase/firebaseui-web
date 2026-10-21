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

import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { FactorId, multiFactor, type TotpSecret, type User } from "firebase/auth";
import { type CountryData, formatPhoneNumber, generateTotpQrCode } from "@firebase-oss/ui-core";
import {
  useDefaultCountry,
  useMultiFactorEnrollmentVerifyPhoneNumberFormAction,
  useMultiFactorEnrollmentVerifyTotpFormAction,
  useSmsMultiFactorEnrollmentPhoneAuthFormAction,
  useTotpMultiFactorSecretGenerationFormAction,
  useUI,
} from "@firebase-oss/ui-react";

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
import { useReauth } from "./reauth";

type Step =
  | { kind: "select" }
  | { kind: "sms" }
  | { kind: "sms-code"; verificationId: string; phoneNumber: string }
  | { kind: "totp"; secret: TotpSecret };

const REAUTH_REASON = "Verify your identity to change your two-factor settings.";

export function MfaEnrollmentStep({ user }: { user: User }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>({ kind: "select" });
  const { withReauth, dialog } = useReauth();
  const generateSecret = useTotpMultiFactorSecretGenerationFormAction();
  const task = useAuthTask();
  const removal = useAuthTask();

  const enrolled = multiFactor(user).enrolledFactors;
  const back = <TextLink onClick={() => setStep({ kind: "select" })}>Pick a different method</TextLink>;
  const done = () => navigate(paths.account);

  let content;
  if (step.kind === "sms") {
    content = (
      <SmsSetup
        back={back}
        withReauth={withReauth}
        onCodeSent={(verificationId, phoneNumber) => setStep({ kind: "sms-code", verificationId, phoneNumber })}
      />
    );
  } else if (step.kind === "sms-code") {
    content = <SmsConfirm step={step} back={back} withReauth={withReauth} onEnrolled={done} />;
  } else if (step.kind === "totp") {
    content = <TotpSetup secret={step.secret} back={back} withReauth={withReauth} onEnrolled={done} />;
  } else {
    content = (
      <Page title="Secure your account" prompt="Add a second step to sign in, so a password on its own isn't enough.">
        {enrolled.length > 0 && (
          <ul className="fc-list" aria-label="Already on this account">
            {enrolled.map((factor) => (
              <li key={factor.uid}>
                {factor.displayName ?? (factor.factorId === FactorId.PHONE ? "Text message" : "Authenticator app")}
                <TextLink
                  disabled={removal.pending}
                  onClick={() =>
                    removal.run(async () => {
                      await withReauth(REAUTH_REASON, () => multiFactor(user).unenroll(factor));
                      // A fresh step object re-renders the list without the removed factor.
                      setStep({ kind: "select" });
                    })
                  }
                >
                  Remove
                </TextLink>
              </li>
            ))}
          </ul>
        )}
        <ErrorText>{removal.error ?? task.error}</ErrorText>
        <Links>
          <TextLink onClick={done}>Not now</TextLink>
        </Links>
        <Actions stacked>
          <Button onClick={() => setStep({ kind: "sms" })}>Use text message</Button>
          <Button
            variant="secondary"
            loading={task.pending}
            onClick={() =>
              task.run(async () => setStep({ kind: "totp", secret: await withReauth(REAUTH_REASON, generateSecret) }))
            }
          >
            Use an authenticator app
          </Button>
        </Actions>
      </Page>
    );
  }

  return (
    <>
      {content}
      {dialog}
    </>
  );
}

type WithReauth = ReturnType<typeof useReauth>["withReauth"];

function SmsSetup({
  back,
  withReauth,
  onCodeSent,
}: {
  back: ReactNode;
  withReauth: WithReauth;
  onCodeSent: (verificationId: string, phoneNumber: string) => void;
}) {
  const [country, setCountry] = useState<CountryData>(useDefaultCountry());
  const [phone, setPhone] = useState("");
  const recaptcha = useResettableRecaptcha();
  const sendCode = useSmsMultiFactorEnrollmentPhoneAuthFormAction();
  const task = useAuthTask();
  const phoneNumber = formatPhoneNumber(phone, country);

  return (
    <>
      <Page title="Add your number" prompt="Enter the number to text a code to.">
        <form
          className="fc-form"
          onSubmit={(event) => {
            event.preventDefault();
            const recaptchaVerifier = recaptcha.verifier;
            if (!recaptchaVerifier) return;
            void task.run(async () => {
              try {
                const verificationId = await withReauth(REAUTH_REASON, () =>
                  sendCode({ phoneNumber, recaptchaVerifier })
                );
                onCodeSent(verificationId, phoneNumber);
              } finally {
                recaptcha.reset();
              }
            });
          }}
        >
          <PhoneFields country={country} onCountryChange={setCountry} value={phone} onChange={setPhone} />
          <p className="fc-body">
            We'll text a code to this number whenever you sign in. Message &amp; data rates may apply.
          </p>
          <ErrorText>{task.error}</ErrorText>
          <Links>{back}</Links>
          <Actions>
            <Button type="submit" disabled={!phone || !recaptcha.verifier} loading={task.pending}>
              Send code
            </Button>
          </Actions>
        </form>
      </Page>
      {recaptcha.container}
    </>
  );
}

function SmsConfirm({
  step,
  back,
  withReauth,
  onEnrolled,
}: {
  step: { verificationId: string; phoneNumber: string };
  back: ReactNode;
  withReauth: WithReauth;
  onEnrolled: () => void;
}) {
  const verify = useMultiFactorEnrollmentVerifyPhoneNumberFormAction();
  const task = useAuthTask();

  return (
    <Page title="Confirm the code" prompt={`We sent a code to ${step.phoneNumber}.`}>
      <CodeForm
        task={task}
        links={back}
        onSubmit={async (verificationCode) => {
          await withReauth(REAUTH_REASON, () =>
            verify({ verificationId: step.verificationId, verificationCode, displayName: "Text message" })
          );
          onEnrolled();
        }}
      />
    </Page>
  );
}

function TotpSetup({
  secret,
  back,
  withReauth,
  onEnrolled,
}: {
  secret: TotpSecret;
  back: ReactNode;
  withReauth: WithReauth;
  onEnrolled: () => void;
}) {
  const ui = useUI();
  const verify = useMultiFactorEnrollmentVerifyTotpFormAction();
  const task = useAuthTask();
  const [qrCode] = useState(() => generateTotpQrCode(ui, secret));

  return (
    <Page title="Scan to set up" prompt="Scan this with your authenticator app, or type the key in by hand.">
      <img className="fc-qr" src={qrCode} alt="QR code for your authenticator app" />
      <p className="fc-secret">{secret.secretKey}</p>
      <p className="fc-body">Then enter the 6-digit code your app is showing.</p>
      <CodeForm
        task={task}
        links={back}
        onSubmit={async (verificationCode) => {
          await withReauth(REAUTH_REASON, () => verify({ secret, verificationCode, displayName: "Authenticator app" }));
          onEnrolled();
        }}
      />
    </Page>
  );
}
