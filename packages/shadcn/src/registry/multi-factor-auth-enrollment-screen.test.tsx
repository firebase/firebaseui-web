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
import { MultiFactorAuthEnrollmentScreen } from "./multi-factor-auth-enrollment-screen";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";

vi.mock("./multi-factor-auth-enrollment-form", () => ({
  MultiFactorAuthEnrollmentForm: ({ onEnrollment }: { onEnrollment?: () => void }) => (
    <div data-testid="multi-factor-auth-enrollment-form">
      <div data-testid="form-props">{onEnrollment && <div data-testid="on-enrollment">onEnrollment</div>}</div>
    </div>
  ),
}));

describe("<MultiFactorAuthEnrollmentScreen />", () => {
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
          multiFactorEnrollment: "Multi-Factor Authentication Setup",
        },
        prompts: {
          mfaEnrollmentPrompt: "Set up an additional security method for your account",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthEnrollmentScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Multi-Factor Authentication Setup")).toBeInTheDocument();
    expect(screen.getByText("Set up an additional security method for your account")).toBeInTheDocument();
    expect(screen.getByTestId("multi-factor-auth-enrollment-form")).toBeInTheDocument();

    const card = container.querySelector(".max-w-md.mx-auto");
    expect(card).toBeInTheDocument();
  });

  it("should pass props to the enrollment form", () => {
    const mockOnEnrollment = vi.fn();
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthEnrollmentScreen onEnrollment={mockOnEnrollment} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("on-enrollment")).toBeInTheDocument();
  });

  it("should render children when provided", () => {
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthEnrollmentScreen>
          <div data-testid="child-content">Child Content</div>
        </MultiFactorAuthEnrollmentScreen>
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("should use correct translation keys", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          multiFactorEnrollment: "Configure MFA",
        },
        prompts: {
          mfaEnrollmentPrompt: "Add extra security",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthEnrollmentScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Configure MFA")).toBeInTheDocument();
    expect(screen.getByText("Add extra security")).toBeInTheDocument();
  });

  it("should render with correct CSS classes", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthEnrollmentScreen />
      </FirebaseUIProvider>
    );

    const mainContainer = container.querySelector(".max-w-md.mx-auto");
    expect(mainContainer).toBeInTheDocument();

    // Check for any card-like element instead of specific radix attribute
    const card = container.querySelector(".max-w-md.mx-auto > div");
    expect(card).toBeInTheDocument();
  });
});
