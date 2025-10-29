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

import { render, screen } from "@testing-library/angular";
import { Component } from "@angular/core";

import { ContentComponent } from "./content";

jest.mock("../../provider", () => ({
  injectTranslation: jest.fn(),
}));

@Component({
  template: `
    <fui-content>
      <div data-testid="projected-content">foo</div>
    </fui-content>
  `,
  standalone: true,
  imports: [ContentComponent],
})
class TestContentHostComponent {}

@Component({
  template: `
    <fui-content>
      <button data-testid="button-1">foo</button>
      <button data-testid="button-2">bar</button>
      <p data-testid="description">baz</p>
    </fui-content>
  `,
  standalone: true,
  imports: [ContentComponent],
})
class TestContentWithMultipleElementsHostComponent {}

describe("<fui-content>", () => {
  beforeEach(() => {
    const { injectTranslation } = require("../../provider");
    injectTranslation.mockReturnValue(() => "OR");
  });

  it("renders content with default divider label", async () => {
    const { container } = await render(TestContentHostComponent);

    const contentWrapper = container.querySelector(".fui-screen__children");
    expect(contentWrapper).toBeTruthy();

    const projectedContent = screen.getByTestId("projected-content");
    expect(projectedContent).toBeInTheDocument();
    expect(projectedContent).toHaveTextContent("foo");

    const divider = container.querySelector(".fui-divider");
    expect(divider).toBeTruthy();
    expect(divider?.querySelector(".fui-divider__text")).toHaveTextContent("OR");
  });

  it("renders multiple projected elements", async () => {
    const { container } = await render(TestContentWithMultipleElementsHostComponent);

    const contentWrapper = container.querySelector(".fui-screen__children");
    expect(contentWrapper).toBeTruthy();

    const button1 = screen.getByTestId("button-1");
    const button2 = screen.getByTestId("button-2");
    const description = screen.getByTestId("description");

    expect(button1).toBeInTheDocument();
    expect(button1).toHaveTextContent("foo");
    expect(button2).toBeInTheDocument();
    expect(button2).toHaveTextContent("bar");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("baz");

    const divider = container.querySelector(".fui-divider");
    expect(divider).toBeTruthy();
    expect(divider?.querySelector(".fui-divider__text")).toHaveTextContent("OR");
  });

  it("has correct classes", async () => {
    const { container } = await render(TestContentHostComponent);

    const contentWrapper = container.querySelector(".fui-screen__children");
    expect(contentWrapper).toHaveClass("fui-screen__children");

    const divider = container.querySelector(".fui-divider");
    expect(divider).toHaveClass("fui-divider");
  });

  it("renders both divider and content wrapper", async () => {
    const { container } = await render(TestContentHostComponent);

    const divider = container.querySelector(".fui-divider");
    const contentWrapper = container.querySelector(".fui-screen__children");

    expect(divider).toBeTruthy();
    expect(contentWrapper).toBeTruthy();
  });

  it("calls injectTranslation with correct parameters", async () => {
    const { injectTranslation } = require("../../provider");
    await render(TestContentHostComponent);

    expect(injectTranslation).toHaveBeenCalledWith("messages", "dividerOr");
  });
});
