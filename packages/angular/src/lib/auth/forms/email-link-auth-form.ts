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

import { Component, effect, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import { UserCredential } from "@angular/fire/auth";
import { FirebaseUIError, completeEmailLinkSignIn, sendSignInLinkToEmail } from "@invertase/firebaseui-core";

import { FormInputComponent, FormSubmitComponent, FormErrorMessageComponent } from "../../components/form";
import { PoliciesComponent } from "../../components/policies";
import { injectEmailLinkAuthFormSchema, injectTranslation, injectUI } from "../../provider";

@Component({
  selector: "fui-email-link-auth-form",
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
    @if (emailSentState()) {
      <div class="fui-form__success">
        {{ emailSentMessage() }}
      </div>
    }

    @if (!emailSentState()) {
      <form (submit)="handleSubmit($event)" class="fui-form">
        <fieldset>
          <fui-form-input name="email" tanstack-app-field [tanstackField]="form" label="{{ emailLabel() }}" />
        </fieldset>

        <fui-policies />

        <fieldset>
          <fui-form-submit [state]="state()">
            {{ sendSignInLinkLabel() }}
          </fui-form-submit>
          <fui-form-error-message [state]="state()" />
        </fieldset>
      </form>
    }
  `,
})
export class EmailLinkAuthFormComponent {
  private ui = injectUI();
  private formSchema = injectEmailLinkAuthFormSchema();

  emailSentState = signal<boolean>(false);

  emailLabel = injectTranslation("labels", "emailAddress");
  sendSignInLinkLabel = injectTranslation("labels", "sendSignInLink");
  emailSentMessage = injectTranslation("messages", "signInLinkSent");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  emailSent = output<void>();
  signIn = output<UserCredential>();

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
    this.completeSignIn();

    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.formSchema(),
          onSubmit: this.formSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              await sendSignInLinkToEmail(this.ui(), value.email);
              this.emailSentState.set(true);
              this.emailSent?.emit();
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

  private async completeSignIn() {
    const credential = await completeEmailLinkSignIn(this.ui(), window.location.href);

    if (credential) {
      this.signIn?.emit(credential);
    }
  }
}
