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
import { GoogleSignInButton } from "./google-sign-in-button";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { GoogleAuthProvider } from "firebase/auth";
import { FirebaseUIProvider } from "@firebase-ui/react";

vi.mock("./oauth-button", () => ({
  OAuthButton: ({ provider, children, themed }: any) => (
    <div data-testid="oauth-button">
      <div data-testid="provider-id">{provider.providerId}</div>
      <div data-testid="themed">{themed}</div>
      <div data-testid="children">{children}</div>
    </div>
  ),
}));

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    GoogleLogo: ({ className, ...props }: any) => (
      <svg data-testid="google-logo" className={className} {...props}>
        <title>Google Logo</title>
      </svg>
    ),
  };
});

afterEach(() => {
  cleanup();
});

describe("<GoogleSignInButton />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default Google provider", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("google.com");
    expect(screen.getByTestId("google-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("renders with custom Google provider", () => {
    const customProvider = new GoogleAuthProvider();
    customProvider.addScope("email");
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GoogleSignInButton provider={customProvider} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("google.com");
    expect(screen.getByTestId("google-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("passes themed prop to OAuthButton", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GoogleSignInButton themed="neutral" />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).toHaveTextContent("neutral");
  });

  it("renders Google logo with correct props", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </FirebaseUIProvider>
    );

    const googleLogo = screen.getByTestId("google-logo");
    expect(googleLogo).toBeInTheDocument();
  });

  it("uses correct translation for button text", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Custom Google Sign In Text",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Custom Google Sign In Text")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </FirebaseUIProvider>
    );

    const childrenContainer = screen.getByTestId("children");
    expect(childrenContainer).toBeInTheDocument();

    // Should contain both the Google logo and the text
    expect(childrenContainer.querySelector('[data-testid="google-logo"]')).toBeInTheDocument();
    expect(childrenContainer).toHaveTextContent("Sign in with Google");
  });

  it("handles missing themed prop", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).toHaveTextContent("");
  });
});
