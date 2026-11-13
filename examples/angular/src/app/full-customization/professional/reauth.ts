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

import { Component, computed, input } from "@angular/core";

import { contents, GoogleLogoComponent } from "../components";
import type { ReauthFlow } from "../reauth";
import { ProButtonComponent, ProDialogComponent, ProErrorComponent, ProFieldComponent } from "./kit";
import { ProMfaChallengeComponent } from "./mfa-challenge";

/** The Professional reauthentication prompt, following the iOS demo; the logic is shared with the other themes. */
@Component({
  selector: "fc-pro-reauth-dialog",
  imports: [
    ProDialogComponent,
    ProButtonComponent,
    ProErrorComponent,
    ProFieldComponent,
    ProMfaChallengeComponent,
    GoogleLogoComponent,
  ],
  host: contents,
  template: `
    @if (flow().secondFactor()) {
      <fc-pro-mfa-challenge [dialog]="true" (cancelled)="flow().cancel()" (resolved)="flow().confirmed()" />
    } @else {
      <fc-pro-dialog icon="lock" title="Confirm it's you" [subtitle]="subtitle()" (closed)="flow().cancel()">
        @if (flow().hasPassword) {
          <form class="pro-stack" (submit)="$event.preventDefault(); flow().confirmPassword()">
            <fc-pro-field
              label="Password"
              type="password"
              autocomplete="current-password"
              placeholderText="Enter your password"
              [autofocus]="true"
              [value]="flow().password()"
              (valueChange)="flow().password.set($event)"
            />
            <fc-pro-error [message]="flow().task.error()" />
            <button proBtn type="submit" [disabled]="!flow().password()" [loading]="flow().task.pending()">
              Continue
            </button>
          </form>
        }
        @if (flow().hasGoogle) {
          <button proBtn variant="outline" (click)="flow().confirmGoogle()">
            <fc-google-logo />
            Continue with Google
          </button>
        }
        @if (!flow().hasPassword && !flow().hasGoogle) {
          <p class="pro-subtitle">Sign out and sign back in to continue.</p>
        }
        @if (!flow().hasPassword) {
          <fc-pro-error [message]="flow().task.error()" />
        }
        <button proBtn variant="text" (click)="flow().cancel()">Cancel</button>
      </fc-pro-dialog>
    }
  `,
})
export class ProReauthDialogComponent {
  reason = input.required<string>();
  flow = input.required<ReauthFlow>();
  protected subtitle = computed(() =>
    this.flow().hasPassword ? `${this.reason()} Enter the password for ${this.flow().user.email}.` : this.reason()
  );
}
