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

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoogleSignInButton } from "~/auth/oauth/google-sign-in-button";

// Mock hooks
vi.mock("~/hooks", () => ({
  useUI: () => ({
    locale: "en-US",
    translations: {
      "en-US": { labels: { signInWithGoogle: "foo bar" } },
    },
  }),
}));

// Mock the OAuthButton component
vi.mock("~/auth/oauth/oauth-button", () => ({
  OAuthButton: ({
    children,
    provider,
  }: {
    children: React.ReactNode;
    provider: any;
  }) => (
    <div data-testid="oauth-button" data-provider={provider.constructor.name}>
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

describe("GoogleSignInButton", () => {
  it("renders with the correct provider", () => {
    render(<GoogleSignInButton />);
    expect(screen.getByTestId("oauth-button")).toHaveAttribute(
      "data-provider",
      "GoogleAuthProvider"
    );
  });

  it("renders with the Google icon SVG", () => {
    render(<GoogleSignInButton />);
    const svg = document.querySelector(".fui-provider__icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("fui-provider__icon");
  });

  it("renders with the correct text", () => {
    render(<GoogleSignInButton />);
    expect(screen.getByText("foo bar")).toBeInTheDocument();
  });
});
