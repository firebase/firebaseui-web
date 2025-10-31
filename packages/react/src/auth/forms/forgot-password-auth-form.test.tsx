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
  ForgotPasswordAuthForm,
  useForgotPasswordAuthForm,
  useForgotPasswordAuthFormAction,
} from "./forgot-password-auth-form";
import { act } from "react";
import { sendPasswordResetEmail } from "@firebase-oss/ui-core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import { FirebaseUIProvider } from "~/context";

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual("firebase/auth");
  return {
    ...actual,
    getRedirectResult: vi.fn().mockResolvedValue(null),
  };
});

vi.mock("@firebase-oss/ui-core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-oss/ui-core")>();
  return {
    ...mod,
    sendPasswordResetEmail: vi.fn(),
  };
});

describe("useForgotPasswordAuthFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accept an email", async () => {
    const sendPasswordResetEmailMock = vi.mocked(sendPasswordResetEmail);
    const mockUI = createMockUI();

    const { result } = renderHook(() => useForgotPasswordAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ email: "test@example.com" });
    });

    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(expect.any(Object), "test@example.com");
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const sendPasswordResetEmailMock = vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const { result } = renderHook(() => useForgotPasswordAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ email: "test@example.com" });
      });
    }).rejects.toThrow("unknownError");

    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com");
  });
});

describe("useForgotPasswordAuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should allow the form to be submitted", async () => {
    const mockUI = createMockUI();
    const sendPasswordResetEmailMock = vi.mocked(sendPasswordResetEmail);

    const { result } = renderHook(() => useForgotPasswordAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "test@example.com");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com");
  });

  it("should not allow the form to be submitted if the form is invalid", async () => {
    const mockUI = createMockUI();
    const sendPasswordResetEmailMock = vi.mocked(sendPasswordResetEmail);

    const { result } = renderHook(() => useForgotPasswordAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.getFieldMeta("email")!.errors[0].length).toBeGreaterThan(0);
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });
});

describe("<ForgotPasswordAuthForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          resetPassword: "resetPassword",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm />
      </FirebaseUIProvider>
    );

    // There should be only one form
    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    // Make sure we have an email input
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();

    // Ensure the "Reset Password" button is present and is a submit button
    const resetPasswordButton = screen.getByRole("button", { name: "resetPassword" });
    expect(resetPasswordButton).toBeInTheDocument();
    expect(resetPasswordButton).toHaveAttribute("type", "submit");
  });

  it("should render the back to sign in button callback when onBackToSignInClick is provided", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          backToSignIn: "backToSignIn",
        },
      }),
    });

    const onBackToSignInClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm onBackToSignInClick={onBackToSignInClickMock} />
      </FirebaseUIProvider>
    );

    const backToSignInButton = screen.getByRole("button", { name: "backToSignIn" });
    expect(backToSignInButton).toBeInTheDocument();
    expect(backToSignInButton).toHaveTextContent("backToSignIn");

    // Make sure it's a button so it doesn't submit the form
    expect(backToSignInButton).toHaveAttribute("type", "button");

    fireEvent.click(backToSignInButton);
    expect(onBackToSignInClickMock).toHaveBeenCalled();
  });

  it("should trigger validation errors when the form is blurred", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <ForgotPasswordAuthForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form.fui-form");
    expect(form).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /email/i });

    act(() => {
      fireEvent.blur(input);
    });

    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
  });
});
