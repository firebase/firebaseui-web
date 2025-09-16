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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { countryData } from "@firebase-ui/core";
import { CountrySelector } from "./country-selector";

describe("<CountrySelector />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with the selected country", () => {
    const country = countryData[0];

    render(<CountrySelector value={country.code} onChange={() => {}} />);

    expect(screen.getByText(country.emoji)).toBeInTheDocument();
    expect(screen.getByText(country.dialCode)).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue(country.code);
  });

  it("applies custom className", () => {
    const country = countryData[0];
    render(<CountrySelector value={country.code} onChange={() => {}} className="custom-class" />);

    const rootDiv = screen.getByRole("combobox").closest("div.fui-country-selector");
    expect(rootDiv).toHaveClass("custom-class");
  });

  it("calls onChange when a different country is selected", () => {
    const country = countryData[0];
    const onChangeMock = vi.fn();

    render(<CountrySelector value={country.code} onChange={onChangeMock} />);

    const select = screen.getByRole("combobox");

    // Find a different country to select
    const newCountry = countryData.find(($) => $.code !== country.code);

    if (!newCountry) {
      expect.fail("No different country found in countryData. Test cannot proceed.");
    }

    // Change the selection
    fireEvent.change(select, { target: { value: newCountry.code } });

    // Check if onChange was called with the new country
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(newCountry.code);
  });

  it("renders all countries in the dropdown", () => {
    const country = countryData[0];
    render(<CountrySelector value={country.code} onChange={() => {}} />);

    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");

    expect(options.length).toBe(countryData.length);
  });
});
