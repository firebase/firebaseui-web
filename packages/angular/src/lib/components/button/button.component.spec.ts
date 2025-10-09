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

import { ButtonComponent } from "./button.component";

describe("<button fui-button>", () => {
  it("renders with default variant (primary)", async () => {
    await render(`<button fui-button>Click me</button>`, { imports: [ButtonComponent] });
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDefined();
    expect(button).toHaveClass("fui-button");
    expect(button).not.toHaveClass("fui-button--secondary");
  });

  it("renders with secondary variant", async () => {
    await render(`<button fui-button [variant]="'secondary'">Click me</button>`, { imports: [ButtonComponent] });
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("fui-button");
    expect(button).toHaveClass("fui-button--secondary");
  });

  it("applies custom class", async () => {
    await render(`<button fui-button class="custom-class">Click me</button>`, { imports: [ButtonComponent] });
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("fui-button");
    expect(button).toHaveClass("custom-class");
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    await render(`<button fui-button (click)="handleClick()">Click me</button>`, { 
      imports: [ButtonComponent],
      componentProperties: { handleClick }
    });
    const button = screen.getByRole("button", { name: /click me/i });

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("passes other props to the button element", async () => {
    await render(`<button fui-button data-testid="test-button" disabled>Click me</button>`, { imports: [ButtonComponent] });
    const button = screen.getByTestId("test-button");

    expect(button).toHaveAttribute("disabled");
  });
});
