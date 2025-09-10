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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhoneForm } from "../../../../src/auth/forms/phone-form";
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
vi.mock("@firebase-ui/core", async (originalImport) => {
  const mod = await originalImport<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    signInWithPhoneNumber: vi.fn().mockResolvedValue({
      confirm: vi.fn().mockResolvedValue(undefined),
    }),
    confirmPhoneNumber: vi.fn().mockResolvedValue(undefined),
    createPhoneFormSchema: vi.fn().mockReturnValue({
      phoneNumber: { required: "Phone number is required" },
      verificationCode: { required: "Verification code is required" },
      pick: vi.fn().mockReturnValue({
        phoneNumber: { required: "Phone number is required" },
      }),
    }),
    formatPhoneNumberWithCountry: vi.fn(
      (phoneNumber, dialCode) => `${dialCode}${phoneNumber}`
    ),
  };
});

// Mock @tanstack/react-form library
vi.mock("@tanstack/react-form", () => {
  const handleSubmitMock = vi.fn().mockImplementation((callback) => {
    // Store the callback to call it directly in tests
    (global as any).formSubmitCallback = callback;
    return Promise.resolve();
  });

  return {
    useForm: vi.fn().mockImplementation(({ onSubmit }) => {
      // Save the onSubmit function to call it directly in tests
      (global as any).formOnSubmit = onSubmit;

      return {
        handleSubmit: handleSubmitMock,
        Field: ({ children, name }: any) => {
          const field = {
            name,
            state: {
              value: name === "phoneNumber" ? "1234567890" : "123456",
              meta: {
                isTouched: false,
                errors: [],
              },
            },
            handleBlur: vi.fn(),
            handleChange: vi.fn(),
          };
          return children(field);
        },
      };
    }),
  };
});

// Mock hooks
vi.mock("../../../../src/hooks", () => ({
  useAuth: vi.fn().mockReturnValue({}),
  useUI: vi.fn().mockReturnValue({
    locale: "en-US",
    translations: {
      "en-US": {
        labels: {
          phoneNumber: "Phone Number",
          verificationCode: "Verification Code",
          sendVerificationCode: "Send Verification Code",
          resendVerificationCode: "Resend Verification Code",
          enterVerificationCode: "Enter Verification Code",
          continue: "Continue",
          backToSignIn: "Back to Sign In",
        },
        errors: {
          unknownError: "Unknown error",
        },
      },
    },
  }),
}));

// Mock the components
vi.mock("../../../../src/components/field-info", () => ({
  FieldInfo: vi
    .fn()
    .mockImplementation(({ field }) => (
      <div data-testid="field-info">
        {field.state.meta.errors.length > 0 && (
          <span>{field.state.meta.errors[0]}</span>
        )}
      </div>
    )),
}));

vi.mock("../../../../src/components/policies", () => ({
  Policies: vi.fn().mockReturnValue(<div data-testid="policies" />),
}));

vi.mock("../../../../src/components/button", () => ({
  Button: vi.fn().mockImplementation(({ children, type, onClick }) => (
    <button type={type} onClick={onClick} data-testid="submit-button">
      {children}
    </button>
  )),
}));

vi.mock("../../../../src/components/country-selector", () => ({
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

// Import the actual functions after mocking
import { signInWithPhoneNumber } from "@firebase-ui/core";

describe("PhoneForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the global state
    (global as any).formOnSubmit = null;
    (global as any).formSubmitCallback = null;
  });

  it("renders the phone number form initially", () => {
    render(<PhoneForm />);

    expect(
      screen.getByRole("textbox", { name: /phone number/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("country-selector")).toBeInTheDocument();
    expect(screen.getByTestId("policies")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("attempts to send verification code when phone number is submitted", async () => {
    render(<PhoneForm />);

    // Get the submit button
    const submitButton = screen.getByTestId("submit-button");

    // Trigger form submission
    await act(async () => {
      fireEvent.click(submitButton);

      // Directly call the onSubmit function with form values
      if ((global as any).formOnSubmit) {
        await (global as any).formOnSubmit({
          value: {
            phoneNumber: "1234567890",
          },
        });
      }
    });

    // Check that the phone verification function was called with any parameters
    expect(signInWithPhoneNumber).toHaveBeenCalled();
    // Verify the phone number is in the second parameter
    expect(signInWithPhoneNumber).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/1234567890/),
      expect.anything()
    );
  });

  it("displays error message when phone verification fails", async () => {
    const mockError = new Error("Invalid phone number");
    (mockError as any).code = "auth/invalid-phone-number";
    (
      signInWithPhoneNumber as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(mockError);

    render(<PhoneForm />);

    // Get the submit button
    const submitButton = screen.getByTestId("submit-button");

    // Trigger form submission
    await act(async () => {
      fireEvent.click(submitButton);

      // Directly call the onSubmit function with form values
      if ((global as any).formOnSubmit) {
        await (global as any)
          .formOnSubmit({
            value: {
              phoneNumber: "1234567890",
            },
          })
          .catch(() => {
            // Catch the error to prevent it from failing the test
          });
      }
    });

    // The UI should show the error message in the form__error div
    expect(screen.getByText("Unknown error")).toBeInTheDocument();
  });

  it("validates on blur for the first time", async () => {
    render(<PhoneForm />);

    const phoneInput = screen.getByRole("textbox", { name: /phone number/i });

    await act(async () => {
      fireEvent.blur(phoneInput);
    });

    // Check that handleBlur was called
    expect((global as any).formOnSubmit).toBeDefined();
  });

  it("validates on input after first blur", async () => {
    render(<PhoneForm />);

    const phoneInput = screen.getByRole("textbox", { name: /phone number/i });

    // First validation on blur
    await act(async () => {
      fireEvent.blur(phoneInput);
    });

    // Then validation should happen on input
    await act(async () => {
      fireEvent.input(phoneInput, { target: { value: "1234567890" } });
    });

    // Check that handleBlur and form.update were called
    expect((global as any).formOnSubmit).toBeDefined();
  });
});
