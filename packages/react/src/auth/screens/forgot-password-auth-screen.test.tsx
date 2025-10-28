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

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ForgotPasswordAuthScreen } from "~/auth/screens/forgot-password-auth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";

vi.mock("~/auth/forms/forgot-password-auth-form", () => ({
  ForgotPasswordAuthForm: ({ onBackToSignInClick }: { onBackToSignInClick?: () => void }) => (
    <div data-testid="forgot-password-auth-form">
      <button onClick={onBackToSignInClick} data-testid="back-button">
        Back to Sign In
      </button>
    </div>
  ),
}));

describe("<ForgotPasswordAuthScreen />", () => {
  afterEach(() => {
    cleanup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct title and subtitle", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          resetPassword: "resetPassword",
        },
        prompts: {
          enterEmailToReset: "enterEmailToReset",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <ForgotPasswordAuthScreen />
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("resetPassword");
    expect(title).toBeDefined();
    expect(title.className).toContain("fui-card__title");

    const subtitle = screen.getByText("enterEmailToReset");
    expect(subtitle).toBeDefined();
    expect(subtitle.className).toContain("fui-card__subtitle");
  });

  it("renders the <ForgotPasswordAuthForm /> component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <ForgotPasswordAuthScreen />
      </CreateFirebaseUIProvider>
    );

    // Mocked so only has as test id
    expect(screen.getByTestId("forgot-password-auth-form")).toBeDefined();
  });

  it("passes onBackToSignInClick to ForgotPasswordAuthForm", () => {
    const mockOnBackToSignInClick = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <ForgotPasswordAuthScreen onBackToSignInClick={mockOnBackToSignInClick} />
      </CreateFirebaseUIProvider>
    );

    // Click the back button in the mocked form
    fireEvent.click(screen.getByTestId("back-button"));

    // Verify the callback was called
    expect(mockOnBackToSignInClick).toHaveBeenCalledTimes(1);
  });
});
