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

import { GithubSignInButtonComponent } from "./github-sign-in-button.component";

jest.mock("../../provider", () => ({
  injectUI: jest.fn(),
  injectTranslation: jest.fn(),
}));

jest.mock("@angular/fire/auth", () => ({
  GithubAuthProvider: class GithubAuthProvider {
    providerId = "github.com";
  },
}));

jest.mock("@firebase-ui/core", () => ({
  signInWithProvider: jest.fn(),
  FirebaseUIError: class FirebaseUIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FirebaseUIError";
    }
  },
}));

@Component({
  template: `<fui-github-sign-in-button></fui-github-sign-in-button>`,
  standalone: true,
  imports: [GithubSignInButtonComponent],
})
class TestGithubSignInButtonHostComponent {}

@Component({
  template: `<fui-github-sign-in-button [provider]="customProvider"></fui-github-sign-in-button>`,
  standalone: true,
  imports: [GithubSignInButtonComponent],
})
class TestGithubSignInButtonWithCustomProviderHostComponent {
  customProvider = { providerId: "custom.github.com" };
}

describe("<fui-github-sign-in-button>", () => {
  beforeEach(() => {
    const { injectUI, injectTranslation } = require("../../provider");

    injectUI.mockReturnValue(() => ({}));
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          signInWithGithub: "Sign in with GitHub",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with the correct provider", async () => {
    await render(TestGithubSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "github.com");
  });

  it("renders with custom provider when provided", async () => {
    await render(TestGithubSignInButtonWithCustomProviderHostComponent);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-provider", "custom.github.com");
  });

  it("renders with the GitHub icon", async () => {
    await render(TestGithubSignInButtonHostComponent);

    const svg = document.querySelector(".fui-provider__icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 30 30");
  });

  it("renders with the correct translated text", async () => {
    await render(TestGithubSignInButtonHostComponent);

    expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
  });

  it("renders as a button with correct classes", async () => {
    await render(TestGithubSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("fui-provider__button");
  });

  it("uses default provider when no provider is provided", async () => {
    await render(TestGithubSignInButtonHostComponent);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-provider", "github.com");
  });
});
