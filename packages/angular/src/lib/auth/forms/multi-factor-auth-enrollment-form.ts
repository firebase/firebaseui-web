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

import { Component, signal, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FactorId } from "firebase/auth";
import { injectTranslation } from "../../provider";
import { SmsMultiFactorEnrollmentFormComponent } from "./mfa/sms-multi-factor-enrollment-form";
import { TotpMultiFactorEnrollmentFormComponent } from "./mfa/totp-multi-factor-enrollment-form";
import { ButtonComponent } from "../../components/button";

type Hint = (typeof FactorId)[keyof typeof FactorId];

@Component({
  selector: "fui-multi-factor-auth-enrollment-form",
  standalone: true,
  imports: [
    CommonModule,
    SmsMultiFactorEnrollmentFormComponent,
    TotpMultiFactorEnrollmentFormComponent,
    ButtonComponent,
  ],
  template: `
    <div class="fui-content">
      @if (selectedHint()) {
        @if (selectedHint() === "phone") {
          <fui-sms-multi-factor-enrollment-form (onEnrollment)="onEnrollment.emit()" />
        } @else if (selectedHint() === "totp") {
          <fui-totp-multi-factor-enrollment-form (onEnrollment)="onEnrollment.emit()" />
        }
      } @else {
        @for (hint of hints(); track hint) {
          @if (hint === "phone") {
            <button fui-button (click)="selectHint('phone')">
              {{ smsVerificationLabel() }}
            </button>
          } @else if (hint === "totp") {
            <button fui-button (click)="selectHint('totp')">
              {{ totpVerificationLabel() }}
            </button>
          }
        }
      }
    </div>
  `,
})
export class MultiFactorAuthEnrollmentFormComponent {
  hints = input<Hint[]>([FactorId.TOTP, FactorId.PHONE]);
  onEnrollment = output<void>();

  selectedHint = signal<Hint | undefined>(undefined);

  smsVerificationLabel = injectTranslation("labels", "mfaSmsVerification");
  totpVerificationLabel = injectTranslation("labels", "mfaTotpVerification");

  constructor() {
    // If only a single hint is provided, select it by default to improve UX
    const hints = this.hints();
    if (hints.length === 1) {
      this.selectedHint.set(hints[0]);
    } else if (hints.length === 0) {
      throw new Error("MultiFactorAuthEnrollmentForm must have at least one hint");
    }
  }

  selectHint(hint: Hint) {
    this.selectedHint.set(hint);
  }
}
