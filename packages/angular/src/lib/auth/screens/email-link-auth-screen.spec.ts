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

import { render, screen, fireEvent } from "@testing-library/angular";
import { Component, EventEmitter } from "@angular/core";
import { Subject } from "rxjs";
import { User } from "@angular/fire/auth";

import { EmailLinkAuthScreenComponent } from "./email-link-auth-screen";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";

@Component({
  selector: "fui-email-link-auth-form",
  template: '<button class="fui-form__action fui-button">labels.sendSignInLink</button>',
  standalone: true,
})
class MockEmailLinkAuthFormComponent {}

@Component({
  selector: "fui-redirect-error",
  template: '<div data-testid="redirect-error">Redirect Error</div>',
  standalone: true,
})
class MockRedirectErrorComponent {}

@Component({
  selector: "fui-multi-factor-auth-assertion-screen",
  template: `
    <div data-testid="mfa-assertion-screen">MFA Assertion Screen</div>
    <button data-testid="mfa-on-success" (click)="onSuccess.emit({ user: { uid: 'mfa-user' } })">
      Trigger MFA Success
    </button>
  `,
  standalone: true,
  outputs: ["onSuccess"],
})
class MockMultiFactorAuthAssertionScreenComponent {
  onSuccess = new EventEmitter<any>();
}

@Component({
  template: `
    <fui-email-link-auth-screen>
      <div data-testid="projected-content">Test Content</div>
    </fui-email-link-auth-screen>
  `,
  standalone: true,
  imports: [EmailLinkAuthScreenComponent],
})
class TestHostWithContentComponent {}

@Component({
  template: `<fui-email-link-auth-screen></fui-email-link-auth-screen>`,
  standalone: true,
  imports: [EmailLinkAuthScreenComponent],
})
class TestHostWithoutContentComponent {}

describe("<fui-email-link-auth-screen>", () => {
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

    injectUI.mockImplementation(() => () => ({
      multiFactorResolver: null,
      setMultiFactorResolver: jest.fn(),
    }));
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
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockRedirectErrorComponent,
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

  it("includes the EmailLinkAuthForm component", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = screen.getByRole("button", { name: "labels.sendSignInLink" });
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass("fui-form__action", "fui-button");
  });

  it("renders projected content when provided", async () => {
    await render(TestHostWithContentComponent, {
      imports: [
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
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

  it("renders RedirectError component in children section", async () => {
    const { container } = await render(TestHostWithContentComponent, {
      imports: [
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockRedirectErrorComponent,
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
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
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
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
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

  it("renders MFA assertion form when MFA resolver is present", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => () => ({
      multiFactorResolver: { auth: {}, session: null, hints: [] },
      setMultiFactorResolver: jest.fn(),
    }));

    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockMultiFactorAuthAssertionScreenComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    // Check for the MFA screen element by its selector
    expect(container.querySelector("fui-multi-factor-auth-assertion-screen")).toBeInTheDocument();
  });

  it("emits signIn when MFA flow succeeds and user authenticates", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => () => ({
      multiFactorResolver: { auth: {}, session: null, hints: [] },
      setMultiFactorResolver: jest.fn(),
    }));

    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockMultiFactorAuthAssertionScreenComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-email-link-auth-screen").componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

    // Simulate user authenticating after MFA flow succeeds
    const mockUser = {
      uid: "mfa-user",
      email: "email-link@example.com",
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
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-email-link-auth-screen").componentInstance;
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
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-email-link-auth-screen").componentInstance;
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
        EmailLinkAuthScreenComponent,
        MockEmailLinkAuthFormComponent,
        MockRedirectErrorComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query((el) => el.name === "fui-email-link-auth-screen").componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

    // Emit null (no user) through the authState observable
    authStateSubject.next(null);

    // Wait for Angular's change detection and effect to run
    fixture.detectChanges();
    await fixture.whenStable();

    expect(signInSpy).not.toHaveBeenCalled();
  });
});
