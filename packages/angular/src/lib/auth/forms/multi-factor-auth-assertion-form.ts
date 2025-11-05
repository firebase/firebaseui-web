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

import { Component, computed, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectUI, injectTranslation } from "../../provider";
import {
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  type UserCredential,
  type MultiFactorInfo,
} from "firebase/auth";
import { SmsMultiFactorAssertionFormComponent } from "./mfa/sms-multi-factor-assertion-form";
import { TotpMultiFactorAssertionFormComponent } from "./mfa/totp-multi-factor-assertion-form";
import { ButtonComponent } from "../../components/button";

@Component({
  selector: "fui-multi-factor-auth-assertion-form",
  standalone: true,
  imports: [CommonModule, SmsMultiFactorAssertionFormComponent, TotpMultiFactorAssertionFormComponent, ButtonComponent],
  template: `
    <div class="fui-content">
      @if (selectedHint()) {
        @if (selectedHint()!.factorId === phoneFactorId()) {
          <fui-sms-multi-factor-assertion-form [hint]="selectedHint()!" (onSuccess)="onSuccess.emit($event)" />
        } @else if (selectedHint()!.factorId === totpFactorId()) {
          <fui-totp-multi-factor-assertion-form [hint]="selectedHint()!" (onSuccess)="onSuccess.emit($event)" />
        }
      } @else {
        <p>{{ mfaAssertionFactorPrompt() }}</p>
        @for (hint of resolver().hints; track hint.factorId) {
          @if (hint.factorId === totpFactorId()) {
            <button fui-button (click)="selectHint(hint)">
              {{ totpVerificationLabel() }}
            </button>
          } @else if (hint.factorId === phoneFactorId()) {
            <button fui-button (click)="selectHint(hint)">
              {{ smsVerificationLabel() }}
            </button>
          }
        }
      }
    </div>
  `,
})
export class MultiFactorAuthAssertionFormComponent {
  private ui = injectUI();

  onSuccess = output<UserCredential>();

  resolver = computed(() => {
    const resolver = this.ui().multiFactorResolver;
    if (!resolver) {
      throw new Error("MultiFactorAuthAssertionForm requires a multi-factor resolver");
    }
    return resolver;
  });

  selectedHint = signal<MultiFactorInfo | undefined>(
    this.resolver().hints.length === 1 ? this.resolver().hints[0] : undefined
  );

  phoneFactorId = computed(() => PhoneMultiFactorGenerator.FACTOR_ID);
  totpFactorId = computed(() => TotpMultiFactorGenerator.FACTOR_ID);

  smsVerificationLabel = injectTranslation("labels", "mfaSmsVerification");
  totpVerificationLabel = injectTranslation("labels", "mfaTotpVerification");
  mfaAssertionFactorPrompt = injectTranslation("prompts", "mfaAssertionFactorPrompt");

  selectHint(hint: MultiFactorInfo) {
    this.selectedHint.set(hint);
  }
}
