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
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MultiFactorAuthEnrollmentForm } from "./multi-factor-auth-enrollment-form";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { FactorId } from "firebase/auth";

vi.mock("./mfa/sms-multi-factor-enrollment-form", () => ({
  SmsMultiFactorEnrollmentForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="sms-multi-factor-enrollment-form">
      <div data-testid="sms-form-props">{onSuccess && <div data-testid="sms-on-enrollment">onSuccess</div>}</div>
    </div>
  ),
}));

vi.mock("./mfa/totp-multi-factor-enrollment-form", () => ({
  TotpMultiFactorEnrollmentForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="totp-multi-factor-enrollment-form">
      <div data-testid="totp-form-props">{onSuccess && <div data-testid="totp-on-success">onSuccess</div>}</div>
    </div>
  ),
}));

describe("<MultiFactorAuthEnrollmentForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with default hints (TOTP and PHONE) when no hints provided", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm />
      </CreateFirebaseUIProvider>
    );

    // Should show both buttons since we have multiple hints (since no prop)
    expect(screen.getByRole("button", { name: "Set up TOTP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set up SMS" })).toBeInTheDocument();
  });

  it("renders with custom hints when provided", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("totp-multi-factor-enrollment-form")).toBeInTheDocument();
  });

  it("auto-selects single hint and renders corresponding form", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("totp-multi-factor-enrollment-form")).toBeInTheDocument();
  });

  it("auto-selects SMS hint and renders corresponding form", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("sms-multi-factor-enrollment-form")).toBeInTheDocument();
  });

  it("shows buttons for multiple hints and allows selection", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByRole("button", { name: "Set up TOTP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set up SMS" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set up TOTP" }));

    expect(screen.getByTestId("totp-multi-factor-enrollment-form")).toBeInTheDocument();
  });

  it("shows buttons for multiple hints and allows SMS selection", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByRole("button", { name: "Set up TOTP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set up SMS" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set up SMS" }));

    expect(screen.getByTestId("sms-multi-factor-enrollment-form")).toBeInTheDocument();
  });

  it("passes onEnrollment prop to TOTP form when auto-selected", () => {
    const mockOnEnrollment = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP]} onEnrollment={mockOnEnrollment} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("totp-on-success")).toBeInTheDocument();
  });

  it("passes onEnrollment prop to SMS form when auto-selected", () => {
    const mockOnEnrollment = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.PHONE]} onEnrollment={mockOnEnrollment} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("sms-on-enrollment")).toBeInTheDocument();
  });

  it("passes onEnrollment prop to TOTP form when selected via button", () => {
    const mockOnEnrollment = vi.fn();
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} onEnrollment={mockOnEnrollment} />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Set up TOTP" }));

    expect(screen.getByTestId("totp-on-success")).toBeInTheDocument();
  });

  it("passes onEnrollment prop to SMS form when selected via button", () => {
    const mockOnEnrollment = vi.fn();
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} onEnrollment={mockOnEnrollment} />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Set up SMS" }));

    expect(screen.getByTestId("sms-on-enrollment")).toBeInTheDocument();
  });

  it("throws error when hints array is empty", () => {
    const ui = createMockUI();

    expect(() => {
      render(
        <CreateFirebaseUIProvider ui={ui}>
          <MultiFactorAuthEnrollmentForm hints={[]} />
        </CreateFirebaseUIProvider>
      );
    }).toThrow("MultiFactorAuthEnrollmentForm must have at least one hint");
  });

  it("throws error for unknown hint type", () => {
    const ui = createMockUI();

    const unknownHint = "unknown" as any;

    expect(() => {
      render(
        <CreateFirebaseUIProvider ui={ui}>
          <MultiFactorAuthEnrollmentForm hints={[unknownHint]} />
        </CreateFirebaseUIProvider>
      );
    }).toThrow("Unknown multi-factor enrollment type: unknown");
  });

  it("uses correct translation keys for buttons", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Configure TOTP Authentication",
          mfaSmsVerification: "Configure SMS Authentication",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByRole("button", { name: "Configure TOTP Authentication" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Configure SMS Authentication" })).toBeInTheDocument();
  });

  it("renders with correct CSS classes", () => {
    const ui = createMockUI();

    const { container } = render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    const contentDiv = container.querySelector(".fui-content");
    expect(contentDiv).toBeInTheDocument();
  });

  it("handles mixed hint types correctly", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByRole("button", { name: "Set up TOTP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set up SMS" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set up TOTP" }));

    expect(screen.getByTestId("totp-multi-factor-enrollment-form")).toBeInTheDocument();
    expect(screen.queryByTestId("sms-multi-factor-enrollment-form")).not.toBeInTheDocument();
  });

  it("maintains state correctly when switching between hints", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });

    const { rerender } = render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Set up TOTP" }));
    expect(screen.getByTestId("totp-multi-factor-enrollment-form")).toBeInTheDocument();

    rerender(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthEnrollmentForm hints={[FactorId.TOTP, FactorId.PHONE]} />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("totp-multi-factor-enrollment-form")).toBeInTheDocument();
  });
});
