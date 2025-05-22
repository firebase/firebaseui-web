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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fui-card',
  standalone: true,
  imports: [],
  template: `
    <div class="fui-card">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
}

@Component({
  selector: 'fui-card-header',
  standalone: true,
  imports: [CommonModule],
  host: {
    style: 'display: block;',
  },
  template: `
    <div class="fui-card__header">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardHeaderComponent {
}

@Component({
  selector: 'fui-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="fui-card__title">
      <ng-content></ng-content>
    </h2>
  `,
})
export class CardTitleComponent {
}

@Component({
  selector: 'fui-card-subtitle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="fui-card__subtitle">
      <ng-content></ng-content>
    </p>
  `,
})
export class CardSubtitleComponent {
}
