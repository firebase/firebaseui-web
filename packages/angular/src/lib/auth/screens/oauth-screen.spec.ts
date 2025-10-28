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
import { TestBed } from "@angular/core/testing";

import { OAuthScreenComponent } from "./oauth-screen";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";
import { MultiFactorAuthAssertionFormComponent } from "../forms/multi-factor-auth-assertion-form";
import { ContentComponent } from "../../components/content";

jest.mock("../../../provider", () => ({
  injectTranslation: jest.fn(),
  injectPolicies: jest.fn(),
  injectRedirectError: jest.fn(),
  injectUI: jest.fn(),
}));

@Component({
  selector: "fui-policies",
  template: '<div data-testid="policies">Policies</div>',
  standalone: true,
})
class MockPoliciesComponent {}

@Component({
  selector: "fui-redirect-error",
  template: '<div data-testid="redirect-error">Redirect Error</div>',
  standalone: true,
})
class MockRedirectErrorComponent {}

@Component({
  selector: "fui-multi-factor-auth-assertion-form",
  template: '<div data-testid="mfa-assertion-form">MFA Assertion Form</div>',
  standalone: true,
})
class MockMultiFactorAuthAssertionFormComponent {}

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
    const { injectTranslation, injectPolicies, injectRedirectError, injectUI } = require("../../../provider");
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

    injectRedirectError.mockImplementation(() => {
      return () => undefined;
    });

    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: null,
      });
    });
  });

  it("renders with correct title and subtitle", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
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
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
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
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
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
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
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

  it("renders RedirectError component with children when no MFA resolver", async () => {
    const { container } = await render(TestHostWithContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const redirectErrorElement = container.querySelector("fui-redirect-error");
    expect(redirectErrorElement).toBeInTheDocument();
  });

  it("has correct CSS classes", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
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
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
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

  it("renders MFA assertion form when multiFactorResolver is present", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: { hints: [] },
      });
    });

    // Override the real component with our mock
    TestBed.overrideComponent(MultiFactorAuthAssertionFormComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-form">MFA Assertion Form</div>',
      },
    });

    await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    expect(screen.getByTestId("mfa-assertion-form")).toBeInTheDocument();
    expect(screen.queryByTestId("policies")).not.toBeInTheDocument();
  });

  it("does not render Policies component when MFA resolver exists", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: { hints: [] },
      });
    });

    // Override the real component with our mock
    TestBed.overrideComponent(MultiFactorAuthAssertionFormComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-form">MFA Assertion Form</div>',
      },
    });

    await render(TestHostWithContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MockMultiFactorAuthAssertionFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    expect(screen.queryByTestId("policies")).not.toBeInTheDocument();
    expect(screen.getByTestId("mfa-assertion-form")).toBeInTheDocument();
  });
});
