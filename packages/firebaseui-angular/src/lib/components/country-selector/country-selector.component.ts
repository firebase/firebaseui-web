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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryData, countryData } from '@firebase-ui/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'fui-country-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fui-country-selector" [class]="className">
      <div class="fui-country-selector__wrapper">
        <span class="fui-country-selector__flag">{{ value.emoji }}</span>
        <div class="fui-country-selector__select-wrapper">
          <span class="fui-country-selector__dial-code">{{ value.dialCode }}</span>
          <select
            class="fui-country-selector__select"
            [ngModel]="value.code"
            (ngModelChange)="handleCountryChange($event)"
          >
            @for (country of countries; track country.code) {
              <option [value]="country.code">
                {{ country.dialCode }} ({{ country.name }})
              </option>
            }
          </select>
        </div>
      </div>
    </div>
  `
})
export class CountrySelectorComponent {
  @Input() value: CountryData = countryData[0];
  @Input() className: string = '';
  @Output() onChange = new EventEmitter<CountryData>();

  countries = countryData;

  handleCountryChange(code: string) {
    const country = this.countries.find(c => c.code === code);
    if (country) {
      this.onChange.emit(country);
    }
  }
}
