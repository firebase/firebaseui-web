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

import { Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { EmailAuthProvider, multiFactor, sendEmailVerification, signOut, updatePassword } from "firebase/auth";
import { injectUI } from "@firebase-oss/ui-angular";

import {
  ButtonComponent,
  contents,
  injectAuthTask,
  PageComponent,
  TextFieldComponent,
  TextLinkComponent,
} from "../components";
import { Reauth } from "../reauth";
import { DemoState, identifier, paths } from "../state";

/** The account facts both account pages read; they re-read on every change to the signed-in user. */
export function accountFacts(state: DemoState) {
  // The same user object comes back after an in-place change, so equality is off here too.
  const user = computed(() => state.user()!, { equal: () => false });
  return {
    user,
    hasPassword: computed(() => user().providerData.some((p) => p.providerId === EmailAuthProvider.PROVIDER_ID)),
    enrolledFactors: computed(() => multiFactor(user()).enrolledFactors.length),
    needsVerification: computed(() => Boolean(user().email) && !user().emailVerified),
  };
}

@Component({
  selector: "fc-account",
  imports: [PageComponent, TextFieldComponent, ButtonComponent, TextLinkComponent],
  host: contents,
  template: `
    @if (facts.user().isAnonymous) {
      <fc-page title="You're in" prompt="You're browsing as a guest.">
        <p class="fc-body">Guest sessions stay on this device. Sign out to try another method.</p>
        <div class="fc-actions">
          <button fcButton (click)="signOut()">Sign out</button>
        </div>
      </fc-page>
    } @else {
      <fc-page title="You're in" [prompt]="'Signed in as ' + name() + '.'">
        @if (facts.hasPassword()) {
          <form class="fc-form" (submit)="$event.preventDefault(); changePassword()">
            <p class="fc-body">
              Changing your password needs a recent sign-in, so it can open the reauthentication step.
            </p>
            <div
              fcField
              icon="lock"
              type="password"
              autocomplete="new-password"
              placeholderText="New password"
              [value]="newPassword()"
              (valueChange)="newPassword.set($event); message.set(null)"
            ></div>
            <div class="fc-actions">
              <button fcButton type="submit" [disabled]="newPassword().length < 6" [loading]="task.pending()">
                Change password
              </button>
            </div>
          </form>
        }
        @if (facts.needsVerification()) {
          <p class="fc-body">Verify {{ facts.user().email }} to set up two-factor authentication.</p>
        }
        @if (task.error(); as error) {
          <p class="fc-error" role="alert">{{ error }}</p>
        }
        @if (message(); as message) {
          <p class="fc-body" role="status">{{ message }}</p>
        }
        <div class="fc-links">
          @if (facts.needsVerification()) {
            <button fcLink (click)="sendVerification()">Send verification email</button>
            <button fcLink (click)="checkVerified()">I've verified my email</button>
          } @else {
            <button fcLink (click)="router.navigateByUrl(paths.twoFactor)">
              {{ facts.enrolledFactors() > 0 ? "Manage two-factor" : "Set up two-factor" }}
            </button>
          }
        </div>
        <div class="fc-actions">
          <button fcButton variant="secondary" (click)="signOut()">Sign out</button>
        </div>
      </fc-page>
    }
  `,
})
export class AccountStepComponent {
  private ui = injectUI();
  private reauth = inject(Reauth);
  private state = inject(DemoState);
  protected router = inject(Router);
  protected paths = paths;
  protected facts = accountFacts(this.state);
  protected name = computed(() => identifier(this.facts.user()));
  protected newPassword = signal("");
  protected message = signal<string | null>(null);
  protected task = injectAuthTask();

  signOut() {
    void signOut(this.ui().auth);
  }

  changePassword() {
    void this.task.run(async () => {
      await this.reauth.withReauth("Verify your identity to change your password.", () =>
        updatePassword(this.facts.user(), this.newPassword())
      );
      this.newPassword.set("");
      this.message.set("Password changed.");
    });
  }

  sendVerification() {
    void this.task.run(() =>
      sendEmailVerification(this.facts.user()).then(() => this.message.set("Verification email sent."))
    );
  }

  checkVerified() {
    void this.task.run(async () => {
      await this.facts.user().reload();
      this.state.refreshUser();
    });
  }
}
