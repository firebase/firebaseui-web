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

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardSubtitleComponent } from '../../../components/card/card.component';
import { FirebaseUI } from '../../../provider';
import { ForgotPasswordFormComponent } from '../../forms/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'fui-password-reset-screen',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    ForgotPasswordFormComponent,
  ],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>{{ titleText | async }}</fui-card-title>
          <fui-card-subtitle>{{ subtitleText | async }}</fui-card-subtitle>
        </fui-card-header>
        <fui-forgot-password-form 
          [signInRoute]="signInRoute"
        ></fui-forgot-password-form>
      </fui-card>
    </div>
  `
})
export class PasswordResetScreenComponent {
  private ui = inject(FirebaseUI);
  
  @Input() signInRoute: string = '';

  get titleText() {
    return this.ui.translation('labels', 'resetPassword');
  }

  get subtitleText() {
    return this.ui.translation('prompts', 'enterEmailToReset');
  }
}
