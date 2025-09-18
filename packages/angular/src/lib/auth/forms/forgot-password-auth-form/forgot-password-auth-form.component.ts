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
import { injectForgotPasswordAuthFormSchema, injectTranslation, injectUI } from "../../../provider";
import { ButtonComponent } from "../../../components/button/button.component";
import { TermsAndPrivacyComponent } from "../../../components/terms-and-privacy/terms-and-privacy.component";
import { FirebaseUIError, sendPasswordResetEmail } from "@firebase-ui/core";

@Component({
  selector: "fui-forgot-password-auth-form",
  standalone: true,
  imports: [CommonModule, TanStackField, ButtonComponent, TermsAndPrivacyComponent],
  template: `
    @if (emailSent) {
      <div class="fui-form__success">
        {{ checkEmailForResetMessage() }}
      </div>
    }

    @if (!emailSent) {
      <form (submit)="handleSubmit($event)" class="fui-form">
        <fieldset>
          <ng-container [tanstackField]="form" name="email" #email="field">
            <label [for]="email.api.name">
              <span>{{ emailLabel() }}</span>
              <input
                type="email"
                [id]="email.api.name"
                [name]="email.api.name"
                [value]="email.api.state.value"
                (blur)="email.api.handleBlur()"
                (input)="email.api.handleChange($any($event).target.value)"
                [attr.aria-invalid]="!!email.api.state.meta.errors.length"
              />
              <span
                role="alert"
                aria-live="polite"
                class="fui-form__error"
                *ngIf="!!email.api.state.meta.errors.length"
              >
                {{ email.api.state.meta.errors.join(", ") }}
              </span>
            </label>
          </ng-container>
        </fieldset>

        <fui-terms-and-privacy></fui-terms-and-privacy>

        <fieldset>
          <fui-button type="submit">
            {{ resetPasswordLabel() }}
          </fui-button>
          <div class="fui-form__error" *ngIf="formError">{{ formError }}</div>
        </fieldset>

        @if (signIn) {
          <div class="flex justify-center items-center">
            <button type="button" (click)="signIn.emit()" class="fui-form__action">
              {{ backToSignInLabel() }} &rarr;
            </button>
          </div>
        }
      </form>
    }
  `,
})
export class ForgotPasswordAuthFormComponent {
  private ui = injectUI();
  private formSchema = injectForgotPasswordAuthFormSchema();

  emailLabel = injectTranslation("labels", "emailAddress");
  resetPasswordLabel = injectTranslation("labels", "resetPassword");
  backToSignInLabel = injectTranslation("labels", "backToSignIn");
  checkEmailForResetMessage = injectTranslation("messages", "checkEmailForReset");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  @Output() signIn = new EventEmitter<void>();

  formError: string | null = null;
  emailSent = false;

  form = injectForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: this.formSchema(),
      onBlur: this.formSchema(),
    },
  }) as any; // TODO(ehesp): Fix this - types go too deep

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();

    const email = this.form.state.values.email;

    if (!email) {
      return;
    }

    await this.resetPassword(email);
  }

  // TODO - this should be handled in the form submit?
  async resetPassword(email: string) {
    this.formError = null;

    try {
      const validationResult = this.formSchema().safeParse({
        email,
      });

      if (!validationResult.success) {
        const validationErrors = validationResult.error.format();

        if (validationErrors.email?._errors?.length) {
          this.formError = validationErrors.email._errors[0];
          return;
        }

        this.formError = this.unknownErrorLabel();
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(this.ui(), email);

      this.emailSent = true;
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.formError = error.message;
        return;
      }

      this.formError = this.unknownErrorLabel();
    }
  }
}
