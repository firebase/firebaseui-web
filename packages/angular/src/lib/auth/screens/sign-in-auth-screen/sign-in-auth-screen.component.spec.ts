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

jest.mock("../../../provider", () => ({
  injectTranslation: jest.fn(),
}));

@Component({
  selector: "fui-sign-in-auth-form",
  template: ` <div data-testid="sign-in-auth-form">Sign In Auth Form</div> `,
  standalone: true,
})
class MockSignInAuthFormComponent {}

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
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("includes the SignInAuthForm component", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = screen.getByTestId("sign-in-auth-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent("Sign In Auth Form");
  });

  it("renders projected content when provided", async () => {
    await render(TestHostWithContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
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

  it("has correct CSS classes", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        SignInAuthScreenComponent,
        MockSignInAuthFormComponent,
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
