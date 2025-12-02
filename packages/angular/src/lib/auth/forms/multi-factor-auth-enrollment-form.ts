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

import { Component, signal, input, Output, EventEmitter, OnInit, computed } from "@angular/core";
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
  host: {
    style: "display: block;",
  },
  imports: [
    CommonModule,
    SmsMultiFactorEnrollmentFormComponent,
    TotpMultiFactorEnrollmentFormComponent,
    ButtonComponent,
  ],
  template: `
    <div class="fui-content">
      @if (validatedHint()) {
        @if (validatedHint() === phoneFactorId) {
          <fui-sms-multi-factor-enrollment-form (onEnrollment)="onEnrollment.emit()" />
        } @else if (validatedHint() === totpFactorId) {
          <fui-totp-multi-factor-enrollment-form (onEnrollment)="onEnrollment.emit()" />
        }
      } @else {
        @for (hint of hints(); track hint) {
          @if (hint === totpFactorId) {
            <button fui-button [variant]="'secondary'" (click)="selectHint(hint)">
              {{ totpVerificationLabel() }}
            </button>
          } @else if (hint === phoneFactorId) {
            <button fui-button [variant]="'secondary'" (click)="selectHint(hint)">
              {{ smsVerificationLabel() }}
            </button>
          }
        }
      }
    </div>
  `,
})
/**
 * A form component for multi-factor authentication enrollment.
 *
 * Allows users to enroll in MFA using SMS or TOTP methods.
 */
export class MultiFactorAuthEnrollmentFormComponent implements OnInit {
  /** The available MFA factor types for enrollment. */
  hints = input<Hint[]>([FactorId.TOTP, FactorId.PHONE]);
  /** Event emitter fired when MFA enrollment is completed. */
  @Output() onEnrollment = new EventEmitter<void>();

  selectedHint = signal<Hint | undefined>(undefined);

  phoneFactorId = FactorId.PHONE;
  totpFactorId = FactorId.TOTP;

  smsVerificationLabel = injectTranslation("labels", "mfaSmsVerification");
  totpVerificationLabel = injectTranslation("labels", "mfaTotpVerification");

  validatedHint = computed(() => {
    const hint = this.selectedHint();
    if (hint && hint !== this.phoneFactorId && hint !== this.totpFactorId) {
      throw new Error(`Unknown multi-factor enrollment type: ${hint}`);
    }
    return hint;
  });

  ngOnInit() {
    const hints = this.hints();
    if (hints.length === 0) {
      throw new Error("MultiFactorAuthEnrollmentForm must have at least one hint");
    }
    // Auto-select single hint after component initialization
    if (hints.length === 1) {
      this.selectedHint.set(hints[0]);
    }
  }

  selectHint(hint: Hint) {
    this.selectedHint.set(hint);
  }
}
