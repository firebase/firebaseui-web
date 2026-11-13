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

import { Component, computed, signal, viewChild } from "@angular/core";
import type { MultiFactorInfo } from "firebase/auth";

import { contents, RecaptchaComponent } from "../components";
import { Enrollment, factorName } from "../steps/mfa-enrollment";
import {
  ProButtonComponent,
  ProChoiceComponent,
  ProCodeFieldComponent,
  ProErrorComponent,
  ProPageComponent,
  ProPhoneFieldComponent,
  ProRowComponent,
} from "./kit";

@Component({
  selector: "fc-pro-mfa-enrollment",
  imports: [
    ProPageComponent,
    ProButtonComponent,
    ProChoiceComponent,
    ProCodeFieldComponent,
    ProErrorComponent,
    ProPhoneFieldComponent,
    ProRowComponent,
    RecaptchaComponent,
  ],
  host: contents,
  template: `
    @switch (flow.step().kind) {
      @case ("sms") {
        <fc-pro-page
          [back]="true"
          (backClick)="flow.select()"
          icon="sms"
          title="Add your phone number"
          subtitle="We'll text a code to this number whenever you sign in."
        >
          <form class="pro-stack" (submit)="$event.preventDefault(); flow.sendSms(recaptcha()!)">
            <fc-pro-phone-field [(country)]="flow.country" [(phone)]="flow.phone" />
            <fc-pro-error [message]="flow.task.error()" />
            <button
              proBtn
              type="submit"
              [disabled]="!flow.phone() || !recaptcha()?.verifier()"
              [loading]="flow.task.pending()"
            >
              Send code
            </button>
          </form>
          <button proBtn variant="text" (click)="flow.select()">Pick a different method</button>
        </fc-pro-page>
        <fc-recaptcha />
      }
      @case ("sms-code") {
        <fc-pro-page
          [back]="true"
          (backClick)="flow.select()"
          icon="tag"
          title="Confirm the code"
          [subtitle]="'We sent a 6-digit code to ' + flow.phoneNumber() + '.'"
        >
          <form class="pro-stack" (submit)="$event.preventDefault(); confirm(flow.confirmSms)">
            <fc-pro-code-field [(value)]="code" />
            <fc-pro-error [message]="flow.task.error()" />
            <button proBtn type="submit" [disabled]="code().length !== 6" [loading]="flow.task.pending()">
              Verify
            </button>
          </form>
        </fc-pro-page>
      }
      @case ("totp") {
        <fc-pro-page
          [back]="true"
          (backClick)="flow.select()"
          icon="qr_code_2"
          title="Scan to set up"
          subtitle="Scan the code with your authenticator app, or enter the key by hand."
        >
          <div class="pro-stack">
            <img class="pro-qr" [src]="totp()?.qrCode" alt="QR code for your authenticator app" />
            <div class="pro-secret">
              <code>{{ totp()?.secret?.secretKey }}</code>
              <button proBtn variant="text" (click)="copy()">{{ copied() ? "Copied" : "Copy" }}</button>
            </div>
            <form class="pro-stack" (submit)="$event.preventDefault(); confirm(flow.confirmTotp)">
              <fc-pro-code-field [(value)]="code" />
              <fc-pro-error [message]="flow.task.error()" />
              <button proBtn type="submit" [disabled]="code().length !== 6" [loading]="flow.task.pending()">
                Verify
              </button>
            </form>
          </div>
          <button proBtn variant="text" (click)="flow.select()">Pick a different method</button>
        </fc-pro-page>
      }
      @default {
        <fc-pro-page
          [back]="true"
          (backClick)="flow.done()"
          icon="verified_user"
          title="Set up two-factor authentication"
          subtitle="Add a second step to sign-in, so a password on its own isn't enough."
        >
          @if (flow.enrolled().length > 0) {
            <h2 class="pro-section">Your methods</h2>
            <div class="pro-group" role="group" aria-label="Your methods">
              @for (factor of flow.enrolled(); track factor.uid; let first = $first) {
                <div>
                  @if (!first) {
                    <div class="pro-separator" style="--pro-inset: 16px" aria-hidden="true"></div>
                  }
                  <fc-pro-row
                    [title]="factorName(factor)"
                    [value]="confirming() === factor.uid ? 'Confirm remove' : 'Remove'"
                    tone="danger"
                    [clickable]="true"
                    [disabled]="flow.removal.pending()"
                    (rowClick)="remove(factor)"
                  />
                </div>
              }
            </div>
            <div style="height: 24px"></div>
          }
          <h2 class="pro-section">Choose a method</h2>
          <div class="pro-group" role="radiogroup" aria-label="Choose a method">
            <fc-pro-choice
              name="enroll-method"
              icon="sms"
              title="Text message"
              detail="We'll text a code to your phone."
              [checked]="method() === 'sms'"
              (selected)="method.set('sms')"
            />
            <div class="pro-separator" style="--pro-inset: 66px" aria-hidden="true"></div>
            <fc-pro-choice
              name="enroll-method"
              icon="smartphone"
              title="Authenticator app"
              detail="Use a code from an app like Google Authenticator."
              [checked]="method() === 'totp'"
              (selected)="method.set('totp')"
            />
          </div>
          <div class="pro-stack" style="margin-top: 16px">
            <fc-pro-error [message]="flow.removal.error() ?? flow.task.error()" />
            <button proBtn [loading]="flow.task.pending()" (click)="continue()">Continue</button>
          </div>
          <button proBtn variant="text" (click)="flow.done()">Not now</button>
        </fc-pro-page>
      }
    }
  `,
})
export class ProMfaEnrollmentComponent {
  protected flow = new Enrollment("For your security, confirm it's you before changing two-factor settings.");
  protected recaptcha = viewChild(RecaptchaComponent);
  protected factorName = factorName;
  protected method = signal<"sms" | "totp">("sms");
  protected code = signal("");
  protected copied = signal(false);
  // Removing a factor takes a second click, so a stray tap doesn't drop it.
  protected confirming = signal<string | null>(null);
  protected totp = computed(() => {
    const step = this.flow.step();
    return step.kind === "totp" ? step : null;
  });

  continue() {
    // Each setup starts fresh: a new secret has not been copied yet.
    this.code.set("");
    this.copied.set(false);
    if (this.method() === "sms") this.flow.go({ kind: "sms" });
    else void this.flow.startTotp();
  }

  confirm(submit: (code: string) => Promise<void>) {
    void this.flow.task.run(() => submit(this.code()));
  }

  remove(factor: MultiFactorInfo) {
    if (this.confirming() !== factor.uid) return this.confirming.set(factor.uid);
    this.confirming.set(null);
    void this.flow.remove(factor);
  }

  copy() {
    const key = this.totp()?.secret.secretKey;
    if (!key) return;
    navigator.clipboard.writeText(key).then(
      () => this.copied.set(true),
      // Clipboard access can be denied; the key is still selectable.
      () => this.copied.set(false)
    );
  }
}
