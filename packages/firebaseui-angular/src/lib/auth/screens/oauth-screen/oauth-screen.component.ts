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

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardSubtitleComponent } from '../../../components/card/card.component';
import { FirebaseUI } from '../../../provider';
import { TermsAndPrivacyComponent } from '../../../components/terms-and-privacy/terms-and-privacy.component';

@Component({
  selector: 'fui-oauth-screen',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    TermsAndPrivacyComponent,
  ],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>{{ titleText | async }}</fui-card-title>
          <fui-card-subtitle>{{ subtitleText | async }}</fui-card-subtitle>
        </fui-card-header>
        <ng-content></ng-content>
        <fui-terms-and-privacy></fui-terms-and-privacy>
      </fui-card>
    </div>
  `
})
export class OAuthScreenComponent {
  private ui = inject(FirebaseUI);

  get titleText() {
    return this.ui.translation('labels', 'signIn');
  }

  get subtitleText() {
    return this.ui.translation('prompts', 'signInToAccount');
  }
}
