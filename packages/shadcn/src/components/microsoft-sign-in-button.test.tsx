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

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MicrosoftSignInButton } from "./microsoft-sign-in-button";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import { OAuthProvider } from "firebase/auth";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";

vi.mock("./oauth-button", () => ({
  OAuthButton: ({ provider, children, themed, onSignIn }: any) => (
    <div data-testid="oauth-button">
      <div data-testid="provider-id">{provider.providerId}</div>
      <div data-testid="themed">{String(themed)}</div>
      <div data-testid="onSignIn">{onSignIn ? "present" : "absent"}</div>
      <div data-testid="children">{children}</div>
    </div>
  ),
}));

vi.mock("@firebase-oss/ui-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-oss/ui-react")>();
  return {
    ...mod,
    MicrosoftLogo: ({ className, ...props }: any) => (
      <svg data-testid="microsoft-logo" className={className} {...props}>
        <title>Microsoft Logo</title>
      </svg>
    ),
  };
});

afterEach(() => {
  cleanup();
});

describe("<MicrosoftSignInButton />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default Microsoft provider", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Sign in with Microsoft",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("microsoft.com");
    expect(screen.getByTestId("microsoft-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Microsoft")).toBeInTheDocument();
  });

  it("renders with custom Microsoft provider", () => {
    const customProvider = new OAuthProvider("microsoft.com");
    customProvider.addScope("email");
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Sign in with Microsoft",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton provider={customProvider} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("microsoft.com");
    expect(screen.getByTestId("microsoft-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Microsoft")).toBeInTheDocument();
  });

  it("passes themed prop to OAuthButton", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Sign in with Microsoft",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton themed />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).toHaveTextContent("true");
  });

  it("renders Microsoft logo with correct props", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Sign in with Microsoft",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton />
      </FirebaseUIProvider>
    );

    const microsoftLogo = screen.getByTestId("microsoft-logo");
    expect(microsoftLogo).toBeInTheDocument();
  });

  it("uses correct translation for button text", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Custom Microsoft Sign In Text",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Custom Microsoft Sign In Text")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Sign in with Microsoft",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton />
      </FirebaseUIProvider>
    );

    const childrenContainer = screen.getByTestId("children");
    expect(childrenContainer).toBeInTheDocument();

    // Should contain both the Microsoft logo and the text
    expect(childrenContainer.querySelector('[data-testid="microsoft-logo"]')).toBeInTheDocument();
    expect(childrenContainer).toHaveTextContent("Sign in with Microsoft");
  });

  it("handles missing themed prop", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Sign in with Microsoft",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).not.toHaveTextContent("true");
  });

  it("passes onSignIn prop to OAuthButton", () => {
    const onSignIn = vi.fn();
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithMicrosoft: "Sign in with Microsoft",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <MicrosoftSignInButton onSignIn={onSignIn} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("onSignIn")).toHaveTextContent("present");
  });
});
