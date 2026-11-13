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
import { confirmPhoneNumber, formatPhoneNumber, verifyPhoneNumber } from "@firebase-oss/ui-core";
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
import { paths } from "../state";

@Component({
  selector: "fc-phone",
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
    @if (verificationId()) {
      <fc-page title="Enter your code" [prompt]="'We sent a code to ' + phoneNumber() + '.'">
        <fc-code-form [task]="task" [submitCode]="verify">
          <button fcLink (click)="send()" [disabled]="task.pending() || !recaptcha().verifier()">Resend code</button>
          <button fcLink (click)="verificationId.set(null)">Use a different number</button>
        </fc-code-form>
      </fc-page>
    } @else {
      <fc-page title="Login by phone number" prompt="Enter your phone number to continue.">
        <form class="fc-form" (submit)="$event.preventDefault(); send()">
          <div fcPhoneFields [(country)]="country" [(phone)]="phone"></div>
          <p class="fc-body">
            By signing in with phone number, an SMS may be sent. Message &amp; data rates may apply.
          </p>
          @if (task.error(); as error) {
            <p class="fc-error" role="alert">{{ error }}</p>
          }
          <div class="fc-links">
            <button fcLink (click)="router.navigateByUrl(paths.email)">Use a different sign in method</button>
          </div>
          <div class="fc-actions">
            <button fcButton type="submit" [disabled]="!phone() || !recaptcha().verifier()" [loading]="task.pending()">
              Send code
            </button>
          </div>
        </form>
      </fc-page>
    }
    <!-- Outside both steps, so it survives the switch to the code step. -->
    <fc-recaptcha />
  `,
})
export class PhoneStepComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected paths = paths;
  protected country = signal(injectDefaultCountry()());
  protected phone = signal("");
  protected verificationId = signal<string | null>(null);
  protected recaptcha = viewChild.required(RecaptchaComponent);
  protected task = injectAuthTask();
  protected phoneNumber = computed(() => formatPhoneNumber(this.phone(), this.country()));

  send() {
    // The verifier is briefly null while a fresh one renders after each send.
    const verifier = this.recaptcha().verifier();
    if (!verifier) return;
    void this.task.run(async () => {
      try {
        this.verificationId.set(await verifyPhoneNumber(this.ui(), this.phoneNumber(), verifier));
      } finally {
        this.recaptcha().reset();
      }
    });
  }

  protected verify = (code: string) => confirmPhoneNumber(this.ui(), this.verificationId()!, code);
}
