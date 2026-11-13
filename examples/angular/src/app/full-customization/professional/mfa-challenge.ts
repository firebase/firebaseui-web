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

import { Component, computed, input, output, signal, viewChild } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import {
  FactorId,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  type MultiFactorInfo,
  type PhoneMultiFactorInfo,
} from "firebase/auth";
import { signInWithMultiFactorAssertion, verifyPhoneNumber } from "@firebase-oss/ui-core";
import { injectUI } from "@firebase-oss/ui-angular";

import { contents, injectAuthTask, RecaptchaComponent } from "../components";
import { factorName } from "../steps/mfa-enrollment";
import {
  ProButtonComponent,
  ProChoiceComponent,
  ProCodeFieldComponent,
  ProDialogComponent,
  ProErrorComponent,
  ProPageComponent,
} from "./kit";

/** Completes `ui.multiFactorResolver`, whether it came from a sign in or a reauthentication. */
@Component({
  selector: "fc-pro-mfa-challenge",
  imports: [
    NgTemplateOutlet,
    ProPageComponent,
    ProDialogComponent,
    ProButtonComponent,
    ProChoiceComponent,
    ProCodeFieldComponent,
    ProErrorComponent,
    RecaptchaComponent,
  ],
  host: contents,
  template: `
    <ng-template #body>
      @if (hints().length > 1) {
        <h2 class="pro-section">Choose a method</h2>
        <div class="pro-group" role="radiogroup" aria-label="Choose a method" style="margin-bottom: 24px">
          @for (h of hints(); track h.uid; let first = $first) {
            <div>
              @if (!first) {
                <div class="pro-separator" style="--pro-inset: 66px" aria-hidden="true"></div>
              }
              <fc-pro-choice
                name="challenge-method"
                [icon]="h.factorId === phoneFactor ? 'sms' : 'smartphone'"
                [title]="factorName(h)"
                [detail]="h.factorId === phoneFactor ? phoneOf(h) : 'Authenticator app'"
                [checked]="h.uid === hint().uid"
                (selected)="choose(h)"
              />
            </div>
          }
        </div>
      }
      <form class="pro-stack" (submit)="$event.preventDefault(); needsCode() ? verify() : send()">
        @if (needsCode()) {
          <fc-pro-code-field [(value)]="code" />
        }
        <fc-pro-error [message]="task.error()" />
        @if (needsCode()) {
          <button proBtn type="submit" [disabled]="code().length !== 6" [loading]="task.pending()">Verify</button>
        } @else {
          <button proBtn type="submit" [disabled]="!recaptcha()?.verifier()" [loading]="task.pending()">
            Send code
          </button>
        }
      </form>
      @if (isSms() && verificationId()) {
        <button proBtn variant="text" (click)="send()" [disabled]="task.pending() || !recaptcha()?.verifier()">
          Resend code
        </button>
      }
      <button proBtn variant="text" (click)="cancelled.emit()">Cancel</button>
      @if (isSms()) {
        <fc-recaptcha />
      }
    </ng-template>

    @if (dialog()) {
      <fc-pro-dialog icon="verified_user" title="Verify it's you" [subtitle]="subtitle()" (closed)="cancelled.emit()">
        <ng-container *ngTemplateOutlet="body" />
      </fc-pro-dialog>
    } @else {
      <fc-pro-page icon="verified_user" title="Verify it's you" [subtitle]="subtitle()">
        <ng-container *ngTemplateOutlet="body" />
      </fc-pro-page>
    }
  `,
})
export class ProMfaChallengeComponent {
  /** Shows the challenge in a dialog, for reauthentication, rather than as a page. */
  dialog = input(false);
  resolved = output();
  cancelled = output();

  private ui = injectUI();
  protected phoneFactor = FactorId.PHONE;
  protected factorName = factorName;
  protected hints = computed(() => this.ui().multiFactorResolver?.hints ?? []);
  protected hint = signal<MultiFactorInfo>(this.hints()[0]!);
  protected code = signal("");
  protected verificationId = signal<string | null>(null);
  protected recaptcha = viewChild(RecaptchaComponent);
  protected task = injectAuthTask();

  protected isSms = computed(() => this.hint().factorId === FactorId.PHONE);
  protected needsCode = computed(() => !this.isSms() || this.verificationId() !== null);
  protected subtitle = computed(() => {
    if (!this.isSms()) return "Enter the 6-digit code from your authenticator app.";
    const phone = this.phoneOf(this.hint());
    return this.verificationId()
      ? `Enter the 6-digit code we sent to ${phone}.`
      : `Your account uses two-factor authentication. We'll text a code to ${phone}.`;
  });

  protected phoneOf(hint: MultiFactorInfo) {
    return (hint as PhoneMultiFactorInfo).phoneNumber;
  }

  choose(hint: MultiFactorInfo) {
    this.hint.set(hint);
    this.verificationId.set(null);
    this.code.set("");
    this.task.error.set(null);
  }

  send() {
    const verifier = this.recaptcha()?.verifier();
    if (!verifier) return;
    const hint = this.hint();
    void this.task.run(async () => {
      try {
        const verificationId = await verifyPhoneNumber(this.ui(), "", verifier, undefined, hint);
        // A send that finishes after the user picked another method no longer applies.
        if (this.hint() === hint) this.verificationId.set(verificationId);
      } catch (error) {
        if (this.hint() === hint) throw error;
      } finally {
        this.recaptcha()?.reset();
      }
    });
  }

  verify() {
    void this.task.run(async () => {
      const assertion = this.isSms()
        ? PhoneMultiFactorGenerator.assertion(PhoneAuthProvider.credential(this.verificationId()!, this.code()))
        : TotpMultiFactorGenerator.assertionForSignIn(this.hint().uid, this.code());
      await signInWithMultiFactorAssertion(this.ui(), assertion);
      this.resolved.emit();
    });
  }
}
