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

import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { injectForm, TanStackField } from '@tanstack/angular-form';
import { FirebaseUI } from '../../../provider';
import { ButtonComponent } from '../../../components/button/button.component';
import { TermsAndPrivacyComponent } from '../../../components/terms-and-privacy/terms-and-privacy.component';
import {
  createEmailLinkFormSchema,
  FirebaseUIError,
  completeEmailLinkSignIn,
  sendSignInLinkToEmail,
} from '@firebase-ui/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'fui-email-link-form',
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    ButtonComponent,
    TermsAndPrivacyComponent,
  ],
  template: `
    <div *ngIf="emailSent" class="fui-form">
      {{ emailSentMessage | async }}
    </div>
    <form *ngIf="!emailSent" (submit)="handleSubmit($event)" class="fui-form">
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
            <span
              role="alert"
              aria-live="polite"
              class="fui-form__error"
              *ngIf="!!email.api.state.meta.errors.length"
            >
              {{ email.api.state.meta.errors.join(', ') }}
            </span>
          </label>
        </ng-container>
      </fieldset>

      <fui-terms-and-privacy></fui-terms-and-privacy>

      <fieldset>
        <fui-button type="submit">
          {{ sendSignInLinkLabel | async }}
        </fui-button>
        <div class="fui-form__error" *ngIf="formError">{{ formError }}</div>
      </fieldset>
    </form>
  `,
})
export class EmailLinkFormComponent implements OnInit {
  private ui = inject(FirebaseUI);

  formError: string | null = null;
  emailSent = false;
  private formSchema: any;
  private config: any;

  form = injectForm({
    defaultValues: {
      email: '',
    },
  });

  async ngOnInit() {
    try {
      this.config = await firstValueFrom(this.ui.config());

      this.formSchema = createEmailLinkFormSchema(this.config?.translations);

      this.form.update({
        validators: {
          onSubmit: this.formSchema,
          onBlur: this.formSchema,
        },
      });

      this.completeSignIn();
    } catch (error) {
      this.formError = await firstValueFrom(
        this.ui.translation('errors', 'unknownError')
      );
    }
  }

  private async completeSignIn() {
    try {
      await completeEmailLinkSignIn(await firstValueFrom(this.ui.config()), window.location.href);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.formError = error.message;
      }
    }
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();

    const email = this.form.state.values.email;

    if (!email) {
      return;
    }

    await this.sendSignInLink(email);
  }

  async sendSignInLink(email: string) {
    this.formError = null;

    try {
      const validationResult = this.formSchema.safeParse({
        email,
      });

      if (!validationResult.success) {
        const validationErrors = validationResult.error.format();

        if (validationErrors.email?._errors?.length) {
          this.formError = validationErrors.email._errors[0];
          return;
        }

        this.formError = await firstValueFrom(
          this.ui.translation('errors', 'unknownError')
        );
        return;
      }

      await sendSignInLinkToEmail(await firstValueFrom(this.ui.config()), email);

      this.emailSent = true;
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.formError = error.message;
        return;
      }

      this.formError = await firstValueFrom(
        this.ui.translation('errors', 'unknownError')
      );
    }
  }

  get emailLabel() {
    return this.ui.translation('labels', 'emailAddress');
  }

  get sendSignInLinkLabel() {
    return this.ui.translation('labels', 'sendSignInLink');
  }

  get emailSentMessage() {
    return this.ui.translation('messages', 'signInLinkSent');
  }
}
