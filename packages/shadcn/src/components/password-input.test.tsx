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

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { createRef } from "react";
import { PasswordInput } from "./password-input";

describe("<PasswordInput />", () => {
  afterEach(() => {
    cleanup();
  });

  function renderPasswordInput() {
    render(
      <>
        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          defaultValue="secret"
          autoComplete="current-password"
          showPasswordLabel="Show password"
          hidePasswordLabel="Hide password"
        />
      </>
    );
  }

  it("renders a hidden password with a show toggle", () => {
    renderPasswordInput();

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "current-password");

    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-controls", "password");
  });

  it("reveals and hides the password when the toggle is clicked", () => {
    renderPasswordInput();

    const input = screen.getByLabelText("Password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("secret");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("turns off spellcheck and autocorrect", () => {
    renderPasswordInput();

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("spellcheck", "false");
    expect(input).toHaveAttribute("autocapitalize", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
  });

  it("hides the password again when the form is submitted", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <form onSubmit={(e) => e.preventDefault()} data-testid="form">
        <label htmlFor="password">Password</label>
        <PasswordInput id="password" ref={ref} showPasswordLabel="Show password" hidePasswordLabel="Hide password" />
      </form>
    );

    const input = screen.getByLabelText("Password");
    expect(ref.current).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    fireEvent.submit(screen.getByTestId("form"));
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });
});
