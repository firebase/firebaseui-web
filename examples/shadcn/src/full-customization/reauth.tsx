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

import { useCallback, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  getMultiFactorResolver,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type MultiFactorError,
} from "firebase/auth";
import { useMultiFactorAssertionCleanup, useUI } from "@firebase-oss/ui-react";

import { ReauthCancelledError, useAuthTask } from "./components";
import { ProReauthDialog } from "./professional/reauth";
import { ThemedReauthDialog } from "./steps/reauth";
import { useThemeId } from "./theme";

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

export type ReauthDialogProps = {
  reason: string;
  onConfirmed: () => void;
  onCancel: () => void;
};

/** The reauthentication state and actions, shared by the themed dialog and the Professional one. */
export function useReauthFlow(onConfirmed: () => void) {
  const ui = useUI();
  const user = ui.auth.currentUser!;
  const [password, setPassword] = useState("");
  const [secondFactor, setSecondFactor] = useState(false);
  const task = useAuthTask();

  const providers = user.providerData.map((p) => p.providerId);
  const hasPassword = Boolean(providers.includes(EmailAuthProvider.PROVIDER_ID) && user.email);
  const hasGoogle = providers.includes(GoogleAuthProvider.PROVIDER_ID);

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

  return {
    user,
    password,
    setPassword,
    secondFactor,
    task,
    hasPassword,
    hasGoogle,
    confirmPassword: () =>
      confirm(() => reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, password))),
    confirmGoogle: () => confirm(() => reauthenticateWithPopup(user, new GoogleAuthProvider())),
  };
}

export type ReauthFlow = ReturnType<typeof useReauthFlow>;

function ReauthDialog(props: ReauthDialogProps) {
  const theme = useThemeId();
  const flow = useReauthFlow(props.onConfirmed);
  // The dialog owns any resolver raised by reauth, so closing it never leaves one behind.
  useMultiFactorAssertionCleanup();
  if (theme === "professional") return <ProReauthDialog {...props} flow={flow} />;
  return <ThemedReauthDialog {...props} flow={flow} />;
}
