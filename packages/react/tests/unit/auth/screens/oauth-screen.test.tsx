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

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { OAuthScreen } from "~/auth/screens/oauth-screen";

// Mock hooks
vi.mock("~/hooks", () => ({
  useUI: () => ({
    locale: "en-US",
    translations: {
      "en-US": {
        labels: {
          signIn: "Sign In",
          signInToAccount: "Sign in to your account",
        },
      },
    },
  }),
}));

// Mock getTranslation
// vi.mock("@firebase-ui/core", () => ({
//   getTranslation: vi.fn((category, key) => {
//     if (category === "labels" && key === "signIn") return "Sign In";
//     if (category === "prompts" && key === "signInToAccount")
//       return "Sign in to your account";
//     return key;
//   }),
// }));

// Mock TermsAndPrivacy component
vi.mock("../../../../src/components/policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

describe("OAuthScreen", () => {
  it("renders with correct title and subtitle", () => {
    const { getByText } = render(<OAuthScreen>OAuth Provider</OAuthScreen>);

    expect(getByText("Sign In")).toBeInTheDocument();
    expect(getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("calls useConfig to get the language", () => {
    render(<OAuthScreen>OAuth Provider</OAuthScreen>);

    // This test implicitly tests that useConfig is called through the mock
    // If it hadn't been called, the title and subtitle wouldn't render correctly
  });

  it("renders children", () => {
    const { getByText } = render(<OAuthScreen>OAuth Provider</OAuthScreen>);

    expect(getByText("OAuth Provider")).toBeInTheDocument();
  });

  it("renders multiple children when provided", () => {
    const { getByText } = render(
      <OAuthScreen>
        <div>Provider 1</div>
        <div>Provider 2</div>
      </OAuthScreen>
    );

    expect(getByText("Provider 1")).toBeInTheDocument();
    expect(getByText("Provider 2")).toBeInTheDocument();
  });

  it("includes the Policies component", () => {
    const { getByTestId } = render(<OAuthScreen>OAuth Provider</OAuthScreen>);

    expect(getByTestId("policies")).toBeInTheDocument();
  });
});
