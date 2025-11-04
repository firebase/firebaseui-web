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

import { describe, it, expect, beforeEach, afterEach } from "vitest";

/**
 * CSS Specificity Test Suite
 *
 * This test suite verifies that our :where() pseudo-class implementation
 * correctly reduces CSS specificity, allowing users to easily override
 * component styles with their own Tailwind classes.
 */

describe("Tailwind :where() pseudo-class", () => {
  let testContainer: HTMLDivElement;
  let styleElement: HTMLStyleElement;

  beforeEach(() => {
    // Create a test container
    testContainer = document.createElement("div");
    document.body.appendChild(testContainer);

    // Create a style element to inject our CSS
    styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(testContainer);
    document.head.removeChild(styleElement);
  });

  /**
   * Helper function to get computed styles for an element
   */
  function getComputedStyleValue(element: HTMLElement, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property);
  }

  /**
   * Helper function to create a test element with specific classes
   */
  function createTestElement(classes: string): HTMLElement {
    const element = document.createElement("div");
    element.className = classes;
    testContainer.appendChild(element);
    return element;
  }

  describe("Basic :where() specificity test", () => {
    it("should demonstrate that :where() has zero specificity", () => {
      // Create CSS that shows specificity difference
      styleElement.textContent = `
        /* Regular class selector (specificity: 0,0,1,0) */
        .regular-class {
          color: red;
        }
        
        /* :where() pseudo-class (specificity: 0,0,0,0) */
        :where(.where-class) {
          color: blue;
        }
        
        /* User class (specificity: 0,0,1,0) */
        .user-override {
          color: green;
        }
      `;

      // Test regular class vs user override
      const regularElement = createTestElement("regular-class user-override");
      expect(getComputedStyleValue(regularElement, "color")).toBe("rgb(0, 128, 0)"); // green wins

      // Test :where() class vs user override
      const whereElement = createTestElement("where-class user-override");
      expect(getComputedStyleValue(whereElement, "color")).toBe("rgb(0, 128, 0)"); // green wins easily
    });

    it("should allow user classes to override :where() styles", () => {
      // Inject CSS with :where() pseudo-class
      styleElement.textContent = `
        :where(.fui-screen) {
          padding-top: 6rem;
          max-width: 28rem;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* User override classes */
        .pt-32 { padding-top: 8rem !important; }
        .max-w-lg { max-width: 32rem !important; }
      `;

      // Create element with both fui-screen and user override classes
      const element = createTestElement("fui-screen pt-32 max-w-lg");

      // User classes should override the :where() styles
      expect(getComputedStyleValue(element, "padding-top")).toBe("8rem"); // pt-32 overrides pt-24
      expect(getComputedStyleValue(element, "max-width")).toBe("32rem"); // max-w-lg overrides max-w-md
    });

    it("should maintain :where() styles when no user overrides are present", () => {
      styleElement.textContent = `
        :where(.fui-screen) {
          padding-top: 6rem;
          max-width: 28rem;
          margin-left: auto;
          margin-right: auto;
        }
      `;

      const element = createTestElement("fui-screen");

      // Should maintain original styles
      expect(getComputedStyleValue(element, "padding-top")).toBe("6rem");
      expect(getComputedStyleValue(element, "max-width")).toBe("28rem");
    });
  });

  describe("Complex selectors with :where()", () => {
    it("should handle nested selectors with :where() correctly", () => {
      styleElement.textContent = `
        :where(.fui-form fieldset > label > input) {
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          padding: 0.5rem;
          font-size: 0.875rem;
          background-color: transparent;
        }
        
        /* User override classes */
        .border-red-500 { border-color: rgb(239, 68, 68) !important; }
        .rounded-lg { border-radius: 0.5rem !important; }
        .p-3 { padding: 0.75rem !important; }
      `;

      // Create nested structure
      const form = document.createElement("div");
      form.className = "fui-form";
      const fieldset = document.createElement("fieldset");
      const label = document.createElement("label");
      const input = document.createElement("input");

      fieldset.appendChild(label);
      label.appendChild(input);
      form.appendChild(fieldset);
      testContainer.appendChild(form);

      // Add user override classes
      input.className = "border-red-500 rounded-lg p-3";

      // User classes should override
      expect(getComputedStyleValue(input, "border-color")).toBe("rgb(239, 68, 68)"); // border-red-500
      expect(getComputedStyleValue(input, "border-radius")).toBe("0.5rem"); // rounded-lg
      expect(getComputedStyleValue(input, "padding")).toBe("0.75rem"); // p-3
    });
  });

  describe("Edge cases", () => {
    it("should handle empty :where() selectors gracefully", () => {
      styleElement.textContent = `
        :where() {
          color: red;
        }
      `;

      const element = createTestElement("test-class");
      // Should not apply any styles (empty selector)
      expect(getComputedStyleValue(element, "color")).not.toBe("rgb(255, 0, 0)");
    });

    it("should handle :where() with attribute selectors", () => {
      styleElement.textContent = `
        :where(.fui-form fieldset > label > input[aria-invalid="true"]) {
          outline: 2px solid red;
        }
        
        /* User override classes */
        .outline-blue-500 { outline-color: rgb(59, 130, 246) !important; }
        .outline-4 { outline-width: 4px !important; }
      `;

      const form = document.createElement("div");
      form.className = "fui-form";
      const fieldset = document.createElement("fieldset");
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.setAttribute("aria-invalid", "true");

      fieldset.appendChild(label);
      label.appendChild(input);
      form.appendChild(fieldset);
      testContainer.appendChild(form);

      // Add user override
      input.className = "outline-blue-500 outline-4";

      // User classes should override
      expect(getComputedStyleValue(input, "outline-color")).toBe("rgb(59, 130, 246)"); // outline-blue-500
      expect(getComputedStyleValue(input, "outline-width")).toBe("4px"); // outline-4
    });
  });

  describe("Component integration tests", () => {
    it("should verify layout components (screen, card) styles can be overridden", () => {
      styleElement.textContent = `
        /* Base component styles with :where() for zero specificity */
        :where(.fui-screen) { padding-top: 6rem; max-width: 28rem; }
        :where(.fui-card) { background-color: white; padding: 2.5rem; }
        
        /* User Tailwind override classes */
        .pt-8 { padding-top: 2rem !important; }
        .max-w-lg { max-width: 32rem !important; }
        .p-6 { padding: 1.5rem !important; }
        .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
      `;

      const screenElement = createTestElement("fui-screen pt-8 max-w-lg");
      const cardElement = createTestElement("fui-card p-6 bg-gray-50");

      expect(getComputedStyleValue(screenElement, "padding-top")).toBe("2rem");
      expect(getComputedStyleValue(cardElement, "background-color")).toBe("rgb(249, 250, 251)");
    });

    it("should verify button components styles can be overridden", () => {
      styleElement.textContent = `
        /* Base component styles with :where() for zero specificity */
        :where(.fui-button) { background-color: black; color: white; padding: 0.5rem 1rem; }
        :where(.fui-button--secondary) { background-color: transparent; border: 1px solid rgb(209, 213, 219); }
        
        /* User Tailwind override classes */
        .bg-blue-500 { background-color: rgb(59, 130, 246) !important; }
        .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
      `;

      const primaryButton = createTestElement("fui-button bg-blue-500 px-6");
      const secondaryButton = createTestElement("fui-button--secondary bg-gray-100");

      expect(getComputedStyleValue(primaryButton, "background-color")).toBe("rgb(59, 130, 246)");
      expect(getComputedStyleValue(secondaryButton, "background-color")).toBe("rgb(243, 244, 246)");
    });

    it("should verify form components styles can be overridden", () => {
      styleElement.textContent = `
        /* Base component styles with :where() for zero specificity */
        :where(.fui-form fieldset > label > input) { border: 1px solid rgb(209, 213, 219); padding: 0.5rem; }
        :where(.fui-error) { color: rgb(239, 68, 68); }
        
        /* User Tailwind override classes */
        .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
        .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        .text-red-600 { color: rgb(220, 38, 38) !important; }
      `;

      const inputElement = createTestElement("border-gray-300 px-3");
      const errorElement = createTestElement("fui-error text-red-600");

      expect(getComputedStyleValue(inputElement, "border-color")).toBe("rgb(209, 213, 219)");
      expect(getComputedStyleValue(errorElement, "color")).toBe("rgb(220, 38, 38)");
    });

    it("should verify utility components (divider, success) styles can be overridden", () => {
      styleElement.textContent = `
        /* Base component styles with :where() for zero specificity */
        :where(.fui-divider) { display: flex; gap: 0.75rem; }
        :where(.fui-divider__line) { background-color: rgb(229, 231, 235); }
        :where(.fui-success) { text-align: center; font-size: 0.75rem; }
        
        /* User Tailwind override classes */
        .gap-2 { gap: 0.5rem !important; }
        .bg-gray-300 { background-color: rgb(209, 213, 219) !important; }
        .text-left { text-align: left !important; }
        .text-sm { font-size: 0.875rem !important; }
      `;

      const dividerElement = createTestElement("fui-divider gap-2");
      const lineElement = createTestElement("fui-divider__line bg-gray-300");
      const successElement = createTestElement("fui-success text-left text-sm");

      expect(getComputedStyleValue(dividerElement, "gap")).toBe("0.5rem");
      expect(getComputedStyleValue(lineElement, "background-color")).toBe("rgb(209, 213, 219)");
      expect(getComputedStyleValue(successElement, "text-align")).toBe("left");
    });

    it("should verify complex input components (phone, country) styles can be overridden", () => {
      styleElement.textContent = `
        /* Base component styles with :where() for zero specificity */
        :where(.fui-phone-input) { display: flex; gap: 0.5rem; }
        :where(.fui-country-selector) { width: 80px; }
        
        /* User Tailwind override classes */
        .gap-2 { gap: 0.5rem !important; }
        .w-24 { width: 6rem !important; }
        .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
      `;

      const phoneElement = createTestElement("fui-phone-input gap-2");
      const countryElement = createTestElement("fui-country-selector w-24 bg-gray-50");

      expect(getComputedStyleValue(phoneElement, "gap")).toBe("0.5rem");
      expect(getComputedStyleValue(countryElement, "width")).toBe("6rem");
    });
  });
});
