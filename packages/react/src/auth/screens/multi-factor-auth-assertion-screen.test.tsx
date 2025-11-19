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

import { registerLocale } from "@firebase-oss/ui-translations";
import { cleanup, render, screen } from "@testing-library/react";
import { type UserCredential } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MultiFactorAuthAssertionScreen } from "~/auth/screens/multi-factor-auth-assertion-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";

vi.mock("~/auth/forms/multi-factor-auth-assertion-form", () => ({
  MultiFactorAuthAssertionForm: ({ onSuccess }: { onSuccess?: (credential: UserCredential) => void }) => (
    <div data-testid="multi-factor-auth-assertion-form">
      <div data-testid="assertion-form-props">
        {onSuccess ? <div data-testid="on-success-prop">onSuccess</div> : null}
      </div>
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

  it("renders with correct title and subtitle", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          multiFactorAssertion: "multiFactorAssertion",
        },
        prompts: {
          mfaAssertionPrompt: "mfaAssertionPrompt",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionScreen />
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("multiFactorAssertion");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("fui-card__title");

    const subtitle = screen.getByText("mfaAssertionPrompt");
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass("fui-card__subtitle");
  });

  it("renders the <MultiFactorAuthAssertionForm /> component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("multi-factor-auth-assertion-form")).toBeInTheDocument();
  });

  it("passes onSuccess prop to MultiFactorAuthAssertionForm", () => {
    const mockOnSuccess = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionScreen onSuccess={mockOnSuccess} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("on-success-prop")).toBeInTheDocument();
  });

  it("renders with default props when no props are provided", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionScreen />
      </CreateFirebaseUIProvider>
    );

    // Should render the form without onSuccess prop
    expect(screen.queryByTestId("on-success-prop")).not.toBeInTheDocument();
  });

  it("renders with correct screen structure", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionScreen />
      </CreateFirebaseUIProvider>
    );

    const screenContainer = screen.getByTestId("multi-factor-auth-assertion-form").closest(".fui-screen");
    expect(screenContainer).toBeInTheDocument();
    expect(screenContainer).toHaveClass("fui-screen");

    const card = screenContainer?.querySelector(".fui-card");
    expect(card).toBeInTheDocument();

    const cardHeader = screenContainer?.querySelector(".fui-card__header");
    expect(cardHeader).toBeInTheDocument();

    const cardContent = screenContainer?.querySelector(".fui-card__content");
    expect(cardContent).toBeInTheDocument();
  });

  it("uses correct translation keys", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          multiFactorAssertion: "Multi-factor Authentication",
        },
        prompts: {
          mfaAssertionPrompt: "Please complete the multi-factor authentication process",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Multi-factor Authentication")).toBeInTheDocument();
    expect(screen.getByText("Please complete the multi-factor authentication process")).toBeInTheDocument();
  });

  it("passes through all props correctly", () => {
    const mockOnSuccess = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionScreen onSuccess={mockOnSuccess} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("on-success-prop")).toBeInTheDocument();
  });
});
