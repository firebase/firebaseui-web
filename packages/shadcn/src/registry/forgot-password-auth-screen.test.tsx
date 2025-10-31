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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ForgotPasswordAuthScreen } from "./forgot-password-auth-screen";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";

vi.mock("./forgot-password-auth-form", () => ({
  ForgotPasswordAuthForm: ({ onPasswordSent, onBackToSignInClick }: any) => (
    <div data-testid="forgot-password-auth-form">
      <div>ForgotPasswordAuthForm</div>
      {onPasswordSent && <div data-testid="onPasswordSent-prop">onPasswordSent provided</div>}
      {onBackToSignInClick && <div data-testid="onBackToSignInClick-prop">onBackToSignInClick provided</div>}
    </div>
  ),
}));

describe("<ForgotPasswordAuthScreen />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the screen correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          resetPassword: "Reset Password",
        },
        prompts: {
          enterEmailToReset: "Enter your email to reset your password",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(screen.getByText("Enter your email to reset your password")).toBeInTheDocument();
    expect(screen.getByTestId("forgot-password-auth-form")).toBeInTheDocument();
  });

  it("should pass props to ForgotPasswordAuthForm", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          resetPassword: "Reset Password",
        },
        prompts: {
          enterEmailToReset: "Enter your email to reset your password",
        },
      }),
    });

    const onPasswordSentMock = vi.fn();
    const onBackToSignInClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthScreen onPasswordSent={onPasswordSentMock} onBackToSignInClick={onBackToSignInClickMock} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("onPasswordSent-prop")).toBeInTheDocument();
    expect(screen.getByTestId("onBackToSignInClick-prop")).toBeInTheDocument();
  });
});
