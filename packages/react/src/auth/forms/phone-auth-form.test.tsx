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
import { render, screen, fireEvent, renderHook, cleanup } from "@testing-library/react";
import {
  PhoneAuthForm,
  usePhoneAuthFormAction,
  usePhoneVerificationFormAction,
  usePhoneResendAction,
  useResendTimer,
} from "./phone-auth-form";
import { act } from "react";

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  RecaptchaVerifier: vi.fn().mockImplementation(() => ({
    render: vi.fn().mockResolvedValue(123),
    clear: vi.fn(),
    verify: vi.fn().mockResolvedValue("verification-token"),
  })),
  ConfirmationResult: vi.fn(),
}));

// Mock the core dependencies
vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    signInWithPhoneNumber: vi.fn(),
    confirmPhoneNumber: vi.fn(),
    formatPhoneNumberWithCountry: vi.fn((phoneNumber, dialCode) => `${dialCode}${phoneNumber}`),
  };
});

vi.mock("~/components/form", async (importOriginal) => {
  const mod = await importOriginal<typeof import("~/components/form")>();
  return {
    ...mod,
    form: {
      ...mod.form,
      ErrorMessage: () => <div data-testid="error-message">Error Message</div>,
    },
  };
});

import { signInWithPhoneNumber, confirmPhoneNumber } from "@firebase-ui/core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "~/context";

vi.mock("~/components/country-selector", () => ({
  CountrySelector: vi.fn().mockImplementation(({ value, onChange }) => (
    <div data-testid="country-selector">
      <select
        onChange={(e) =>
          onChange &&
          onChange({
            code: e.target.value,
            name: e.target.value === "US" ? "United States" : "United Kingdom",
            dialCode: e.target.value === "US" ? "+1" : "+44",
            emoji: e.target.value === "US" ? "🇺🇸" : "🇬🇧",
          })
        }
        value={value?.code}
      >
        <option value="US">United States</option>
        <option value="GB">United Kingdom</option>
      </select>
    </div>
  )),
}));

describe("useResendTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useResendTimer(30));

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it("should start timer and count down correctly", async () => {
    const { result } = renderHook(() => useResendTimer(5));

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timeLeft).toBe(5);
    expect(result.current.canResend).toBe(false);

    // Advance timer by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(4);
    expect(result.current.canResend).toBe(false);

    // Advance timer by 3 more seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBe(1);
    expect(result.current.canResend).toBe(false);

    // Advance timer by final second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it("should handle multiple timer starts correctly", () => {
    const { result } = renderHook(() => useResendTimer(3));

    // Start first timer
    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timeLeft).toBe(3);

    // Advance by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(2);

    // Start timer again (should reset)
    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timeLeft).toBe(3);
    expect(result.current.canResend).toBe(false);
  });

  it("should clean up timer on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    const { result, unmount } = renderHook(() => useResendTimer(10));

    act(() => {
      result.current.startTimer();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should handle zero delay correctly", () => {
    const { result } = renderHook(() => useResendTimer(0));

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.canResend).toBe(false); // Timer is active but will complete immediately

    // Advance timer to trigger the interval callback
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it("should handle single second delay correctly", () => {
    const { result } = renderHook(() => useResendTimer(1));

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timeLeft).toBe(1);
    expect(result.current.canResend).toBe(false);

    // Advance by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it("should maintain correct state during countdown", () => {
    const { result } = renderHook(() => useResendTimer(3));

    act(() => {
      result.current.startTimer();
    });

    // Check initial state
    expect(result.current.timeLeft).toBe(3);
    expect(result.current.canResend).toBe(false);

    // Check state at each second
    for (let i = 2; i >= 0; i--) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeLeft).toBe(i);
      expect(result.current.canResend).toBe(i === 0);
    }
  });
});

describe("usePhoneAuthFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts phone number and recaptcha verifier", async () => {
    const signInWithPhoneNumberMock = vi.mocked(signInWithPhoneNumber);
    const mockUI = createMockUI();
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(() => usePhoneAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ phoneNumber: "+1234567890", recaptchaVerifier: mockRecaptchaVerifier as any });
    });

    expect(signInWithPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), "+1234567890", mockRecaptchaVerifier);
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const signInWithPhoneNumberMock = vi.mocked(signInWithPhoneNumber).mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(() => usePhoneAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ phoneNumber: "+1234567890", recaptchaVerifier: mockRecaptchaVerifier as any });
      });
    }).rejects.toThrow("unknownError");

    expect(signInWithPhoneNumberMock).toHaveBeenCalledWith(mockUI.get(), "+1234567890", mockRecaptchaVerifier);
  });
});

describe("usePhoneVerificationFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts confirmation result and code", async () => {
    const confirmPhoneNumberMock = vi.mocked(confirmPhoneNumber);
    const mockUI = createMockUI();
    const mockConfirmationResult = { confirm: vi.fn() };

    const { result } = renderHook(() => usePhoneVerificationFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ confirmationResult: mockConfirmationResult as any, code: "123456" });
    });

    expect(confirmPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), mockConfirmationResult, "123456");
  });
});

describe("usePhoneResendAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts phone number and recaptcha verifier", async () => {
    const signInWithPhoneNumberMock = vi.mocked(signInWithPhoneNumber).mockResolvedValue({ confirm: vi.fn() } as any);
    const mockUI = createMockUI();
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(() => usePhoneResendAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ phoneNumber: "+1234567890", recaptchaVerifier: mockRecaptchaVerifier as any });
    });

    expect(signInWithPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), "+1234567890", mockRecaptchaVerifier);
  });
});

describe("<PhoneAuthForm />", () => {
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
          sendCode: "sendCode",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    // There should be only one form
    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    // Make sure we have a phone number input
    expect(screen.getByRole("textbox", { name: /phone number/i })).toBeInTheDocument();
    expect(screen.getByTestId("country-selector")).toBeInTheDocument();

    // Ensure the "Send Code" button is present and is a submit button
    const sendCodeButton = screen.getByRole("button", { name: "sendCode" });
    expect(sendCodeButton).toBeInTheDocument();
    expect(sendCodeButton).toHaveAttribute("type", "submit");
  });

  it("should trigger validation errors when the form is blurred", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form.fui-form");
    expect(form).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /phone number/i });

    act(() => {
      fireEvent.blur(input);
    });

    expect(screen.getByText("Please provide a phone number, The phone number is invalid")).toBeInTheDocument();
  });
});
