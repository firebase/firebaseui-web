/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MultiFactorInfo } from "firebase/auth";

@Component({
  selector: "fui-totp-multi-factor-assertion-form",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fui-content">
      <div>TOTP Multi-Factor Assertion Form (Stubbed)</div>
      <div>Hint: {{ hint()?.displayName || 'No hint' }}</div>
    </div>
  `,
})
export class TotpMultiFactorAssertionFormComponent {
  hint = input.required<MultiFactorInfo>();
}
