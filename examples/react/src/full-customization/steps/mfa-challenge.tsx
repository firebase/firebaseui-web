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
import { FactorId, type MultiFactorInfo, type PhoneMultiFactorInfo } from "firebase/auth";
import {
  useMultiFactorAssertionCleanup,
  useSmsMultiFactorAssertionPhoneFormAction,
  useSmsMultiFactorAssertionVerifyFormAction,
  useTotpMultiFactorAssertionFormAction,
  useUI,
} from "@firebase-oss/ui-react";

import {
  Actions,
  Button,
  CodeForm,
  ErrorText,
  Links,
  Page,
  TextLink,
  useAuthTask,
  useResettableRecaptcha,
} from "../components";

function factorLabel(hint: MultiFactorInfo) {
  if (hint.factorId === FactorId.PHONE) return `Text message to ${(hint as PhoneMultiFactorInfo).phoneNumber}`;
  if (hint.factorId === FactorId.TOTP) return "Authenticator app";
  return hint.displayName ?? hint.factorId;
}

/**
 * Shown by the demo root whenever a sign in call leaves a multi-factor resolver on the UI state.
 * Resolving it signs the user in; cancelling clears it and returns to the previous screen.
 */
export function MfaChallengeStep() {
  const ui = useUI();
  const hints = ui.multiFactorResolver?.hints ?? [];
  const [hint, setHint] = useState<MultiFactorInfo | null>(hints.length === 1 ? hints[0]! : null);
  const cancel = <TextLink onClick={() => ui.setMultiFactorResolver()}>Cancel</TextLink>;

  useMultiFactorAssertionCleanup();

  if (!hint) {
    return (
      <Page title="One more step" prompt="Choose how to confirm it's you.">
        <Actions stacked>
          {hints.map((h, index) => (
            <Button key={h.uid} variant={index === 0 ? "primary" : "secondary"} onClick={() => setHint(h)}>
              {h.factorId === FactorId.PHONE ? "Text message" : "Authenticator app"}
            </Button>
          ))}
        </Actions>
        <Links>{cancel}</Links>
      </Page>
    );
  }

  return hint.factorId === FactorId.PHONE ? (
    <SmsChallenge hint={hint} cancel={cancel} />
  ) : (
    <Page title="One more step" prompt="Open your authenticator app and enter the 6-digit code for this account.">
      <TotpChallenge hint={hint} cancel={cancel} />
    </Page>
  );
}

function TotpChallenge({ hint, cancel }: { hint: MultiFactorInfo; cancel: ReactNode }) {
  const verify = useTotpMultiFactorAssertionFormAction();
  const task = useAuthTask();
  return <CodeForm task={task} onSubmit={(verificationCode) => verify({ hint, verificationCode })} links={cancel} />;
}

function SmsChallenge({ hint, cancel }: { hint: MultiFactorInfo; cancel: ReactNode }) {
  const recaptcha = useResettableRecaptcha();
  const sendCode = useSmsMultiFactorAssertionPhoneFormAction();
  const verify = useSmsMultiFactorAssertionVerifyFormAction();
  const task = useAuthTask();
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const send = () => {
    // The verifier is briefly null while a fresh one renders after each send.
    const recaptchaVerifier = recaptcha.verifier;
    if (!recaptchaVerifier) return;
    return task.run(async () => {
      try {
        setVerificationId(await sendCode({ hint, recaptchaVerifier }));
      } finally {
        recaptcha.reset();
      }
    });
  };

  return (
    <>
      <Page title="One more step" prompt={`${factorLabel(hint)}.`}>
        {verificationId ? (
          <CodeForm
            task={task}
            onSubmit={(verificationCode) => verify({ verificationId, verificationCode })}
            links={
              <>
                <TextLink onClick={() => void send()} disabled={task.pending || !recaptcha.verifier}>
                  Resend code
                </TextLink>
                {cancel}
              </>
            }
          />
        ) : (
          <>
            <p className="fc-body">We'll send a code to confirm it's you.</p>
            <ErrorText>{task.error}</ErrorText>
            <Links>{cancel}</Links>
            <Actions>
              <Button onClick={() => void send()} disabled={!recaptcha.verifier} loading={task.pending}>
                Send code
              </Button>
            </Actions>
          </>
        )}
      </Page>
      {recaptcha.container}
    </>
  );
}
