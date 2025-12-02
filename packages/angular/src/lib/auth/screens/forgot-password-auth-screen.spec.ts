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

import { ForgotPasswordAuthScreenComponent } from "./forgot-password-auth-screen";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";

@Component({
  selector: "fui-forgot-password-auth-form",
  template: '<div class="fui-form">Forgot Password Form</div>',
  standalone: true,
})
class MockForgotPasswordAuthFormComponent {}

describe("<fui-forgot-password-auth-screen>", () => {
  beforeEach(() => {
    const { injectTranslation } = require("../../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          resetPassword: "Reset Password",
        },
        prompts: {
          enterEmailToReset: "Enter your email to reset your password",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with correct title and subtitle", async () => {
    await render(ForgotPasswordAuthScreenComponent, {
      imports: [
        ForgotPasswordAuthScreenComponent,
        MockForgotPasswordAuthFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByRole("heading", { name: "Reset Password" })).toBeInTheDocument();
    expect(screen.getByText("Enter your email to reset your password")).toBeInTheDocument();
  });

  it("includes the ForgotPasswordAuthForm component", async () => {
    const { container } = await render(ForgotPasswordAuthScreenComponent, {
      imports: [
        ForgotPasswordAuthScreenComponent,
        MockForgotPasswordAuthFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = container.querySelector(".fui-form");
    expect(form).toBeInTheDocument();
  });

  it("has correct CSS classes", async () => {
    const { container } = await render(ForgotPasswordAuthScreenComponent, {
      imports: [
        ForgotPasswordAuthScreenComponent,
        MockForgotPasswordAuthFormComponent,
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
    await render(ForgotPasswordAuthScreenComponent, {
      imports: [
        ForgotPasswordAuthScreenComponent,
        MockForgotPasswordAuthFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(injectTranslation).toHaveBeenCalledWith("labels", "resetPassword");
    expect(injectTranslation).toHaveBeenCalledWith("prompts", "enterEmailToReset");
  });
});
