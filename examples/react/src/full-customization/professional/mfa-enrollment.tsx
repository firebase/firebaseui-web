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
import { multiFactor, type TotpSecret, type User } from "firebase/auth";
import { type CountryData, formatPhoneNumber, generateTotpQrCode } from "@firebase-oss/ui-core";
import {
  useDefaultCountry,
  useMultiFactorEnrollmentVerifyPhoneNumberFormAction,
  useMultiFactorEnrollmentVerifyTotpFormAction,
  useSmsMultiFactorEnrollmentPhoneAuthFormAction,
  useTotpMultiFactorSecretGenerationFormAction,
  useUI,
} from "@firebase-oss/ui-react";

import { useAuthTask, useResettableRecaptcha } from "../components";
import { useReauth } from "../reauth";
import { paths } from "../state";
import {
  ProButton,
  ProChoice,
  ProCodeField,
  ProError,
  ProGroup,
  ProPage,
  ProPhoneField,
  ProRow,
  ProSection,
  ProSeparator,
} from "./kit";
import { factorName } from "./mfa-challenge";

type Step =
  | { kind: "select" }
  | { kind: "sms" }
  | { kind: "sms-code"; verificationId: string; phoneNumber: string }
  | { kind: "totp"; secret: TotpSecret };

const REAUTH_REASON = "For your security, confirm it's you before changing two-factor settings.";

export function ProMfaEnrollment({ user }: { user: User }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>({ kind: "select" });
  const [method, setMethod] = useState<"sms" | "totp">("sms");
  const { withReauth, dialog } = useReauth();
  const generateSecret = useTotpMultiFactorSecretGenerationFormAction();
  const task = useAuthTask();
  const removal = useAuthTask();
  // Removing a factor takes a second click, so a stray tap doesn't drop it.
  const [confirming, setConfirming] = useState<string | null>(null);

  const enrolled = multiFactor(user).enrolledFactors;
  const backToSelect = () => setStep({ kind: "select" });
  const done = () => navigate(paths.account);

  let content: ReactNode;
  if (step.kind === "sms") {
    content = (
      <SmsSetup
        onBack={backToSelect}
        withReauth={withReauth}
        onCodeSent={(verificationId, phoneNumber) => setStep({ kind: "sms-code", verificationId, phoneNumber })}
      />
    );
  } else if (step.kind === "sms-code") {
    content = <SmsConfirm step={step} onBack={backToSelect} withReauth={withReauth} onEnrolled={done} />;
  } else if (step.kind === "totp") {
    content = <TotpSetup secret={step.secret} onBack={backToSelect} withReauth={withReauth} onEnrolled={done} />;
  } else {
    content = (
      <ProPage
        onBack={done}
        icon="verified_user"
        title="Set up two-factor authentication"
        subtitle="Add a second step to sign-in, so a password on its own isn't enough."
      >
        {enrolled.length > 0 && (
          <>
            <ProSection>Your methods</ProSection>
            <ProGroup label="Your methods">
              {enrolled.map((factor, index) => (
                <div key={factor.uid}>
                  {index > 0 && <ProSeparator inset={16} />}
                  <ProRow
                    title={factorName(factor)}
                    value={confirming === factor.uid ? "Confirm remove" : "Remove"}
                    tone="danger"
                    disabled={removal.pending}
                    onClick={() => {
                      if (confirming !== factor.uid) return setConfirming(factor.uid);
                      setConfirming(null);
                      void removal.run(async () => {
                        await withReauth(REAUTH_REASON, () => multiFactor(user).unenroll(factor));
                        // A fresh step object re-renders the list without the removed factor.
                        setStep({ kind: "select" });
                      });
                    }}
                  />
                </div>
              ))}
            </ProGroup>
            <div style={{ height: 24 }} />
          </>
        )}
        <ProSection>Choose a method</ProSection>
        <div className="pro-group" role="radiogroup" aria-label="Choose a method">
          <ProChoice
            name="enroll-method"
            icon="sms"
            title="Text message"
            detail="We'll text a code to your phone."
            checked={method === "sms"}
            onSelect={() => setMethod("sms")}
          />
          <ProSeparator inset={66} />
          <ProChoice
            name="enroll-method"
            icon="smartphone"
            title="Authenticator app"
            detail="Use a code from an app like Google Authenticator."
            checked={method === "totp"}
            onSelect={() => setMethod("totp")}
          />
        </div>
        <div className="pro-stack" style={{ marginTop: 16 }}>
          <ProError>{removal.error ?? task.error}</ProError>
          <ProButton
            loading={task.pending}
            onClick={() =>
              method === "sms"
                ? setStep({ kind: "sms" })
                : void task.run(async () =>
                    setStep({ kind: "totp", secret: await withReauth(REAUTH_REASON, generateSecret) })
                  )
            }
          >
            Continue
          </ProButton>
        </div>
        <ProButton variant="text" onClick={done}>
          Not now
        </ProButton>
      </ProPage>
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
  onBack,
  withReauth,
  onCodeSent,
}: {
  onBack: () => void;
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
      <ProPage
        onBack={onBack}
        icon="sms"
        title="Add your phone number"
        subtitle="We'll text a code to this number whenever you sign in."
      >
        <form
          className="pro-stack"
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
          <ProPhoneField country={country} onCountryChange={setCountry} value={phone} onChange={setPhone} />
          <ProError>{task.error}</ProError>
          <ProButton type="submit" disabled={!phone || !recaptcha.verifier} loading={task.pending}>
            Send code
          </ProButton>
        </form>
        <ProButton variant="text" onClick={onBack}>
          Pick a different method
        </ProButton>
      </ProPage>
      {recaptcha.container}
    </>
  );
}

function SmsConfirm({
  step,
  onBack,
  withReauth,
  onEnrolled,
}: {
  step: { verificationId: string; phoneNumber: string };
  onBack: () => void;
  withReauth: WithReauth;
  onEnrolled: () => void;
}) {
  const [code, setCode] = useState("");
  const verify = useMultiFactorEnrollmentVerifyPhoneNumberFormAction();
  const task = useAuthTask();

  return (
    <ProPage
      onBack={onBack}
      icon="tag"
      title="Confirm the code"
      subtitle={`We sent a 6-digit code to ${step.phoneNumber}.`}
    >
      <form
        className="pro-stack"
        onSubmit={(event) => {
          event.preventDefault();
          void task.run(async () => {
            await withReauth(REAUTH_REASON, () =>
              verify({ verificationId: step.verificationId, verificationCode: code, displayName: "Text message" })
            );
            onEnrolled();
          });
        }}
      >
        <ProCodeField value={code} onChange={setCode} />
        <ProError>{task.error}</ProError>
        <ProButton type="submit" disabled={code.length !== 6} loading={task.pending}>
          Verify
        </ProButton>
      </form>
    </ProPage>
  );
}

function TotpSetup({
  secret,
  onBack,
  withReauth,
  onEnrolled,
}: {
  secret: TotpSecret;
  onBack: () => void;
  withReauth: WithReauth;
  onEnrolled: () => void;
}) {
  const ui = useUI();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const verify = useMultiFactorEnrollmentVerifyTotpFormAction();
  const task = useAuthTask();
  const [qrCode] = useState(() => generateTotpQrCode(ui, secret));

  return (
    <ProPage
      onBack={onBack}
      icon="qr_code_2"
      title="Scan to set up"
      subtitle="Scan the code with your authenticator app, or enter the key by hand."
    >
      <div className="pro-stack">
        <img className="pro-qr" src={qrCode} alt="QR code for your authenticator app" />
        <div className="pro-secret">
          <code>{secret.secretKey}</code>
          <ProButton
            variant="text"
            onClick={() =>
              navigator.clipboard.writeText(secret.secretKey).then(
                () => setCopied(true),
                // Clipboard access can be denied; the key is still selectable.
                () => setCopied(false)
              )
            }
          >
            {copied ? "Copied" : "Copy"}
          </ProButton>
        </div>
        <form
          className="pro-stack"
          onSubmit={(event) => {
            event.preventDefault();
            void task.run(async () => {
              await withReauth(REAUTH_REASON, () =>
                verify({ secret, verificationCode: code, displayName: "Authenticator app" })
              );
              onEnrolled();
            });
          }}
        >
          <ProCodeField value={code} onChange={setCode} />
          <ProError>{task.error}</ProError>
          <ProButton type="submit" disabled={code.length !== 6} loading={task.pending}>
            Verify
          </ProButton>
        </form>
      </div>
      <ProButton variant="text" onClick={onBack}>
        Pick a different method
      </ProButton>
    </ProPage>
  );
}
