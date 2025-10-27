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
import { createFirebaseUIProvider, createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { verifyPhoneNumber, enrollWithMultiFactorAssertion } from "@firebase-ui/core";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    verifyPhoneNumber: vi.fn(),
    enrollWithMultiFactorAssertion: vi.fn(),
  };
});

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    useRecaptchaVerifier: () => ({
      render: vi.fn(),
      verify: vi.fn(),
    }),
  };
});

describe("<SmsMultiFactorEnrollmentForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the phone number form initially", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Code" })).toBeInTheDocument();
  });

  it("should transition to verification form on successful phone number submission", async () => {
    vi.mocked(verifyPhoneNumber).mockResolvedValue("verification-id-123");

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("should handle phone number form submission error", async () => {
    vi.mocked(verifyPhoneNumber).mockRejectedValue(new Error("Phone verification failed"));

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByText("Phone verification failed")).toBeInTheDocument();
    });
  });

  it("should handle verification form submission error", async () => {
    vi.mocked(verifyPhoneNumber).mockResolvedValue("verification-id-123");
    vi.mocked(enrollWithMultiFactorAssertion).mockRejectedValue(new Error("Verification failed"));

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("Verification failed")).toBeInTheDocument();
    });
  });

  it("should complete enrollment successfully", async () => {
    vi.mocked(verifyPhoneNumber).mockResolvedValue("verification-id-123");
    vi.mocked(enrollWithMultiFactorAssertion).mockResolvedValue({} as any);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+1234567890" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(enrollWithMultiFactorAssertion).toHaveBeenCalled();
    });
  });
});
