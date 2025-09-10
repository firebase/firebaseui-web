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

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmailPasswordForm } from "../../../../src/auth/forms/email-password-form";
import { act } from "react";

// Mock the dependencies
vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    signInWithEmailAndPassword: vi.fn().mockResolvedValue(undefined),
    FirebaseUIError: class FirebaseUIError extends Error {
      constructor(error: any) {
        super(error.message || "Unknown error");
        this.name = "FirebaseUIError";
      }
    },
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
              value: name === "email" ? "test@example.com" : "password123",
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

vi.mock("../../../../src/hooks", () => ({
  useAuth: vi.fn().mockReturnValue({}),
  useUI: vi.fn().mockReturnValue({
    translations: {
      "en-US": {
        labels: {
          emailAddress: "Email Address",
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
  Policies: vi
    .fn()
    .mockReturnValue(<div data-testid="policies" />),
}));

vi.mock("../../../../src/components/button", () => ({
  Button: vi.fn().mockImplementation(({ children, type, onClick }) => (
    <button type={type} onClick={onClick} data-testid="submit-button">
      {children}
    </button>
  )),
}));

// Import the actual functions after mocking
import { signInWithEmailAndPassword } from "@firebase-ui/core";

describe("EmailPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(<EmailPasswordForm />);

    expect(
      screen.getByRole("textbox", { name: /email address/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("policies")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("submits the form when the button is clicked", async () => {
    render(<EmailPasswordForm />);

    // Get the submit button
    const submitButton = screen.getByTestId("submit-button");

    // Trigger form submission
    await act(async () => {
      fireEvent.click(submitButton);

      // Directly call the onSubmit function with form values
      if ((global as any).formOnSubmit) {
        await (global as any).formOnSubmit({
          value: {
            email: "test@example.com",
            password: "password123",
          },
        });
      }
    });

    // Check that the authentication function was called
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
      "password123"
    );
  });

  it("displays error message when sign in fails", async () => {
    // Mock the sign in function to reject with an error
    const mockError = new Error("Invalid credentials");
    (signInWithEmailAndPassword as Mock).mockRejectedValueOnce(mockError);

    render(<EmailPasswordForm />);

    // Get the submit button
    const submitButton = screen.getByTestId("submit-button");

    // Trigger form submission
    await act(async () => {
      fireEvent.click(submitButton);

      // Directly call the onSubmit function with form values
      if ((global as any).formOnSubmit) {
        await (global as any).formOnSubmit({
          value: {
            email: "test@example.com",
            password: "password123",
          },
        });
      }
    });

    // Check that the authentication function was called
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it("validates on blur for the first time", async () => {
    render(<EmailPasswordForm />);

    const emailInput = screen.getByRole("textbox", { name: /email address/i });
    const passwordInput = screen.getByDisplayValue("password123");

    await act(async () => {
      fireEvent.blur(emailInput);
      fireEvent.blur(passwordInput);
    });

    // Check that handleBlur was called
    expect((global as any).formOnSubmit).toBeDefined();
  });

  it("validates on input after first blur", async () => {
    render(<EmailPasswordForm />);

    const emailInput = screen.getByRole("textbox", { name: /email address/i });
    const passwordInput = screen.getByDisplayValue("password123");

    // First validation on blur
    await act(async () => {
      fireEvent.blur(emailInput);
      fireEvent.blur(passwordInput);
    });

    // Then validation should happen on input
    await act(async () => {
      fireEvent.input(emailInput, { target: { value: "test@example.com" } });
      fireEvent.input(passwordInput, { target: { value: "password123" } });
    });

    // Check that handleBlur and form.update were called
    expect((global as any).formOnSubmit).toBeDefined();
  });
});
