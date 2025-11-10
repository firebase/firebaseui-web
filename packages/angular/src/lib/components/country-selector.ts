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

import { Component, computed, model } from "@angular/core";
import { CommonModule } from "@angular/common";
import { type CountryCode } from "@invertase/firebaseui-core";
import { FormsModule } from "@angular/forms";
import { injectCountries, injectDefaultCountry } from "../provider";

@Component({
  selector: "fui-country-selector",
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: {
    style: "display: block;",
  },
  template: `
    <div class="fui-country-selector">
      <div class="fui-country-selector__wrapper">
        <span class="fui-country-selector__flag">{{ selected().emoji }}</span>
        <div class="fui-country-selector__select-wrapper">
          <span class="fui-country-selector__dial-code">{{ selected().dialCode }}</span>
          <select
            class="fui-country-selector__select"
            [ngModel]="selected().code"
            (ngModelChange)="handleCountryChange($event)"
          >
            @for (country of countries(); track $index) {
              <option [value]="country.code">{{ country.dialCode }} ({{ country.name }})</option>
            }
          </select>
        </div>
      </div>
    </div>
  `,
})
export class CountrySelectorComponent {
  countries = injectCountries();
  defaultCountry = injectDefaultCountry();
  value = model<CountryCode>();

  selected = computed(() => {
    if (!this.value()) {
      return this.defaultCountry();
    }

    return this.countries().find((c) => c.code === this.value()) || this.defaultCountry();
  });

  handleCountryChange(code: string) {
    const country = this.countries().find((c) => c.code === code);

    if (country) {
      this.value.update(() => country.code as CountryCode);
    }
  }
}
