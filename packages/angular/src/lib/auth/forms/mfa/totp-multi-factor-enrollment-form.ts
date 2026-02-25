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

import { Component, signal, effect, Output, EventEmitter, computed, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField, injectForm, injectStore } from "@tanstack/angular-form";
import { TotpMultiFactorGenerator, type TotpSecret } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  generateTotpSecret,
  generateTotpQrCode,
  FirebaseUIError,
} from "@firebase-oss/ui-core";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../../components/form";
import {
  injectUI,
  injectTranslation,
  injectMultiFactorTotpAuthNumberFormSchema,
  injectMultiFactorTotpAuthVerifyFormSchema,
} from "../../../provider";

@Component({
  selector: "fui-totp-multi-factor-secret-generation-form",
  standalone: true,
  host: {
    style: "display: block;",
  },
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
  ],
  template: `
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <fui-form-input
          name="displayName"
          tanstack-app-field
          [tanstackField]="form"
          [label]="displayNameLabel()"
          type="text"
        ></fui-form-input>
      </fieldset>
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ generateQrCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>
    </form>
  `,
})
/**
 * A form component for generating a TOTP secret and display name during MFA enrollment.
 */
export class TotpMultiFactorSecretGenerationFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorTotpAuthNumberFormSchema();

  /** Event emitter fired when TOTP secret is generated. */
  @Output() onSubmit = new EventEmitter<{ secret: TotpSecret; displayName: string }>();

  displayNameLabel = injectTranslation("labels", "displayName");
  generateQrCodeLabel = injectTranslation("labels", "generateQrCode");

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
          onChange: this.formSchema(),
          onSubmit: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const secret = await generateTotpSecret(this.ui());
              this.onSubmit.emit({ secret, displayName: value.displayName });
              return;
            } catch (error) {
              return error instanceof FirebaseUIError ? error.message : String(error);
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
  host: {
    style: "display: block;",
  },
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
  ],
  template: `
    <div class="fui-qr-code-container">
      <img [src]="qrCodeDataUrl()" alt="TOTP QR Code" />
      <code>{{ secret().secretKey.toString() }}</code>
      <p>{{ mfaTotpQrCodePrompt() }}</p>
    </div>
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <fui-form-input
          name="verificationCode"
          tanstack-app-field
          [tanstackField]="form"
          [label]="verificationCodeLabel()"
          [description]="mfaTotpEnrollmentVerificationPrompt()"
          type="text"
        ></fui-form-input>
      </fieldset>
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ verifyCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>
    </form>
  `,
})
/**
 * A form component for verifying TOTP code during MFA enrollment.
 *
 * Displays a QR code and allows users to verify their authenticator app setup.
 */
export class TotpMultiFactorVerificationFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorTotpAuthVerifyFormSchema();

  /** The TOTP secret generated in the previous step. */
  secret = input.required<TotpSecret>();
  /** The display name for the TOTP factor. */
  displayName = input.required<string>();
  /** Event emitter fired when MFA enrollment is completed. */
  @Output() onEnrollment = new EventEmitter<void>();

  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
  mfaTotpQrCodePrompt = injectTranslation("prompts", "mfaTotpQrCodePrompt");
  mfaTotpEnrollmentVerificationPrompt = injectTranslation("prompts", "mfaTotpEnrollmentVerificationPrompt");

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
          onChange: this.formSchema(),
          onSubmit: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const assertion = TotpMultiFactorGenerator.assertionForEnrollment(this.secret(), value.verificationCode);
              await enrollWithMultiFactorAssertion(this.ui(), assertion, this.displayName());
              this.onEnrollment.emit();
              return;
            } catch (error) {
              return error instanceof FirebaseUIError ? error.message : String(error);
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
  host: {
    style: "display: block;",
  },
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
/**
 * A form component for TOTP multi-factor authentication enrollment.
 *
 * Manages the flow between secret generation and verification for TOTP MFA enrollment.
 */
export class TotpMultiFactorEnrollmentFormComponent {
  private ui = injectUI();

  enrollment = signal<{ secret: TotpSecret; displayName: string } | null>(null);
  /** Event emitter fired when MFA enrollment is completed. */
  @Output() onEnrollment = new EventEmitter<void>();

  constructor() {
    if (!this.ui().auth.currentUser) {
      throw new Error("User must be authenticated to enroll with multi-factor authentication");
    }
  }

  handleSecretGeneration(data: { secret: TotpSecret; displayName: string }) {
    this.enrollment.set(data);
  }
}
