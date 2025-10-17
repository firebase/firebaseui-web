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

import { OAuthScreenComponent } from "./oauth-screen.component";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../../components/card/card.component";
import { ContentComponent } from "../../../components/content/content.component";

jest.mock("../../../provider", () => ({
  injectTranslation: jest.fn(),
  injectPolicies: jest.fn(),
}));

@Component({
  selector: "fui-policies",
  template: '<div data-testid="policies">Policies</div>',
  standalone: true,
})
class MockPoliciesComponent {}

@Component({
  template: `
    <fui-oauth-screen>
      <div data-testid="oauth-provider">OAuth Provider</div>
    </fui-oauth-screen>
  `,
  standalone: true,
  imports: [OAuthScreenComponent],
})
class TestHostWithContentComponent {}

@Component({
  template: `
    <fui-oauth-screen>
      <div data-testid="provider-1">Provider 1</div>
      <div data-testid="provider-2">Provider 2</div>
    </fui-oauth-screen>
  `,
  standalone: true,
  imports: [OAuthScreenComponent],
})
class TestHostWithMultipleProvidersComponent {}

@Component({
  template: `<fui-oauth-screen></fui-oauth-screen>`,
  standalone: true,
  imports: [OAuthScreenComponent],
})
class TestHostWithoutContentComponent {}

describe("<fui-oauth-screen>", () => {
  beforeEach(() => {
    const { injectTranslation, injectPolicies } = require("../../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          signIn: "Sign In",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    injectPolicies.mockReturnValue({
      termsOfServiceUrl: "https://example.com/terms",
      privacyPolicyUrl: "https://example.com/privacy",
    });
  });

  it("renders with correct title and subtitle", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("includes the Policies component", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const policies = container.querySelector(".fui-policies");
    expect(policies).toBeInTheDocument();
  });

  it("renders projected content wrapped in fui-content", async () => {
    await render(TestHostWithContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const provider = screen.getByTestId("oauth-provider");
    expect(provider).toBeInTheDocument();
    expect(provider).toHaveTextContent("OAuth Provider");
  });

  it("renders multiple providers wrapped in fui-content", async () => {
    await render(TestHostWithMultipleProvidersComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const provider1 = screen.getByTestId("provider-1");
    const provider2 = screen.getByTestId("provider-2");

    expect(provider1).toBeInTheDocument();
    expect(provider1).toHaveTextContent("Provider 1");
    expect(provider2).toBeInTheDocument();
    expect(provider2).toHaveTextContent("Provider 2");
  });

  it("has correct CSS classes", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
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
        OAuthScreenComponent,
        MockPoliciesComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    expect(injectTranslation).toHaveBeenCalledWith("labels", "signIn");
    expect(injectTranslation).toHaveBeenCalledWith("prompts", "signInToAccount");
  });
});
