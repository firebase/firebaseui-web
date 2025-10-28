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

import { Component, signal, effect, viewChild, computed, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField, injectForm, injectStore } from "@tanstack/angular-form";
import { ElementRef } from "@angular/core";
import { RecaptchaVerifier } from "firebase/auth";
import { PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";
import {
  verifyPhoneNumber,
  enrollWithMultiFactorAssertion,
  formatPhoneNumber,
  FirebaseUIError,
} from "@firebase-ui/core";
import { multiFactor } from "firebase/auth";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../../components/form";
import { CountrySelectorComponent } from "../../../components/country-selector";
import { PoliciesComponent } from "../../../components/policies";
import {
  injectUI,
  injectTranslation,
  injectMultiFactorPhoneAuthNumberFormSchema,
  injectMultiFactorPhoneAuthVerifyFormSchema,
  injectDefaultCountry,
} from "../../../provider";

@Component({
  selector: "fui-sms-multi-factor-enrollment-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
    CountrySelectorComponent,
    PoliciesComponent,
  ],
  template: `
    <div class="fui-form-container">
      @if (!verificationId()) {
        <form (submit)="handlePhoneSubmit($event)" class="fui-form">
          <fieldset>
            <fui-form-input
              name="displayName"
              tanstack-app-field
              [tanstackField]="phoneForm"
              label="{{ displayNameLabel() }}"
            ></fui-form-input>
          </fieldset>
          <fieldset>
            <fui-country-selector [(value)]="country"></fui-country-selector>
            <fui-form-input
              name="phoneNumber"
              tanstack-app-field
              [tanstackField]="phoneForm"
              label="{{ phoneNumberLabel() }}"
            ></fui-form-input>
          </fieldset>
          <fieldset>
            <div class="fui-recaptcha-container" #recaptchaContainer></div>
          </fieldset>
          <fui-policies />
          <fieldset>
            <fui-form-submit [state]="phoneState()">
              {{ sendCodeLabel() }}
            </fui-form-submit>
            <fui-form-error-message [state]="phoneState()" />
          </fieldset>
        </form>
      } @else {
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
export class SmsMultiFactorEnrollmentFormComponent {
  private ui = injectUI();
  private phoneFormSchema = injectMultiFactorPhoneAuthNumberFormSchema();
  private verificationFormSchema = injectMultiFactorPhoneAuthVerifyFormSchema();
  private defaultCountry = injectDefaultCountry();

  verificationId = signal<string | null>(null);
  country = signal(this.defaultCountry().code);
  displayName = signal<string>("");

  displayNameLabel = injectTranslation("labels", "displayName");
  phoneNumberLabel = injectTranslation("labels", "phoneNumber");
  sendCodeLabel = injectTranslation("labels", "sendCode");
  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  onEnrollment = output<void>();

  recaptchaContainer = viewChild.required<ElementRef<HTMLDivElement>>("recaptchaContainer");

  recaptchaVerifier = computed(() => {
    return new RecaptchaVerifier(this.ui().auth, this.recaptchaContainer().nativeElement, {
      size: "normal",
    });
  });

  phoneForm = injectForm({
    defaultValues: {
      displayName: "",
      phoneNumber: "",
    },
  });

  verificationForm = injectForm({
    defaultValues: {
      verificationCode: "",
    },
  });

  phoneState = injectStore(this.phoneForm, (state) => state);
  verificationState = injectStore(this.verificationForm, (state) => state);

  constructor() {
    effect(() => {
      this.phoneForm.update({
        validators: {
          onBlur: this.phoneFormSchema(),
          onSubmit: this.phoneFormSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const currentUser = this.ui().auth.currentUser;
              if (!currentUser) {
                throw new Error("User must be authenticated to enroll with multi-factor authentication");
              }

              const mfaUser = multiFactor(currentUser);
              const formattedPhoneNumber = formatPhoneNumber(value.phoneNumber, this.defaultCountry());
              const verificationId = await verifyPhoneNumber(
                this.ui(),
                formattedPhoneNumber,
                this.recaptchaVerifier(),
                mfaUser
              );

              this.displayName.set(value.displayName);
              this.verificationId.set(verificationId);
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
          onBlur: this.verificationFormSchema(),
          onSubmit: this.verificationFormSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const credential = PhoneAuthProvider.credential(this.verificationId()!, value.verificationCode);
              const assertion = PhoneMultiFactorGenerator.assertion(credential);
              await enrollWithMultiFactorAssertion(this.ui(), assertion, this.displayName());
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

  async handlePhoneSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.phoneForm.handleSubmit();
  }

  async handleVerificationSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.verificationForm.handleSubmit();
  }
}
