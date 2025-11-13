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
import { Component, EventEmitter } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { User } from "@angular/fire/auth";

import { OAuthScreenComponent } from "./oauth-screen";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";
import { MultiFactorAuthAssertionScreenComponent } from "../screens/multi-factor-auth-assertion-screen";
import { MultiFactorAuthAssertionFormComponent } from "../forms/multi-factor-auth-assertion-form";
import { ContentComponent } from "../../components/content";

jest.mock("../../../provider", () => ({
  injectTranslation: jest.fn(),
  injectPolicies: jest.fn(),
  injectRedirectError: jest.fn(),
  injectUI: jest.fn(),
  injectUserAuthenticated: jest.fn(),
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

@Component({
  selector: "fui-multi-factor-auth-assertion-screen",
  template: '<div data-testid="mfa-assertion-screen">MFA Assertion Screen</div>',
  standalone: true,
  outputs: ["onSuccess"],
})
class MockMultiFactorAuthAssertionScreenComponent {
  onSuccess = new EventEmitter();
}

describe("<fui-oauth-screen>", () => {
  let authStateSubject: Subject<User | null>;
  let userAuthenticatedCallback: ((user: User) => void) | null = null;

  beforeEach(() => {
    authStateSubject = new Subject<User | null>();
    
    const { injectTranslation, injectPolicies, injectRedirectError, injectUI, injectUserAuthenticated } = require("../../../provider");
    
    // Mock injectUserAuthenticated to store the callback and set up subscription
    injectUserAuthenticated.mockImplementation((callback: (user: User) => void) => {
      userAuthenticatedCallback = callback;
      const subscription = authStateSubject.subscribe((user) => {
        if (user && !user.isAnonymous && userAuthenticatedCallback) {
          userAuthenticatedCallback(user);
        }
      });
      return subscription;
    });

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

  afterEach(() => {
    userAuthenticatedCallback = null;
    authStateSubject.complete();
    authStateSubject = new Subject<User | null>();
    jest.clearAllMocks();
  });

  it("renders with correct title and subtitle", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
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
        MultiFactorAuthAssertionScreenComponent,
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
        MultiFactorAuthAssertionScreenComponent,
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
        MultiFactorAuthAssertionScreenComponent,
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
        MultiFactorAuthAssertionScreenComponent,
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
        MultiFactorAuthAssertionScreenComponent,
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
        MultiFactorAuthAssertionScreenComponent,
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

  it("renders MFA assertion screen when multiFactorResolver is present", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: { auth: {}, session: null, hints: [] },
      });
    });

    TestBed.overrideComponent(MultiFactorAuthAssertionScreenComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-screen">MFA Assertion Screen</div>',
      },
    });

    await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    expect(screen.getByTestId("mfa-assertion-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("policies")).not.toBeInTheDocument();
  });

  it("does not render Policies component when MFA resolver exists", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: { auth: {}, session: null, hints: [] },
      });
    });

    TestBed.overrideComponent(MultiFactorAuthAssertionScreenComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-screen">MFA Assertion Screen</div>',
      },
    });

    await render(TestHostWithContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    expect(screen.queryByTestId("policies")).not.toBeInTheDocument();
    expect(screen.getByTestId("mfa-assertion-screen")).toBeInTheDocument();
  });

  it("emits onSignIn when MFA flow succeeds and user authenticates", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: { auth: {}, session: null, hints: [{ factorId: "totp", uid: "test" }] },
      });
    });

    TestBed.overrideComponent(MultiFactorAuthAssertionScreenComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-screen">MFA Assertion Screen</div>',
      },
    });

    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-oauth-screen").componentInstance;
    const onSignInSpy = jest.spyOn(component.onSignIn, "emit");

    // Simulate user authenticating after MFA flow succeeds
    const mockUser = {
      uid: "angular-oauth-mfa-user",
      email: "oauth@example.com",
      isAnonymous: false,
    } as User;

    // Emit the user through the authState observable (simulating auth state change after MFA)
    authStateSubject.next(mockUser);

    // Wait for Angular's change detection and effect to run
    fixture.detectChanges();
    await fixture.whenStable();

    expect(onSignInSpy).toHaveBeenCalledTimes(1);
    expect(onSignInSpy).toHaveBeenCalledWith(mockUser);
  });

  it("emits onSignIn when a non-anonymous user authenticates", async () => {
    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-oauth-screen").componentInstance;
    const onSignInSpy = jest.spyOn(component.onSignIn, "emit");

    // Simulate a user authenticating
    const mockUser = {
      uid: "test-user-123",
      email: "test@example.com",
      isAnonymous: false,
    } as User;

    // Emit the user through the authState observable
    authStateSubject.next(mockUser);

    // Wait for Angular's change detection and effect to run
    fixture.detectChanges();
    await fixture.whenStable();

    expect(onSignInSpy).toHaveBeenCalledTimes(1);
    expect(onSignInSpy).toHaveBeenCalledWith(mockUser);
  });

  it("does not emit onSignIn for anonymous users", async () => {
    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-oauth-screen").componentInstance;
    const onSignInSpy = jest.spyOn(component.onSignIn, "emit");

    // Simulate an anonymous user authenticating
    const mockAnonymousUser = {
      uid: "anonymous-user-123",
      isAnonymous: true,
    } as User;

    // Emit the anonymous user through the authState observable
    authStateSubject.next(mockAnonymousUser);

    // Wait for Angular's change detection and effect to run
    fixture.detectChanges();
    await fixture.whenStable();

    expect(onSignInSpy).not.toHaveBeenCalled();
  });

  it("does not emit onSignIn when user is null", async () => {
    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        OAuthScreenComponent,
        MockPoliciesComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
        ContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-oauth-screen").componentInstance;
    const onSignInSpy = jest.spyOn(component.onSignIn, "emit");

    // Emit null (no user) through the authState observable
    authStateSubject.next(null);

    // Wait for Angular's change detection and effect to run
    fixture.detectChanges();
    await fixture.whenStable();

    expect(onSignInSpy).not.toHaveBeenCalled();
  });
});
