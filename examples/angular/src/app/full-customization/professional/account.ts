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
import { sendEmailVerification, signOut, updatePassword, type User } from "firebase/auth";
import { injectUI } from "@firebase-oss/ui-angular";

import { contents, injectAuthTask } from "../components";
import { Reauth } from "../reauth";
import { DemoState, paths } from "../state";
import { accountFacts } from "../steps/account";
import { ProButtonComponent, ProErrorComponent, ProFieldComponent, ProHeaderComponent, ProRowComponent } from "./kit";

function signedInWith(user: User) {
  if (user.isAnonymous) return "a temporary account";
  const provider = user.providerData[0]?.providerId;
  if (provider === "google.com") return "Google";
  if (provider === "phone") return "phone";
  return "email";
}

/** A settings-style account page, as in the Android and iOS demos. */
@Component({
  selector: "fc-pro-account",
  imports: [ProHeaderComponent, ProRowComponent, ProFieldComponent, ProButtonComponent, ProErrorComponent],
  host: contents,
  template: `
    <main class="pro-page">
      <fc-pro-header title="Account" />
      <div class="pro-content">
        <div class="pro-profile" data-testid="profile">
          <span class="pro-avatar" aria-hidden="true">
            @if (identity()) {
              {{ identity()![0]!.toUpperCase() }}
            } @else {
              <span class="fc-icon pro-sym">person</span>
            }
          </span>
          <div style="min-width: 0">
            <div class="pro-profile__name">{{ identity() || "Signed in" }}</div>
            <div class="pro-profile__sub">Signed in with {{ signedInWith() }}</div>
          </div>
        </div>

        @if (!facts.user().isAnonymous) {
          <h2 class="pro-section">Security</h2>
          <div class="pro-group" role="group" aria-label="Security">
            @if (facts.hasPassword()) {
              <fc-pro-row
                icon="key"
                title="Password"
                [value]="editingPassword() ? 'Cancel' : 'Change'"
                [chevron]="true"
                [clickable]="true"
                [expanded]="editingPassword()"
                (rowClick)="editingPassword.set(!editingPassword()); message.set(null)"
              />
              @if (editingPassword()) {
                <form class="pro-inline-form" (submit)="$event.preventDefault(); changePassword()">
                  <fc-pro-field
                    label="New password"
                    type="password"
                    autocomplete="new-password"
                    placeholderText="At least 6 characters"
                    [autofocus]="true"
                    [(value)]="newPassword"
                  />
                  <fc-pro-error [message]="task.error()" />
                  <button proBtn type="submit" [disabled]="newPassword().length < 6" [loading]="task.pending()">
                    Update password
                  </button>
                </form>
              }
              <div class="pro-separator" style="--pro-inset: 48px" aria-hidden="true"></div>
            }
            <fc-pro-row
              icon="verified_user"
              title="Two-factor authentication"
              [value]="facts.enrolledFactors() > 0 ? 'On' : 'Off'"
              [chevron]="true"
              [clickable]="true"
              (rowClick)="openTwoFactor()"
            />
            @if (facts.user().email) {
              <div class="pro-separator" style="--pro-inset: 48px" aria-hidden="true"></div>
              <fc-pro-row
                icon="mail"
                title="Email"
                [value]="facts.user().emailVerified ? 'Verified' : verificationSent() ? 'Check again' : 'Verify'"
                [tone]="facts.user().emailVerified ? 'muted' : 'accent'"
                [clickable]="!facts.user().emailVerified"
                (rowClick)="verifyEmail()"
              />
            }
          </div>
          @if (!editingPassword()) {
            <fc-pro-error [message]="task.error()" />
          }
          @if (message(); as message) {
            <p class="pro-subtitle" role="status">{{ message }}</p>
          }
        }

        <div style="height: 24px"></div>
        <div class="pro-group" role="group">
          <fc-pro-row title="Sign out" tone="accent" [clickable]="true" (rowClick)="signOut()" />
        </div>
      </div>
    </main>
  `,
})
export class ProAccountComponent {
  private ui = injectUI();
  private router = inject(Router);
  private reauth = inject(Reauth);
  private state = inject(DemoState);
  protected facts = accountFacts(this.state);
  protected identity = computed(() => {
    const user = this.facts.user();
    return user.displayName || user.email || user.phoneNumber;
  });
  protected signedInWith = computed(() => signedInWith(this.facts.user()));
  protected editingPassword = signal(false);
  protected newPassword = signal("");
  protected message = signal<string | null>(null);
  protected verificationSent = signal(false);
  protected task = injectAuthTask();

  changePassword() {
    void this.task.run(async () => {
      await this.reauth.withReauth("Verify your identity to change your password.", () =>
        updatePassword(this.facts.user(), this.newPassword())
      );
      this.newPassword.set("");
      this.editingPassword.set(false);
      this.message.set("Password updated.");
    });
  }

  openTwoFactor() {
    if (this.facts.needsVerification()) this.message.set("Verify your email before setting up two-factor.");
    else void this.router.navigateByUrl(paths.twoFactor);
  }

  verifyEmail() {
    const user = this.facts.user();
    void this.task.run(async () => {
      if (this.verificationSent()) {
        await user.reload();
        this.state.refreshUser();
        return;
      }
      await sendEmailVerification(user);
      this.verificationSent.set(true);
      this.message.set(`We sent a verification link to ${user.email}.`);
    });
  }

  signOut() {
    void signOut(this.ui().auth);
  }
}
