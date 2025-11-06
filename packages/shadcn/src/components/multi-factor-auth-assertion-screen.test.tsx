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

import { FirebaseUIProvider } from "@invertase/firebaseui-react";
import { registerLocale } from "@invertase/firebaseui-translations";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockUI } from "../../tests/utils";
import { MultiFactorAuthAssertionScreen } from "./multi-factor-auth-assertion-screen";

vi.mock("./multi-factor-auth-assertion-form", () => ({
  MultiFactorAuthAssertionForm: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div data-testid="multi-factor-auth-assertion-form">
      <div data-testid="form-props">{onSuccess && <div data-testid="on-success">onSuccess</div>}</div>
    </div>
  ),
}));

describe("<MultiFactorAuthAssertionScreen />", () => {
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
          multiFactorAssertion: "Multi-Factor Authentication",
        },
        prompts: {
          mfaAssertionPrompt: "Please complete the multi-factor authentication process",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthAssertionScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Multi-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText("Please complete the multi-factor authentication process")).toBeInTheDocument();
    expect(screen.getByTestId("multi-factor-auth-assertion-form")).toBeInTheDocument();

    const card = container.querySelector(".max-w-sm.mx-auto");
    expect(card).toBeInTheDocument();
  });

  it("should pass props to the assertion form", () => {
    const mockOnSuccess = vi.fn();
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthAssertionScreen onSuccess={mockOnSuccess} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("on-success")).toBeInTheDocument();
  });

  it("should use correct translation keys", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          multiFactorAssertion: "Complete MFA",
        },
        prompts: {
          mfaAssertionPrompt: "Verify your identity",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthAssertionScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Complete MFA")).toBeInTheDocument();
    expect(screen.getByText("Verify your identity")).toBeInTheDocument();
  });

  it("should render with correct CSS classes", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorAuthAssertionScreen />
      </FirebaseUIProvider>
    );

    const mainContainer = container.querySelector(".max-w-sm.mx-auto");
    expect(mainContainer).toBeInTheDocument();

    // Check for any card-like element instead of specific radix attribute
    const card = container.querySelector(".max-w-sm.mx-auto > div");
    expect(card).toBeInTheDocument();
  });
});
