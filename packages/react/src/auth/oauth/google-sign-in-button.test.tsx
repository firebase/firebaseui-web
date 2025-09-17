/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
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
import { GoogleIcon, GoogleSignInButton } from "./google-sign-in-button";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { ComponentProps } from "react";

// Mock the OAuthButton component
vi.mock("./oauth-button", () => ({
  OAuthButton: ({ children, provider }: ComponentProps<"div"> & { provider: any }) => (
    <div data-testid="oauth-button" data-provider={provider?.constructor?.name || "GoogleAuthProvider"}>
      {children}
    </div>
  ),
}));

// Mock the GoogleAuthProvider
vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: class GoogleAuthProvider {
    constructor() {
      // Empty constructor
    }
  },
}));

afterEach(() => {
  cleanup();
});

describe("<GoogleSignInButton />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct provider", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </CreateFirebaseUIProvider>
    );

    const oauthButton = screen.getByTestId("oauth-button");
    expect(oauthButton).toBeDefined();
    expect(oauthButton.getAttribute("data-provider")).toBe("GoogleAuthProvider");
  });

  it("renders with custom provider when provided", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    const customProvider = new (class CustomGoogleProvider {
      constructor() {
        // Empty constructor
      }
    })();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <GoogleSignInButton provider={customProvider as any} />
      </CreateFirebaseUIProvider>
    );

    const oauthButton = screen.getByTestId("oauth-button");
    expect(oauthButton).toBeDefined();
    expect(oauthButton.getAttribute("data-provider")).toBe("CustomGoogleProvider");
  });

  it("renders with the Google icon", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </CreateFirebaseUIProvider>
    );

    const svg = document.querySelector(".fui-provider__icon");
    expect(svg).toBeDefined();
    expect(svg).toHaveClass("fui-provider__icon");
    expect(svg?.tagName.toLowerCase()).toBe("svg");
  });

  it("renders with the correct translated text", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Sign in with Google")).toBeDefined();
  });

  it("renders with different translated text for different locales", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Iniciar sesión con Google",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Iniciar sesión con Google")).toBeDefined();
  });

  it("passes children to OAuthButton", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithGoogle: "Sign in with Google",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <GoogleSignInButton />
      </CreateFirebaseUIProvider>
    );

    const oauthButton = screen.getByTestId("oauth-button");
    expect(oauthButton).toBeDefined();
    
    const svg = oauthButton.querySelector(".fui-provider__icon");
    const text = oauthButton.querySelector("span");
    
    expect(svg).toBeDefined();
    expect(text).toBeDefined();
    expect(text?.textContent).toBe("Sign in with Google");
  });
});

describe("<GoogleIcon />", () => {
  it("renders as an SVG element", () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector("svg");
    
    expect(svg).toBeDefined();
    expect(svg?.tagName.toLowerCase()).toBe("svg");
  });

  it("has the correct CSS class", () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector("svg");
    
    expect(svg).toHaveClass("fui-provider__icon");
  });

  it("has the correct viewBox attribute", () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector("svg");
    
    expect(svg?.getAttribute("viewBox")).toBe("0 0 48 48");
  });
});