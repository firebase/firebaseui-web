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
  usePhoneNumberFormAction,
  usePhoneNumberForm,
  useVerifyPhoneNumberFormAction,
  useVerifyPhoneNumberForm,
  PhoneNumberForm,
} from "./phone-auth-form";
import { act } from "react";
import type { UserCredential } from "firebase/auth";

vi.mock("firebase/auth", () => ({
  RecaptchaVerifier: vi.fn().mockImplementation(() => ({
    render: vi.fn().mockResolvedValue(123),
    clear: vi.fn(),
    verify: vi.fn().mockResolvedValue("verification-token"),
  })),
  ConfirmationResult: vi.fn(),
}));

vi.mock("@invertase/firebaseui-core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-core")>();
  return {
    ...mod,
    verifyPhoneNumber: vi.fn(),
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

import { verifyPhoneNumber, confirmPhoneNumber } from "@invertase/firebaseui-core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
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

describe("usePhoneNumberFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts phone number and recaptcha verifier", async () => {
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber);
    const mockUI = createMockUI();
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(() => usePhoneNumberFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ phoneNumber: "1234567890", recaptchaVerifier: mockRecaptchaVerifier as any });
    });

    expect(verifyPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), "1234567890", mockRecaptchaVerifier);
  });

  it("should return a verification ID on success", async () => {
    const mockVerificationId = "test-verification-id";
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber).mockResolvedValue(mockVerificationId);
    const mockUI = createMockUI();
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(() => usePhoneNumberFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      const verificationId = await result.current({
        phoneNumber: "1234567890",
        recaptchaVerifier: mockRecaptchaVerifier as any,
      });
      expect(verificationId).toBe(mockVerificationId);
    });

    expect(verifyPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), "1234567890", mockRecaptchaVerifier);
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber).mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(() => usePhoneNumberFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ phoneNumber: "1234567890", recaptchaVerifier: mockRecaptchaVerifier as any });
      });
    }).rejects.toThrow("Unknown error");

    expect(verifyPhoneNumberMock).toHaveBeenCalledWith(mockUI.get(), "1234567890", mockRecaptchaVerifier);
  });
});

describe("usePhoneNumberForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should allow the form to be submitted with valid phone number", async () => {
    const mockUI = createMockUI();
    const mockVerificationId = "test-verification-id";
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber).mockResolvedValue(mockVerificationId);
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(
      () =>
        usePhoneNumberForm({
          recaptchaVerifier: mockRecaptchaVerifier as any,
          onSuccess: vi.fn(),
        }),
      {
        wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
      }
    );

    act(() => {
      result.current.setFieldValue("phoneNumber", "1234567890");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(verifyPhoneNumberMock).toHaveBeenCalledWith(mockUI.get(), "1234567890", mockRecaptchaVerifier);
  });

  it("should not allow the form to be submitted if the form is invalid", async () => {
    const mockUI = createMockUI();
    const verifyPhoneNumberMock = vi.mocked(verifyPhoneNumber);
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };

    const { result } = renderHook(
      () =>
        usePhoneNumberForm({
          recaptchaVerifier: mockRecaptchaVerifier as any,
          onSuccess: vi.fn(),
        }),
      {
        wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
      }
    );

    act(() => {
      result.current.setFieldValue("phoneNumber", "12345678901"); // too long
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    const fieldMeta = result.current.getFieldMeta("phoneNumber");
    expect(fieldMeta?.errors).toBeDefined();
    expect(fieldMeta?.errors.length).toBeGreaterThan(0);
    expect(verifyPhoneNumberMock).not.toHaveBeenCalled();
  });

  it("should call onSuccess callback when form submission succeeds", async () => {
    const mockUI = createMockUI();
    const mockRecaptchaVerifier = { render: vi.fn(), clear: vi.fn(), verify: vi.fn() };
    const mockVerificationId = "test-verification-id";
    const onSuccessMock = vi.fn();

    vi.mocked(verifyPhoneNumber).mockResolvedValue(mockVerificationId);

    const { result } = renderHook(
      () =>
        usePhoneNumberForm({
          recaptchaVerifier: mockRecaptchaVerifier as any,
          onSuccess: onSuccessMock,
        }),
      {
        wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
      }
    );

    act(() => {
      result.current.setFieldValue("phoneNumber", "1234567890");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSuccessMock).toHaveBeenCalledWith(mockVerificationId);
  });
});

describe("useVerifyPhoneNumberFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accepts verification ID and code", async () => {
    const confirmPhoneNumberMock = vi.mocked(confirmPhoneNumber);
    const mockUI = createMockUI();
    const mockVerificationId = "test-verification-id";

    const { result } = renderHook(() => useVerifyPhoneNumberFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ verificationId: mockVerificationId, verificationCode: "123456" });
    });

    expect(confirmPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), mockVerificationId, "123456");
  });

  it("should return a credential on success", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;
    const confirmPhoneNumberMock = vi.mocked(confirmPhoneNumber).mockResolvedValue(mockCredential);
    const mockUI = createMockUI();
    const mockVerificationId = "test-verification-id";

    const { result } = renderHook(() => useVerifyPhoneNumberFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      const credential = await result.current({ verificationId: mockVerificationId, verificationCode: "123456" });
      expect(credential).toBe(mockCredential);
    });

    expect(confirmPhoneNumberMock).toHaveBeenCalledWith(expect.any(Object), mockVerificationId, "123456");
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const confirmPhoneNumberMock = vi.mocked(confirmPhoneNumber).mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const mockVerificationId = "test-verification-id";

    const { result } = renderHook(() => useVerifyPhoneNumberFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ verificationId: mockVerificationId, verificationCode: "123456" });
      });
    }).rejects.toThrow("Unknown error");

    expect(confirmPhoneNumberMock).toHaveBeenCalledWith(mockUI.get(), mockVerificationId, "123456");
  });
});

describe("useVerifyPhoneNumberForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should allow the form to be submitted with valid verification code", async () => {
    const mockUI = createMockUI();
    const confirmPhoneNumberMock = vi.mocked(confirmPhoneNumber);
    const mockVerificationId = "test-verification-id";

    const { result } = renderHook(
      () =>
        useVerifyPhoneNumberForm({
          verificationId: mockVerificationId,
          onSuccess: vi.fn(),
        }),
      {
        wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
      }
    );

    act(() => {
      result.current.setFieldValue("verificationCode", "123456");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(confirmPhoneNumberMock).toHaveBeenCalledWith(mockUI.get(), mockVerificationId, "123456");
  });

  it("should not allow the form to be submitted if the form is invalid", async () => {
    const mockUI = createMockUI();
    const confirmPhoneNumberMock = vi.mocked(confirmPhoneNumber);
    const mockVerificationId = "test-verification-id";

    const { result } = renderHook(
      () =>
        useVerifyPhoneNumberForm({
          verificationId: mockVerificationId,
          onSuccess: vi.fn(),
        }),
      {
        wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
      }
    );

    act(() => {
      result.current.setFieldValue("verificationCode", "123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.getFieldMeta("verificationCode")!.errors[0].length).toBeGreaterThan(0);
    expect(confirmPhoneNumberMock).not.toHaveBeenCalled();
  });

  it("should call onSuccess callback when form submission succeeds", async () => {
    const mockUI = createMockUI();
    const mockVerificationId = "test-verification-id";
    const mockCredential = { credential: true } as unknown as UserCredential;
    const onSuccessMock = vi.fn();

    vi.mocked(confirmPhoneNumber).mockResolvedValue(mockCredential);

    const { result } = renderHook(
      () =>
        useVerifyPhoneNumberForm({
          verificationId: mockVerificationId,
          onSuccess: onSuccessMock,
        }),
      {
        wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
      }
    );

    act(() => {
      result.current.setFieldValue("verificationCode", "123456");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSuccessMock).toHaveBeenCalledWith(mockCredential);
  });
});

describe("<PhoneNumberForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the phone number form correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "sendCode",
          phoneNumber: "phoneNumber",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneNumberForm onSubmit={vi.fn()} />
      </FirebaseUIProvider>
    );

    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /phoneNumber/i })).toBeInTheDocument();
    expect(screen.getByTestId("country-selector")).toBeInTheDocument();

    const sendCodeButton = screen.getByRole("button", { name: "sendCode" });
    expect(sendCodeButton).toBeInTheDocument();
    expect(sendCodeButton).toHaveAttribute("type", "submit");
  });

  it("should trigger validation errors when the form is blurred", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneNumberForm onSubmit={vi.fn()} />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form.fui-form");
    expect(form).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /phone number/i });

    act(() => {
      fireEvent.blur(input);
    });

    expect(screen.getByText("Please provide a phone number")).toBeInTheDocument();
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
          phoneNumber: "phoneNumber",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /phoneNumber/i })).toBeInTheDocument();
    expect(screen.getByTestId("country-selector")).toBeInTheDocument();

    const sendCodeButton = screen.getByRole("button", { name: "sendCode" });
    expect(sendCodeButton).toBeInTheDocument();
    expect(sendCodeButton).toHaveAttribute("type", "submit");
  });

  it("should render phone number form initially and handle form submission", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "sendCode",
          phoneNumber: "phoneNumber",
        },
      }),
    });

    const onSignInMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm onSignIn={onSignInMock} />
      </FirebaseUIProvider>
    );

    expect(screen.getByRole("textbox", { name: /phoneNumber/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sendCode" })).toBeInTheDocument();
    expect(screen.getByTestId("country-selector")).toBeInTheDocument();
  });
});
