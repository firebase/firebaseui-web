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
import { FactorId, type MultiFactorInfo, type PhoneMultiFactorInfo } from "firebase/auth";
import { MessageSquare, ShieldCheck, Smartphone } from "lucide-react";
import {
  useSmsMultiFactorAssertionPhoneFormAction,
  useSmsMultiFactorAssertionVerifyFormAction,
  useTotpMultiFactorAssertionFormAction,
  useUI,
} from "@firebase-oss/ui-react";

import { useAuthTask, useResettableRecaptcha } from "../components";
import { ProButton, ProChoice, ProCodeField, ProError, ProPage, ProSection, ProSeparator } from "./kit";

type Icon = ComponentType<{ className?: string }>;
type Header = { icon: Icon; title: string; subtitle: string };
/** Renders the challenge as a page for sign in, or inside the reauth dialog. */
type Frame = (header: Header, body: ReactNode) => ReactNode;

export const factorName = (hint: MultiFactorInfo) =>
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
                  name="challenge-method"
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
