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
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import { UserCredential } from "@angular/fire/auth";
import {
  FirebaseUIError,
  completeEmailLinkSignIn,
  sendSignInLinkToEmail,
} from "@firebase-ui/core";

import { injectEmailLinkAuthFormSchema, injectTranslation, injectUI } from "../../../provider";
import { PoliciesComponent } from "../../../components/policies/policies.component";
import { FormErrorMessageComponent, FormInputComponent, FormSubmitComponent } from "../../../components/form/form.component";

@Component({
  selector: "fui-email-link-auth-form",
  standalone: true,
  imports: [
    CommonModule,
    PoliciesComponent,
    TanStackField,
    TanStackAppField,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
  ],
  template: `
    @if (emailSent) {
      <div class="fui-form">
        {{ emailSentMessage() }}
      </div>
    }

    @if (!emailSent) {
      <form (submit)="handleSubmit($event)" class="fui-form">
        <fieldset>
          <fui-form-input
            name="email"
            tanstack-app-field
            [tanstackField]="form"
            label="{{ emailLabel() }}"
          ></fui-form-input>
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
export class EmailLinkAuthFormComponent implements OnInit {
  private ui = injectUI();
  private formSchema = injectEmailLinkAuthFormSchema();

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

  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }

  async ngOnInit() {
    this.completeSignIn();

    this.form.update({
      validators: {
        onBlur: this.formSchema(),
        onSubmit: this.formSchema(),
        onSubmitAsync: async ({ value }) => {
          try {
            await sendSignInLinkToEmail(this.ui(), value.email);
            this.emailSent?.emit();
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

  private async completeSignIn() {
    const credential = await completeEmailLinkSignIn(this.ui(), window.location.href);

    if (credential) {
      this.signIn?.emit(credential);
    }
  }
}
