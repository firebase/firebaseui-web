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

import { Component, OnInit, output, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserCredential } from "@angular/fire/auth";
import { injectForm, TanStackField, TanStackAppField, injectStore } from "@tanstack/angular-form";
import { FirebaseUIError, signInWithEmailAndPassword } from "@firebase-ui/core";

import { injectSignInAuthFormSchema, injectTranslation, injectUI } from "../../../provider";
import { PoliciesComponent } from "../../../components/policies/policies.component";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
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
    FormActionComponent,
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
        <fui-form-submit [state]="state()">
          {{ signInLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>

      @if (signUp) {
        <button fui-form-action (click)="foo()">{{ noAccountLabel() }} {{ registerLabel() }}</button>
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
  signUp = output<void>();
  signIn = output<UserCredential>();

  form = injectForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  foo() {
    console.log("foo");
  }

  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }

  ngOnInit() {
    this.form.update({
      validators: {
        onChange: this.formSchema(),
        onBlur: this.formSchema(),
        onSubmit: this.formSchema(),
        onSubmitAsync: async ({ value }) => {
          console.log("onSubmitAsync", value);
          try {
            const credential = await signInWithEmailAndPassword(this.ui(), value.email, value.password);
            this.signIn?.emit(credential);
          } catch (error) {
            console.log("error", error);
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
