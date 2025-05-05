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

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { PasswordResetScreen } from "~/auth/screens/password-reset-screen";
import * as hooks from "~/hooks";

// Mock the hooks
vi.mock("~/hooks", () => ({
  useUI: vi.fn(() => ({
    locale: "en-US",
    translations: {
      "en-US": {
        labels: {
          resetPassword: "Reset Password",
        },
        prompts: {
          enterEmailToReset: "Enter your email to reset your password",
        },
      },
    },
  })),
}));

// Mock the ForgotPasswordForm component
vi.mock("~/auth/forms/forgot-password-form", () => ({
  ForgotPasswordForm: ({
    onBackToSignInClick,
  }: {
    onBackToSignInClick?: () => void;
  }) => (
    <div data-testid="forgot-password-form">
      <button onClick={onBackToSignInClick} data-testid="back-button">
        Back to Sign In
      </button>
    </div>
  ),
}));

describe("PasswordResetScreen", () => {
  const mockOnBackToSignInClick = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct title and subtitle", () => {
    const { getByText } = render(<PasswordResetScreen />);

    expect(getByText("Reset Password")).toBeInTheDocument();
    expect(
      getByText("Enter your email to reset your password")
    ).toBeInTheDocument();
  });

  it("calls useUI to get the locale", () => {
    render(<PasswordResetScreen />);

    expect(hooks.useUI).toHaveBeenCalled();
  });

  it("includes the ForgotPasswordForm component", () => {
    const { getByTestId } = render(<PasswordResetScreen />);

    expect(getByTestId("forgot-password-form")).toBeInTheDocument();
  });

  it("passes onBackToSignInClick to ForgotPasswordForm", () => {
    const { getByTestId } = render(
      <PasswordResetScreen onBackToSignInClick={mockOnBackToSignInClick} />
    );

    // Click the back button in the mocked form
    fireEvent.click(getByTestId("back-button"));

    // Verify the callback was called
    expect(mockOnBackToSignInClick).toHaveBeenCalledTimes(1);
  });
});
