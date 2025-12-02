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

import { render } from "@testing-library/angular";
import { Component } from "@angular/core";

import { PoliciesComponent } from "./policies";

jest.mock("../../provider", () => ({
  injectUI: jest.fn(),
  injectPolicies: jest.fn(),
  injectTranslation: jest.fn(),
}));

@Component({
  template: `<fui-policies></fui-policies>`,
  standalone: true,
  imports: [PoliciesComponent],
  providers: [
    {
      provide: "FIREBASE_UI_STORE",
      useValue: {
        get: () => ({}),
        subscribe: (callback: any) => callback({}),
      },
    },
    {
      provide: "FIREBASE_UI_POLICIES",
      useValue: {
        termsOfServiceUrl: "https://example.com/terms",
        privacyPolicyUrl: "https://example.com/privacy",
      },
    },
  ],
})
class TestPoliciesWithBothUrlsHostComponent {}

@Component({
  template: `<fui-policies></fui-policies>`,
  standalone: true,
  imports: [PoliciesComponent],
  providers: [
    {
      provide: "FIREBASE_UI_STORE",
      useValue: {
        get: () => ({}),
        subscribe: (callback: any) => callback({}),
      },
    },
    {
      provide: "FIREBASE_UI_POLICIES",
      useValue: null,
    },
  ],
})
class TestPoliciesWithNoUrlsHostComponent {}

@Component({
  template: `<fui-policies></fui-policies>`,
  standalone: true,
  imports: [PoliciesComponent],
  providers: [
    {
      provide: "FIREBASE_UI_STORE",
      useValue: {
        get: () => ({}),
        subscribe: (callback: any) => callback({}),
      },
    },
    {
      provide: "FIREBASE_UI_POLICIES",
      useValue: {
        termsOfServiceUrl: "https://example.com/terms",
        privacyPolicyUrl: null,
      },
    },
  ],
})
class TestPoliciesWithTosOnlyHostComponent {}

@Component({
  template: `<fui-policies></fui-policies>`,
  standalone: true,
  imports: [PoliciesComponent],
  providers: [
    {
      provide: "FIREBASE_UI_STORE",
      useValue: {
        get: () => ({}),
        subscribe: (callback: any) => callback({}),
      },
    },
    {
      provide: "FIREBASE_UI_POLICIES",
      useValue: {
        termsOfServiceUrl: null,
        privacyPolicyUrl: "https://example.com/privacy",
      },
    },
  ],
})
class TestPoliciesWithPrivacyOnlyHostComponent {}

@Component({
  template: `<fui-policies></fui-policies>`,
  standalone: true,
  imports: [PoliciesComponent],
  providers: [
    {
      provide: "FIREBASE_UI_STORE",
      useValue: {
        get: () => ({}),
        subscribe: (callback: any) => callback({}),
      },
    },
    {
      provide: "FIREBASE_UI_POLICIES",
      useValue: {
        termsOfServiceUrl: "https://example.com/terms",
        privacyPolicyUrl: "https://example.com/privacy",
      },
    },
  ],
})
class TestPoliciesWithCustomTemplateHostComponent {}

describe("<fui-policies>", () => {
  beforeEach(() => {
    const { injectUI, injectPolicies, injectTranslation } = require("../../provider");

    injectUI.mockReturnValue(() => ({}));
    injectPolicies.mockReturnValue({
      termsOfServiceUrl: "https://example.com/terms",
      privacyPolicyUrl: "https://example.com/privacy",
    });
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          termsOfService: "Terms of Service",
          privacyPolicy: "Privacy Policy",
        },
        messages: {
          termsAndPrivacy: "By continuing, you agree to our {tos} and {privacy}",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders component with terms and privacy links", async () => {
    const { container } = await render(TestPoliciesWithBothUrlsHostComponent);

    const policiesContainer = container.querySelector(".fui-policies");
    expect(policiesContainer).toBeTruthy();
    expect(policiesContainer).toHaveClass("fui-policies");

    const tosLink = container.querySelector('a[href="https://example.com/terms"]');
    expect(tosLink).toBeTruthy();
    expect(tosLink?.tagName).toBe("A");
    expect(tosLink).toHaveAttribute("target", "_blank");
    expect(tosLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(tosLink).toHaveTextContent("Terms of Service");

    const privacyLink = container.querySelector('a[href="https://example.com/privacy"]');
    expect(privacyLink).toBeTruthy();
    expect(privacyLink?.tagName).toBe("A");
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(privacyLink).toHaveTextContent("Privacy Policy");

    const textContent = policiesContainer?.textContent;
    expect(textContent).toContain("By continuing, you agree to our");
  });

  it("does not render when both tosUrl and privacyPolicyUrl are not provided", async () => {
    const { injectPolicies } = require("../../provider");
    injectPolicies.mockReturnValue(null);

    const { container } = await render(TestPoliciesWithNoUrlsHostComponent);

    const policiesContainer = container.querySelector(".fui-policies");
    // Host element is always rendered, but should be hidden and have no content
    expect(policiesContainer).toBeTruthy();
    expect(policiesContainer).toHaveClass("fui-policies");
    expect(policiesContainer).toHaveStyle({ display: "none" });
    expect(policiesContainer?.textContent?.trim()).toBe("");
    expect(policiesContainer?.querySelectorAll("a").length).toBe(0);
  });

  it("renders with tosUrl when privacyPolicyUrl is not provided", async () => {
    const { injectPolicies } = require("../../provider");
    injectPolicies.mockReturnValue({
      termsOfServiceUrl: "https://example.com/terms",
      privacyPolicyUrl: null,
    });

    const { container } = await render(TestPoliciesWithTosOnlyHostComponent);

    const policiesContainer = container.querySelector(".fui-policies");
    expect(policiesContainer).toBeTruthy();
    expect(policiesContainer).toHaveClass("fui-policies");

    const tosLink = container.querySelector('a[href="https://example.com/terms"]');
    expect(tosLink).toBeTruthy();
    expect(tosLink).toHaveTextContent("Terms of Service");

    const privacyLink = container.querySelector('a[href="https://example.com/privacy"]');
    expect(privacyLink).toBeFalsy();
  });

  it("renders with privacyPolicyUrl when tosUrl is not provided", async () => {
    const { injectPolicies } = require("../../provider");
    injectPolicies.mockReturnValue({
      termsOfServiceUrl: null,
      privacyPolicyUrl: "https://example.com/privacy",
    });

    const { container } = await render(TestPoliciesWithPrivacyOnlyHostComponent);

    const policiesContainer = container.querySelector(".fui-policies");
    expect(policiesContainer).toBeTruthy();
    expect(policiesContainer).toHaveClass("fui-policies");

    const tosLink = container.querySelector('a[href="https://example.com/terms"]');
    expect(tosLink).toBeFalsy();

    const privacyLink = container.querySelector('a[href="https://example.com/privacy"]');
    expect(privacyLink).toBeTruthy();
    expect(privacyLink).toHaveTextContent("Privacy Policy");
  });

  it("uses custom template text when provided", async () => {
    const { injectTranslation } = require("../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          termsOfService: "Terms of Service",
          privacyPolicy: "Privacy Policy",
        },
        messages: {
          termsAndPrivacy: "Custom template with {tos} and {privacy}",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    const { container } = await render(TestPoliciesWithCustomTemplateHostComponent);

    const policiesContainer = container.querySelector(".fui-policies");
    expect(policiesContainer).toBeTruthy();
    expect(policiesContainer).toHaveClass("fui-policies");

    const textContent = policiesContainer?.textContent;
    expect(textContent).toContain("Custom template with");
    expect(textContent).toContain("Terms of Service");
    expect(textContent).toContain("Privacy Policy");
  });
});
