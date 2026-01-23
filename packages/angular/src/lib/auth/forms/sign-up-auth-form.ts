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

import { Component, Output, EventEmitter, input, effect, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import { FirebaseUIError, createUserWithEmailAndPassword, hasBehavior } from "@firebase-oss/ui-core";
import { UserCredential } from "@angular/fire/auth";

import { PoliciesComponent } from "../../components/policies";
import { injectSignUpAuthFormSchema, injectTranslation, injectUI } from "../../provider";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../components/form";

@Component({
  selector: "fui-sign-up-auth-form",
  standalone: true,
  host: {
    style: "display: block;",
  },
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
      @if (requireDisplayNameField()) {
        <fieldset>
          <fui-form-input name="displayName" tanstack-app-field [tanstackField]="form" [label]="displayNameLabel()" />
        </fieldset>
      }
      <fieldset>
        <fui-form-input name="email" tanstack-app-field [tanstackField]="form" [label]="emailLabel()" type="email" />
      </fieldset>
      <fieldset>
        <fui-form-input
          name="password"
          tanstack-app-field
          [tanstackField]="form"
          [label]="passwordLabel()"
          type="password"
        />
      </fieldset>
      <fui-policies />
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ createAccountLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>

      @if (signIn()?.observed) {
        <button fui-form-action (click)="signIn()?.emit()">{{ haveAccountLabel() }} {{ signInLabel() }}</button>
      }
    </form>
  `,
})
/**
 * A form component for signing up with email and password.
 *
 * Optionally includes a display name field if the requireDisplayName behavior is enabled.
 */
export class SignUpAuthFormComponent {
  private ui = injectUI();
  private formSchema = injectSignUpAuthFormSchema();

  requireDisplayNameField = computed(() => {
    return hasBehavior(this.ui(), "requireDisplayName");
  });

  emailLabel = injectTranslation("labels", "emailAddress");
  displayNameLabel = injectTranslation("labels", "displayName");
  passwordLabel = injectTranslation("labels", "password");
  createAccountLabel = injectTranslation("labels", "createAccount");
  haveAccountLabel = injectTranslation("prompts", "haveAccount");
  signInLabel = injectTranslation("labels", "signIn");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  /** Event emitter for sign in action. */
  signIn = input<EventEmitter<void>>();

  /** Event emitter for successful sign-up. */
  @Output() signUp = new EventEmitter<UserCredential>();

  form = injectForm({
    defaultValues: {
      email: "",
      password: "",
      displayName: this.requireDisplayNameField() ? "" : undefined,
    },
  });

  state = injectStore(this.form, (state) => state);

  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }

  constructor() {
    effect(() => {
      this.form.update({
        validators: {
          onChange: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const credential = await createUserWithEmailAndPassword(
                this.ui(),
                value.email,
                value.password,
                value.displayName
              );
              this.signUp.emit(credential);
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
