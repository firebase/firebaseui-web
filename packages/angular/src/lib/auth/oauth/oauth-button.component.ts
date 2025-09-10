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
import { ButtonComponent } from '../../components/button/button.component';
import { FirebaseUI } from '../../provider';
import { Auth, AuthProvider } from '@angular/fire/auth';
import { FirebaseUIError, signInWithOAuth } from '@firebase-ui/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'fui-oauth-button',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div>
      <fui-button
        type="button"
        (click)="handleOAuthSignIn()"
        class="fui-provider__button"
      >
        <ng-content></ng-content>
      </fui-button>
      <div class="fui-form__error" *ngIf="error">{{ error }}</div>
    </div>
  `,
})
export class OAuthButtonComponent implements OnInit {
  private ui = inject(FirebaseUI);

  @Input() provider!: AuthProvider;

  error: string | null = null;

  ngOnInit() {
    if (!this.provider) {
      console.error('Provider is required for OAuthButtonComponent');
    }
  }

  async handleOAuthSignIn() {
    this.error = null;
    try {
      await signInWithOAuth(await firstValueFrom(this.ui.config()), this.provider);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.error = error.message;
        return;
      }
      console.error(error);
      firstValueFrom(this.ui.translation('errors', 'unknownError'))
        .then((message) => (this.error = message))
        .catch(() => (this.error = 'Unknown error'));
    }
  }
}
