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

import { useEffect, useRef } from "react";

import { Actions, Button, ErrorText, Links, ProviderButton, TextField, TextLink } from "../components";
import type { ReauthDialogProps, ReauthFlow } from "../reauth";
import { MfaChallenge } from "./mfa-challenge";

export function ThemedReauthDialog({ reason, onConfirmed, onCancel, flow }: ReauthDialogProps & { flow: ReauthFlow }) {
  const { password, setPassword, secondFactor, task, hasPassword, hasGoogle } = flow;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

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
            void flow.confirmPassword();
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
            <ProviderButton provider="google" onClick={() => void flow.confirmGoogle()}>
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
