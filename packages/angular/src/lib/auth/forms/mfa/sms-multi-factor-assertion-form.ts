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

import { Component, ElementRef, effect, input, signal, output, computed, viewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import {
  injectMultiFactorPhoneAuthAssertionFormSchema,
  injectMultiFactorPhoneAuthVerifyFormSchema,
  injectRecaptchaVerifier,
  injectTranslation,
  injectUI,
} from "../../../provider";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../../components/form";
import { FirebaseUIError, verifyPhoneNumber, signInWithMultiFactorAssertion } from "@invertase/firebaseui-core";
import { PhoneAuthProvider, PhoneMultiFactorGenerator, type MultiFactorInfo, type UserCredential } from "firebase/auth";

type PhoneMultiFactorInfo = MultiFactorInfo & {
  phoneNumber?: string;
};

@Component({
  selector: "fui-sms-multi-factor-assertion-phone-form",
  standalone: true,
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
          name="phoneNumber"
          tanstack-app-field
          [tanstackField]="form"
          label="{{ phoneNumberLabel() }}"
          type="tel"
        ></fui-form-input>
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
export class SmsMultiFactorAssertionPhoneFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorPhoneAuthAssertionFormSchema();

  hint = input.required<MultiFactorInfo>();
  onSubmit = output<string>();

  phoneNumberLabel = injectTranslation("labels", "phoneNumber");
  sendCodeLabel = injectTranslation("labels", "sendCode");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  recaptchaContainer = viewChild.required<ElementRef<HTMLDivElement>>("recaptchaContainer");

  phoneNumber = computed(() => {
    const hint = this.hint() as PhoneMultiFactorInfo;
    return hint.phoneNumber || "";
  });

  recaptchaVerifier = injectRecaptchaVerifier(() => this.recaptchaContainer());

  form = injectForm({
    defaultValues: {
      phoneNumber: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  constructor() {
    effect(() => {
      // Set the phone number value from the hint
      this.form.setFieldValue("phoneNumber", this.phoneNumber());
    });

    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.formSchema(),
          onSubmit: this.formSchema(),
          onSubmitAsync: async () => {
            try {
              const verifier = this.recaptchaVerifier();
              if (!verifier) {
                return this.unknownErrorLabel();
              }

              const verificationId = await verifyPhoneNumber(this.ui(), "", verifier, undefined, this.hint());
              this.onSubmit.emit(verificationId);
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
          label="{{ verificationCodeLabel() }}"
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
export class SmsMultiFactorAssertionVerifyFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorPhoneAuthVerifyFormSchema();

  verificationId = input.required<string>();
  onSuccess = output<UserCredential>();

  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
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
          onSubmit: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const credential = PhoneAuthProvider.credential(value.verificationId, value.verificationCode);
              const assertion = PhoneMultiFactorGenerator.assertion(credential);
              const result = await signInWithMultiFactorAssertion(this.ui(), assertion);
              this.onSuccess.emit(result);
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
export class SmsMultiFactorAssertionFormComponent {
  hint = input.required<MultiFactorInfo>();
  onSuccess = output<UserCredential>();

  verification = signal<{ verificationId: string } | null>(null);

  handlePhoneSubmit(verificationId: string) {
    this.verification.set({ verificationId });
  }
}
