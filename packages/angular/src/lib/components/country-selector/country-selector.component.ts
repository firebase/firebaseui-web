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
import { CountryCode, CountryData, countryData } from "@firebase-ui/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "fui-country-selector",
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            @for (country of countries; track country.code) {
              <option [value]="country.code">{{ country.dialCode }} ({{ country.name }})</option>
            }
          </select>
        </div>
      </div>
    </div>
  `,
})
export class CountrySelectorComponent {
  countries = countryData;
  value = model<CountryCode>();
  selected = computed(() => countryData.find((c) => c.code === this.value()));

  handleCountryChange(code: string) {
    const country = this.countries.find((c) => c.code === code) as CountryData;

    if (country) {
      this.value.update(() => country.code as CountryCode);
    }
  }
}
