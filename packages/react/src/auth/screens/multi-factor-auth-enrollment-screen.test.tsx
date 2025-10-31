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
import { MultiFactorAuthEnrollmentScreen } from "~/auth/screens/multi-factor-auth-enrollment-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FactorId } from "firebase/auth";

vi.mock("~/auth/forms/multi-factor-auth-enrollment-form", () => ({
  MultiFactorAuthEnrollmentForm: ({ onEnrollment, hints }: { onEnrollment?: () => void; hints?: string[] }) => (
    <div data-testid="multi-factor-auth-enrollment-form">
      <div data-testid="enrollment-form-props">
        {onEnrollment ? <div data-testid="on-enrollment-prop">onEnrollment</div> : null}
        {hints ? <div data-testid="hints-prop">{hints.join(",")}</div> : null}
      </div>
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

  it("renders with correct title and subtitle", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          multiFactorEnrollment: "multiFactorEnrollment",
        },
        prompts: {
          mfaEnrollmentPrompt: "mfaEnrollmentPrompt",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen />
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("multiFactorEnrollment");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("fui-card__title");

    const subtitle = screen.getByText("mfaEnrollmentPrompt");
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass("fui-card__subtitle");
  });

  it("renders the <MultiFactorAuthEnrollmentForm /> component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("multi-factor-auth-enrollment-form")).toBeInTheDocument();
  });

  it("passes onEnrollment prop to MultiFactorAuthEnrollmentForm", () => {
    const mockOnEnrollment = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen onEnrollment={mockOnEnrollment} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("on-enrollment-prop")).toBeInTheDocument();
  });

  it("passes hints prop to MultiFactorAuthEnrollmentForm", () => {
    const mockHints = [FactorId.TOTP, FactorId.PHONE];
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen hints={mockHints} />
      </CreateFirebaseUIProvider>
    );

    const hintsElement = screen.getByTestId("hints-prop");
    expect(hintsElement).toBeInTheDocument();
    expect(hintsElement.textContent).toBe("totp,phone");
  });

  it("renders with default props when no props are provided", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen />
      </CreateFirebaseUIProvider>
    );

    // Should render the form without onEnrollment prop
    expect(screen.queryByTestId("on-enrollment-prop")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hints-prop")).not.toBeInTheDocument();
  });

  it("renders with correct screen structure", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen />
      </CreateFirebaseUIProvider>
    );

    const screenContainer = screen.getByTestId("multi-factor-auth-enrollment-form").closest(".fui-screen");
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
          multiFactorEnrollment: "Set up Multi-Factor Authentication",
        },
        prompts: {
          mfaEnrollmentPrompt: "Choose a method to secure your account",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Set up Multi-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText("Choose a method to secure your account")).toBeInTheDocument();
  });

  it("handles all supported factor IDs", () => {
    const allHints = [FactorId.TOTP, FactorId.PHONE];
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen hints={allHints} />
      </CreateFirebaseUIProvider>
    );

    const hintsElement = screen.getByTestId("hints-prop");
    expect(hintsElement.textContent).toBe("totp,phone");
  });

  it("passes through all props correctly", () => {
    const mockOnEnrollment = vi.fn();
    const mockHints = [FactorId.TOTP];
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentScreen onEnrollment={mockOnEnrollment} hints={mockHints} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("on-enrollment-prop")).toBeInTheDocument();
    expect(screen.getByTestId("hints-prop")).toBeInTheDocument();
    expect(screen.getByTestId("hints-prop").textContent).toBe("totp");
  });
});
