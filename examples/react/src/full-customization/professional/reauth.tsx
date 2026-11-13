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

import { GoogleLogo } from "@firebase-oss/ui-react";

import type { ReauthDialogProps, ReauthFlow } from "../reauth";
import { ProButton, ProDialog, ProError, ProField } from "./kit";
import { ProMfaChallenge } from "./mfa-challenge";

/** The Professional reauthentication prompt, following the iOS demo; the logic is shared with the other themes. */
export function ProReauthDialog({ reason, onConfirmed, onCancel, flow }: ReauthDialogProps & { flow: ReauthFlow }) {
  const { user, password, setPassword, secondFactor, task, hasPassword, hasGoogle } = flow;

  if (secondFactor) {
    return (
      <ProMfaChallenge
        frame={(header, body) => (
          <ProDialog icon={header.icon} title={header.title} subtitle={header.subtitle} onClose={onCancel}>
            {body}
          </ProDialog>
        )}
        onCancel={onCancel}
        onResolved={onConfirmed}
      />
    );
  }

  return (
    <ProDialog
      icon="lock"
      title="Confirm it's you"
      subtitle={hasPassword ? `${reason} Enter the password for ${user.email}.` : reason}
      onClose={onCancel}
    >
      {hasPassword && (
        <form
          className="pro-stack"
          onSubmit={(event) => {
            event.preventDefault();
            void flow.confirmPassword();
          }}
        >
          <ProField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          <ProError>{task.error}</ProError>
          <ProButton type="submit" disabled={!password} loading={task.pending}>
            Continue
          </ProButton>
        </form>
      )}
      {hasGoogle && (
        <ProButton variant="outline" icon={<GoogleLogo />} onClick={() => void flow.confirmGoogle()}>
          Continue with Google
        </ProButton>
      )}
      {!hasPassword && !hasGoogle && <p className="pro-subtitle">Sign out and sign back in to continue.</p>}
      {!hasPassword && <ProError>{task.error}</ProError>}
      <ProButton variant="text" onClick={onCancel}>
        Cancel
      </ProButton>
    </ProDialog>
  );
}
