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
import { GitHubSignInButton } from "./github-sign-in-button";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { GithubAuthProvider } from "firebase/auth";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";

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

vi.mock("@invertase/firebaseui-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-react")>();
  return {
    ...mod,
    GitHubLogo: ({ className, ...props }: any) => (
      <svg data-testid="github-logo" className={className} {...props}>
        <title>GitHub Logo</title>
      </svg>
    ),
  };
});

afterEach(() => {
  cleanup();
});

describe("<GitHubSignInButton />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default GitHub provider", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Sign in with GitHub",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("github.com");
    expect(screen.getByTestId("github-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
  });

  it("renders with custom GitHub provider", () => {
    const customProvider = new GithubAuthProvider();
    customProvider.addScope("user:email");
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Sign in with GitHub",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton provider={customProvider} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("oauth-button")).toBeInTheDocument();
    expect(screen.getByTestId("provider-id")).toHaveTextContent("github.com");
    expect(screen.getByTestId("github-logo")).toBeInTheDocument();
    expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
  });

  it("passes themed prop to OAuthButton", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Sign in with GitHub",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton themed />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).toHaveTextContent("true");
  });

  it("renders GitHub logo with correct props", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Sign in with GitHub",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton />
      </FirebaseUIProvider>
    );

    const githubLogo = screen.getByTestId("github-logo");
    expect(githubLogo).toBeInTheDocument();
  });

  it("uses correct translation for button text", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Custom GitHub Sign In Text",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Custom GitHub Sign In Text")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Sign in with GitHub",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton />
      </FirebaseUIProvider>
    );

    const childrenContainer = screen.getByTestId("children");
    expect(childrenContainer).toBeInTheDocument();

    // Should contain both the GitHub logo and the text
    expect(childrenContainer.querySelector('[data-testid="github-logo"]')).toBeInTheDocument();
    expect(childrenContainer).toHaveTextContent("Sign in with GitHub");
  });

  it("handles missing themed prop", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Sign in with GitHub",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("themed")).not.toHaveTextContent("true");
  });

  it("passes onSignIn prop to OAuthButton", () => {
    const onSignIn = vi.fn();
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGitHub: "Sign in with GitHub",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={ui}>
        <GitHubSignInButton onSignIn={onSignIn} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("onSignIn")).toHaveTextContent("present");
  });
});
