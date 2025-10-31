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

import { render, screen, fireEvent } from "@testing-library/angular";
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { CountrySelectorComponent } from "./country-selector";

jest.mock("../../provider", () => ({
  injectCountries: jest.fn(),
  injectDefaultCountry: jest.fn(),
}));

const mockCountryData = [
  { name: "United States", dialCode: "+1", code: "US", emoji: "🇺🇸" },
  { name: "United Kingdom", dialCode: "+44", code: "GB", emoji: "🇬🇧" },
  { name: "Canada", dialCode: "+1", code: "CA", emoji: "🇨🇦" },
  { name: "Germany", dialCode: "+49", code: "DE", emoji: "🇩🇪" },
  { name: "France", dialCode: "+33", code: "FR", emoji: "🇫🇷" },
] as const;

@Component({
  template: `<fui-country-selector [value]="value()" (valueChange)="onValueChange($event)"></fui-country-selector>`,
  standalone: true,
  imports: [CountrySelectorComponent, FormsModule],
})
class TestCountrySelectorHostComponent {
  value = signal("US");
  onValueChange = jest.fn();
}

@Component({
  template: `<fui-country-selector [value]="value()" class="custom-class"></fui-country-selector>`,
  standalone: true,
  imports: [CountrySelectorComponent, FormsModule],
})
class TestCountrySelectorWithCustomClassHostComponent {
  value = signal("US");
}

describe("<fui-country-selector>", () => {
  const defaultCountry = mockCountryData.find((country) => country.code === "US")!;

  beforeEach(() => {
    const { injectCountries, injectDefaultCountry } = require("../../provider");

    injectCountries.mockReturnValue(signal(mockCountryData));
    injectDefaultCountry.mockReturnValue(signal(defaultCountry));
  });

  it("renders with the default country", async () => {
    await render(TestCountrySelectorHostComponent);

    expect(screen.getByText(defaultCountry.emoji)).toBeInTheDocument();
    expect(screen.getByText(defaultCountry.dialCode)).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue(defaultCountry.code);
  });

  it("applies custom className", async () => {
    const { container } = await render(TestCountrySelectorWithCustomClassHostComponent);

    const hostElement = container.querySelector("fui-country-selector");
    expect(hostElement).toHaveClass("custom-class");
  });

  it("calls valueChange when a different country is selected", async () => {
    const { fixture } = await render(TestCountrySelectorHostComponent);
    const hostComponent = fixture.componentInstance;

    const newCountry = mockCountryData.find((country) => country.code === "GB")!;

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: newCountry.code } });
    expect(hostComponent.onValueChange).toHaveBeenCalledWith(newCountry.code);
  });

  it("renders all countries in the dropdown", async () => {
    await render(TestCountrySelectorHostComponent);

    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");

    expect(options).toHaveLength(mockCountryData.length);

    const usCountry = mockCountryData.find((country) => country.code === "US");
    expect(usCountry).toBeTruthy();

    if (usCountry) {
      const optionsArray = Array.from(options) as HTMLOptionElement[];
      const usOption = optionsArray.find((option: HTMLOptionElement) => option.value === usCountry.code);
      expect(usOption).toBeTruthy();
      if (usOption) {
        expect(usOption.textContent?.trim()).toBe(`${usCountry.dialCode} (${usCountry.name})`);
      }
    } else {
      fail("US country not found in mockCountryData");
    }
  });

  it("displays country information correctly", async () => {
    await render(TestCountrySelectorHostComponent);

    const options = screen.getAllByRole("option");
    options.forEach((option) => {
      const text = option.textContent;
      expect(text).toMatch(/^\+\d+ \([^)]+\)$/);
    });
  });

  it("updates display when value changes", async () => {
    const { fixture } = await render(TestCountrySelectorHostComponent);
    const hostComponent = fixture.componentInstance;

    const newCountry = mockCountryData.find((country) => country.code === "GB")!;

    hostComponent.value.set(newCountry.code);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(screen.getByText(newCountry.emoji)).toBeInTheDocument();
    expect(screen.getByText(newCountry.dialCode)).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue(newCountry.code);
  });
});
