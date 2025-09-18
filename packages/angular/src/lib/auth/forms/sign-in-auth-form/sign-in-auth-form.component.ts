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

import { Component, EventEmitter, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { injectSignInAuthFormSchema, injectTranslation, injectUI } from "../../../provider";
import { TermsAndPrivacyComponent } from "../../../components/terms-and-privacy/terms-and-privacy.component";
import { FirebaseUIError, signInWithEmailAndPassword } from "@firebase-ui/core";

import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
} from "../../../components/form/form.component";
import { UserCredential } from "firebase/auth";

@Component({
  selector: "fui-sign-in-auth-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    TermsAndPrivacyComponent,
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
          label="Email Label TODO"
        ></fui-form-input>
      </fieldset>
      <fieldset>
        <fui-form-input name="password" tanstack-app-field [tanstackField]="form" label="Password Label TODO">
          @if (forgotPassword) {
            <button fui-form-action (click)="forgotPassword.emit()">
              {{ forgotPasswordLabel() }}
            </button>
          }
        </fui-form-input>
      </fieldset>

      <fui-terms-and-privacy></fui-terms-and-privacy>

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

  @Output() forgotPassword = new EventEmitter<void>();
  @Output() register = new EventEmitter<void>();
  @Output() signIn?: EventEmitter<UserCredential>;

  formError: string | null = null;

  form = injectForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.form.handleSubmit()
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
