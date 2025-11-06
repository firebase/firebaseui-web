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
import { TwitterSignInButton } from "./twitter-sign-in-button";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { TwitterAuthProvider } from "firebase/auth";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";

vi.mock("./oauth-button", () => ({
  OAuthButton: ({ provider, children, themed }: any) => (
    <div data-testid="oauth-button">
      <div data-testid="provider-id">{provider.providerId}</div>
      <div data-testid="themed">{String(themed)}</div>
      <div data-testid="children">{children}</div>
    </div>
  ),
}));

vi.mock("@invertase/firebaseui-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-react")>();
  return {
    ...mod,
    TwitterLogo: ({ className, ...props }: any) => (
      <svg data-testid="twitter-logo" className={className} {...props}>
        <title>Twitter Logo</title>
      </svg>
    ),
  };
});

afterEach(() => {
  cleanup();
});

describe("<TwitterSignInButton />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default Twitter provider", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithTwitter: "Sign in with Twitter",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <TwitterSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("twitter.com");
    expect(screen.getByTestId("twitter-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Twitter")).toBeInTheDocument();
  });

  it("renders with custom Twitter provider", () => {
    const customProvider = new TwitterAuthProvider();
    customProvider.addScope("email");
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithTwitter: "Sign in with Twitter",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <TwitterSignInButton provider={customProvider} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("twitter.com");
    expect(screen.getByTestId("twitter-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Twitter")).toBeInTheDocument();
  });

  it("passes themed prop to OAuthButton", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithTwitter: "Sign in with Twitter",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <TwitterSignInButton themed />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).toHaveTextContent("true");
  });

  it("renders Twitter logo with correct props", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithTwitter: "Sign in with Twitter",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <TwitterSignInButton />
      </FirebaseUIProvider>
    );

    const twitterLogo = screen.getByTestId("twitter-logo");
    expect(twitterLogo).toBeInTheDocument();
  });

  it("uses correct translation for button text", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithTwitter: "Custom Twitter Sign In Text",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <TwitterSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Custom Twitter Sign In Text")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithTwitter: "Sign in with Twitter",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <TwitterSignInButton />
      </FirebaseUIProvider>
    );

    const childrenContainer = screen.getByTestId("children");
    expect(childrenContainer).toBeInTheDocument();

    // Should contain both the Twitter logo and the text
    expect(childrenContainer.querySelector('[data-testid="twitter-logo"]')).toBeInTheDocument();
    expect(childrenContainer).toHaveTextContent("Sign in with Twitter");
  });

  it("handles missing themed prop", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithTwitter: "Sign in with Twitter",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <TwitterSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).not.toHaveTextContent("true");
  });
});
