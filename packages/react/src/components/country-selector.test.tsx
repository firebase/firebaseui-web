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
import { render, screen, fireEvent, cleanup, renderHook, waitFor } from "@testing-library/react";
import { countryData, countryCodes } from "@invertase/firebaseui-core";
import { CountrySelector, CountrySelectorRef, useCountries, useDefaultCountry } from "./country-selector";
import { createMockUI, createFirebaseUIProvider } from "~/tests/utils";
import { RefObject } from "react";

describe("useCountries", () => {
  it("should return allowed countries from behavior", () => {
    const mockUI = createMockUI({
      behaviors: [countryCodes({ allowedCountries: ["US", "GB", "CA"] })],
    });

    const { result } = renderHook(() => useCountries(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toHaveLength(3);
    expect(result.current.map((c) => c.code)).toEqual(["CA", "GB", "US"]);
  });

  it("should return all countries when no behavior is set", () => {
    const mockUI = createMockUI({
      behaviors: [],
    });

    const { result } = renderHook(() => useCountries(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toEqual(countryData);
  });
});

describe("useDefaultCountry", () => {
  it("should return default country from behavior", () => {
    const mockUI = createMockUI({
      behaviors: [countryCodes({ allowedCountries: ["US", "GB", "CA"] })],
    });

    const { result } = renderHook(() => useDefaultCountry(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current.code).toBe("US");
    expect(result.current.name).toBe("United States");
  });

  it("should return US when no behavior is set", () => {
    const mockUI = createMockUI({
      behaviors: [],
    });

    const { result } = renderHook(() => useDefaultCountry(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current.code).toBe("US");
  });
});

describe("<CountrySelector />", () => {
  const mockUI = createMockUI({
    behaviors: [countryCodes({ allowedCountries: ["US", "GB", "CA"] })],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with the default country", () => {
    render(createFirebaseUIProvider({ children: <CountrySelector />, ui: mockUI }));

    expect(screen.getByText("🇺🇸")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("US");
  });

  it("applies custom className", () => {
    render(
      createFirebaseUIProvider({
        children: <CountrySelector className="custom-class" />,
        ui: mockUI,
      })
    );

    const rootDiv = screen.getByRole("combobox").closest("div.fui-country-selector");
    expect(rootDiv).toHaveClass("custom-class");
  });

  it("changes selection when a different country is selected", () => {
    render(createFirebaseUIProvider({ children: <CountrySelector />, ui: mockUI }));

    const select = screen.getByRole("combobox");

    // Change to GB
    fireEvent.change(select, { target: { value: "GB" } });

    expect(screen.getByText("🇬🇧")).toBeInTheDocument();
    expect(screen.getByText("+44")).toBeInTheDocument();
    expect(select).toHaveValue("GB");
  });

  it("renders only allowed countries in the dropdown", () => {
    render(createFirebaseUIProvider({ children: <CountrySelector />, ui: mockUI }));

    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");

    expect(options).toHaveLength(3);
    expect(Array.from(options).map((option) => option.value)).toEqual(["CA", "GB", "US"]);
  });

  it("displays country information correctly", () => {
    render(createFirebaseUIProvider({ children: <CountrySelector />, ui: mockUI }));

    // Check that all countries show dial code and name
    const options = screen.getAllByRole("option");
    options.forEach((option) => {
      const text = option.textContent;
      expect(text).toMatch(/^\+\d+ \([^)]+\)$/); // Format: +123 (Country Name)
    });
  });
});

describe("CountrySelector ref", () => {
  const mockUI = createMockUI({
    behaviors: [countryCodes({ allowedCountries: ["US", "GB", "CA"] })],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should expose getCountry and setCountry methods", () => {
    const ref: RefObject<CountrySelectorRef> = { current: undefined as unknown as CountrySelectorRef };

    render(createFirebaseUIProvider({ children: <CountrySelector ref={ref} />, ui: mockUI }));

    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.getCountry).toBe("function");
    expect(typeof ref.current?.setCountry).toBe("function");
  });

  it("should return current selected country via getCountry", () => {
    const ref: RefObject<CountrySelectorRef> = { current: undefined as unknown as CountrySelectorRef };

    render(createFirebaseUIProvider({ children: <CountrySelector ref={ref} />, ui: mockUI }));

    const currentCountry = ref.current?.getCountry();
    expect(currentCountry?.code).toBe("US");
    expect(currentCountry?.name).toBe("United States");
  });

  it("should set country via setCountry", async () => {
    const ref: RefObject<CountrySelectorRef> = { current: undefined as unknown as CountrySelectorRef };

    render(createFirebaseUIProvider({ children: <CountrySelector ref={ref} />, ui: mockUI }));

    ref.current?.setCountry("GB");

    await waitFor(() => {
      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("GB");
    });
  });

  it("should update getCountry after setCountry", async () => {
    const ref: RefObject<CountrySelectorRef> = { current: undefined as unknown as CountrySelectorRef };

    render(createFirebaseUIProvider({ children: <CountrySelector ref={ref} />, ui: mockUI }));

    ref.current?.setCountry("CA");

    await waitFor(() => {
      const currentCountry = ref.current?.getCountry();
      expect(currentCountry?.code).toBe("CA");
    });

    const currentCountry = ref.current?.getCountry();
    expect(currentCountry?.name).toBe("Canada");
  });
});
