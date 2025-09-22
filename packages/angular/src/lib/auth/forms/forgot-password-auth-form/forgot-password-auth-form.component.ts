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

import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
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
    @if (emailSent()) {
      <div class="fui-form__success">
        {{ checkEmailForResetMessage() }}
      </div>
    }

    @if (!emailSent()) {
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
          <button fui-button type="submit">
            {{ resetPasswordLabel() }}
          </button>
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
export class ForgotPasswordAuthFormComponent implements OnInit {
  private ui = injectUI();
  private formSchema = injectForgotPasswordAuthFormSchema();

  emailSent = signal<boolean>(false);

  emailLabel = injectTranslation("labels", "emailAddress");
  resetPasswordLabel = injectTranslation("labels", "resetPassword");
  backToSignInLabel = injectTranslation("labels", "backToSignIn");
  checkEmailForResetMessage = injectTranslation("messages", "checkEmailForReset");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  @Output() passwordSent = new EventEmitter<void>();
  @Output() backToSignIn = new EventEmitter<void>();

  form = injectForm({
    defaultValues: {
      email: "",
    },
  });

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }

  async ngOnInit() {
    this.form.update({
      validators: {
        onBlur: this.formSchema(),
        onSubmit: this.formSchema(),
        onSubmitAsync: async ({ value }) => {
          try {
            await sendPasswordResetEmail(this.ui(), value.email);
            this.emailSent.set(true);
            this.passwordSent?.emit();
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
