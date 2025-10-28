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

import { Component, signal, effect, output, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField, injectForm, injectStore } from "@tanstack/angular-form";
import { TotpMultiFactorGenerator, type TotpSecret } from "firebase/auth";
import { z } from "zod";
import {
  enrollWithMultiFactorAssertion,
  generateTotpSecret,
  generateTotpQrCode,
  FirebaseUIError,
} from "@firebase-ui/core";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
} from "../../../components/form/form.component";
import { PoliciesComponent } from "../../../components/policies/policies.component";
import {
  injectUI,
  injectTranslation,
} from "../../../provider";

@Component({
  selector: "fui-totp-multi-factor-enrollment-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
    PoliciesComponent,
  ],
  template: `
    <div class="fui-form-container">
      @if (!enrollment()) {
        <!-- Display Name Entry Step -->
        <form (submit)="handleDisplayNameSubmit($event)" class="fui-form">
          <fieldset>
            <fui-form-input
              name="displayName"
              tanstack-app-field
              [tanstackField]="displayNameForm"
              label="{{ displayNameLabel() }}"
            ></fui-form-input>
          </fieldset>
          <fui-policies />
          <fieldset>
            <fui-form-submit [state]="displayNameState()">
              {{ generateQrCodeLabel() }}
            </fui-form-submit>
            <fui-form-error-message [state]="displayNameState()" />
          </fieldset>
        </form>
      } @else {
        <!-- QR Code and Verification Step -->
        <div class="fui-qr-code-container">
          <img [src]="qrCodeDataUrl()" alt="TOTP QR Code" />
          <p>TODO: Scan this QR code with your authenticator app</p>
        </div>
        <form (submit)="handleVerificationSubmit($event)" class="fui-form">
          <fieldset>
            <fui-form-input
              name="verificationCode"
              tanstack-app-field
              [tanstackField]="verificationForm"
              label="{{ verificationCodeLabel() }}"
            ></fui-form-input>
          </fieldset>
          <fui-policies />
          <fieldset>
            <fui-form-submit [state]="verificationState()">
              {{ verifyCodeLabel() }}
            </fui-form-submit>
            <fui-form-error-message [state]="verificationState()" />
          </fieldset>
        </form>
      }
    </div>
  `,
})
export class TotpMultiFactorEnrollmentFormComponent {
  private ui = injectUI();

  enrollment = signal<{ secret: TotpSecret; displayName: string } | null>(null);

  displayNameLabel = injectTranslation("labels", "displayName");
  generateQrCodeLabel = injectTranslation("labels", "generateQrCode");
  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  onEnrollment = output<void>();

  displayNameForm = injectForm({
    defaultValues: {
      displayName: "",
    },
  });

  verificationForm = injectForm({
    defaultValues: {
      verificationCode: "",
    },
  });

  displayNameState = injectStore(this.displayNameForm, (state) => state);
  verificationState = injectStore(this.verificationForm, (state) => state);

  qrCodeDataUrl = computed(() => {
    const enrollmentData = this.enrollment();
    if (!enrollmentData) return "";
    return generateTotpQrCode(this.ui(), enrollmentData.secret, enrollmentData.displayName);
  });

  constructor() {
    effect(() => {
      this.displayNameForm.update({
        validators: {
          onBlur: z.object({
            displayName: z.string().min(1, "Display name is required"),
          }),
          onSubmit: z.object({
            displayName: z.string().min(1, "Display name is required"),
          }),
          onSubmitAsync: async ({ value }) => {
            try {
              if (!this.ui().auth.currentUser) {
                throw new Error("User must be authenticated to enroll with multi-factor authentication");
              }

              const secret = await generateTotpSecret(this.ui());
              this.enrollment.set({ secret, displayName: value.displayName });
              return;
            } catch (error) {
              if (error instanceof FirebaseUIError) {
                return error.message;
              }
              return this.unknownErrorLabel();
            }
          },
        },
      });
    });

    effect(() => {
      this.verificationForm.update({
        validators: {
          onBlur: z.object({
            verificationCode: z.string().refine((val) => val.length === 6, {
              message: "Verification code must be 6 digits",
            }),
          }),
          onSubmit: z.object({
            verificationCode: z.string().refine((val) => val.length === 6, {
              message: "Verification code must be 6 digits",
            }),
          }),
          onSubmitAsync: async ({ value }) => {
            try {
              const enrollmentData = this.enrollment();
              if (!enrollmentData) {
                throw new Error("No enrollment data available");
              }

              const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
                enrollmentData.secret,
                value.verificationCode
              );
              await enrollWithMultiFactorAssertion(this.ui(), assertion, enrollmentData.displayName);
              this.onEnrollment.emit();
              return;
            } catch (error) {
              if (error instanceof FirebaseUIError) {
                return error.message;
              }
              return this.unknownErrorLabel();
            }
          },
        },
      });
    });
  }

  async handleDisplayNameSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.displayNameForm.handleSubmit();
  }

  async handleVerificationSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.verificationForm.handleSubmit();
  }
}
