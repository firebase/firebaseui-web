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
import { render, screen, renderHook, cleanup } from "@testing-library/react";
import {
  TotpMultiFactorEnrollmentForm,
  useTotpMultiFactorSecretGenerationFormAction,
  useMultiFactorEnrollmentVerifyTotpFormAction,
  MultiFactorEnrollmentVerifyTotpForm,
} from "./totp-multi-factor-enrollment-form";
import { act } from "react";
import { generateTotpSecret, generateTotpQrCode, enrollWithMultiFactorAssertion } from "@firebase-ui/core";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { TotpMultiFactorGenerator } from "firebase/auth";
import { FirebaseUIProvider } from "@firebase-ui/react";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    generateTotpSecret: vi.fn(),
    generateTotpQrCode: vi.fn(),
    enrollWithMultiFactorAssertion: vi.fn(),
  };
});

vi.mock("firebase/auth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...mod,
    TotpMultiFactorGenerator: {
      ...mod.TotpMultiFactorGenerator,
      assertionForEnrollment: vi.fn(),
    },
  };
});

describe("useTotpMultiFactorSecretGenerationFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which generates a TOTP secret", async () => {
    const generateTotpSecretMock = vi.mocked(generateTotpSecret);
    const mockSecret = { secretKey: "test-secret" } as any;
    generateTotpSecretMock.mockResolvedValue(mockSecret);
    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
    });

    const { result } = renderHook(() => useTotpMultiFactorSecretGenerationFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    await act(async () => {
      const secret = await result.current();
      expect(secret).toBe(mockSecret);
    });

    expect(generateTotpSecretMock).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const generateTotpSecretMock = vi.mocked(generateTotpSecret).mockRejectedValue(new Error("Unknown error"));
    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
    });

    const { result } = renderHook(() => useTotpMultiFactorSecretGenerationFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    await expect(async () => {
      await act(async () => {
        await result.current();
      });
    }).rejects.toThrow("Unknown error");

    expect(generateTotpSecretMock).toHaveBeenCalledWith(expect.any(Object));
  });
});

describe("useMultiFactorEnrollmentVerifyTotpFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts verification details", async () => {
    const enrollWithMultiFactorAssertionMock = vi.mocked(enrollWithMultiFactorAssertion);
    const TotpMultiFactorGeneratorAssertionMock = vi.mocked(TotpMultiFactorGenerator.assertionForEnrollment);
    const mockAssertion = { assertion: true } as any;
    const mockSecret = { secretKey: "test-secret" } as any;
    TotpMultiFactorGeneratorAssertionMock.mockReturnValue(mockAssertion);
    enrollWithMultiFactorAssertionMock.mockResolvedValue(undefined);
    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
    });

    const { result } = renderHook(() => useMultiFactorEnrollmentVerifyTotpFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    await act(async () => {
      await result.current({
        secret: mockSecret,
        verificationCode: "123456",
        displayName: "Test User",
      });
    });

    expect(TotpMultiFactorGeneratorAssertionMock).toHaveBeenCalledWith(mockSecret, "123456");
    expect(enrollWithMultiFactorAssertionMock).toHaveBeenCalledWith(expect.any(Object), mockAssertion, "123456");
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    vi.mocked(enrollWithMultiFactorAssertion).mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
    });

    const { result } = renderHook(() => useMultiFactorEnrollmentVerifyTotpFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({
          secret: { secretKey: "test-secret" } as any,
          verificationCode: "123456",
          displayName: "Test User",
        });
      });
    }).rejects.toThrow("Unknown error");
  });
});

describe("<MultiFactorEnrollmentVerifyTotpForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the form correctly", () => {
    const generateTotpQrCodeMock = vi.mocked(generateTotpQrCode);
    generateTotpQrCodeMock.mockReturnValue("data:image/png;base64,test-qr-code");
    const mockSecret = { secretKey: "test-secret" } as any;
    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
      locale: registerLocale("test", {
        labels: {
          verificationCode: "verificationCode",
          verifyCode: "verifyCode",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <MultiFactorEnrollmentVerifyTotpForm secret={mockSecret} displayName="Test User" onSuccess={vi.fn()} />
      </FirebaseUIProvider>
    );

    const form = container.querySelectorAll("form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /verificationCode/i })).toBeInTheDocument();

    const verifyCodeButton = screen.getByRole("button", { name: "verifyCode" });
    expect(verifyCodeButton).toBeInTheDocument();
    expect(verifyCodeButton).toHaveAttribute("type", "submit");

    expect(container.querySelector("img[alt='TOTP QR Code']")).toBeInTheDocument();
  });
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
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
      locale: registerLocale("test", {
        labels: {
          displayName: "displayName",
          generateQrCode: "generateQrCode",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <TotpMultiFactorEnrollmentForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelectorAll("form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /displayName/i })).toBeInTheDocument();

    const generateQrCodeButton = screen.getByRole("button", { name: "generateQrCode" });
    expect(generateQrCodeButton).toBeInTheDocument();
    expect(generateQrCodeButton).toHaveAttribute("type", "submit");
  });

  it("should throw error when user is not authenticated", () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as any,
    });

    expect(() => {
      render(
        <FirebaseUIProvider ui={mockUI}>
          <TotpMultiFactorEnrollmentForm />
        </FirebaseUIProvider>
      );
    }).toThrow("User must be authenticated to enroll with multi-factor authentication");
  });

  it("should render form elements correctly", () => {
    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
      locale: registerLocale("test", {
        labels: {
          displayName: "displayName",
          generateQrCode: "generateQrCode",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <TotpMultiFactorEnrollmentForm />
      </FirebaseUIProvider>
    );

    expect(screen.getByRole("textbox", { name: /displayName/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "generateQrCode" })).toBeInTheDocument();
  });
});
