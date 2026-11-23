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

import { Component, computed, inject, signal, viewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  FactorId,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  type MultiFactorInfo,
  type TotpSecret,
} from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  formatPhoneNumber,
  generateTotpQrCode,
  generateTotpSecret,
  verifyPhoneNumber,
} from "@firebase-oss/ui-core";
import { injectDefaultCountry, injectUI } from "@firebase-oss/ui-angular";

import {
  ButtonComponent,
  CodeFormComponent,
  contents,
  injectAuthTask,
  PageComponent,
  PhoneFieldsComponent,
  RecaptchaComponent,
  TextLinkComponent,
} from "../components";
import { Reauth } from "../reauth";
import { DemoState, paths } from "../state";

/** The steps of adding a factor, shared with the Professional enrollment screen. */
export type EnrollStep =
  | { kind: "select" }
  | { kind: "sms" }
  | { kind: "sms-code"; verificationId: string }
  | { kind: "totp"; secret: TotpSecret; qrCode: string };

/**
 * The enrollment state and actions, shared by the themed and the Professional screens. Every call
 * that changes the factors needs a recent sign-in, so each one goes through withReauth.
 */
export class Enrollment {
  private ui = injectUI();
  private router = inject(Router);
  private reauth = inject(Reauth);
  private state = inject(DemoState);

  readonly step = signal<EnrollStep>({ kind: "select" });
  readonly country = signal(injectDefaultCountry()());
  readonly phone = signal("");
  readonly phoneNumber = computed(() => formatPhoneNumber(this.phone(), this.country()));
  readonly enrolled = computed(() => {
    const user = this.state.user();
    return user ? [...multiFactor(user).enrolledFactors] : [];
  });
  readonly task = injectAuthTask();
  readonly removal = injectAuthTask();

  constructor(private reason: string) {}

  /** Moves to a step. The steps share one task, so an error from the last step doesn't carry over. */
  go(step: EnrollStep) {
    this.step.set(step);
    this.task.error.set(null);
  }

  select() {
    this.go({ kind: "select" });
  }

  done() {
    void this.router.navigateByUrl(paths.account);
  }

  remove(factor: MultiFactorInfo) {
    return this.removal.run(async () => {
      await this.reauth.withReauth(this.reason, () => multiFactor(this.state.user()!).unenroll(factor));
      // The user object changed in place; re-read it so the list drops the removed factor.
      this.state.refreshUser();
    });
  }

  startTotp() {
    return this.task.run(async () => {
      const secret = await this.reauth.withReauth(this.reason, () => generateTotpSecret(this.ui()));
      this.step.set({ kind: "totp", secret, qrCode: generateTotpQrCode(this.ui(), secret) });
    });
  }

  sendSms(recaptcha: RecaptchaComponent) {
    const verifier = recaptcha.verifier();
    if (!verifier) return;
    const phoneNumber = this.phoneNumber();
    void this.task.run(async () => {
      try {
        const verificationId = await this.reauth.withReauth(this.reason, () =>
          verifyPhoneNumber(this.ui(), phoneNumber, verifier, multiFactor(this.state.user()!))
        );
        this.step.set({ kind: "sms-code", verificationId });
      } finally {
        recaptcha.reset();
      }
    });
  }

  confirmSms = async (code: string) => {
    const step = this.step();
    if (step.kind !== "sms-code") return;
    const assertion = PhoneMultiFactorGenerator.assertion(PhoneAuthProvider.credential(step.verificationId, code));
    await this.reauth.withReauth(this.reason, () =>
      enrollWithMultiFactorAssertion(this.ui(), assertion, "Text message")
    );
    this.done();
  };

  confirmTotp = async (code: string) => {
    const step = this.step();
    if (step.kind !== "totp") return;
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(step.secret, code);
    await this.reauth.withReauth(this.reason, () =>
      enrollWithMultiFactorAssertion(this.ui(), assertion, "Authenticator app")
    );
    this.done();
  };
}

export const factorName = (factor: MultiFactorInfo) =>
  factor.displayName || (factor.factorId === FactorId.PHONE ? "Text message" : "Authenticator app");

@Component({
  selector: "fc-mfa-enrollment",
  imports: [
    PageComponent,
    PhoneFieldsComponent,
    ButtonComponent,
    TextLinkComponent,
    CodeFormComponent,
    RecaptchaComponent,
  ],
  host: contents,
  template: `
    @switch (flow.step().kind) {
      @case ("sms") {
        <fc-page title="Add your number" prompt="Enter the number to text a code to.">
          <form class="fc-form" (submit)="$event.preventDefault(); flow.sendSms(recaptcha()!)">
            <div fcPhoneFields [(country)]="flow.country" [(phone)]="flow.phone"></div>
            <p class="fc-body">
              We'll text a code to this number whenever you sign in. Message &amp; data rates may apply.
            </p>
            @if (flow.task.error(); as error) {
              <p class="fc-error" role="alert">{{ error }}</p>
            }
            <div class="fc-links">
              <button fcLink (click)="flow.select()">Pick a different method</button>
            </div>
            <div class="fc-actions">
              <button
                fcButton
                type="submit"
                [disabled]="!flow.phone() || !recaptcha()?.verifier()"
                [loading]="flow.task.pending()"
              >
                Send code
              </button>
            </div>
          </form>
        </fc-page>
        <fc-recaptcha />
      }
      @case ("sms-code") {
        <fc-page title="Confirm the code" [prompt]="'We sent a code to ' + flow.phoneNumber() + '.'">
          <fc-code-form [task]="flow.task" [submitCode]="flow.confirmSms">
            <button fcLink (click)="flow.select()">Pick a different method</button>
          </fc-code-form>
        </fc-page>
      }
      @case ("totp") {
        <fc-page title="Scan to set up" prompt="Scan this with your authenticator app, or type the key in by hand.">
          <img class="fc-qr" [src]="totp()?.qrCode" alt="QR code for your authenticator app" />
          <p class="fc-secret">{{ totp()?.secret?.secretKey }}</p>
          <p class="fc-body">Then enter the 6-digit code your app is showing.</p>
          <fc-code-form [task]="flow.task" [submitCode]="flow.confirmTotp">
            <button fcLink (click)="flow.select()">Pick a different method</button>
          </fc-code-form>
        </fc-page>
      }
      @default {
        <fc-page
          title="Secure your account"
          prompt="Add a second step to sign in, so a password on its own isn't enough."
        >
          @if (flow.enrolled().length > 0) {
            <ul class="fc-list" aria-label="Already on this account">
              @for (factor of flow.enrolled(); track factor.uid) {
                <li>
                  {{ factorName(factor) }}
                  <button fcLink [disabled]="flow.removal.pending()" (click)="remove(factor)">
                    {{ confirming() === factor.uid ? "Confirm remove" : "Remove" }}
                  </button>
                </li>
              }
            </ul>
          }
          @if (flow.removal.error() ?? flow.task.error(); as error) {
            <p class="fc-error" role="alert">{{ error }}</p>
          }
          <div class="fc-links">
            <button fcLink (click)="flow.done()">Not now</button>
          </div>
          <div class="fc-actions fc-actions--stacked">
            <button fcButton (click)="flow.go({ kind: 'sms' })">Use text message</button>
            <button fcButton variant="secondary" [loading]="flow.task.pending()" (click)="flow.startTotp()">
              Use an authenticator app
            </button>
          </div>
        </fc-page>
      }
    }
  `,
})
export class MfaEnrollmentStepComponent {
  protected flow = new Enrollment("Verify your identity to change your two-factor settings.");
  protected recaptcha = viewChild(RecaptchaComponent);
  protected factorName = factorName;
  // Removing a factor takes a second click, so a stray tap doesn't drop it.
  protected confirming = signal<string | null>(null);
  protected totp = computed(() => {
    const step = this.flow.step();
    return step.kind === "totp" ? step : null;
  });

  remove(factor: MultiFactorInfo) {
    if (this.confirming() !== factor.uid) return this.confirming.set(factor.uid);
    this.confirming.set(null);
    void this.flow.remove(factor);
  }
}
