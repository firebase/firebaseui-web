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
import { TotpMultiFactorEnrollmentForm } from "./totp-multi-factor-enrollment-form";
import { createFirebaseUIProvider, createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { generateTotpSecret, generateTotpQrCode, enrollWithMultiFactorAssertion } from "@firebase-ui/core";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    generateTotpSecret: vi.fn(),
    generateTotpQrCode: vi.fn(),
    enrollWithMultiFactorAssertion: vi.fn(),
  };
});

describe("<TotpMultiFactorEnrollmentForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the secret generation form initially", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          displayName: "Display Name",
          generateQrCode: "Generate Secret",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Secret" })).toBeInTheDocument();
  });

  it("should transition to verification form after secret generation", async () => {
    const mockSecret = { secretKey: "test-secret" } as any;
    vi.mocked(generateTotpSecret).mockResolvedValue(mockSecret);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          displayName: "Display Name",
          generateQrCode: "Generate Secret",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: "Test TOTP" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate Secret" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("should handle secret generation error", async () => {
    vi.mocked(generateTotpSecret).mockRejectedValue(new Error("Secret generation failed"));

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          displayName: "Display Name",
          generateQrCode: "Generate Secret",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: "Test TOTP" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate Secret" }));

    await waitFor(() => {
      expect(screen.getByText("Secret generation failed")).toBeInTheDocument();
    });
  });

  it("should handle verification error", async () => {
    const mockSecret = { secretKey: "test-secret" } as any;
    vi.mocked(generateTotpSecret).mockResolvedValue(mockSecret);
    vi.mocked(enrollWithMultiFactorAssertion).mockRejectedValue(new Error("Verification failed"));

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          displayName: "Display Name",
          generateQrCode: "Generate Secret",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorEnrollmentForm />,
        ui: mockUI,
      })
    );

    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: "Test TOTP" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate Secret" }));

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
});
