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

import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "fui-divider",
  standalone: true,
  imports: [CommonModule],
  host: {
    style: "display: block;",
  },
  template: `
    <div class="fui-divider my-6">
      <div class="fui-divider__line"></div>
      @if (label()) {
        <div class="fui-divider__text">{{ label() }}</div>
        <div class="fui-divider__line"></div>
      }
    </div>
  `,
})
/**
 * A divider component that can display a line or a line with text in the middle.
 */
export class DividerComponent {
  /** Optional label text to display in the center of the divider. */
  label = input<string>();
}
