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

import { contents, injectAuthTask, RecaptchaComponent } from "../components";
import { paths } from "../state";
import {
  ProButtonComponent,
  ProCodeFieldComponent,
  ProErrorComponent,
  ProPageComponent,
  ProPhoneFieldComponent,
} from "./kit";

@Component({
  selector: "fc-pro-phone",
  imports: [
    ProPageComponent,
    ProButtonComponent,
    ProCodeFieldComponent,
    ProErrorComponent,
    ProPhoneFieldComponent,
    RecaptchaComponent,
  ],
  host: contents,
  template: `
    @if (verificationId()) {
      <fc-pro-page
        [back]="true"
        (backClick)="verificationId.set(null)"
        icon="tag"
        title="Enter the code"
        [subtitle]="'We sent a 6-digit code to ' + phoneNumber() + '.'"
      >
        <form class="pro-stack" (submit)="$event.preventDefault(); verify()">
          <fc-pro-code-field [(value)]="code" />
          <fc-pro-error [message]="task.error()" />
          <button proBtn type="submit" [disabled]="code().length !== 6" [loading]="task.pending()">Verify</button>
        </form>
        <button proBtn variant="text" (click)="send()" [disabled]="task.pending() || !recaptcha().verifier()">
          Resend code
        </button>
        <button proBtn variant="text" (click)="verificationId.set(null); code.set('')">Use a different number</button>
      </fc-pro-page>
    } @else {
      <fc-pro-page
        [back]="true"
        (backClick)="router.navigateByUrl(paths.email)"
        icon="phone"
        title="Sign in with your phone"
        subtitle="We'll text you a 6-digit code to confirm it's you. Message and data rates may apply."
      >
        <form class="pro-stack" (submit)="$event.preventDefault(); send()">
          <fc-pro-phone-field [(country)]="country" [(phone)]="phone" />
          <fc-pro-error [message]="task.error()" />
          <button proBtn type="submit" [disabled]="!phone() || !recaptcha().verifier()" [loading]="task.pending()">
            Send code
          </button>
        </form>
      </fc-pro-page>
    }
    <fc-recaptcha />
  `,
})
export class ProPhoneComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected paths = paths;
  protected country = signal(injectDefaultCountry()());
  protected phone = signal("");
  protected code = signal("");
  protected verificationId = signal<string | null>(null);
  protected recaptcha = viewChild.required(RecaptchaComponent);
  protected task = injectAuthTask();
  protected phoneNumber = computed(() => formatPhoneNumber(this.phone(), this.country()));

  send() {
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

  verify() {
    void this.task.run(() => confirmPhoneNumber(this.ui(), this.verificationId()!, this.code()));
  }
}
