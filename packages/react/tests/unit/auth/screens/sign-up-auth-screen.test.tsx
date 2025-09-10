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
import { SignUpAuthScreen } from "~/auth/screens/sign-up-auth-screen";

// Mock hooks
vi.mock("~/hooks", () => ({
  useUI: () => ({
    locale: "en-US",
    translations: {
      "en-US": {
        labels: {
          register: "Create Account",
          dividerOr: "OR",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
      },
    },
  }),
}));

// Mock translations
// vi.mock("@firebase-ui/core", () => ({
//   getTranslation: vi.fn((category, key) => {
//     if (category === "labels" && key === "register") return "Create Account";
//     if (category === "prompts" && key === "enterDetailsToCreate")
//       return "Enter your details to create an account";
//     if (category === "messages" && key === "dividerOr") return "OR";
//     return `${category}.${key}`;
//   }),
// }));

// Mock RegisterForm component
vi.mock("~/auth/forms/register-form", () => ({
  RegisterForm: ({
    onBackToSignInClick,
  }: {
    onBackToSignInClick?: () => void;
  }) => (
    <div data-testid="register-form">
      <button
        data-testid="back-to-sign-in-button"
        onClick={onBackToSignInClick}
      >
        Back to Sign In
      </button>
    </div>
  ),
}));

describe("SignUpAuthScreen", () => {
  it("renders the correct title and subtitle", () => {
    render(<SignUpAuthScreen />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your details to create an account")
    ).toBeInTheDocument();
  });

  it("includes the RegisterForm component", () => {
    render(<SignUpAuthScreen />);

    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("passes the onBackToSignInClick prop to the RegisterForm", async () => {
    const onBackToSignInClick = vi.fn();
    render(<SignUpAuthScreen onBackToSignInClick={onBackToSignInClick} />);

    const backButton = screen.getByTestId("back-to-sign-in-button");
    backButton.click();

    expect(onBackToSignInClick).toHaveBeenCalled();
  });

  it("renders children when provided", () => {
    render(
      <SignUpAuthScreen>
        <div data-testid="test-child">Child element</div>
      </SignUpAuthScreen>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("does not render divider or children container when no children are provided", () => {
    render(<SignUpAuthScreen />);

    expect(screen.queryByText("or")).not.toBeInTheDocument();
  });
});
