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

import { useCallback, useEffect, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  getMultiFactorResolver,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type MultiFactorError,
} from "firebase/auth";
import { useUI } from "@firebase-oss/ui-react";

import {
  Actions,
  Button,
  ErrorText,
  Links,
  ProviderButton,
  ReauthCancelledError,
  TextField,
  TextLink,
  useAuthTask,
} from "../components";
import { MfaChallenge } from "./mfa-challenge";

type Pending = { reason: string; resolve: () => void; reject: (error: Error) => void };

/**
 * FirebaseUI has no reauthentication API yet, so this calls firebase/auth directly.
 *
 * `withReauth(reason, task)` runs the task, and when Firebase answers `auth/requires-recent-login`
 * it opens the dialog, waits for the user to confirm who they are, then runs the task again.
 */
export function useReauth() {
  const [pending, setPending] = useState<Pending | null>(null);

  const withReauth = useCallback(async <T,>(reason: string, task: () => Promise<T>): Promise<T> => {
    try {
      return await task();
    } catch (error) {
      if (!(error instanceof FirebaseError) || error.code !== "auth/requires-recent-login") throw error;
      await new Promise<void>((resolve, reject) => setPending({ reason, resolve, reject }));
      return await task();
    }
  }, []);

  const dialog = pending && (
    <ReauthDialog
      reason={pending.reason}
      onConfirmed={() => {
        pending.resolve();
        setPending(null);
      }}
      onCancel={() => {
        pending.reject(new ReauthCancelledError());
        setPending(null);
      }}
    />
  );

  return { withReauth, dialog };
}

function ReauthDialog({
  reason,
  onConfirmed,
  onCancel,
}: {
  reason: string;
  onConfirmed: () => void;
  onCancel: () => void;
}) {
  const ui = useUI();
  const user = ui.auth.currentUser!;
  const ref = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState("");
  const [secondFactor, setSecondFactor] = useState(false);
  const task = useAuthTask();

  const providers = user.providerData.map((p) => p.providerId);
  const hasPassword = providers.includes(EmailAuthProvider.PROVIDER_ID) && user.email;
  const hasGoogle = providers.includes(GoogleAuthProvider.PROVIDER_ID);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const confirm = (reauthenticate: () => Promise<unknown>) =>
    task.run(async () => {
      try {
        await reauthenticate();
      } catch (error) {
        if (!(error instanceof FirebaseError) || error.code !== "auth/multi-factor-auth-required") throw error;
        // With a second factor enrolled, reauthentication needs it too. Putting the resolver on the UI state
        // lets the same challenge screens finish it; the demo root only takes over for signed-out users.
        ui.setMultiFactorResolver(getMultiFactorResolver(ui.auth, error as MultiFactorError));
        setSecondFactor(true);
        return;
      }
      onConfirmed();
    });

  return (
    <dialog
      ref={ref}
      className="fc-dialog"
      aria-labelledby="fc-reauth-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      {secondFactor ? (
        <div className="fc-card">
          <MfaChallenge
            frame={(prompt, body) => (
              <>
                <p id="fc-reauth-title" className="fc-prompt">
                  One more step
                </p>
                <p className="fc-body">{prompt}</p>
                {body}
              </>
            )}
            onCancel={onCancel}
            onResolved={onConfirmed}
          />
        </div>
      ) : (
        <form
          className="fc-card"
          onSubmit={(event) => {
            event.preventDefault();
            void confirm(() => reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, password)));
          }}
        >
          <p id="fc-reauth-title" className="fc-prompt">
            Confirm it's you
          </p>
          <p className="fc-body">{reason}</p>
          {hasPassword && (
            <TextField
              icon="lock"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
          )}
          {hasGoogle && (
            <ProviderButton
              provider="google"
              onClick={() => confirm(() => reauthenticateWithPopup(user, new GoogleAuthProvider()))}
            >
              Continue with Google
            </ProviderButton>
          )}
          {!hasPassword && !hasGoogle && <p className="fc-body">Sign out and sign back in to continue.</p>}
          <ErrorText>{task.error}</ErrorText>
          <Links>
            <TextLink onClick={onCancel}>Cancel</TextLink>
          </Links>
          {hasPassword && (
            <Actions>
              <Button type="submit" disabled={!password} loading={task.pending}>
                Confirm
              </Button>
            </Actions>
          )}
        </form>
      )}
    </dialog>
  );
}
