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
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { PhoneAuthForm } from "./phone-auth-form";
import { act } from "react";
import { usePhoneNumberFormAction, useVerifyPhoneNumberFormAction, useUI } from "@invertase/firebaseui-react";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";
import { User, UserCredential } from "firebase/auth";
import { FirebaseUI, FirebaseUIError } from "@invertase/firebaseui-core";
import { FirebaseError } from "firebase/app";
import { ERROR_CODE_MAP } from "@invertase/firebaseui-translations";

vi.mock("@invertase/firebaseui-core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-core")>();
  return {
    ...mod,
    verifyPhoneNumber: vi.fn(),
    confirmPhoneNumber: vi.fn(),
    formatPhoneNumber: vi.fn((phoneNumber, country) => {
      // Mock formatPhoneNumber to return formatted phone number
      return `${country.dialCode}${phoneNumber}`;
    }),
    getTranslation: vi.fn((_, category, key) => {
      if (category === "labels" && key === "sendCode") return "Send Code";
      if (category === "labels" && key === "phoneNumber") return "Phone Number";
      if (category === "labels" && key === "verificationCode") return "Verification Code";
      if (category === "labels" && key === "verifyCode") return "Verify Code";
      if (category === "errors" && key === "invalidPhoneNumber") return "Error: Invalid phone number format";
      if (category === "errors" && key === "missingPhoneNumber") return "Phone number is required";
      return key;
    }),
  };
});

vi.mock("@invertase/firebaseui-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-react")>();
  return {
    ...mod,
    usePhoneNumberFormAction: vi.fn().mockReturnValue(vi.fn().mockResolvedValue("verification-id-123")),
    useVerifyPhoneNumberFormAction: vi.fn().mockReturnValue(vi.fn().mockResolvedValue({} as any)),
    useUI: vi.fn().mockReturnValue({
      state: "idle",
      auth: {
        currentUser: null,
      },
      locale: {
        translations: {
          labels: {
            sendCode: "Send Code",
            verificationCode: "Verification Code",
            verifyCode: "Verify Code",
            phoneNumber: "Phone Number",
          },
        },
      },
    }),
    useRecaptchaVerifier: vi.fn().mockReturnValue({
      render: vi.fn(),
      verify: vi.fn(),
      reset: vi.fn(),
      clear: vi.fn(),
    }),
  };
});

vi.mock("./policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

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
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    expect(container.querySelector("input[name='phoneNumber']")).toBeInTheDocument();
    expect(container.querySelector("button[type='submit']")).toBeInTheDocument();
    expect(container.querySelector(".fui-country-selector")).toBeInTheDocument();
    expect(screen.getByTestId("policies")).toBeInTheDocument();
  });

  it("should transition to verification form after phone number submission", async () => {
    const mockVerificationId = "test-verification-id";
    const mockAction = vi.fn().mockResolvedValue(mockVerificationId);
    vi.mocked(usePhoneNumberFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    // Initially should show phone number form
    expect(container.querySelector("input[name='phoneNumber']")).toBeInTheDocument();
    expect(container.querySelector("input[name='verificationCode']")).not.toBeInTheDocument();

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });

    expect(container.querySelector("input[name='verificationCode']")).toBeInTheDocument();
    expect(container.querySelector("input[name='phoneNumber']")).not.toBeInTheDocument();
  });

  it("should call onSignIn callback when verification is successful", async () => {
    const mockVerificationId = "test-verification-id";
    const mockCredential = { credential: true } as unknown as UserCredential;
    const mockPhoneAction = vi.fn().mockResolvedValue(mockVerificationId);
    const mockVerifyAction = vi.fn().mockResolvedValue(mockCredential);

    vi.mocked(usePhoneNumberFormAction).mockReturnValue(mockPhoneAction);
    vi.mocked(useVerifyPhoneNumberFormAction).mockReturnValue(mockVerifyAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    const onSignInMock = vi.fn();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm onSignIn={onSignInMock} />
      </FirebaseUIProvider>
    );

    // Submit phone number
    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPhoneAction).toHaveBeenCalled();
    });

    // Submit verification code
    const verificationInput = container.querySelector("input[name='verificationCode']")!;
    const verifyButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(verificationInput, { target: { value: "123456" } });
    });

    await act(async () => {
      fireEvent.click(verifyButton);
    });

    await waitFor(() => {
      expect(mockVerifyAction).toHaveBeenCalled();
    });

    expect(onSignInMock).toHaveBeenCalledWith(mockCredential);
  });

  it("should display error message when phone number submission fails", async () => {
    const mockAction = vi.fn().mockRejectedValue(new Error("Phone verification failed"));
    vi.mocked(usePhoneNumberFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText("Error: Phone verification failed")).toBeInTheDocument();
  });

  it("should display error message when verification fails", async () => {
    const mockVerificationId = "test-verification-id";
    const mockPhoneAction = vi.fn().mockResolvedValue(mockVerificationId);
    const mockVerifyAction = vi.fn().mockRejectedValue(new Error("Invalid verification code"));

    vi.mocked(usePhoneNumberFormAction).mockReturnValue(mockPhoneAction);
    vi.mocked(useVerifyPhoneNumberFormAction).mockReturnValue(mockVerifyAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    // Submit phone number first
    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPhoneAction).toHaveBeenCalled();
    });

    // Now submit verification code
    const verificationInput = container.querySelector("input[name='verificationCode']")!;
    const verifyButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(verificationInput, { target: { value: "123456" } });
    });

    await act(async () => {
      fireEvent.click(verifyButton);
    });

    expect(await screen.findByText("Error: Invalid verification code")).toBeInTheDocument();
  });

  it.skip("should handle FirebaseUIError with proper error message", async () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
        },
        errors: {
          "auth/invalid-phone-number": "Error: Invalid phone number format",
        },
      }),
    });

    const firebaseError = new FirebaseUIError(
      mockUI.get(),
      new FirebaseError("auth/invalid-phone-number", "Invalid phone number format")
    );
    const mockAction = vi.fn().mockRejectedValue(firebaseError);
    vi.mocked(usePhoneNumberFormAction).mockReturnValue(mockAction);

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText("Error: Invalid phone number format")).toBeInTheDocument();
  });

  it("should disable submit button when UI state is not idle", () => {
    // Mock useUI to return pending state
    vi.mocked(useUI).mockReturnValue({
      state: "pending",
      auth: {
        currentUser: null,
      },
    } as unknown as FirebaseUI);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    const submitButton = container.querySelector("button[type='submit']")!;
    expect(submitButton).toBeDisabled();
  });

  it.skip("should format phone number with country code before submission", async () => {
    const mockVerificationId = "test-verification-id";
    const mockAction = vi.fn().mockResolvedValue(mockVerificationId);
    vi.mocked(usePhoneNumberFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendCode: "Send Code",
          phoneNumber: "Phone Number",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <PhoneAuthForm />
      </FirebaseUIProvider>
    );

    const phoneInput = container.querySelector("input[name='phoneNumber']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    act(() => {
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });

    // Should be called with formatted phone number
    expect(mockAction).toHaveBeenCalledWith({
      phoneNumber: "+11234567890", // formatted with country code
      recaptchaVerifier: expect.any(Object),
    });
  });
});
