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

import { Component, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectUI } from "../../provider";

@Component({
  selector: "fui-multi-factor-auth-assertion-form",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fui-content">
      <div>Hello World - MFA Assertion Form</div>
    </div>
  `,
})
export class MultiFactorAuthAssertionFormComponent {
  private ui = injectUI();
  
  mfaResolver = computed(() => {
    const resolver = this.ui().multiFactorResolver;
    if (!resolver) {
      throw new Error("MultiFactorAuthAssertionForm requires a multi-factor resolver");
    }
    return resolver;
  });
}
