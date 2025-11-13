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
import { Subject } from "rxjs";
import { User } from "@angular/fire/auth";

import { PhoneAuthScreenComponent } from "./phone-auth-screen";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";
import { MultiFactorAuthAssertionScreenComponent } from "../screens/multi-factor-auth-assertion-screen";
import { MultiFactorAuthAssertionFormComponent } from "../forms/multi-factor-auth-assertion-form";
import { TotpMultiFactorAssertionFormComponent } from "../forms/mfa/totp-multi-factor-assertion-form";
import { TotpMultiFactorGenerator } from "firebase/auth";

@Component({
  selector: "fui-phone-auth-form",
  template: '<div class="fui-form">Phone Auth Form</div>',
  standalone: true,
})
class MockPhoneAuthFormComponent {}

@Component({
  selector: "fui-redirect-error",
  template: '<div data-testid="redirect-error">Redirect Error</div>',
  standalone: true,
})
class MockRedirectErrorComponent {}

@Component({
  template: `
    <fui-phone-auth-screen>
      <div data-testid="projected-content">Test Content</div>
    </fui-phone-auth-screen>
  `,
  standalone: true,
  imports: [PhoneAuthScreenComponent],
})
class TestHostWithContentComponent {}

@Component({
  template: `<fui-phone-auth-screen></fui-phone-auth-screen>`,
  standalone: true,
  imports: [PhoneAuthScreenComponent],
})
class TestHostWithoutContentComponent {}

describe("<fui-phone-auth-screen>", () => {
  let authStateSubject: Subject<User | null>;
  let userAuthenticatedCallback: ((user: User) => void) | null = null;

  beforeEach(() => {
    authStateSubject = new Subject<User | null>();
    
    const { injectTranslation, injectUI, injectUserAuthenticated } = require("../../../provider");
    
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
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("includes the PhoneAuthForm component", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = document.querySelector(".fui-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass("fui-form");
  });

  it("renders projected content when provided", async () => {
    await render(TestHostWithContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
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
    const { container } = await render(TestHostWithContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const redirectErrorElement = container.querySelector("fui-redirect-error");
    expect(redirectErrorElement).toBeInTheDocument();
  });

  it("has correct CSS classes", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
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
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
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
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByTestId("mfa-assertion-screen")).toBeInTheDocument();
    expect(screen.queryByText("Phone Auth Form")).not.toBeInTheDocument();
  });

  it("does not render PhoneAuthForm when MFA resolver exists", async () => {
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
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.queryByText("Phone Auth Form")).not.toBeInTheDocument();
    expect(screen.getByTestId("mfa-assertion-screen")).toBeInTheDocument();
  });

  it("emits signIn when MFA flow succeeds and user authenticates", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: {
          auth: {},
          session: null,
          hints: [{ factorId: TotpMultiFactorGenerator.FACTOR_ID, uid: "test" }],
        },
      });
    });

    TestBed.overrideComponent(MultiFactorAuthAssertionScreenComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-screen">MFA Assertion Screen</div>',
      },
    });

    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-phone-auth-screen").componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

    // Simulate user authenticating after MFA flow succeeds
    const mockUser = {
      uid: "angular-phone-mfa-user",
      email: "phone@example.com",
      isAnonymous: false,
    } as User;

    // Emit the user through the authState observable (simulating auth state change after MFA)
    authStateSubject.next(mockUser);

    // Wait for Angular's change detection and effect to run
    fixture.detectChanges();
    await fixture.whenStable();

    expect(signInSpy).toHaveBeenCalledTimes(1);
    expect(signInSpy).toHaveBeenCalledWith(mockUser);
  });

  it("emits signIn when a non-anonymous user authenticates", async () => {
    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-phone-auth-screen").componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

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

    expect(signInSpy).toHaveBeenCalledTimes(1);
    expect(signInSpy).toHaveBeenCalledWith(mockUser);
  });

  it("does not emit signIn for anonymous users", async () => {
    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-phone-auth-screen").componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

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

    expect(signInSpy).not.toHaveBeenCalled();
  });

  it("does not emit signIn when user is null", async () => {
    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        PhoneAuthScreenComponent,
        MockPhoneAuthFormComponent,
        MockRedirectErrorComponent,
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-phone-auth-screen").componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

    // Emit null (no user) through the authState observable
    authStateSubject.next(null);

    // Wait for Angular's change detection and effect to run
    fixture.detectChanges();
    await fixture.whenStable();

    expect(signInSpy).not.toHaveBeenCalled();
  });
});
