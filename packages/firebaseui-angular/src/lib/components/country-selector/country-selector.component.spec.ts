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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { countryData } from '@firebase-ui/core';

import { CountrySelectorComponent } from './country-selector.component';

describe('CountrySelectorComponent', () => {
  let component: CountrySelectorComponent;
  let fixture: ComponentFixture<CountrySelectorComponent>;
  const defaultCountry = countryData[0]; // First country in the list

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountrySelectorComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CountrySelectorComponent);
    component = fixture.componentInstance;
    component.value = defaultCountry;
    fixture.detectChanges();
  });

  it('renders with the selected country', () => {
    // Check if the country flag emoji is displayed
    const flagElement = fixture.debugElement.query(
      By.css('.fui-country-selector__flag')
    );
    expect(flagElement.nativeElement.textContent).toBe(defaultCountry.emoji);

    // Check if the dial code is displayed
    const dialCodeElement = fixture.debugElement.query(
      By.css('.fui-country-selector__dial-code')
    );
    expect(dialCodeElement.nativeElement.textContent).toBe(
      defaultCountry.dialCode
    );

    // Check if the select has the correct value
    const selectElement = fixture.debugElement.query(By.css('select'));
    expect(selectElement.nativeElement.value).toBe(defaultCountry.code);
  });

  it('applies custom className', () => {
    // Set custom class
    component.className = 'custom-class';
    fixture.detectChanges();

    // Check if the custom class is applied
    const container = fixture.debugElement.query(
      By.css('.fui-country-selector')
    );
    expect(
      container.nativeElement.classList.contains('custom-class')
    ).toBeTruthy();
    expect(
      container.nativeElement.classList.contains('fui-country-selector')
    ).toBeTruthy();
  });

  it('calls onChange when a different country is selected', () => {
    // Spy on the onChange event
    spyOn(component.onChange, 'emit');

    // Find a different country to select
    const newCountry = countryData.find(
      (country) => country.code !== defaultCountry.code
    );

    if (newCountry) {
      // Get the select element
      const selectElement = fixture.debugElement.query(
        By.css('select')
      ).nativeElement;

      // Change the selection
      selectElement.value = newCountry.code;
      selectElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Check if onChange was called with the new country
      expect(component.onChange.emit).toHaveBeenCalledWith(newCountry);
    } else {
      // Fail the test if no different country is found
      fail('No different country found in countryData. Test cannot proceed.');
    }
  });

  it('renders all countries in the dropdown', () => {
    const selectElement = fixture.debugElement.query(
      By.css('select')
    ).nativeElement;
    const options = selectElement.querySelectorAll('option');

    // Check if all countries are in the dropdown
    expect(options.length).toBe(countryData.length);

    // Check if a specific country exists in the dropdown
    const usCountry = countryData.find((country) => country.code === 'US');
    if (usCountry) {
      // Properly cast the NodeList to an array of HTMLOptionElement
      const optionsArray = Array.from(options) as HTMLOptionElement[];
      const usOption = optionsArray.find(
        (option: HTMLOptionElement) => option.value === usCountry.code
      );
      expect(usOption).toBeTruthy();
      if (usOption) {
        expect(usOption.textContent?.trim()).toBe(
          `${usCountry.dialCode} (${usCountry.name})`
        );
      }
    } else {
      // Fail the test if US country is not found
      fail('US country not found in countryData. Test cannot proceed.');
    }
  });
});
