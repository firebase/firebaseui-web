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
import { SignInAuthForm, useSignInAuthForm, useSignInAuthFormAction } from "./sign-in-auth-form";
import { act } from "react";
import { signInWithEmailAndPassword } from "@firebase-ui/core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import type { UserCredential } from "firebase/auth";
import { FirebaseUIProvider } from "~/context";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    signInWithEmailAndPassword: vi.fn(),
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

describe("useSignInAuthFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accept an email and password", async () => {
    const signInWithEmailAndPasswordMock = vi.mocked(signInWithEmailAndPassword);
    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignInAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ email: "test@example.com", password: "password123" });
    });

    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(expect.any(Object), "test@example.com", "password123");
  });

  it("should return a credential on success", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;

    const signInWithEmailAndPasswordMock = vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockCredential);

    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignInAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      const credential = await result.current({ email: "test@example.com", password: "password123" });
      expect(credential).toBe(mockCredential);
    });

    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(expect.any(Object), "test@example.com", "password123");
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const signInWithEmailAndPasswordMock = vi
      .mocked(signInWithEmailAndPassword)
      .mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const { result } = renderHook(() => useSignInAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ email: "test@example.com", password: "password123" });
      });
    }).rejects.toThrow("unknownError");

    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com", "password123");
  });
});

describe("useSignInAuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should allow the form to be submitted", async () => {
    const mockUI = createMockUI();
    const signInWithEmailAndPasswordMock = vi.mocked(signInWithEmailAndPassword);

    const { result } = renderHook(() => useSignInAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "test@example.com");
      result.current.setFieldValue("password", "password123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com", "password123");
  });

  it("should not allow the form to be submitted if the form is invalid", async () => {
    const mockUI = createMockUI();
    const signInWithEmailAndPasswordMock = vi.mocked(signInWithEmailAndPassword);

    const { result } = renderHook(() => useSignInAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.getFieldMeta("email")!.errors[0].length).toBeGreaterThan(0);
    expect(signInWithEmailAndPasswordMock).not.toHaveBeenCalled();
  });
});

describe("<SignInAuthForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.only("should render the form correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signIn: "signIn",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm />
      </FirebaseUIProvider>
    );

    // There should be only one form
    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    // Make sure we have an email and password input
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /password/i })).toBeInTheDocument();

    // Ensure the "Sign In" button is present and is a submit button
    const signInButton = screen.getByRole("button", { name: "signIn" });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute("type", "submit");
  });

  it("should render the forgot password button callback when onForgotPasswordClick is provided", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          forgotPassword: "forgotPassword",
        },
      }),
    });

    const onForgotPasswordClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm onForgotPasswordClick={onForgotPasswordClickMock} />
      </FirebaseUIProvider>
    );

    const forgotPasswordButton = screen.getByRole("button", { name: "forgotPassword" });
    expect(forgotPasswordButton).toBeInTheDocument();
    expect(forgotPasswordButton).toHaveTextContent("forgotPassword");

    // Make sure it's a button so it doesn't submit the form
    expect(forgotPasswordButton).toHaveAttribute("type", "button");

    fireEvent.click(forgotPasswordButton);
    expect(onForgotPasswordClickMock).toHaveBeenCalled();
  });

  it("should render the register button callback when onRegisterClick is provided", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        prompts: {
          noAccount: "foo",
        },
        labels: {
          register: "bar",
        },
      }),
    });

    const onRegisterClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm onRegisterClick={onRegisterClickMock} />
      </FirebaseUIProvider>
    );

    const name = "foo bar";

    const registerButton = screen.getByRole("button", { name });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toHaveTextContent(name);

    // Make sure it's a button so it doesn't submit the form
    expect(registerButton).toHaveAttribute("type", "button");

    fireEvent.click(registerButton);
    expect(onRegisterClickMock).toHaveBeenCalled();
  });

  it("should trigger validation errors when the form is blurred", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm />
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
