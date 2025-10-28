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

import { SignInAuthScreenComponent } from "./sign-in-auth-screen.component";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../../components/card/card.component";

@Component({
  selector: "fui-sign-in-auth-form",
  template: '<button class="fui-form__action fui-button">Sign in</button>',
  standalone: true,
})
class MockSignInAuthFormComponent {}

@Component({
  selector: "fui-redirect-error",
  template: '<div data-testid="redirect-error">Redirect Error</div>',
  standalone: true,
})
class MockRedirectErrorComponent {}

@Component({
  template: `
    <fui-sign-in-auth-screen>
      <div data-testid="projected-content">Test Content</div>
    </fui-sign-in-auth-screen>
  `,
  standalone: true,
  imports: [SignInAuthScreenComponent],
})
class TestHostWithContentComponent {}

@Component({
  template: `<fui-sign-in-auth-screen></fui-sign-in-auth-screen>`,
  standalone: true,
  imports: [SignInAuthScreenComponent],
})
class TestHostWithoutContentComponent {}

describe("<fui-sign-in-auth-screen>", () => {
  beforeEach(() => {
    const { injectTranslation } = require("../../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          signIn: "Sign in",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with correct title and subtitle", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("includes the SignInAuthForm component", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = screen.getByRole("button", { name: "Sign in" });
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass("fui-form__action", "fui-button");
  });

  it("renders projected content when provided", async () => {
    await render(TestHostWithContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const projectedContent = screen.getByTestId("projected-content");
    expect(projectedContent).toBeInTheDocument();
    expect(projectedContent).toHaveTextContent("Test Content");
  });

  it("renders RedirectError component in children section when no MFA resolver", async () => {
    await render(TestHostWithContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const redirectError = screen.getByTestId("redirect-error");
    expect(redirectError).toBeInTheDocument();
    expect(redirectError).toHaveTextContent("Redirect Error");
  });

  it("has correct CSS classes", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(container.querySelector(".fui-screen")).toBeInTheDocument();
    expect(container.querySelector(".fui-card")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__header")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__title")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__subtitle")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__content")).toBeInTheDocument();
  });

  it("calls injectTranslation with correct parameters", async () => {
    const { injectTranslation } = require("../../../provider");
    await render(TestHostWithoutContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(injectTranslation).toHaveBeenCalledWith("labels", "signIn");
    expect(injectTranslation).toHaveBeenCalledWith("prompts", "signInToAccount");
  });
});
