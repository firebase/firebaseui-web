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

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "fui-card",
  standalone: true,
  imports: [],
  host: {
    class: "fui-card",
    style: "display: block;",
  },
  template: `
    <ng-content select="fui-card-header"></ng-content>
    <ng-content select="fui-card-content"></ng-content>
  `,
})
export class CardComponent {}

@Component({
  selector: "fui-card-header",
  standalone: true,
  imports: [CommonModule],
  host: {
    class: "fui-card__header",
    style: "display: block;",
  },
  template: `
    <ng-content select="fui-card-title"></ng-content>
    <ng-content select="fui-card-subtitle"></ng-content>
  `,
})
export class CardHeaderComponent {}

@Component({
  selector: "fui-card-title",
  standalone: true,
  imports: [CommonModule],
  host: {
    class: "fui-card__title",
    style: "display: block;",
  },
  template: `
    <h2>
      <ng-content></ng-content>
    </h2>
  `,
})
export class CardTitleComponent {}

@Component({
  selector: "fui-card-subtitle",
  standalone: true,
  imports: [CommonModule],
  host: {
    class: "fui-card__subtitle",
    style: "display: block;",
  },
  template: `
    <p>
      <ng-content></ng-content>
    </p>
  `,
})
export class CardSubtitleComponent {}

@Component({
  selector: "fui-card-content",
  standalone: true,
  imports: [CommonModule],
  host: {
    class: "fui-card__content",
    style: "display: block;",
  },
  template: `
    <ng-content></ng-content>
  `,
})
export class CardContentComponent {}
