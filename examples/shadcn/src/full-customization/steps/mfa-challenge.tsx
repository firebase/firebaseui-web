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

/** Wraps the challenge in its surroundings: a full page for sign in, the dialog for reauthentication. */
type Frame = (prompt: string, body: ReactNode) => ReactNode;

type ChallengeProps = {
  frame: Frame;
  onCancel: () => void;
  /** Called once the second factor is confirmed and the resolver is resolved. */
  onResolved?: () => void;
};

/**
 * Shown by the demo root whenever a sign in call leaves a multi-factor resolver on the UI state.
 * Resolving it signs the user in; cancelling clears it and returns to the previous screen.
 */
export function MfaChallengeStep() {
  const ui = useUI();
  return (
    <MfaChallenge
      frame={(prompt, body) => (
        <Page title="One more step" prompt={prompt}>
          {body}
        </Page>
      )}
      onCancel={() => ui.setMultiFactorResolver()}
    />
  );
}

/**
 * Completes `ui.multiFactorResolver`, whichever call raised it. The ui-react assertion hooks only
 * call `resolver.resolveSignIn`, so the same screens finish a reauthentication as well as a sign in.
 */
export function MfaChallenge({ frame, onCancel, onResolved }: ChallengeProps) {
  const ui = useUI();
  const hints = ui.multiFactorResolver?.hints ?? [];
  const [hint, setHint] = useState<MultiFactorInfo | null>(hints.length === 1 ? hints[0]! : null);

  useMultiFactorAssertionCleanup();

  const links = (
    <>
      {hints.length > 1 && <TextLink onClick={() => setHint(null)}>Pick a different method</TextLink>}
      <TextLink onClick={onCancel}>Cancel</TextLink>
    </>
  );

  if (!hint) {
    return frame(
      "Choose how to confirm it's you.",
      <>
        <Actions stacked>
          {hints.map((h, index) => (
            <Button key={h.uid} variant={index === 0 ? "primary" : "secondary"} onClick={() => setHint(h)}>
              {h.factorId === FactorId.PHONE ? "Text message" : "Authenticator app"}
            </Button>
          ))}
        </Actions>
        <Links>
          <TextLink onClick={onCancel}>Cancel</TextLink>
        </Links>
      </>
    );
  }

  return hint.factorId === FactorId.PHONE ? (
    <SmsChallenge hint={hint} frame={frame} links={links} onResolved={onResolved} />
  ) : (
    <TotpChallenge hint={hint} frame={frame} links={links} onResolved={onResolved} />
  );
}

type FactorProps = { hint: MultiFactorInfo; frame: Frame; links: ReactNode; onResolved?: () => void };

function TotpChallenge({ hint, frame, links, onResolved }: FactorProps) {
  const verify = useTotpMultiFactorAssertionFormAction();
  const task = useAuthTask();

  return frame(
    "Open your authenticator app and enter the 6-digit code for this account.",
    <CodeForm
      task={task}
      links={links}
      onSubmit={async (verificationCode) => {
        await verify({ hint, verificationCode });
        onResolved?.();
      }}
    />
  );
}

function SmsChallenge({ hint, frame, links, onResolved }: FactorProps) {
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

  const body = verificationId ? (
    <CodeForm
      task={task}
      onSubmit={async (verificationCode) => {
        await verify({ verificationId, verificationCode });
        onResolved?.();
      }}
      links={
        <>
          <TextLink onClick={() => void send()} disabled={task.pending || !recaptcha.verifier}>
            Resend code
          </TextLink>
          {links}
        </>
      }
    />
  ) : (
    <>
      <p className="fc-body">We'll send a code to confirm it's you.</p>
      <ErrorText>{task.error}</ErrorText>
      <Links>{links}</Links>
      <Actions>
        <Button onClick={() => void send()} disabled={!recaptcha.verifier} loading={task.pending}>
          Send code
        </Button>
      </Actions>
    </>
  );

  return (
    <>
      {frame(`Text message to ${(hint as PhoneMultiFactorInfo).phoneNumber}.`, body)}
      {recaptcha.container}
    </>
  );
}
