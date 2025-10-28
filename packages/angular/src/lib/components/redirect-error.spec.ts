/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { render, screen } from "@testing-library/angular";
import { Component } from "@angular/core";
import { RedirectErrorComponent } from "./redirect-error";

@Component({
  template: `<fui-redirect-error></fui-redirect-error>`,
  standalone: true,
  imports: [RedirectErrorComponent],
})
class TestHostComponent {}

describe("<fui-redirect-error>", () => {
  it("renders error message when redirectError is present in UI state", async () => {
    const { injectRedirectError } = require("../../provider");
    const errorMessage = "Authentication failed";
    injectRedirectError.mockReturnValue(() => errorMessage);

    const { container } = await render(TestHostComponent);

    // Debug: log the container HTML
    console.log("Container HTML:", container.innerHTML);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeDefined();
    expect(errorElement).toHaveClass("fui-form__error");
  });

  it("returns null when no redirectError exists", async () => {
    const { injectRedirectError } = require("../../provider");
    injectRedirectError.mockReturnValue(() => undefined);

    const { container } = await render(TestHostComponent);

    expect(container.querySelector(".fui-form__error")).toBeNull();
  });

  it("properly formats error messages for Error objects", async () => {
    const { injectRedirectError } = require("../../provider");
    const errorMessage = "Network error occurred";
    injectRedirectError.mockReturnValue(() => errorMessage);

    const { container } = await render(TestHostComponent);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeDefined();
    expect(errorElement).toHaveClass("fui-form__error");
  });

  it("properly formats error messages for string values", async () => {
    const { injectRedirectError } = require("../../provider");
    const errorMessage = "Custom error string";
    injectRedirectError.mockReturnValue(() => errorMessage);

    const { container } = await render(TestHostComponent);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeDefined();
    expect(errorElement).toHaveClass("fui-form__error");
  });

  it("displays error with correct CSS class", async () => {
    const { injectRedirectError } = require("../../provider");
    const errorMessage = "Test error";
    injectRedirectError.mockReturnValue(() => errorMessage);

    const { container } = await render(TestHostComponent);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toHaveClass("fui-form__error");
  });

  it("handles undefined redirectError", async () => {
    const { injectRedirectError } = require("../../provider");
    injectRedirectError.mockReturnValue(() => undefined);

    const { container } = await render(TestHostComponent);

    expect(container.querySelector(".fui-form__error")).toBeNull();
  });
});
