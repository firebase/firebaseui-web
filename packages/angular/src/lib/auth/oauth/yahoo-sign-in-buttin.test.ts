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

import { YahooSignInButtonComponent } from "./yahoo-sign-in-button";

@Component({
  template: `<fui-yahoo-sign-in-button></fui-yahoo-sign-in-button>`,
  standalone: true,
  imports: [YahooSignInButtonComponent],
})
class TestYahooSignInButtonHostComponent {}

@Component({
  template: `<fui-yahoo-sign-in-button [provider]="customProvider"></fui-yahoo-sign-in-button>`,
  standalone: true,
  imports: [YahooSignInButtonComponent],
})
class TestYahooSignInButtonWithCustomProviderHostComponent {
  customProvider = { providerId: "custom.yahoo.com" };
}

describe("<fui-yahoo-sign-in-button>", () => {
  beforeEach(() => {
    const { injectUI, injectTranslation } = require("../../tests/test-helpers");

    injectUI.mockReturnValue(() => ({}));
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          signInWithYahoo: "Sign in with Yahoo",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with the correct provider", async () => {
    await render(TestYahooSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "yahoo.com");
  });

  it("renders with custom provider when provided", async () => {
    await render(TestYahooSignInButtonWithCustomProviderHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "custom.yahoo.com");
  });

  it("renders with the Twitter icon", async () => {
    await render(TestYahooSignInButtonHostComponent);

    const svg = document.querySelector(".fui-provider__icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 30 30");
  });

  it("renders with the correct translated text", async () => {
    await render(TestYahooSignInButtonHostComponent);

    expect(screen.getByText("Sign in with Yahoo")).toBeInTheDocument();
  });

  it("renders as a button with correct classes", async () => {
    await render(TestYahooSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("fui-provider__button");
  });

  it("uses default provider when no provider is provided", async () => {
    await render(TestYahooSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-provider", "yahoo.com");
  });

  it("has signIn output", async () => {
    const { fixture } = await render(TestYahooSignInButtonHostComponent);

    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    // Verify the component has the signIn output
    const buttonComponent = fixture.debugElement.query(
      (el) => el.name === "fui-yahoo-sign-in-button"
    )?.componentInstance;
    expect(buttonComponent?.signIn).toBeDefined();
  });
});
