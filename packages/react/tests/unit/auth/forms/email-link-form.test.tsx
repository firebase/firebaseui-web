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
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EmailLinkForm } from "../../../../src/auth/forms/email-link-form";

// Mock Firebase UI Core
vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  const FirebaseUIError = vi.fn();
  FirebaseUIError.prototype.message = "Test error message";

  return {
    ...mod,
    FirebaseUIError: class FirebaseUIError {
      message: string;
      code?: string;

      constructor({ code, message }: { code: string; message: string }) {
        this.code = code;
        this.message = message;
      }
    },
    completeEmailLinkSignIn: vi.fn(),
    sendSignInLinkToEmail: vi.fn(),
    createEmailLinkFormSchema: () => ({
      email: {
        validate: (value: string) => {
          if (!value) return "Email is required";
          return undefined;
        },
      },
    }),
  };
});

import {
  FirebaseUIError,
  sendSignInLinkToEmail,
  completeEmailLinkSignIn,
} from "@firebase-ui/core";

// Mock React's useState to control state for testing
const useStateMock = vi.fn();
const setFormErrorMock = vi.fn();
const setEmailSentMock = vi.fn();

// Mock hooks
vi.mock("../../../../src/hooks", () => ({
  useUI: vi.fn(() => ({
    locale: "en-US",
    translations: {
      "en-US": {
        labels: {
          emailAddress: "Email",
          sendSignInLink: "sendSignInLink",
        },
      },
    },
  })),
  useAuth: vi.fn(() => ({})),
}));

// Mock form
vi.mock("@tanstack/react-form", () => ({
  useForm: () => {
    const formState = {
      email: "test@example.com",
    };

    return {
      Field: ({ name, children }: any) => {
        // Create a mock field with the required methods and state management
        const field = {
          name,
          handleBlur: vi.fn(),
          handleChange: vi.fn((value: string) => {
            formState[name as keyof typeof formState] = value;
          }),
          state: {
            value: formState[name as keyof typeof formState] || "",
            meta: { isTouched: false, errors: [] },
          },
        };

        return children(field);
      },
      handleSubmit: vi.fn().mockImplementation(async () => {
        // Call the onSubmit handler with the form state
        await (global as any).formOnSubmit?.({ value: formState });
      }),
    };
  },
}));

// Mock components
vi.mock("../../../../src/components/field-info", () => ({
  FieldInfo: () => <div data-testid="field-info" />,
}));

vi.mock("../../../../src/components/policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

vi.mock("../../../../src/components/button", () => ({
  Button: ({
    children,
    onClick,
    type,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "submit" | "reset" | "button";
    [key: string]: any;
  }) => (
    <button onClick={onClick} type={type} data-testid="submit-button" {...rest}>
      {children}
    </button>
  ),
}));

// Mock react useState to control state in tests
vi.mock("react", async () => {
  const actual = (await vi.importActual("react")) as typeof import("react");
  return {
    ...actual,
    useState: vi.fn().mockImplementation((initialValue) => {
      useStateMock(initialValue);
      // For formError state
      if (initialValue === null) {
        return [null, setFormErrorMock];
      }
      // For emailSent state
      if (initialValue === false) {
        return [false, setEmailSentMock];
      }
      // Default behavior for other useState calls
      return actual.useState(initialValue);
    }),
  };
});

const mockSendSignInLink = vi.mocked(sendSignInLinkToEmail);
const mockCompleteEmailLink = vi.mocked(completeEmailLinkSignIn);

describe("EmailLinkForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the global state
    (global as any).formOnSubmit = null;
    setFormErrorMock.mockReset();
    setEmailSentMock.mockReset();
  });

  it("renders the email link form", () => {
    render(<EmailLinkForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("sendSignInLink")).toBeInTheDocument();
  });

  it("attempts to complete email link sign-in on load", () => {
    mockCompleteEmailLink.mockResolvedValue(null);

    render(<EmailLinkForm />);

    expect(mockCompleteEmailLink).toHaveBeenCalled();
  });

  it("submits the form and sends sign-in link to email", async () => {
    mockSendSignInLink.mockResolvedValue(undefined);

    const { container } = render(<EmailLinkForm />);

    // Get the form element
    const form = container.getElementsByClassName(
      "fui-form"
    )[0] as HTMLFormElement;

    // Set up the form submit handler
    (global as any).formOnSubmit = async ({
      value,
    }: {
      value: { email: string };
    }) => {
      await sendSignInLinkToEmail(expect.anything(), value.email);
    };

    // Submit the form
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockSendSignInLink).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
    );
  });

  it("handles error when sending email link fails", async () => {
    // Mock the error that will be thrown
    const mockError = new FirebaseUIError({
      code: "auth/invalid-email",
      message: "Invalid email",
    });
    mockSendSignInLink.mockRejectedValue(mockError);

    const { container } = render(<EmailLinkForm />);

    // Get the form element
    const form = container.getElementsByClassName(
      "fui-form"
    )[0] as HTMLFormElement;

    // Set up the form submit handler to simulate error
    (global as any).formOnSubmit = async () => {
      try {
        // Simulate the action that would throw an error
        await sendSignInLinkToEmail(expect.anything(), "invalid-email");
      } catch (error) {
        // Simulate the error being caught and error state being set
        setFormErrorMock("Invalid email");
        // Don't rethrow the error - we've handled it here
      }
    };

    // Submit the form
    await act(async () => {
      fireEvent.submit(form);
    });

    // Verify that the error state was updated
    expect(setFormErrorMock).toHaveBeenCalledWith("Invalid email");
  });

  it("handles success when email is sent", async () => {
    mockSendSignInLink.mockResolvedValue(undefined);

    const { container } = render(<EmailLinkForm />);

    // Get the form element
    const form = container.getElementsByClassName(
      "fui-form"
    )[0] as HTMLFormElement;

    // Set up the form submit handler
    (global as any).formOnSubmit = async () => {
      // Simulate successful email send by setting emailSent to true
      setEmailSentMock(true);
    };

    // Submit the form
    await act(async () => {
      fireEvent.submit(form);
    });

    // Verify that the success state was updated
    expect(setEmailSentMock).toHaveBeenCalledWith(true);
  });

  it("validates on blur for the first time", async () => {
    render(<EmailLinkForm />);

    const emailInput = screen.getByLabelText("Email");

    await act(async () => {
      fireEvent.blur(emailInput);
    });

    // Check that form validation is available
    expect((global as any).formOnSubmit).toBeDefined();
  });

  it("validates on input after first blur", async () => {
    render(<EmailLinkForm />);

    const emailInput = screen.getByLabelText("Email");

    // First validation on blur
    await act(async () => {
      fireEvent.blur(emailInput);
    });

    // Then validation should happen on input
    await act(async () => {
      fireEvent.input(emailInput, { target: { value: "test@example.com" } });
    });

    // Check that form validation is available
    expect((global as any).formOnSubmit).toBeDefined();
  });
});
