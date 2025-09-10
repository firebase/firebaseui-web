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
import { ButtonComponent } from '../../../components/button/button.component';
import { FirebaseUI } from '../../../provider';
import { CommonModule } from '@angular/common';
import { injectForm, TanStackField } from '@tanstack/angular-form';
import {
  createEmailFormSchema,
  EmailFormSchema,
  FirebaseUIError,
  createUserWithEmailAndPassword,
} from '@firebase-ui/core';
import { Auth } from '@angular/fire/auth';
import { TermsAndPrivacyComponent } from '../../../components/terms-and-privacy/terms-and-privacy.component';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'fui-register-form',
  imports: [
    CommonModule,
    TanStackField,
    ButtonComponent,
    TermsAndPrivacyComponent,
  ],
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
      <fieldset>
        <ng-container [tanstackField]="form" name="password" #password="field">
          <label [for]="password.api.name">
            <span>{{ passwordLabel | async }}</span>
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
              {{ password.api.state.meta.errors.join(', ') }}
            </span>
          </label>
        </ng-container>
      </fieldset>

      <fui-terms-and-privacy></fui-terms-and-privacy>

      <fieldset>
        <fui-button type="submit">
          {{ createAccountLabel | async }}
        </fui-button>
        <div class="fui-form__error" *ngIf="formError">{{ formError }}</div>
      </fieldset>

      <div class="flex justify-center items-center" *ngIf="signInRoute">
        <button
          type="button"
          (click)="navigateTo(signInRoute)"
          class="fui-form__action"
        >
          {{ haveAccountLabel | async }} {{ signInLabel | async }} &rarr;
        </button>
      </div>
    </form>
  `,
  standalone: true,
})
export class RegisterFormComponent implements OnInit {
  private ui = inject(FirebaseUI);
  private router = inject(Router);

  @Input({ required: true }) signInRoute!: string;

  formError: string | null = null;
  private formSchema: any;
  private config: any;

  form = injectForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async ngOnInit() {
    try {
      this.config = await firstValueFrom(this.ui.config());

      this.formSchema = createEmailFormSchema(this.config?.translations);

      this.form.update({
        validators: {
          onSubmit: this.formSchema,
          onBlur: this.formSchema,
        },
      });
    } catch (error) {
      this.formError = await firstValueFrom(
        this.ui.translation('errors', 'unknownError')
      );
    }
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();

    const email = this.form.state.values.email;
    const password = this.form.state.values.password;

    if (!email || !password) {
      return;
    }

    await this.registerUser(email, password);
  }

  async registerUser(email: string, password: string) {
    this.formError = null;

    try {
      const validationResult = this.formSchema.safeParse({
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

        this.formError = await firstValueFrom(
          this.ui.translation('errors', 'unknownError')
        );
        return;
      }

      await createUserWithEmailAndPassword(
        await firstValueFrom(this.ui.config()),
        email,
        password,
      );
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

  navigateTo(route: string) {
    this.router.navigateByUrl(route);
  }

  get emailLabel() {
    return this.ui.translation('labels', 'emailAddress');
  }

  get passwordLabel() {
    return this.ui.translation('labels', 'password');
  }

  get createAccountLabel() {
    return this.ui.translation('labels', 'createAccount');
  }

  get haveAccountLabel() {
    return this.ui.translation('prompts', 'haveAccount');
  }

  get signInLabel() {
    return this.ui.translation('labels', 'signIn');
  }
}
