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
  SmsMultiFactorEnrollmentForm,
  useSmsMultiFactorEnrollmentPhoneAuthFormAction,
  useMultiFactorEnrollmentVerifyPhoneNumberFormAction,
  MultiFactorEnrollmentVerifyPhoneNumberForm,
} from "./sms-multi-factor-enrollment-form";
import { act } from "react";
import { verifyPhoneNumber, enrollWithMultiFactorAssertion } from "@firebase-ui/core";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";
import { FirebaseUIProvider } from "@firebase-ui/react";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    verifyPhoneNumber: vi.fn(),
    enrollWithMultiFactorAssertion: vi.fn(),
    formatPhoneNumber: vi.fn(),
  };
});

vi.mock("firebase/auth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...mod,
    PhoneAuthProvider: {
      credential: vi.fn(),
    },
    PhoneMultiFactorGenerator: {
      assertion: vi.fn(),
    },
    multiFactor: vi.fn(() => ({
      enroll: vi.fn(),
    })),
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

vi.mock("@/registry/country-selector", () => ({
  CountrySelector: ({ ref }: { ref: any }) => (
    <div data-testid="country-selector" ref={ref}>
      Country Selector
    </div>
  ),
}));

describe("useSmsMultiFactorEnrollmentPhoneAuthFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts phone number and recaptcha verifier", async () => {
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber);
    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
    });

    const { result } = renderHook(() => useSmsMultiFactorEnrollmentPhoneAuthFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    const mockRecaptchaVerifier = {} as any;

    await act(async () => {
      await result.current({ phoneNumber: "+1234567890", recaptchaVerifier: mockRecaptchaVerifier });
    });

    expect(verifyPhoneNumberMock).toHaveBeenCalledWith(
      expect.any(Object),
      "+1234567890",
      mockRecaptchaVerifier,
      expect.any(Object)
    );
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber).mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const { result } = renderHook(() => useSmsMultiFactorEnrollmentPhoneAuthFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ phoneNumber: "+1234567890", recaptchaVerifier: {} as any });
      });
    }).rejects.toThrow("Unknown error");

    expect(verifyPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), "+1234567890", {}, expect.any(Object));
  });
});

describe("useMultiFactorEnrollmentVerifyPhoneNumberFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts verification details", async () => {
    const enrollWithMultiFactorAssertionMock = vi.mocked(enrollWithMultiFactorAssertion);
    const PhoneAuthProviderCredentialMock = vi.mocked(PhoneAuthProvider.credential);
    const PhoneMultiFactorGeneratorAssertionMock = vi.mocked(PhoneMultiFactorGenerator.assertion);
    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
    });

    const { result } = renderHook(() => useMultiFactorEnrollmentVerifyPhoneNumberFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    const mockCredential = { credential: true };
    const mockAssertion = { assertion: true };
    PhoneAuthProviderCredentialMock.mockReturnValue(mockCredential as any);
    PhoneMultiFactorGeneratorAssertionMock.mockReturnValue(mockAssertion as any);

    await act(async () => {
      await result.current({
        verificationId: "verification-id-123",
        verificationCode: "123456",
        displayName: "Test User",
      });
    });

    expect(PhoneAuthProviderCredentialMock).toHaveBeenCalledWith("verification-id-123", "123456");
    expect(PhoneMultiFactorGeneratorAssertionMock).toHaveBeenCalledWith(mockCredential);
    expect(enrollWithMultiFactorAssertionMock).toHaveBeenCalledWith(expect.any(Object), mockAssertion, "Test User");
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const enrollWithMultiFactorAssertionMock = vi
      .mocked(enrollWithMultiFactorAssertion)
      .mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const { result } = renderHook(() => useMultiFactorEnrollmentVerifyPhoneNumberFormAction(), {
      wrapper: ({ children }) => (
        <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>
      ),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({
          verificationId: "verification-id-123",
          verificationCode: "123456",
          displayName: "Test User",
        });
      });
    }).rejects.toThrow("Unknown error");
  });
});

describe("<MultiFactorEnrollmentVerifyPhoneNumberForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form correctly", () => {
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
        <MultiFactorEnrollmentVerifyPhoneNumberForm
          verificationId="verification-id-123"
          displayName="Test User"
          onSuccess={vi.fn()}
        />
      </FirebaseUIProvider>
    );

    const form = container.querySelectorAll("form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /verificationCode/i })).toBeInTheDocument();

    const verifyCodeButton = screen.getByRole("button", { name: "verifyCode" });
    expect(verifyCodeButton).toBeInTheDocument();
    expect(verifyCodeButton).toHaveAttribute("type", "submit");
  });
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
      auth: { currentUser: { uid: "test-user", _onReload: vi.fn() } } as any,
      locale: registerLocale("test", {
        labels: {
          displayName: "displayName",
          phoneNumber: "phoneNumber",
          sendCode: "sendCode",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SmsMultiFactorEnrollmentForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelectorAll("form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /displayName/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /phoneNumber/i })).toBeInTheDocument();

    const sendCodeButton = screen.getByRole("button", { name: "sendCode" });
    expect(sendCodeButton).toBeInTheDocument();
    expect(sendCodeButton).toHaveAttribute("type", "submit");

    expect(screen.getByTestId("country-selector")).toBeInTheDocument();
    expect(container.querySelector(".fui-recaptcha-container")).toBeInTheDocument();
  });

  it("should throw error when user is not authenticated", () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as any,
    });

    expect(() => {
      render(
        <FirebaseUIProvider ui={mockUI}>
          <SmsMultiFactorEnrollmentForm />
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
          phoneNumber: "phoneNumber",
          sendCode: "sendCode",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SmsMultiFactorEnrollmentForm />
      </FirebaseUIProvider>
    );

    expect(screen.getByRole("textbox", { name: /displayName/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /phoneNumber/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sendCode" })).toBeInTheDocument();
    expect(screen.getByTestId("country-selector")).toBeInTheDocument();
  });
});
