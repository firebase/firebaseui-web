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

import { useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  FactorId,
  multiFactor,
  type MultiFactorInfo,
  type PhoneMultiFactorInfo,
  type TotpSecret,
  type User,
} from "firebase/auth";
import { Hash, MessageSquare, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { type CountryData, formatPhoneNumber, generateTotpQrCode } from "@firebase-oss/ui-core";
import {
  useDefaultCountry,
  useMultiFactorAssertionCleanup,
  useMultiFactorEnrollmentVerifyPhoneNumberFormAction,
  useMultiFactorEnrollmentVerifyTotpFormAction,
  useSmsMultiFactorAssertionPhoneFormAction,
  useSmsMultiFactorAssertionVerifyFormAction,
  useSmsMultiFactorEnrollmentPhoneAuthFormAction,
  useTotpMultiFactorAssertionFormAction,
  useTotpMultiFactorSecretGenerationFormAction,
  useUI,
} from "@firebase-oss/ui-react";

import { useAuthTask, useResettableRecaptcha } from "../components";
import { paths } from "../state";
import { useReauth } from "../steps/reauth";
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

type Icon = ComponentType<{ className?: string }>;
type Header = { icon: Icon; title: string; subtitle: string };
/** Renders the challenge as a page for sign in, or inside the reauth dialog. */
type Frame = (header: Header, body: ReactNode) => ReactNode;

const factorName = (hint: MultiFactorInfo) =>
  hint.displayName || (hint.factorId === FactorId.PHONE ? "Text message" : "Authenticator app");

/** The sign-in challenge, shown by the demo root while a multi-factor resolver is pending. */
export function ProMfaChallengeStep() {
  const ui = useUI();
  return (
    <ProMfaChallenge
      frame={(header, body) => (
        <ProPage icon={header.icon} title={header.title} subtitle={header.subtitle}>
          {body}
        </ProPage>
      )}
      onCancel={() => ui.setMultiFactorResolver()}
    />
  );
}

type ChallengeProps = { frame: Frame; onCancel: () => void; onResolved?: () => void };

/** Completes `ui.multiFactorResolver`, whether it came from a sign in or a reauthentication. */
export function ProMfaChallenge({ frame, onCancel, onResolved }: ChallengeProps) {
  const ui = useUI();
  const hints = ui.multiFactorResolver?.hints ?? [];
  const [hint, setHint] = useState<MultiFactorInfo>(hints[0]!);
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const recaptcha = useResettableRecaptcha();
  const sendSms = useSmsMultiFactorAssertionPhoneFormAction();
  const verifySms = useSmsMultiFactorAssertionVerifyFormAction();
  const verifyTotp = useTotpMultiFactorAssertionFormAction();
  const task = useAuthTask();

  useMultiFactorAssertionCleanup();

  const isSms = hint.factorId === FactorId.PHONE;
  const phone = isSms ? (hint as PhoneMultiFactorInfo).phoneNumber : "";
  const needsCode = !isSms || verificationId !== null;

  const send = () => {
    const recaptchaVerifier = recaptcha.verifier;
    if (!recaptchaVerifier) return;
    return task.run(async () => {
      try {
        setVerificationId(await sendSms({ hint, recaptchaVerifier }));
      } finally {
        recaptcha.reset();
      }
    });
  };

  const verify = () =>
    task.run(async () => {
      await (isSms
        ? verifySms({ verificationId: verificationId!, verificationCode: code })
        : verifyTotp({ hint, verificationCode: code }));
      onResolved?.();
    });

  const subtitle = !isSms
    ? "Enter the 6-digit code from your authenticator app."
    : verificationId
      ? `Enter the 6-digit code we sent to ${phone}.`
      : `Your account uses two-factor authentication. We'll text a code to ${phone}.`;

  const body = (
    <>
      {hints.length > 1 && (
        <>
          <ProSection>Choose a method</ProSection>
          <div className="pro-group" role="radiogroup" aria-label="Choose a method" style={{ marginBottom: 24 }}>
            {hints.map((h, index) => (
              <div key={h.uid}>
                {index > 0 && <ProSeparator inset={66} />}
                <ProChoice
                  icon={h.factorId === FactorId.PHONE ? MessageSquare : Smartphone}
                  title={factorName(h)}
                  detail={h.factorId === FactorId.PHONE ? (h as PhoneMultiFactorInfo).phoneNumber : "Authenticator app"}
                  checked={h.uid === hint.uid}
                  onSelect={() => {
                    setHint(h);
                    setVerificationId(null);
                    setCode("");
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
      <form
        className="pro-stack"
        onSubmit={(event) => {
          event.preventDefault();
          void (needsCode ? verify() : send());
        }}
      >
        {needsCode && <ProCodeField value={code} onChange={setCode} />}
        <ProError>{task.error}</ProError>
        {needsCode ? (
          <ProButton type="submit" disabled={code.length !== 6} loading={task.pending}>
            Verify
          </ProButton>
        ) : (
          <ProButton type="submit" disabled={!recaptcha.verifier} loading={task.pending}>
            Send code
          </ProButton>
        )}
      </form>
      {isSms && verificationId && (
        <ProButton variant="text" onClick={() => void send()} disabled={task.pending || !recaptcha.verifier}>
          Resend code
        </ProButton>
      )}
      <ProButton variant="text" onClick={onCancel}>
        Cancel
      </ProButton>
      {recaptcha.container}
    </>
  );

  return frame({ icon: ShieldCheck, title: "Verify it's you", subtitle }, body);
}

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
        icon={ShieldCheck}
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
                    value="Remove"
                    tone="danger"
                    disabled={removal.pending}
                    onClick={() =>
                      removal.run(async () => {
                        await withReauth(REAUTH_REASON, () => multiFactor(user).unenroll(factor));
                        // A fresh step object re-renders the list without the removed factor.
                        setStep({ kind: "select" });
                      })
                    }
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
            icon={MessageSquare}
            title="Text message"
            detail="We'll text a code to your phone."
            checked={method === "sms"}
            onSelect={() => setMethod("sms")}
          />
          <ProSeparator inset={66} />
          <ProChoice
            icon={Smartphone}
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
        icon={MessageSquare}
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
      icon={Hash}
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
      icon={QrCode}
      title="Scan to set up"
      subtitle="Scan the code with your authenticator app, or enter the key by hand."
    >
      <div className="pro-stack">
        <img className="pro-qr" src={qrCode} alt="QR code for your authenticator app" />
        <div className="pro-secret">
          <code>{secret.secretKey}</code>
          <ProButton
            variant="text"
            onClick={() => void navigator.clipboard.writeText(secret.secretKey).then(() => setCopied(true))}
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
