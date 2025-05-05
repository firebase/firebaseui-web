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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CountrySelector } from "../../../src/components/country-selector";
import { countryData } from "@firebase-ui/core";

describe("CountrySelector Component", () => {
  const mockOnChange = vi.fn();
  const defaultCountry = countryData[0]; // First country in the list

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with the selected country", () => {
    render(<CountrySelector value={defaultCountry} onChange={mockOnChange} />);

    // Check if the country flag emoji is displayed
    expect(screen.getByText(defaultCountry.emoji)).toBeInTheDocument();

    // Check if the dial code is displayed
    expect(screen.getByText(defaultCountry.dialCode)).toBeInTheDocument();

    // Check if the select has the correct value
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue(defaultCountry.code);
  });

  it("applies custom className", () => {
    render(
      <CountrySelector
        value={defaultCountry}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const selector = screen
      .getByRole("combobox")
      .closest(".fui-country-selector");
    expect(selector).toHaveClass("fui-country-selector");
    expect(selector).toHaveClass("custom-class");
  });

  it("calls onChange when a different country is selected", () => {
    render(<CountrySelector value={defaultCountry} onChange={mockOnChange} />);

    const select = screen.getByRole("combobox");

    // Find a different country to select
    const newCountry = countryData.find(
      (country) => country.code !== defaultCountry.code
    );

    if (newCountry) {
      // Change the selection
      fireEvent.change(select, { target: { value: newCountry.code } });

      // Check if onChange was called with the new country
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(newCountry);
    } else {
      // Fail the test if no different country is found
      expect.fail(
        "No different country found in countryData. Test cannot proceed."
      );
    }
  });

  it("renders all countries in the dropdown", () => {
    render(<CountrySelector value={defaultCountry} onChange={mockOnChange} />);

    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");

    // Check if all countries are in the dropdown
    expect(options.length).toBe(countryData.length);

    // Check if a specific country exists in the dropdown
    const usCountry = countryData.find((country) => country.code === "US");
    if (usCountry) {
      const usOption = Array.from(options).find(
        (option) => option.value === usCountry.code
      );
      expect(usOption).toBeInTheDocument();
      expect(usOption?.textContent).toBe(
        `${usCountry.dialCode} (${usCountry.name})`
      );
    } else {
      // Fail the test if US country is not found
      expect.fail("US country not found in countryData. Test cannot proceed.");
    }
  });
});
