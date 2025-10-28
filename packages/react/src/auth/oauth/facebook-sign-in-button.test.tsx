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
import { FacebookLogo, FacebookSignInButton } from "./facebook-sign-in-button";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";

vi.mock("firebase/auth", () => ({
  FacebookAuthProvider: class FacebookAuthProvider {
    constructor() {
      this.providerId = "facebook.com";
    }
    providerId: string;
  },
}));

afterEach(() => {
  cleanup();
});

describe("<FacebookSignInButton />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct provider", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithFacebook: "Sign in with Facebook",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <FacebookSignInButton />
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.getAttribute("data-provider")).toBe("facebook.com");
  });

  it("renders with custom provider when provided", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithFacebook: "Sign in with Facebook",
        },
      }),
    });

    const customProvider = new (class CustomFacebookProvider {
      providerId = "custom.facebook.com";
    })() as any;

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <FacebookSignInButton provider={customProvider} />
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.getAttribute("data-provider")).toBe("custom.facebook.com");
  });

  it("renders with the Facebook icon", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithFacebook: "Sign in with Facebook",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <FacebookSignInButton />
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
          signInWithFacebook: "Sign in with Facebook",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <FacebookSignInButton />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Sign in with Facebook")).toBeDefined();
  });

  it("renders with different translated text for different locales", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithFacebook: "Iniciar sesión con Facebook",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <FacebookSignInButton />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Iniciar sesión con Facebook")).toBeDefined();
  });

  it("renders as a button with correct classes", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signInWithFacebook: "Sign in with Facebook",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <FacebookSignInButton />
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("fui-provider__button");
    expect(button.getAttribute("type")).toBe("button");
  });
});

describe("<FacebookLogo />", () => {
  it("renders as an SVG element", () => {
    const { container } = render(<FacebookLogo />);
    const svg = container.querySelector("svg");

    expect(svg).toBeDefined();
    expect(svg?.tagName.toLowerCase()).toBe("svg");
  });

  it("has the correct CSS class", () => {
    const { container } = render(<FacebookLogo />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveClass("fui-provider__icon");
  });

  it("forwards custom SVG props", () => {
    const { container } = render(<FacebookLogo data-testid="custom-svg" className="foo" width={32} />);
    const svg = container.querySelector('svg[data-testid="custom-svg"]');

    expect(svg).toBeDefined();
    expect(svg!.getAttribute("width")).toBe("32");
    expect(svg).toHaveClass("fui-provider__icon");
    expect(svg).toHaveClass("foo");
  });
});
