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

import { SignUpAuthScreenComponent } from "./sign-up-auth-screen.component";
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
  selector: "fui-sign-up-auth-form",
  template: `
    <div data-testid="sign-up-auth-form">
      Sign Up Auth Form
    </div>
  `,
  standalone: true,
})
class MockSignUpAuthFormComponent {}

@Component({
  template: `
    <fui-sign-up-auth-screen>
      <div data-testid="projected-content">Test Content</div>
    </fui-sign-up-auth-screen>
  `,
  standalone: true,
  imports: [SignUpAuthScreenComponent],
})
class TestHostWithContentComponent {}

@Component({
  template: `<fui-sign-up-auth-screen></fui-sign-up-auth-screen>`,
  standalone: true,
  imports: [SignUpAuthScreenComponent],
})
class TestHostWithoutContentComponent {}

describe("<fui-sign-up-auth-screen>", () => {
  beforeEach(() => {
    const { injectTranslation } = require("../../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          register: "Create Account",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with correct title and subtitle", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        SignUpAuthScreenComponent,
        MockSignUpAuthFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Enter your details to create an account")).toBeInTheDocument();
  });

  it("includes the SignUpAuthForm component", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        SignUpAuthScreenComponent,
        MockSignUpAuthFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = screen.getByTestId("sign-up-auth-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent("Sign Up Auth Form");
  });

  it("renders projected content when provided", async () => {
    await render(TestHostWithContentComponent, {
      imports: [
        SignUpAuthScreenComponent,
        MockSignUpAuthFormComponent,
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
        SignUpAuthScreenComponent,
        MockSignUpAuthFormComponent,
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
        SignUpAuthScreenComponent,
        MockSignUpAuthFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(injectTranslation).toHaveBeenCalledWith("labels", "register");
    expect(injectTranslation).toHaveBeenCalledWith("prompts", "enterDetailsToCreate");
  });
});
