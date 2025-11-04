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
import { render, screen, cleanup, renderHook, waitFor } from "@testing-library/react";
import { countryCodes } from "@firebase-ui/core";
import { CountrySelector } from "./country-selector";
import { createMockUI, createFirebaseUIProvider } from "../../tests/utils";
import { FirebaseUIProvider } from "@firebase-ui/react";
import { useCountries, useDefaultCountry } from "@firebase-ui/react";
import type { RefObject } from "react";
import type { CountrySelectorRef } from "@firebase-ui/react";

// Mock the shadcn Select components
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value} data-on-value-change={onValueChange}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => (
    <button data-testid="select-trigger" role="combobox">
      {children}
    </button>
  ),
  SelectValue: ({ children }: any) => <span data-testid="select-value">{children}</span>,
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content" role="listbox">
      {children}
    </div>
  ),
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value} role="option">
      {children}
    </div>
  ),
}));

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

    expect(result.current.length).toBeGreaterThan(100); // Should have many countries
  });
});

describe("useDefaultCountry", () => {
  it("should return US as default country", () => {
    const mockUI = createMockUI();

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
    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("select")).toHaveAttribute("data-value", "US");
    expect(screen.getByTestId("select-value")).toHaveTextContent("🇺🇸 +1");
  });

  it("renders country options in the dropdown", () => {
    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector />
      </FirebaseUIProvider>
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);

    // Check that items have correct values
    expect(selectItems[0]).toHaveAttribute("data-value", "CA");
    expect(selectItems[1]).toHaveAttribute("data-value", "GB");
    expect(selectItems[2]).toHaveAttribute("data-value", "US");
  });

  it("displays country information correctly in options", () => {
    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector />
      </FirebaseUIProvider>
    );

    const selectItems = screen.getAllByTestId("select-item");

    // Check that each option shows dial code and country name
    selectItems.forEach((item) => {
      const text = item.textContent;
      expect(text).toMatch(/^\+\d+ \([^)]+\)$/); // Format: +123 (Country Name)
    });
  });

  it("changes selection when a different country is selected", async () => {
    const ref: RefObject<CountrySelectorRef> = { current: null as unknown as CountrySelectorRef };

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector ref={ref} />
      </FirebaseUIProvider>
    );

    // Use the ref to change the country
    ref.current?.setCountry("GB");

    await waitFor(() => {
      expect(screen.getByTestId("select")).toHaveAttribute("data-value", "GB");
    });
  });

  it("renders only allowed countries in the dropdown", () => {
    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector />
      </FirebaseUIProvider>
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);

    const values = selectItems.map((item) => item.getAttribute("data-value"));
    expect(values).toEqual(["CA", "GB", "US"]);
  });

  it("handles country selection with setCountry callback", async () => {
    const ref: RefObject<CountrySelectorRef> = { current: null as unknown as CountrySelectorRef };

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector ref={ref} />
      </FirebaseUIProvider>
    );

    // Use the ref to change the country
    ref.current?.setCountry("CA");

    await waitFor(() => {
      expect(screen.getByTestId("select")).toHaveAttribute("data-value", "CA");
    });
  });
  it("should work with all countries when no behavior is set", () => {
    const mockUI = createMockUI({
      behaviors: [],
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector />
      </FirebaseUIProvider>
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems.length).toBeGreaterThan(100); // Should have many countries
  });

  it("should display correct emoji and dial code in trigger", () => {
    const mockUI = createMockUI({
      behaviors: [countryCodes({ allowedCountries: ["US", "GB", "CA"] })],
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector />
      </FirebaseUIProvider>
    );

    const selectValues = screen.getAllByTestId("select-value");
    const triggerValue = selectValues.find((el) => el.closest('[data-testid="select-trigger"]'));
    expect(triggerValue).toHaveTextContent("🇺🇸 +1");
  });

  it("should update display when country changes", async () => {
    const mockUI = createMockUI({
      behaviors: [countryCodes({ allowedCountries: ["US", "GB", "CA"] })],
    });
    const ref: RefObject<CountrySelectorRef> = { current: null as unknown as CountrySelectorRef };

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector ref={ref} />
      </FirebaseUIProvider>
    );

    // Change to Canada
    ref.current?.setCountry("CA");

    await waitFor(() => {
      // Verify that the select component receives the updated value
      const selects = screen.getAllByTestId("select");
      const selectWithCA = selects.find((el) => el.getAttribute("data-value") === "CA");
      expect(selectWithCA).toBeDefined();
    });
  });
});

describe("CountrySelectorRef", () => {
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
    const ref: RefObject<CountrySelectorRef> = { current: null as unknown as CountrySelectorRef };

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector ref={ref} />
      </FirebaseUIProvider>
    );

    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.getCountry).toBe("function");
    expect(typeof ref.current?.setCountry).toBe("function");
  });

  it("should return current selected country via getCountry", () => {
    const ref: RefObject<CountrySelectorRef> = { current: null as unknown as CountrySelectorRef };

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector ref={ref} />
      </FirebaseUIProvider>
    );

    const currentCountry = ref.current?.getCountry();
    expect(currentCountry?.code).toBe("US");
    expect(currentCountry?.name).toBe("United States");
  });

  it("should set country via setCountry", async () => {
    const ref: RefObject<CountrySelectorRef> = { current: null as unknown as CountrySelectorRef };

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector ref={ref} />
      </FirebaseUIProvider>
    );

    ref.current?.setCountry("GB");

    await waitFor(() => {
      const select = screen.getByTestId("select");
      expect(select).toHaveAttribute("data-value", "GB");
    });
  });

  it("should update getCountry after setCountry", async () => {
    const ref: RefObject<CountrySelectorRef> = { current: null as unknown as CountrySelectorRef };

    render(
      <FirebaseUIProvider ui={mockUI}>
        <CountrySelector ref={ref} />
      </FirebaseUIProvider>
    );

    ref.current?.setCountry("CA");

    await waitFor(() => {
      const currentCountry = ref.current?.getCountry();
      expect(currentCountry?.code).toBe("CA");
      expect(currentCountry?.name).toBe("Canada");
    });
  });
});
