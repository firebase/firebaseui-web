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
import { TestBed } from "@angular/core/testing";
import { LegacySignInRecoveryComponent } from "./legacy-sign-in-recovery";
import { AppleSignInButtonComponent } from "../auth/oauth/apple-sign-in-button";
import { FacebookSignInButtonComponent } from "../auth/oauth/facebook-sign-in-button";
import { GitHubSignInButtonComponent } from "../auth/oauth/github-sign-in-button";
import { GoogleSignInButtonComponent } from "../auth/oauth/google-sign-in-button";
import { MicrosoftSignInButtonComponent } from "../auth/oauth/microsoft-sign-in-button";
import { TwitterSignInButtonComponent } from "../auth/oauth/twitter-sign-in-button";
import { YahooSignInButtonComponent } from "../auth/oauth/yahoo-sign-in-button";

jest.mock("@angular/fire/auth", () => {
  const actual = jest.requireActual("@angular/fire/auth");
  return {
    ...actual,
    GoogleAuthProvider: class GoogleAuthProvider {
      providerId = "google.com";
    },
    GithubAuthProvider: class GithubAuthProvider {
      providerId = "github.com";
    },
    FacebookAuthProvider: class FacebookAuthProvider {
      providerId = "facebook.com";
    },
    TwitterAuthProvider: class TwitterAuthProvider {
      providerId = "twitter.com";
    },
    OAuthProvider: class OAuthProvider {
      providerId: string;
      constructor(providerId: string) {
        this.providerId = providerId;
      }
    },
  };
});

jest.mock("../provider", () => ({
  injectClearLegacySignInRecovery: jest.fn(),
  injectLegacySignInRecovery: jest.fn(),
  injectTranslation: jest.fn(),
  injectUI: jest.fn(),
}));

@Component({
  template: `<fui-legacy-sign-in-recovery />`,
  standalone: true,
  imports: [LegacySignInRecoveryComponent],
})
class TestHostComponent {}

@Component({
  selector: "fui-google-sign-in-button",
  template: '<button type="button" (click)="signIn.emit({})">Sign in with Google</button>',
  standalone: true,
  outputs: ["signIn"],
})
class MockGoogleSignInButtonComponent {
  signIn = new EventEmitter();
}

@Component({
  selector: "fui-github-sign-in-button",
  template: '<button type="button" (click)="signIn.emit({})">Sign in with GitHub</button>',
  standalone: true,
  outputs: ["signIn"],
})
class MockGitHubSignInButtonComponent {
  signIn = new EventEmitter();
}

@Component({
  selector: "fui-facebook-sign-in-button",
  template: '<button type="button">Sign in with Facebook</button>',
  standalone: true,
})
class MockFacebookSignInButtonComponent {}

@Component({
  selector: "fui-apple-sign-in-button",
  template: '<button type="button">Sign in with Apple</button>',
  standalone: true,
})
class MockAppleSignInButtonComponent {}

@Component({
  selector: "fui-microsoft-sign-in-button",
  template: '<button type="button">Sign in with Microsoft</button>',
  standalone: true,
})
class MockMicrosoftSignInButtonComponent {}

@Component({
  selector: "fui-twitter-sign-in-button",
  template: '<button type="button">Sign in with X</button>',
  standalone: true,
})
class MockTwitterSignInButtonComponent {}

@Component({
  selector: "fui-yahoo-sign-in-button",
  template: '<button type="button">Sign in with Yahoo</button>',
  standalone: true,
})
class MockYahooSignInButtonComponent {}

describe("<fui-legacy-sign-in-recovery>", () => {
  beforeEach(() => {
    const {
      injectClearLegacySignInRecovery,
      injectLegacySignInRecovery,
      injectTranslation,
      injectUI,
    } = require("../provider");

    injectClearLegacySignInRecovery.mockReturnValue(jest.fn());
    injectLegacySignInRecovery.mockReturnValue(() => undefined);
    injectUI.mockReturnValue(() => ({
      locale: {
        locale: "en-US",
        translations: {
          messages: {
            legacySignInRecoveryPrompt: "You have previously signed in with a different method for {email}.",
          },
        },
      },
      state: "idle",
    }));
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          signInWithGoogle: "Sign in with Google",
          signInWithGitHub: "Sign in with GitHub",
          dismiss: "Dismiss",
        },
        messages: {
          legacySignInRecoveryPrompt: "You have previously signed in with a different method for {email}.",
          legacySignInRecoverySelectMethod: "Choose one of your previous sign-in methods to continue.",
          legacySignInRecoveryEmailPassword: "Use the email and password form to continue.",
          legacySignInRecoveryEmailLink: "Use your email link sign-in flow to continue.",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    TestBed.overrideComponent(LegacySignInRecoveryComponent, {
      remove: {
        imports: [
          AppleSignInButtonComponent,
          FacebookSignInButtonComponent,
          GitHubSignInButtonComponent,
          GoogleSignInButtonComponent,
          MicrosoftSignInButtonComponent,
          TwitterSignInButtonComponent,
          YahooSignInButtonComponent,
        ],
      },
      add: {
        imports: [
          MockAppleSignInButtonComponent,
          MockFacebookSignInButtonComponent,
          MockGitHubSignInButtonComponent,
          MockGoogleSignInButtonComponent,
          MockMicrosoftSignInButtonComponent,
          MockTwitterSignInButtonComponent,
          MockYahooSignInButtonComponent,
        ],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when there is no recovery state", async () => {
    const { container } = await render(TestHostComponent);

    expect(container.querySelector(".fui-legacy-sign-in-recovery")).toBeNull();
  });

  it("renders recovery copy and recognized provider buttons", async () => {
    const { injectLegacySignInRecovery } = require("../provider");
    injectLegacySignInRecovery.mockReturnValue(() => ({
      email: "test@example.com",
      signInMethods: ["google.com", "github.com", "password", "emailLink"],
    }));

    await render(TestHostComponent);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(
      screen.getByText("You have previously signed in with a different method for test@example.com.")
    ).toBeDefined();
    expect(screen.getByText("Choose one of your previous sign-in methods to continue.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign in with GitHub" })).toBeDefined();
    expect(screen.getByText("Use the email and password form to continue.")).toBeDefined();
    expect(screen.getByText("Use your email link sign-in flow to continue.")).toBeDefined();
  });

  it("clears recovery state when dismissed", async () => {
    const { injectLegacySignInRecovery, injectClearLegacySignInRecovery } = require("../provider");
    const clearRecovery = jest.fn();

    injectLegacySignInRecovery.mockReturnValue(() => ({
      email: "test@example.com",
      signInMethods: ["google.com"],
    }));
    injectClearLegacySignInRecovery.mockReturnValue(clearRecovery);

    await render(TestHostComponent);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(clearRecovery).toHaveBeenCalledTimes(1);
  });

  it("clears recovery state when the modal backdrop is clicked", async () => {
    const { injectLegacySignInRecovery, injectClearLegacySignInRecovery } = require("../provider");
    const clearRecovery = jest.fn();

    injectLegacySignInRecovery.mockReturnValue(() => ({
      email: "test@example.com",
      signInMethods: ["google.com"],
    }));
    injectClearLegacySignInRecovery.mockReturnValue(clearRecovery);

    await render(TestHostComponent);

    fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);

    expect(clearRecovery).toHaveBeenCalledTimes(1);
  });
});
