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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EmailLinkAuthScreen } from "./email-link-auth-screen";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";

vi.mock("./email-link-auth-form", () => ({
  EmailLinkAuthForm: ({ onEmailSent, onSignIn }: any) => (
    <div data-testid="email-link-auth-form">
      <div>EmailLinkAuthForm</div>
      {onEmailSent && <div data-testid="onEmailSent-prop">onEmailSent provided</div>}
      {onSignIn && <div data-testid="onSignIn-prop">onSignIn provided</div>}
    </div>
  ),
}));

describe("<EmailLinkAuthScreen />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the screen correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signIn: "Sign In",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByTestId("email-link-auth-form")).toBeInTheDocument();
  });

  it("should render with children", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signIn: "Sign In",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
        messages: {
          dividerOr: "or",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthScreen>
          <div data-testid="child-component">Child Component</div>
        </EmailLinkAuthScreen>
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByTestId("email-link-auth-form")).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.getByTestId("child-component")).toBeInTheDocument();
  });

  it("should pass props to EmailLinkAuthForm", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signIn: "Sign In",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
      }),
    });

    const onEmailSentMock = vi.fn();
    const onSignInMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthScreen onEmailSent={onEmailSentMock} onSignIn={onSignInMock} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("onEmailSent-prop")).toBeInTheDocument();
    expect(screen.getByTestId("onSignIn-prop")).toBeInTheDocument();
  });

  it("should not render separator when no children", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signIn: "Sign In",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
        messages: {
          dividerOr: "or",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByTestId("email-link-auth-form")).toBeInTheDocument();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
  });
});
