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

import { Component, signal, effect, output, computed, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField, injectForm, injectStore } from "@tanstack/angular-form";
import { TotpMultiFactorGenerator, type TotpSecret } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  generateTotpSecret,
  generateTotpQrCode,
  FirebaseUIError,
} from "@firebase-ui/core";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../../components/form";
import { PoliciesComponent } from "../../../components/policies";
import {
  injectUI,
  injectTranslation,
  injectMultiFactorTotpAuthNumberFormSchema,
  injectMultiFactorTotpAuthVerifyFormSchema,
} from "../../../provider";

@Component({
  selector: "fui-totp-multi-factor-secret-generation-form",
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
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <fui-form-input
          name="displayName"
          tanstack-app-field
          [tanstackField]="form"
          label="{{ displayNameLabel() }}"
        ></fui-form-input>
      </fieldset>
      <fui-policies />
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ generateQrCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>
    </form>
  `,
})
export class TotpMultiFactorSecretGenerationFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorTotpAuthNumberFormSchema();

  onSubmit = output<{ secret: TotpSecret; displayName: string }>();

  displayNameLabel = injectTranslation("labels", "displayName");
  generateQrCodeLabel = injectTranslation("labels", "generateQrCode");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  form = injectForm({
    defaultValues: {
      displayName: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  constructor() {
    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.formSchema(),
          onSubmit: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              if (!this.ui().auth.currentUser) {
                throw new Error("User must be authenticated to enroll with multi-factor authentication");
              }

              const secret = await generateTotpSecret(this.ui());
              this.onSubmit.emit({ secret, displayName: value.displayName });
              return;
            } catch (error) {
              if (error instanceof FirebaseUIError) {
                return error.message;
              }

              console.error(error);
              return this.unknownErrorLabel();
            }
          },
        },
      });
    });
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }
}

@Component({
  selector: "fui-totp-multi-factor-verification-form",
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
    <div class="fui-qr-code-container">
      <img [src]="qrCodeDataUrl()" alt="TOTP QR Code" />
      <p>TODO: Scan this QR code with your authenticator app</p>
    </div>
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <fui-form-input
          name="verificationCode"
          tanstack-app-field
          [tanstackField]="form"
          label="{{ verificationCodeLabel() }}"
        ></fui-form-input>
      </fieldset>
      <fui-policies />
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ verifyCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>
    </form>
  `,
})
export class TotpMultiFactorVerificationFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorTotpAuthVerifyFormSchema();

  secret = input.required<TotpSecret>();
  displayName = input.required<string>();
  onEnrollment = output<void>();

  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  form = injectForm({
    defaultValues: {
      verificationCode: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  qrCodeDataUrl = computed(() => {
    return generateTotpQrCode(this.ui(), this.secret(), this.displayName());
  });

  constructor() {
    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.formSchema(),
          onSubmit: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const assertion = TotpMultiFactorGenerator.assertionForEnrollment(this.secret(), value.verificationCode);
              await enrollWithMultiFactorAssertion(this.ui(), assertion, this.displayName());
              this.onEnrollment.emit();
              return;
            } catch (error) {
              if (error instanceof FirebaseUIError) {
                return error.message;
              }
              if (error instanceof Error) {
                return error.message;
              }
              return this.unknownErrorLabel();
            }
          },
        },
      });
    });
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }
}

@Component({
  selector: "fui-totp-multi-factor-enrollment-form",
  standalone: true,
  imports: [CommonModule, TotpMultiFactorSecretGenerationFormComponent, TotpMultiFactorVerificationFormComponent],
  template: `
    <div class="fui-form-container">
      @if (!enrollment()) {
        <fui-totp-multi-factor-secret-generation-form (onSubmit)="handleSecretGeneration($event)" />
      } @else {
        <fui-totp-multi-factor-verification-form
          [secret]="enrollment()!.secret"
          [displayName]="enrollment()!.displayName"
          (onEnrollment)="onEnrollment.emit()"
        />
      }
    </div>
  `,
})
export class TotpMultiFactorEnrollmentFormComponent {
  enrollment = signal<{ secret: TotpSecret; displayName: string } | null>(null);
  onEnrollment = output<void>();

  handleSecretGeneration(data: { secret: TotpSecret; displayName: string }) {
    this.enrollment.set(data);
  }
}
