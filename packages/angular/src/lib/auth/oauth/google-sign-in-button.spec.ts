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
import { Component, signal } from "@angular/core";

import { GoogleSignInButtonComponent } from "./google-sign-in-button";

@Component({
  template: `<fui-google-sign-in-button></fui-google-sign-in-button>`,
  standalone: true,
  imports: [GoogleSignInButtonComponent],
})
class TestGoogleSignInButtonHostComponent {}

@Component({
  template: `<fui-google-sign-in-button [provider]="customProvider"></fui-google-sign-in-button>`,
  standalone: true,
  imports: [GoogleSignInButtonComponent],
})
class TestGoogleSignInButtonWithCustomProviderHostComponent {
  customProvider = { providerId: "custom.google.com" };
}

describe("<fui-google-sign-in-button>", () => {
  beforeEach(() => {
    const { injectUI, injectTranslation } = require("../../tests/test-helpers");

    injectUI.mockReturnValue(() => ({}));
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with the correct provider", async () => {
    await render(TestGoogleSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "google.com");
  });

  it("renders with custom provider when provided", async () => {
    await render(TestGoogleSignInButtonWithCustomProviderHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "custom.google.com");
  });

  it("renders with the Google icon", async () => {
    await render(TestGoogleSignInButtonHostComponent);

    const svg = document.querySelector(".fui-provider__icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 48 48");
  });

  it("renders with the correct translated text", async () => {
    await render(TestGoogleSignInButtonHostComponent);

    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("renders as a button with correct classes", async () => {
    await render(TestGoogleSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("fui-provider__button");
  });

  it("uses default provider when no provider is provided", async () => {
    await render(TestGoogleSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-provider", "google.com");
  });
});
