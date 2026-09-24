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

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  EmailAuthProvider,
  multiFactor,
  sendEmailVerification,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { useUI } from "@firebase-oss/ui-react";

import { Actions, Button, ErrorText, Links, Page, TextField, TextLink, useAuthTask } from "../components";
import { paths } from "../state";
import { useReauth } from "./reauth";

function identifier(user: User) {
  return user.displayName || user.email || user.phoneNumber || "your account";
}

export function AccountStep({ user }: { user: User }) {
  const ui = useUI();
  const navigate = useNavigate();
  const { withReauth, dialog } = useReauth();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const task = useAuthTask();

  const hasPassword = user.providerData.some((p) => p.providerId === EmailAuthProvider.PROVIDER_ID);
  const enrolledFactors = multiFactor(user).enrolledFactors.length;
  const needsVerification = Boolean(user.email) && !user.emailVerified;

  const signOutButton = (
    <Button variant={user.isAnonymous ? "primary" : "secondary"} onClick={() => signOut(ui.auth)}>
      Sign out
    </Button>
  );

  if (user.isAnonymous) {
    return (
      <Page title="You're in" prompt="You're browsing as a guest.">
        <p className="fc-body">Guest sessions stay on this device. Sign out to try another method.</p>
        <Actions>{signOutButton}</Actions>
      </Page>
    );
  }

  return (
    <Page title="You're in" prompt={`Signed in as ${identifier(user)}.`}>
      {hasPassword && (
        <form
          className="fc-form"
          onSubmit={(event) => {
            event.preventDefault();
            void task.run(async () => {
              await withReauth("Verify your identity to change your password.", () =>
                updatePassword(user, newPassword)
              );
              setNewPassword("");
              setMessage("Password changed.");
            });
          }}
        >
          <p className="fc-body">
            Changing your password needs a recent sign-in, so it can open the reauthentication step.
          </p>
          <TextField
            icon="lock"
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setMessage(null);
            }}
          />
          <Actions>
            <Button type="submit" disabled={newPassword.length < 6} loading={task.pending}>
              Change password
            </Button>
          </Actions>
        </form>
      )}
      {needsVerification && <p className="fc-body">Verify {user.email} to set up two-factor authentication.</p>}
      <ErrorText>{task.error}</ErrorText>
      {message && (
        <p className="fc-body" role="status">
          {message}
        </p>
      )}
      <Links>
        {needsVerification ? (
          <TextLink
            onClick={() =>
              task.run(() => sendEmailVerification(user).then(() => setMessage("Verification email sent.")))
            }
          >
            Send verification email
          </TextLink>
        ) : (
          <TextLink onClick={() => navigate(paths.twoFactor)}>
            {enrolledFactors > 0 ? "Manage two-factor" : "Set up two-factor"}
          </TextLink>
        )}
      </Links>
      <Actions>{signOutButton}</Actions>
      {dialog}
    </Page>
  );
}
