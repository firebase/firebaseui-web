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

import { Component, effect, Output, EventEmitter, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import { FirebaseUIError, sendPasswordResetEmail } from "@invertase/firebaseui-core";

import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../components/form";
import { PoliciesComponent } from "../../components/policies";
import { injectForgotPasswordAuthFormSchema, injectTranslation, injectUI } from "../../provider";

@Component({
  selector: "fui-forgot-password-auth-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    PoliciesComponent,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
    FormActionComponent,
  ],
  template: `
    @if (emailSent()) {
      <div class="fui-success">
        {{ checkEmailForResetMessage() }}
      </div>
    }

    @if (!emailSent()) {
      <form (submit)="handleSubmit($event)" class="fui-form">
        <fieldset>
          <fui-form-input name="email" tanstack-app-field [tanstackField]="form" label="{{ emailLabel() }}" />
        </fieldset>

        <fui-policies />

        <fieldset>
          <fui-form-submit [state]="state()">
            {{ resetPasswordLabel() }}
          </fui-form-submit>
          <fui-form-error-message [state]="state()" />
        </fieldset>

        @if (backToSignIn()?.observed) {
          <button fui-form-action (click)="backToSignIn()?.emit()">{{ backToSignInLabel() }} &rarr;</button>
        }
      </form>
    }
  `,
})
export class ForgotPasswordAuthFormComponent {
  private ui = injectUI();
  private formSchema = injectForgotPasswordAuthFormSchema();

  emailSent = signal<boolean>(false);

  emailLabel = injectTranslation("labels", "emailAddress");
  resetPasswordLabel = injectTranslation("labels", "resetPassword");
  backToSignInLabel = injectTranslation("labels", "backToSignIn");
  checkEmailForResetMessage = injectTranslation("messages", "checkEmailForReset");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  backToSignIn = input<EventEmitter<void>>();

  @Output() passwordSent = new EventEmitter<void>();

  form = injectForm({
    defaultValues: {
      email: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }

  constructor() {
    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              await sendPasswordResetEmail(this.ui(), value.email);
              this.emailSent.set(true);
              this.passwordSent.emit();
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
}
