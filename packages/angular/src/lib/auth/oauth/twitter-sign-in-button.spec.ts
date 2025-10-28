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

import { TwitterSignInButtonComponent } from "./twitter-sign-in-button";

// Mocks are handled by jest.config.ts moduleNameMapper and test-helpers.ts

@Component({
  template: `<fui-twitter-sign-in-button></fui-twitter-sign-in-button>`,
  standalone: true,
  imports: [TwitterSignInButtonComponent],
})
class TestTwitterSignInButtonHostComponent {}

@Component({
  template: `<fui-twitter-sign-in-button [provider]="customProvider"></fui-twitter-sign-in-button>`,
  standalone: true,
  imports: [TwitterSignInButtonComponent],
})
class TestTwitterSignInButtonWithCustomProviderHostComponent {
  customProvider = { providerId: "custom.twitter.com" };
}

describe("<fui-twitter-sign-in-button>", () => {
  beforeEach(() => {
    const { injectUI, injectTranslation } = require("../../tests/test-helpers");

    injectUI.mockReturnValue(() => ({}));
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          signInWithTwitter: "Sign in with Twitter",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with the correct provider", async () => {
    await render(TestTwitterSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "twitter.com");
  });

  it("renders with custom provider when provided", async () => {
    await render(TestTwitterSignInButtonWithCustomProviderHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "custom.twitter.com");
  });

  it("renders with the Twitter icon", async () => {
    await render(TestTwitterSignInButtonHostComponent);

    const svg = document.querySelector(".fui-provider__icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 30 30");
  });

  it("renders with the correct translated text", async () => {
    await render(TestTwitterSignInButtonHostComponent);

    expect(screen.getByText("Sign in with Twitter")).toBeInTheDocument();
  });

  it("renders as a button with correct classes", async () => {
    await render(TestTwitterSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("fui-provider__button");
  });

  it("uses default provider when no provider is provided", async () => {
    await render(TestTwitterSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-provider", "twitter.com");
  });
});
