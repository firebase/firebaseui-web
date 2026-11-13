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

import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router";
import {
  EmailAuthProvider,
  multiFactor,
  onIdTokenChanged,
  sendEmailVerification,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { KeyRound, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { useUI } from "@firebase-oss/ui-react";

import { useAuthTask } from "../components";
import { paths } from "../state";
import { useReauth } from "../reauth";
import { ProButton, ProError, ProField, ProGroup, ProHeader, ProRow, ProSection, ProSeparator } from "./kit";

function signedInWith(user: User) {
  if (user.isAnonymous) return "a temporary account";
  const provider = user.providerData[0]?.providerId;
  if (provider === "google.com") return "Google";
  if (provider === "phone") return "phone";
  return "email";
}

/** A settings-style account page, as in the Android and iOS demos. */
export function ProAccount({ user }: { user: User }) {
  const ui = useUI();
  const navigate = useNavigate();
  const { withReauth, dialog } = useReauth();
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const task = useAuthTask();

  // The user object is mutated in place by reload() and profile updates, so re-render on demand and on token refresh.
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => onIdTokenChanged(ui.auth, () => refresh()), [ui.auth]);

  const identity = user.displayName || user.email || user.phoneNumber;
  const hasPassword = user.providerData.some((p) => p.providerId === EmailAuthProvider.PROVIDER_ID);
  const twoFactorOn = multiFactor(user).enrolledFactors.length > 0;
  const needsVerification = Boolean(user.email) && !user.emailVerified;

  return (
    <main className="pro-page">
      <ProHeader title="Account" />
      <div className="pro-content">
        <div className="pro-profile" data-testid="profile">
          <span className="pro-avatar" aria-hidden="true">
            {identity ? identity[0]!.toUpperCase() : <UserIcon />}
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="pro-profile__name">{identity || "Signed in"}</div>
            <div className="pro-profile__sub">Signed in with {signedInWith(user)}</div>
          </div>
        </div>

        {!user.isAnonymous && (
          <>
            <ProSection>Security</ProSection>
            <ProGroup label="Security">
              {hasPassword && (
                <>
                  <ProRow
                    icon={KeyRound}
                    title="Password"
                    value={editingPassword ? "Cancel" : "Change"}
                    chevron
                    expanded={editingPassword}
                    onClick={() => {
                      setEditingPassword(!editingPassword);
                      setMessage(null);
                    }}
                  />
                  {editingPassword && (
                    <form
                      className="pro-inline-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void task.run(async () => {
                          await withReauth("Verify your identity to change your password.", () =>
                            updatePassword(user, newPassword)
                          );
                          setNewPassword("");
                          setEditingPassword(false);
                          setMessage("Password updated.");
                        });
                      }}
                    >
                      <ProField
                        label="New password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        autoFocus
                      />
                      <ProError>{task.error}</ProError>
                      <ProButton type="submit" disabled={newPassword.length < 6} loading={task.pending}>
                        Update password
                      </ProButton>
                    </form>
                  )}
                  <ProSeparator />
                </>
              )}
              <ProRow
                icon={ShieldCheck}
                title="Two-factor authentication"
                value={twoFactorOn ? "On" : "Off"}
                chevron
                onClick={() =>
                  needsVerification
                    ? setMessage("Verify your email before setting up two-factor.")
                    : navigate(paths.twoFactor)
                }
              />
              {user.email && (
                <>
                  <ProSeparator />
                  <ProRow
                    icon={Mail}
                    title="Email"
                    value={user.emailVerified ? "Verified" : verificationSent ? "Check again" : "Verify"}
                    tone={user.emailVerified ? "muted" : "accent"}
                    onClick={
                      user.emailVerified
                        ? undefined
                        : () =>
                            void task.run(async () => {
                              if (verificationSent) {
                                await user.reload();
                                refresh();
                                return;
                              }
                              await sendEmailVerification(user);
                              setVerificationSent(true);
                              setMessage(`We sent a verification link to ${user.email}.`);
                            })
                    }
                  />
                </>
              )}
            </ProGroup>
            {!editingPassword && <ProError>{task.error}</ProError>}
            {message && (
              <p className="pro-subtitle" role="status">
                {message}
              </p>
            )}
          </>
        )}

        <div style={{ height: 24 }} />
        <ProGroup>
          <ProRow title="Sign out" tone="accent" onClick={() => void signOut(ui.auth)} />
        </ProGroup>
      </div>
      {dialog}
    </main>
  );
}
