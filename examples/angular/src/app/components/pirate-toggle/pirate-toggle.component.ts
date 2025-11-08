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
import { injectUI } from "@invertase/firebaseui-angular";
import { enUs } from "@invertase/firebaseui-translations";
import { pirate } from "../../pirate";

@Component({
  selector: "app-pirate-toggle",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="fixed z-10 size-10 top-8 right-20 border border-gray-300 dark:border-gray-700 rounded-md p-2 group/toggle extend-touch-target"
      (click)="toggleLocale()"
      type="button"
    >
      {{ isPirate() ? "🇺🇸" : "🏴‍☠️" }}
    </button>
  `,
  styles: [],
})
export class PirateToggleComponent {
  private ui = injectUI();

  isPirate = computed(() => this.ui().locale.locale === "pirate");

  toggleLocale() {
    const currentUI = this.ui();
    if (this.isPirate()) {
      currentUI.setLocale(enUs);
    } else {
      currentUI.setLocale(pirate);
    }
  }
}
