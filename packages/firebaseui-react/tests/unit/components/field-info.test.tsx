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

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FieldInfo } from "../../../src/components/field-info";
import { FieldApi } from "@tanstack/react-form";

describe("FieldInfo Component", () => {
  // Create a mock FieldApi with errors
  const createMockFieldWithErrors = (errors: string[]) => {
    return {
      state: {
        meta: {
          isTouched: true,
          errors,
        },
      },
    } as unknown as FieldApi<any, string>;
  };

  // Create a mock FieldApi without errors
  const createMockFieldWithoutErrors = () => {
    return {
      state: {
        meta: {
          isTouched: true,
          errors: [],
        },
      },
    } as unknown as FieldApi<any, string>;
  };

  // Create a mock FieldApi that's not touched
  const createMockFieldNotTouched = () => {
    return {
      state: {
        meta: {
          isTouched: false,
          errors: ["This field is required"],
        },
      },
    } as unknown as FieldApi<any, string>;
  };

  it("renders error message when field is touched and has errors", () => {
    const errorMessage = "This field is required";
    const field = createMockFieldWithErrors([errorMessage]);

    render(<FieldInfo field={field} />);

    const errorElement = screen.getByRole("alert");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass("fui-form__error");
    expect(errorElement).toHaveTextContent(errorMessage);
  });

  it("renders nothing when field is touched but has no errors", () => {
    const field = createMockFieldWithoutErrors();

    const { container } = render(<FieldInfo field={field} />);

    // The component should render nothing
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when field is not touched, even with errors", () => {
    const field = createMockFieldNotTouched();

    const { container } = render(<FieldInfo field={field} />);

    // The component should render nothing
    expect(container).toBeEmptyDOMElement();
  });

  it("applies custom className to the error message", () => {
    const errorMessage = "This field is required";
    const field = createMockFieldWithErrors([errorMessage]);

    render(<FieldInfo field={field} className="custom-error" />);

    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveClass("fui-form__error");
    expect(errorElement).toHaveClass("custom-error");
  });

  it("accepts and passes through additional props", () => {
    const errorMessage = "This field is required";
    const field = createMockFieldWithErrors([errorMessage]);

    render(
      <FieldInfo
        field={field}
        data-testid="error-message"
        aria-labelledby="form-field"
      />
    );

    const errorElement = screen.getByTestId("error-message");
    expect(errorElement).toHaveAttribute("aria-labelledby", "form-field");
  });

  it("displays only the first error when multiple errors exist", () => {
    const errors = ["First error", "Second error"];
    const field = createMockFieldWithErrors(errors);

    render(<FieldInfo field={field} />);

    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveTextContent(errors[0]);
    expect(errorElement).not.toHaveTextContent(errors[1]);
  });
});
