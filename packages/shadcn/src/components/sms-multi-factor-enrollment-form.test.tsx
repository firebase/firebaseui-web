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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { SmsMultiFactorEnrollmentForm } from "./sms-multi-factor-enrollment-form";
import { createFirebaseUIProvider, createMockUIWithUser } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { verifyPhoneNumber, enrollWithMultiFactorAssertion } from "@invertase/firebaseui-core";
import React from "react";

// Mock input-otp components to prevent window access issues
vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "input-otp", ...props }, children),
  InputOTPGroup: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "input-otp-group", ...props }, children),
  InputOTPSlot: ({ index, ...props }: any) =>
    React.createElement("input", { "data-testid": `input-otp-slot-${index}`, ...props }),
}));

// Mock the schema hooks
vi.mock("@invertase/firebaseui-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-react")>();
  return {
    ...mod,
    useRecaptchaVerifier: vi.fn().mockReturnValue({}),
  };
});

vi.mock("@invertase/firebaseui-core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-core")>();
  return {
    ...mod,
    verifyPhoneNumber: vi.fn(),
    enrollWithMultiFactorAssertion: vi.fn(),
  };
});

// Mock Firebase Auth multiFactor function
vi.mock("firebase/auth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...mod,
    multiFactor: vi.fn().mockReturnValue({
      enrolledFactors: [],
      enroll: vi.fn(),
      unenroll: vi.fn(),
      getSession: vi.fn(),
    }),
    PhoneAuthProvider: {
      credential: vi.fn().mockReturnValue({}),
    },
    PhoneMultiFactorGenerator: {
      assertion: vi.fn().mockReturnValue({}),
    },
  };
});

// Mock CountrySelector
vi.mock("./country-selector", () => ({
  CountrySelector: vi.fn().mockImplementation(({ ref }) => {
    if (ref && typeof ref === "object" && "current" in ref) {
      ref.current = {
        getCountry: () => ({
          code: "US",
          name: "United States",
          dialCode: "+1",
          emoji: "🇺🇸",
        }),
      };
    }
    return null;
  }),
}));

describe("<SmsMultiFactorEnrollmentForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the phone number form initially", () => {
    const mockUI = createMockUIWithUser({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
        },
      }),
    });

    const { container } = render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    expect(container.querySelector("input[name='phoneNumber']")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Code" })).toBeInTheDocument();
  });

  it("should transition to verification form on successful phone number submission", async () => {
    vi.mocked(verifyPhoneNumber).mockResolvedValue("verification-id-123");

    const mockUI = createMockUIWithUser({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    const { container } = render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    // Fill in display name first
    const displayNameInput = container.querySelector("input[name='displayName']")!;
    fireEvent.change(displayNameInput, { target: { value: "Test User" } });

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByTestId("input-otp")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("should handle phone number form submission error", async () => {
    vi.mocked(verifyPhoneNumber).mockRejectedValue(new Error("Phone verification failed"));

    const mockUI = createMockUIWithUser({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
        },
      }),
    });

    const { container } = render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    // Fill in display name first
    const displayNameInput = container.querySelector("input[name='displayName']")!;
    fireEvent.change(displayNameInput, { target: { value: "Test User" } });

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByText("Error: Phone verification failed")).toBeInTheDocument();
    });
  });

  it("should handle verification form submission error", async () => {
    vi.mocked(verifyPhoneNumber).mockResolvedValue("verification-id-123");
    vi.mocked(enrollWithMultiFactorAssertion).mockRejectedValue(new Error("Verification failed"));

    const mockUI = createMockUIWithUser({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    const { container } = render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    // Fill in display name first
    const displayNameInput = container.querySelector("input[name='displayName']")!;
    fireEvent.change(displayNameInput, { target: { value: "Test User" } });

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByTestId("input-otp")).toBeInTheDocument();
    });

    const verificationInput = screen.getByTestId("input-otp-slot-0");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("Error: Verification failed")).toBeInTheDocument();
    });
  });

  it("should complete enrollment successfully", async () => {
    vi.mocked(verifyPhoneNumber).mockResolvedValue("verification-id-123");
    vi.mocked(enrollWithMultiFactorAssertion).mockResolvedValue({} as any);

    const mockUI = createMockUIWithUser({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    const { container } = render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    // Fill in display name first
    const displayNameInput = container.querySelector("input[name='displayName']")!;
    fireEvent.change(displayNameInput, { target: { value: "Test User" } });

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByTestId("input-otp")).toBeInTheDocument();
    });

    const verificationInput = screen.getByTestId("input-otp-slot-0");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(enrollWithMultiFactorAssertion).toHaveBeenCalled();
    });
  });
});
