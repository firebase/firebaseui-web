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

import { Component, ElementRef, effect, input, signal, output, computed, viewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import {
  injectPhoneAuthFormSchema,
  injectPhoneAuthVerifyFormSchema,
  injectRecaptchaVerifier,
  injectTranslation,
  injectUI,
} from "../../provider";
import { RecaptchaVerifier, UserCredential } from "@angular/fire/auth";
import { PoliciesComponent } from "../../components/policies";
import { CountrySelectorComponent } from "../../components/country-selector";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../components/form";
import {
  countryData,
  FirebaseUIError,
  formatPhoneNumber,
  confirmPhoneNumber,
  verifyPhoneNumber,
  CountryCode,
} from "@firebase-ui/core";

@Component({
  selector: "fui-phone-number-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    PoliciesComponent,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
    CountrySelectorComponent,
  ],
  template: `
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <fui-country-selector [(value)]="country"></fui-country-selector>
        <fui-form-input
          name="phoneNumber"
          tanstack-app-field
          [tanstackField]="form"
          label="{{ phoneNumberLabel() }}"
        ></fui-form-input>
      </fieldset>
      <fieldset>
        <div class="fui-recaptcha-container" #recaptchaContainer></div>
      </fieldset>
      <fui-policies />
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ sendCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>
    </form>
  `,
})
export class PhoneNumberFormComponent {
  private ui = injectUI();
  private formSchema = injectPhoneAuthFormSchema();

  onSubmit = output<{ verificationId: string; phoneNumber: string }>();
  country = signal<CountryCode>(countryData[0].code);

  phoneNumberLabel = injectTranslation("labels", "phoneNumber");
  sendCodeLabel = injectTranslation("labels", "sendCode");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  recaptchaContainer = viewChild.required<ElementRef<HTMLDivElement>>("recaptchaContainer");
  recaptchaVerifier = injectRecaptchaVerifier(() => this.recaptchaContainer());

  form = injectForm({
    defaultValues: {
      phoneNumber: "",
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
            const selectedCountry = countryData.find((c) => c.code === this.country());
            const formattedNumber = formatPhoneNumber(value.phoneNumber, selectedCountry!);

            try {
              const verifier = this.recaptchaVerifier();
              if (!verifier) {
                return this.unknownErrorLabel();
              }
              const verificationId = await verifyPhoneNumber(this.ui(), formattedNumber, verifier);
              this.onSubmit.emit({ verificationId, phoneNumber: formattedNumber });
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
  selector: "fui-verification-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    PoliciesComponent,
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
export class VerificationFormComponent {
  private ui = injectUI();
  private formSchema = injectPhoneAuthVerifyFormSchema();

  verificationId = input.required<string>();
  signIn = output<UserCredential>();

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
              const credential = await confirmPhoneNumber(this.ui(), this.verificationId(), value.verificationCode);
              this.signIn.emit(credential);
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
  selector: "fui-phone-auth-form",
  standalone: true,
  imports: [CommonModule, PhoneNumberFormComponent, VerificationFormComponent],
  template: `
    <div class="fui-form-container">
      @if (verificationId()) {
        <fui-verification-form [verificationId]="verificationId()!" (signIn)="signIn.emit($event)" />
      } @else {
        <fui-phone-number-form (onSubmit)="handlePhoneSubmit($event)" />
      }
    </div>
  `,
})
export class PhoneAuthFormComponent {
  verificationId = signal<string | null>(null);
  signIn = output<UserCredential>();

  handlePhoneSubmit(data: { verificationId: string; phoneNumber: string }) {
    this.verificationId.set(data.verificationId);
  }
}
