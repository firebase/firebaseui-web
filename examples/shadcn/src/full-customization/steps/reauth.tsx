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

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { Actions, Button, ErrorText, Links, ProviderButton, TextField, TextLink } from "../components";
import type { ReauthDialogProps, ReauthFlow } from "../reauth";
import { MfaChallenge } from "./mfa-challenge";

export function ThemedReauthDialog({ reason, onConfirmed, onCancel, flow }: ReauthDialogProps & { flow: ReauthFlow }) {
  const { password, setPassword, secondFactor, task, hasPassword, hasGoogle } = flow;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      {/* Only Escape and Cancel dismiss it, so an outside click (or the reCAPTCHA popup) keeps the step. */}
      <DialogContent
        className="fc-dialog"
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
      >
        {secondFactor ? (
          <MfaChallenge
            frame={(prompt, body) => (
              <>
                <DialogTitle className="fc-prompt">One more step</DialogTitle>
                <DialogDescription className="fc-body">{prompt}</DialogDescription>
                {body}
              </>
            )}
            onCancel={onCancel}
            onResolved={onConfirmed}
          />
        ) : (
          <form
            className="fc-form"
            onSubmit={(event) => {
              event.preventDefault();
              void flow.confirmPassword();
            }}
          >
            <DialogTitle className="fc-prompt">Confirm it's you</DialogTitle>
            <DialogDescription className="fc-body">{reason}</DialogDescription>
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
      </DialogContent>
    </Dialog>
  );
}
