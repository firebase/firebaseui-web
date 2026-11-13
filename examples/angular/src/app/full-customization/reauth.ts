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

import { Injectable, signal } from "@angular/core";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  getMultiFactorResolver,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type MultiFactorError,
} from "firebase/auth";
import type { FirebaseUI } from "@firebase-oss/ui-core";

import { AuthTask, ReauthCancelledError } from "./components";

type Pending = { reason: string; resolve: () => void; reject: (error: Error) => void };

/**
 * FirebaseUI has no reauthentication API yet, so this calls firebase/auth directly.
 *
 * `withReauth(reason, task)` runs the task, and when Firebase answers `auth/requires-recent-login`
 * it opens the dialog, waits for the user to confirm who they are, then runs the task again.
 */
@Injectable()
export class Reauth {
  /** The open request, which the demo root renders as the dialog. */
  readonly pending = signal<Pending | null>(null);

  async withReauth<T>(reason: string, task: () => Promise<T>): Promise<T> {
    try {
      return await task();
    } catch (error) {
      if (!(error instanceof FirebaseError) || error.code !== "auth/requires-recent-login") throw error;
      await new Promise<void>((resolve, reject) => this.pending.set({ reason, resolve, reject }));
      return await task();
    }
  }

  confirmed() {
    this.pending()?.resolve();
    this.pending.set(null);
  }

  cancelled() {
    this.pending()?.reject(new ReauthCancelledError());
    this.pending.set(null);
  }

  /** Leaving the demo with the dialog open settles the waiting call as a cancellation. */
  ngOnDestroy() {
    this.cancelled();
  }
}

/** The reauthentication state and actions, shared by the themed dialog and the Professional one. */
export class ReauthFlow {
  readonly password = signal("");
  readonly secondFactor = signal(false);
  readonly task: AuthTask;
  readonly user;
  readonly hasPassword: boolean;
  readonly hasGoogle: boolean;

  constructor(
    private ui: () => FirebaseUI,
    private reauth: Reauth
  ) {
    this.task = new AuthTask(ui);
    this.user = ui().auth.currentUser!;
    const providers = this.user.providerData.map((p) => p.providerId);
    this.hasPassword = Boolean(providers.includes(EmailAuthProvider.PROVIDER_ID) && this.user.email);
    this.hasGoogle = providers.includes(GoogleAuthProvider.PROVIDER_ID);
  }

  confirmPassword() {
    return this.confirm(() =>
      reauthenticateWithCredential(this.user, EmailAuthProvider.credential(this.user.email!, this.password()))
    );
  }

  confirmGoogle() {
    return this.confirm(() => reauthenticateWithPopup(this.user, new GoogleAuthProvider()));
  }

  confirmed() {
    this.reauth.confirmed();
  }

  cancel() {
    this.reauth.cancelled();
  }

  private confirm(reauthenticate: () => Promise<unknown>) {
    return this.task.run(async () => {
      try {
        await reauthenticate();
      } catch (error) {
        if (!(error instanceof FirebaseError) || error.code !== "auth/multi-factor-auth-required") throw error;
        // With a second factor enrolled, reauthentication needs it too. Putting the resolver on the UI state
        // lets the same challenge screens finish it; the demo root only takes over for signed-out users.
        const ui = this.ui();
        ui.setMultiFactorResolver(getMultiFactorResolver(ui.auth, error as MultiFactorError));
        this.secondFactor.set(true);
        return;
      }
      this.confirmed();
    });
  }
}
