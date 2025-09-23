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

import { Component, OnInit, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserCredential } from "@angular/fire/auth";
import { injectForm, TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { FirebaseUIError, signInWithEmailAndPassword } from "@firebase-ui/core";

import { injectSignInAuthFormSchema, injectTranslation, injectUI } from "../../../provider";
import { PoliciesComponent } from "../../../components/policies/policies.component";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
} from "../../../components/form/form.component";

@Component({
  selector: "fui-sign-in-auth-form",
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
          name="email"
          tanstack-app-field
          [tanstackField]="form"
          label="{{ emailLabel() }}"
        ></fui-form-input>
      </fieldset>
      <fieldset>
        <fui-form-input name="password" tanstack-app-field [tanstackField]="form" label="{{ passwordLabel() }}">
          @if (forgotPassword) {
            <button fui-form-action (click)="forgotPassword.emit()">
              {{ forgotPasswordLabel() }}
            </button>
          }
        </fui-form-input>
      </fieldset>

      <fui-policies />

      <fieldset>
        <fui-form-submit>
          {{ signInLabel() }}
        </fui-form-submit>
        <fui-form-error-message></fui-form-error-message>
      </fieldset>

      @if (register) {
        <button fui-form-action (click)="register.emit()">{{ noAccountLabel() }} {{ registerLabel() }}</button>
      }
    </form>
  `,
})
export class SignInAuthFormComponent implements OnInit {
  private ui = injectUI();
  private formSchema = injectSignInAuthFormSchema();

  emailLabel = injectTranslation("labels", "emailAddress");
  passwordLabel = injectTranslation("labels", "password");
  forgotPasswordLabel = injectTranslation("labels", "forgotPassword");
  signInLabel = injectTranslation("labels", "signIn");
  noAccountLabel = injectTranslation("prompts", "noAccount");
  registerLabel = injectTranslation("labels", "register");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  forgotPassword = output<void>();
  register = output<void>();
  signIn = output<UserCredential>();

  form = injectForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }

  ngOnInit() {
    this.form.update({
      validators: {
        onBlur: this.formSchema(),
        onSubmit: this.formSchema(),
        onSubmitAsync: async ({ value }) => {
          try {
            const credential = await signInWithEmailAndPassword(this.ui(), value.email, value.password);
            this.signIn?.emit(credential);
          } catch (error) {
            if (error instanceof FirebaseUIError) {
              return error.message;
            }

            return this.unknownErrorLabel();
          }
        },
      },
    });
  }
}
