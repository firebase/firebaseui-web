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

import { Component, effect, input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import { injectMultiFactorTotpAuthVerifyFormSchema, injectTranslation, injectUI } from "../../../provider";
import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../../components/form";
import { FirebaseUIError, signInWithMultiFactorAssertion } from "@invertase/firebaseui-core";
import { TotpMultiFactorGenerator, type MultiFactorInfo, type UserCredential } from "firebase/auth";

@Component({
  selector: "fui-totp-multi-factor-assertion-form",
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
          [description]="enterVerificationCodePrompt()"
          type="text"
          placeholder="123456"
          maxlength="6"
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
export class TotpMultiFactorAssertionFormComponent {
  private ui = injectUI();
  private formSchema = injectMultiFactorTotpAuthVerifyFormSchema();

  hint = input.required<MultiFactorInfo>();
  @Output() onSuccess = new EventEmitter<UserCredential>();

  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
  enterVerificationCodePrompt = injectTranslation("prompts", "enterVerificationCode");

  form = injectForm({
    defaultValues: {
      verificationCode: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  constructor() {
    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const assertion = TotpMultiFactorGenerator.assertionForSignIn(this.hint().uid, value.verificationCode);
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
