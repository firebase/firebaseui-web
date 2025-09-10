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
import { Divider } from "../../../src/components/divider";

describe("Divider Component", () => {
  it("renders a divider with no text", () => {
    render(<Divider data-testid="divider-no-text" />);
    const divider = screen.getByTestId("divider-no-text");

    expect(divider).toBeInTheDocument();
    expect(divider).toHaveClass("fui-divider");
    expect(divider.querySelector(".fui-divider__line")).toBeInTheDocument();
    expect(divider.querySelector(".fui-divider__text")).not.toBeInTheDocument();
  });

  it("renders a divider with text", () => {
    const dividerText = "OR";
    render(<Divider data-testid="divider-with-text">{dividerText}</Divider>);
    const divider = screen.getByTestId("divider-with-text");
    const textElement = screen.getByText(dividerText);

    expect(divider).toBeInTheDocument();
    expect(divider).toHaveClass("fui-divider");
    expect(divider.querySelectorAll(".fui-divider__line")).toHaveLength(2);
    expect(textElement).toBeInTheDocument();
    expect(textElement.closest(".fui-divider__text")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Divider data-testid="divider-custom-class" className="custom-class" />
    );
    const divider = screen.getByTestId("divider-custom-class");

    expect(divider).toHaveClass("fui-divider");
    expect(divider).toHaveClass("custom-class");
  });

  it("passes other props to the div element", () => {
    render(<Divider data-testid="test-divider" aria-label="divider" />);
    const divider = screen.getByTestId("test-divider");

    expect(divider).toBeInTheDocument();
    expect(divider).toHaveClass("fui-divider");
    expect(divider).toHaveAttribute("aria-label", "divider");
  });
});
