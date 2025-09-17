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
import { SignUpAuthForm, useSignUpAuthForm, useSignUpAuthFormAction } from "./sign-up-auth-form";
import { act } from "react";
import { createUserWithEmailAndPassword } from "@firebase-ui/core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import type { UserCredential } from "firebase/auth";
import { FirebaseUIProvider } from "~/context";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    createUserWithEmailAndPassword: vi.fn(),
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

describe("useSignUpAuthFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accept an email and password", async () => {
    const createUserWithEmailAndPasswordMock = vi.mocked(createUserWithEmailAndPassword);
    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignUpAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ email: "test@example.com", password: "password123" });
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(expect.any(Object), "test@example.com", "password123");
  });

  it("should return a credential on success", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;

    const createUserWithEmailAndPasswordMock = vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(mockCredential);

    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignUpAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      const credential = await result.current({ email: "test@example.com", password: "password123" });
      expect(credential).toBe(mockCredential);
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(expect.any(Object), "test@example.com", "password123");
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const createUserWithEmailAndPasswordMock = vi
      .mocked(createUserWithEmailAndPassword)
      .mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const { result } = renderHook(() => useSignUpAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ email: "test@example.com", password: "password123" });
      });
    }).rejects.toThrow("unknownError");

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com", "password123");
  });
});

describe("useSignUpAuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should allow the form to be submitted", async () => {
    const mockUI = createMockUI();
    const createUserWithEmailAndPasswordMock = vi.mocked(createUserWithEmailAndPassword);

    const { result } = renderHook(() => useSignUpAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "test@example.com");
      result.current.setFieldValue("password", "password123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com", "password123");
  });

  it("should not allow the form to be submitted if the form is invalid", async () => {
    const mockUI = createMockUI();
    const createUserWithEmailAndPasswordMock = vi.mocked(createUserWithEmailAndPassword);

    const { result } = renderHook(() => useSignUpAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.getFieldMeta("email")!.errors[0].length).toBeGreaterThan(0);
    expect(createUserWithEmailAndPasswordMock).not.toHaveBeenCalled();
  });
});

describe("<SignUpAuthForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          createAccount: "createAccount",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
      </FirebaseUIProvider>
    );

    // There should be only one form
    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    // Make sure we have an email and password input
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /password/i })).toBeInTheDocument();

    // Ensure the "Create Account" button is present and is a submit button
    const createAccountButton = screen.getByRole("button", { name: "createAccount" });
    expect(createAccountButton).toBeInTheDocument();
    expect(createAccountButton).toHaveAttribute("type", "submit");
  });

  it("should render the back to sign in button callback when onBackToSignInClick is provided", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        prompts: {
          haveAccount: "foo",
        },
        labels: {
          signIn: "bar",
        },
      }),
    });

    const onBackToSignInClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm onBackToSignInClick={onBackToSignInClickMock} />
      </FirebaseUIProvider>
    );

    const name = "foo bar";

    const backToSignInButton = screen.getByRole("button", { name });
    expect(backToSignInButton).toBeInTheDocument();
    expect(backToSignInButton).toHaveTextContent(name);

    // Make sure it's a button so it doesn't submit the form
    expect(backToSignInButton).toHaveAttribute("type", "button");

    fireEvent.click(backToSignInButton);
    expect(onBackToSignInClickMock).toHaveBeenCalled();
  });

  it('should trigger validation errors when the form is blurred', () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
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
