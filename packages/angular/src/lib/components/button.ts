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

import { Component, HostBinding, input } from "@angular/core";
import { buttonVariant, type ButtonVariant } from "@invertase/firebaseui-styles";

@Component({
  selector: "button[fui-button]",
  template: `<ng-content></ng-content>`,
  standalone: true,
})
/**
 * A customizable button component with multiple variants.
 */
export class ButtonComponent {
  /** The visual variant of the button. */
  variant = input<ButtonVariant>();

  @HostBinding("class")
  get getButtonClasses(): string {
    return buttonVariant({ variant: this.variant() });
  }
}
