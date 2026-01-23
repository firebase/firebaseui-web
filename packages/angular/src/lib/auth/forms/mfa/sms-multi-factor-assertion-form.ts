/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ElementRef, effect, input, signal, Output, EventEmitter, computed, viewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import {
  injectMultiFactorPhoneAuthVerifyFormSchema,
  injectRecaptchaVerifier,
  injectTranslation,
  injectUI,
} from "../../../provider";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../../components/form";
import {
  FirebaseUIError,
  verifyPhoneNumber,
  signInWithMultiFactorAssertion,
  getTranslation,
} from "@firebase-oss/ui-core";
import { PhoneAuthProvider, PhoneMultiFactorGenerator, type MultiFactorInfo, type UserCredential } from "firebase/auth";

type PhoneMultiFactorInfo = MultiFactorInfo & {
  phoneNumber?: string;
};

@Component({
  selector: "fui-sms-multi-factor-assertion-phone-form",
  standalone: true,
  imports: [CommonModule, FormSubmitComponent, FormErrorMessageComponent],
  host: {
    style: "display: block;",
  },
  template: `
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <label>
          <div data-input-description>
            {{ mfaSmsAssertionPrompt() }}
          </div>
        </label>
      </fieldset>
      <fieldset>
        <div class="fui-recaptcha-container" #recaptchaContainer></div>
      </fieldset>
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ sendCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>
    </form>
  `,
})
/**
 * A form component for requesting SMS verification code during MFA assertion.
 */
export class SmsMultiFactorAssertionPhoneFormComponent {
  private ui = injectUI();

  /** The multi-factor info hint containing phone number details. */
  hint = input.required<MultiFactorInfo>();
  /** Event emitter fired when verification ID is received. */
  @Output() onSubmit = new EventEmitter<string>();

  sendCodeLabel = injectTranslation("labels", "sendCode");

  recaptchaContainer = viewChild.required<ElementRef<HTMLDivElement>>("recaptchaContainer");

  phoneNumber = computed(() => {
    const hint = this.hint() as PhoneMultiFactorInfo;
    return hint.phoneNumber || "";
  });

  mfaSmsAssertionPrompt = computed(() => {
    return getTranslation(this.ui(), "messages", "mfaSmsAssertionPrompt", { phoneNumber: this.phoneNumber() });
  });

  recaptchaVerifier = injectRecaptchaVerifier(() => this.recaptchaContainer());

  form = injectForm({
    defaultValues: {},
  });

  state = injectStore(this.form, (state) => state);

  constructor() {
    effect(() => {
      this.form.update({
        validators: {
          onSubmitAsync: async () => {
            try {
              const verifier = this.recaptchaVerifier();
              if (!verifier) {
                return "Recaptcha verifier not available";
              }

              const verificationId = await verifyPhoneNumber(this.ui(), "", verifier, undefined, this.hint());
              this.onSubmit.emit(verificationId);
              return;
            } catch (error) {
              return error instanceof FirebaseUIError ? error.message : String(error);
            }
          },
        },
      });
    });

    effect((onCleanup) => {
      const verifier = this.recaptchaVerifier();
      onCleanup(() => {
        if (verifier) {
          verifier.clear();
        }
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
  selector: "fui-sms-multi-factor-assertion-verify-form",
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
          name="verificationCode"
          tanstack-app-field
          [tanstackField]="form"
          [label]="verificationCodeLabel()"
          [description]="smsVerificationPrompt()"
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
 * A form component for verifying SMS code during MFA assertion.
 */
export class SmsMultiFactorAssertionVerifyFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorPhoneAuthVerifyFormSchema();

  /** The verification ID received from the phone form. */
  verificationId = input.required<string>();
  /** Event emitter for successful MFA assertion. */
  @Output() onSuccess = new EventEmitter<UserCredential>();

  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
  smsVerificationPrompt = injectTranslation("prompts", "smsVerificationPrompt");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  form = injectForm({
    defaultValues: {
      verificationId: "",
      verificationCode: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  constructor() {
    effect(() => {
      this.form.setFieldValue("verificationId", this.verificationId());
    });

    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.formSchema(),
          onChange: this.formSchema(),
          onSubmit: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const credential = PhoneAuthProvider.credential(value.verificationId, value.verificationCode);
              const assertion = PhoneMultiFactorGenerator.assertion(credential);
              const result = await signInWithMultiFactorAssertion(this.ui(), assertion);
              this.onSuccess.emit(result);
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
  selector: "fui-sms-multi-factor-assertion-form",
  standalone: true,
  imports: [CommonModule, SmsMultiFactorAssertionPhoneFormComponent, SmsMultiFactorAssertionVerifyFormComponent],
  host: {
    style: "display: block;",
  },
  template: `
    <div class="fui-content">
      @if (verification()) {
        <fui-sms-multi-factor-assertion-verify-form
          [verificationId]="verification()!.verificationId"
          (onSuccess)="onSuccess.emit($event)"
        />
      } @else {
        <fui-sms-multi-factor-assertion-phone-form [hint]="hint()" (onSubmit)="handlePhoneSubmit($event)" />
      }
    </div>
  `,
})
/**
 * A form component for SMS multi-factor authentication assertion.
 *
 * Manages the flow between requesting and verifying SMS codes for MFA.
 */
export class SmsMultiFactorAssertionFormComponent {
  /** The multi-factor info hint containing phone number details. */
  hint = input.required<MultiFactorInfo>();
  /** Event emitter for successful MFA assertion. */
  @Output() onSuccess = new EventEmitter<UserCredential>();

  verification = signal<{ verificationId: string } | null>(null);

  handlePhoneSubmit(verificationId: string) {
    this.verification.set({ verificationId });
  }
}
