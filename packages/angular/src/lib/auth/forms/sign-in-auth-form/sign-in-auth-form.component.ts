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

import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, TanStackField } from "@tanstack/angular-form";
import { injectSignInAuthFormSchema, injectTranslation, injectUI } from "../../../provider";
import { ButtonComponent } from "../../../components/button/button.component";
import { TermsAndPrivacyComponent } from "../../../components/terms-and-privacy/terms-and-privacy.component";
import { FirebaseUIError, signInWithEmailAndPassword } from "@firebase-ui/core";

@Component({
  selector: "fui-sign-in-auth-form",
  standalone: true,
  imports: [CommonModule, TanStackField, ButtonComponent, TermsAndPrivacyComponent],
  template: `
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <ng-container [tanstackField]="form" name="email" #email="field">
          <label [for]="email.api.name">
            <span>{{ emailLabel | async }}</span>
            <input
              type="email"
              [id]="email.api.name"
              [name]="email.api.name"
              [value]="email.api.state.value"
              (blur)="email.api.handleBlur()"
              (input)="email.api.handleChange($any($event).target.value)"
              [attr.aria-invalid]="!!email.api.state.meta.errors.length"
            />
            <span role="alert" aria-live="polite" class="fui-form__error" *ngIf="!!email.api.state.meta.errors.length">
              {{ email.api.state.meta.errors.join(", ") }}
            </span>
          </label>
        </ng-container>
      </fieldset>
      <fieldset>
        <ng-container [tanstackField]="form" name="password" #password="field">
          <label [for]="password.api.name">
            <span class="flex">
              <span class="flex-grow">{{ passwordLabel() }}</span>
              @if(forgotPassword) {
                <button type="button" (click)="forgotPassword.emit()" class="fui-form__action">
                  {{ forgotPasswordLabel() }}
                </button>
              }
            </span>
            <input
              type="password"
              [id]="password.api.name"
              [name]="password.api.name"
              [value]="password.api.state.value"
              (blur)="password.api.handleBlur()"
              (input)="password.api.handleChange($any($event).target.value)"
              [attr.aria-invalid]="!!password.api.state.meta.errors.length"
            />
            <span
              role="alert"
              aria-live="polite"
              class="fui-form__error"
              *ngIf="!!password.api.state.meta.errors.length"
            >
              {{ password.api.state.meta.errors.join(", ") }}
            </span>
          </label>
        </ng-container>
      </fieldset>

      <fui-terms-and-privacy></fui-terms-and-privacy>

      <fieldset>
        <button fui-button type="submit">
          {{ signInLabel() }}
        </button>
        <div class="fui-form__error" *ngIf="formError">{{ formError }}</div>
      </fieldset>

      @if(register) {
        <div class="flex justify-center items-center">
          <button type="button" (click)="register.emit()" class="fui-form__action">
            {{ noAccountLabel() }} {{ registerLabel() }}
          </button>
        </div>
      }
    </form>
  `,
})
export class SignInAuthFormComponent {
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

  formError: string | null = null;

  form = injectForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: this.formSchema(),
      onSubmit: this.formSchema(),
    },
  }) as any; // TODO(ehesp): Fix this - types go too deep

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();

    const email = this.form.state.values.email;
    const password = this.form.state.values.password;

    if (!email || !password) {
      return;
    }

    await this.validateAndSignIn(email, password);
  }

  async validateAndSignIn(email: string, password: string) {
    try {
      const validationResult = this.formSchema().safeParse({
        email,
        password,
      });

      if (!validationResult.success) {
        const validationErrors = validationResult.error.format();

        if (validationErrors.email?._errors?.length) {
          this.formError = validationErrors.email._errors[0];
          return;
        }

        if (validationErrors.password?._errors?.length) {
          this.formError = validationErrors.password._errors[0];
          return;
        }

        this.formError = this.unknownErrorLabel();
        return;
      }

      this.formError = null;
      await signInWithEmailAndPassword(this.ui(), email, password);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.formError = error.message;
        return;
      }

      this.formError = this.unknownErrorLabel();
    }
  }
}
