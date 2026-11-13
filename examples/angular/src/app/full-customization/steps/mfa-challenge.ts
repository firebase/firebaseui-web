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

import {
  ButtonComponent,
  CodeFormComponent,
  contents,
  injectAuthTask,
  PageComponent,
  RecaptchaComponent,
  TextLinkComponent,
} from "../components";

/**
 * Completes `ui.multiFactorResolver`, whichever call raised it. Core's signInWithMultiFactorAssertion
 * only calls `resolver.resolveSignIn`, so the same screen finishes a reauthentication as well as a
 * sign in. As a page it is shown by the demo root; inside the reauth dialog it drops the page frame.
 */
@Component({
  selector: "fc-mfa-challenge",
  imports: [NgTemplateOutlet, PageComponent, ButtonComponent, TextLinkComponent, CodeFormComponent, RecaptchaComponent],
  host: contents,
  template: `
    <ng-template #links>
      @if (hints().length > 1) {
        <button fcLink (click)="choose(null)">Pick a different method</button>
      }
      <button fcLink (click)="cancelled.emit()">Cancel</button>
    </ng-template>

    <ng-template #body>
      @if (!hint()) {
        <div class="fc-actions fc-actions--stacked">
          @for (h of hints(); track h.uid; let first = $first) {
            <button fcButton [variant]="first ? 'primary' : 'secondary'" (click)="choose(h)">
              {{ h.factorId === phoneFactor ? "Text message" : "Authenticator app" }}
            </button>
          }
        </div>
        <div class="fc-links">
          <button fcLink (click)="cancelled.emit()">Cancel</button>
        </div>
      } @else if (!isSms()) {
        <fc-code-form [task]="task" [submitCode]="verifyTotp">
          <ng-container *ngTemplateOutlet="links" />
        </fc-code-form>
      } @else if (verificationId()) {
        <fc-code-form [task]="task" [submitCode]="verifySms">
          <button fcLink (click)="send()" [disabled]="task.pending() || !recaptcha()?.verifier()">Resend code</button>
          <ng-container *ngTemplateOutlet="links" />
        </fc-code-form>
      } @else {
        <p class="fc-body">We'll send a code to confirm it's you.</p>
        @if (task.error(); as error) {
          <p class="fc-error" role="alert">{{ error }}</p>
        }
        <div class="fc-links"><ng-container *ngTemplateOutlet="links" /></div>
        <div class="fc-actions">
          <button fcButton (click)="send()" [disabled]="!recaptcha()?.verifier()" [loading]="task.pending()">
            Send code
          </button>
        </div>
      }
    </ng-template>

    @if (dialog()) {
      <p id="fc-reauth-title" class="fc-prompt">One more step</p>
      <p class="fc-body">{{ prompt() }}</p>
      <ng-container *ngTemplateOutlet="body" />
    } @else {
      <fc-page title="One more step" [prompt]="prompt()">
        <ng-container *ngTemplateOutlet="body" />
      </fc-page>
    }
    @if (isSms()) {
      <fc-recaptcha />
    }
  `,
})
export class MfaChallengeComponent {
  /** Drops the page frame, for use inside the reauthentication dialog. */
  dialog = input(false);
  /** Called once the second factor is confirmed and the resolver is resolved. */
  resolved = output();
  cancelled = output();

  private ui = injectUI();
  protected phoneFactor = FactorId.PHONE;
  protected hints = computed(() => this.ui().multiFactorResolver?.hints ?? []);
  protected hint = signal<MultiFactorInfo | null>(this.hints().length === 1 ? this.hints()[0]! : null);
  protected isSms = computed(() => this.hint()?.factorId === FactorId.PHONE);
  protected verificationId = signal<string | null>(null);
  protected recaptcha = viewChild(RecaptchaComponent);
  protected task = injectAuthTask();

  protected prompt = computed(() => {
    const hint = this.hint();
    if (!hint) return "Choose how to confirm it's you.";
    if (!this.isSms()) return "Open your authenticator app and enter the 6-digit code for this account.";
    return `Text message to ${(hint as PhoneMultiFactorInfo).phoneNumber}.`;
  });

  choose(hint: MultiFactorInfo | null) {
    this.hint.set(hint);
    this.verificationId.set(null);
    this.task.error.set(null);
  }

  send() {
    // The verifier is briefly null while a fresh one renders after each send.
    const verifier = this.recaptcha()?.verifier();
    const hint = this.hint();
    if (!verifier || !hint) return;
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

  protected verifySms = async (code: string) => {
    const credential = PhoneAuthProvider.credential(this.verificationId()!, code);
    await signInWithMultiFactorAssertion(this.ui(), PhoneMultiFactorGenerator.assertion(credential));
    this.resolved.emit();
  };

  protected verifyTotp = async (code: string) => {
    const assertion = TotpMultiFactorGenerator.assertionForSignIn(this.hint()!.uid, code);
    await signInWithMultiFactorAssertion(this.ui(), assertion);
    this.resolved.emit();
  };
}
