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
import { ForgotPasswordAuthForm } from "./forgot-password-auth-form";
import { act } from "react";
import { useForgotPasswordAuthFormAction } from "@firebase-ui/react";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    sendPasswordResetEmail: vi.fn(),
  };
});

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    useForgotPasswordAuthFormAction: vi.fn(),
  };
});

vi.mock("./policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

describe("<ForgotPasswordAuthForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the form correctly", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm />
      </FirebaseUIProvider>
    );

    expect(container.querySelector("input[name='email']")).toBeInTheDocument();
    expect(container.querySelector("button[type='submit']")).toBeInTheDocument();
  });

  it("should render with back to sign in callback", () => {
    const onBackToSignInClickMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          backToSignIn: "backToSignIn",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm onBackToSignInClick={onBackToSignInClickMock} />
      </FirebaseUIProvider>
    );

    const button = container.querySelector("button[type='button']");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("backToSignIn");

    act(() => {
      fireEvent.click(button!);
    });

    expect(onBackToSignInClickMock).toHaveBeenCalled();
  });

  it("should call the onPasswordSent callback when the form is submitted successfully", async () => {
    const mockAction = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useForgotPasswordAuthFormAction).mockReturnValue(mockAction);
    const onPasswordSentMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          resetPassword: "Reset Password",
        },
        errors: {
          invalidEmail: "Invalid email",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm onPasswordSent={onPasswordSentMock} />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();

    const emailInput = container.querySelector("input[name='email']");

    act(() => {
      fireEvent.change(emailInput!, { target: { value: "test@example.com" } });
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });

    expect(mockAction).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(onPasswordSentMock).toHaveBeenCalled();
  });

  it("should display error message when form submission fails", async () => {
    const mockAction = vi.fn().mockRejectedValue(new Error("foo"));

    vi.mocked(useForgotPasswordAuthFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          resetPassword: "Reset Password",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm />
      </FirebaseUIProvider>
    );

    const emailInput = container.querySelector("input[name='email']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText("foo")).toBeInTheDocument();
  });

  it("should show success message after successful submission", async () => {
    const mockAction = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useForgotPasswordAuthFormAction).mockReturnValue(mockAction);
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          resetPassword: "Reset Password",
        },
        messages: {
          checkEmailForReset: "Check your email for reset instructions",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form");
    const emailInput = container.querySelector("input[name='email']");

    act(() => {
      fireEvent.change(emailInput!, { target: { value: "test@example.com" } });
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(screen.getByText("Check your email for reset instructions")).toBeInTheDocument();
    });

    // Form should no longer be visible
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });

  it("should not show success message initially", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        messages: {
          checkEmailForReset: "Check your email for reset instructions",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm />
      </FirebaseUIProvider>
    );

    expect(screen.queryByText("Check your email for reset instructions")).not.toBeInTheDocument();
    expect(container.querySelector("form")).toBeInTheDocument();
  });
});
