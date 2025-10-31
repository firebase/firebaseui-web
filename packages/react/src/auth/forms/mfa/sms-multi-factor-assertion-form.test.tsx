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
  SmsMultiFactorAssertionForm,
  useSmsMultiFactorAssertionPhoneFormAction,
  useSmsMultiFactorAssertionVerifyFormAction,
} from "./sms-multi-factor-assertion-form";
import { act } from "react";
import { verifyPhoneNumber, signInWithMultiFactorAssertion } from "@invertase/firebaseui-core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";

vi.mock("@invertase/firebaseui-core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-core")>();
  return {
    ...mod,
    verifyPhoneNumber: vi.fn(),
    signInWithMultiFactorAssertion: vi.fn(),
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
  };
});

vi.mock("~/hooks", async (importOriginal) => {
  const mod = await importOriginal<typeof import("~/hooks")>();
  return {
    ...mod,
    useRecaptchaVerifier: vi.fn().mockReturnValue({
      render: vi.fn(),
      clear: vi.fn(),
      verify: vi.fn(),
    }),
  };
});

describe("useSmsMultiFactorAssertionPhoneFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a function", () => {
    const mockUI = createMockUI();
    const { result } = renderHook(() => useSmsMultiFactorAssertionPhoneFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(typeof result.current).toBe("function");
  });

  it("should call verifyPhoneNumber with correct parameters", async () => {
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber);
    const mockUI = createMockUI();
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };
    const mockHint = {
      factorId: "phone" as const,
      phoneNumber: "+1234567890",
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const { result } = renderHook(() => useSmsMultiFactorAssertionPhoneFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ hint: mockHint, recaptchaVerifier: mockRecaptchaVerifier as any });
    });

    expect(verifyPhoneNumberMock).toHaveBeenCalledWith(
      expect.any(Object), // UI object
      "", // empty phone number
      mockRecaptchaVerifier,
      undefined, // no mfaUser
      mockHint // mfaHint
    );
  });
});

describe("useSmsMultiFactorAssertionVerifyFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a function", () => {
    const mockUI = createMockUI();
    const { result } = renderHook(() => useSmsMultiFactorAssertionVerifyFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(typeof result.current).toBe("function");
  });

  it("should call PhoneAuthProvider.credential and PhoneMultiFactorGenerator.assertion", async () => {
    const mockUI = createMockUI();
    const mockCredential = { credential: true };
    const mockAssertion = { assertion: true };

    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(mockCredential as any);
    vi.mocked(PhoneMultiFactorGenerator.assertion).mockReturnValue(mockAssertion as any);

    const { result } = renderHook(() => useSmsMultiFactorAssertionVerifyFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ verificationId: "test-verification-id", verificationCode: "123456" });
    });

    expect(PhoneAuthProvider.credential).toHaveBeenCalledWith("test-verification-id", "123456");
    expect(PhoneMultiFactorGenerator.assertion).toHaveBeenCalledWith(mockCredential);
  });

  it("should call signInWithMultiFactorAssertion with correct parameters", async () => {
    const signInWithMultiFactorAssertionMock = vi.mocked(signInWithMultiFactorAssertion);
    const mockUI = createMockUI();
    const mockCredential = { credential: true };
    const mockAssertion = { assertion: true };

    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(mockCredential as any);
    vi.mocked(PhoneMultiFactorGenerator.assertion).mockReturnValue(mockAssertion as any);

    const { result } = renderHook(() => useSmsMultiFactorAssertionVerifyFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ verificationId: "test-verification-id", verificationCode: "123456" });
    });

    expect(signInWithMultiFactorAssertionMock).toHaveBeenCalledWith(expect.any(Object), mockAssertion);
  });
});

describe("<SmsMultiFactorAssertionForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the phone form initially", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "sendCode",
          phoneNumber: "phoneNumber",
        },
      }),
    });

    const mockHint = {
      factorId: "phone" as const,
      phoneNumber: "+1234567890",
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const { container } = render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /phoneNumber/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /phoneNumber/i })).toHaveValue("+1234567890");

    const sendCodeButton = screen.getByRole("button", { name: "sendCode" });
    expect(sendCodeButton).toBeInTheDocument();
    expect(sendCodeButton).toHaveAttribute("type", "submit");

    expect(container.querySelector(".fui-recaptcha-container")).toBeInTheDocument();
  });

  it("should display phone number from hint", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "phoneNumber",
        },
      }),
    });

    const mockHint = {
      factorId: "phone" as const,
      phoneNumber: "+1234567890",
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    const phoneInput = screen.getByRole("textbox", { name: /phoneNumber/i });
    expect(phoneInput).toHaveValue("+1234567890");
  });

  it("should handle missing phone number in hint", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "phoneNumber",
        },
      }),
    });

    const mockHint = {
      factorId: "phone" as const,
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    const phoneInput = screen.getByRole("textbox", { name: /phoneNumber/i });
    expect(phoneInput).toHaveValue("");
  });

  it("should accept onSuccess callback prop", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "phoneNumber",
        },
      }),
    });

    const mockHint = {
      factorId: "phone" as const,
      phoneNumber: "+1234567890",
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };
    const onSuccessMock = vi.fn();

    expect(() => {
      render(
        createFirebaseUIProvider({
          children: <SmsMultiFactorAssertionForm hint={mockHint} onSuccess={onSuccessMock} />,
          ui: mockUI,
        })
      );
    }).not.toThrow();
  });
});
