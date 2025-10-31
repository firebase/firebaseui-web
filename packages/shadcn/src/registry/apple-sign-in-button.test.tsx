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
import { AppleSignInButton } from "./apple-sign-in-button";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import { OAuthProvider } from "firebase/auth";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";

vi.mock("./oauth-button", () => ({
  OAuthButton: ({ provider, children, themed }: any) => (
    <div data-testid="oauth-button">
      <div data-testid="provider-id">{provider.providerId}</div>
      <div data-testid="themed">{String(themed)}</div>
      <div data-testid="children">{children}</div>
    </div>
  ),
}));

vi.mock("@firebase-oss/ui-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-oss/ui-react")>();
  return {
    ...mod,
    AppleLogo: ({ className, ...props }: any) => (
      <svg data-testid="apple-logo" className={className} {...props}>
        <title>Apple Logo</title>
      </svg>
    ),
  };
});

afterEach(() => {
  cleanup();
});

describe("<AppleSignInButton />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default Apple provider", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithApple: "Sign in with Apple",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <AppleSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("apple.com");
    expect(screen.getByTestId("apple-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Apple")).toBeInTheDocument();
  });

  it("renders with custom Apple provider", () => {
    const customProvider = new OAuthProvider("apple.com");
    customProvider.addScope("email");
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithApple: "Sign in with Apple",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <AppleSignInButton provider={customProvider} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("apple.com");
    expect(screen.getByTestId("apple-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Apple")).toBeInTheDocument();
  });

  it("passes themed prop to OAuthButton", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithApple: "Sign in with Apple",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <AppleSignInButton themed />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).toHaveTextContent("true");
  });

  it("renders Apple logo with correct props", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithApple: "Sign in with Apple",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <AppleSignInButton />
      </FirebaseUIProvider>
    );

    const appleLogo = screen.getByTestId("apple-logo");
    expect(appleLogo).toBeInTheDocument();
  });

  it("uses correct translation for button text", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithApple: "Custom Apple Sign In Text",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <AppleSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Custom Apple Sign In Text")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithApple: "Sign in with Apple",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <AppleSignInButton />
      </FirebaseUIProvider>
    );

    const childrenContainer = screen.getByTestId("children");
    expect(childrenContainer).toBeInTheDocument();

    // Should contain both the Apple logo and the text
    expect(childrenContainer.querySelector('[data-testid="apple-logo"]')).toBeInTheDocument();
    expect(childrenContainer).toHaveTextContent("Sign in with Apple");
  });

  it("handles missing themed prop", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithApple: "Sign in with Apple",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <AppleSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).not.toHaveTextContent("true");
  });
});
