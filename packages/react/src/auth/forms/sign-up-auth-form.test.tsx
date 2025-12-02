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
import { SignUpAuthForm, useSignUpAuthForm, useSignUpAuthFormAction, useRequireDisplayName } from "./sign-up-auth-form";
import { act } from "react";
import { createUserWithEmailAndPassword } from "@firebase-oss/ui-core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import type { UserCredential } from "firebase/auth";
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

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      expect.any(Object),
      "test@example.com",
      "password123",
      undefined
    );
  });

  it("should return a credential on success", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;

    const createUserWithEmailAndPasswordMock = vi
      .mocked(createUserWithEmailAndPassword)
      .mockResolvedValue(mockCredential);

    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignUpAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      const credential = await result.current({ email: "test@example.com", password: "password123" });
      expect(credential).toBe(mockCredential);
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      expect.any(Object),
      "test@example.com",
      "password123",
      undefined
    );
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

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      mockUI.get(),
      "test@example.com",
      "password123",
      undefined
    );
  });

  it("should return a callback which accepts email, password, and displayName", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;
    const createUserWithEmailAndPasswordMock = vi
      .mocked(createUserWithEmailAndPassword)
      .mockResolvedValue(mockCredential);
    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignUpAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ email: "test@example.com", password: "password123", displayName: "John Doe" });
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      expect.any(Object),
      "test@example.com",
      "password123",
      "John Doe"
    );
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
    const mockCredential = { credential: true } as unknown as UserCredential;
    const mockUI = createMockUI();
    const createUserWithEmailAndPasswordMock = vi
      .mocked(createUserWithEmailAndPassword)
      .mockResolvedValue(mockCredential);

    const { result } = renderHook(() => useSignUpAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "test@example.com");
      result.current.setFieldValue("password", "password123");
      // Don't set displayName - let it be undefined (optional)
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      mockUI.get(),
      "test@example.com",
      "password123",
      undefined
    );
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

  it("should allow the form to be submitted with displayName", async () => {
    const mockUI = createMockUI();
    const createUserWithEmailAndPasswordMock = vi.mocked(createUserWithEmailAndPassword);

    const { result } = renderHook(() => useSignUpAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "test@example.com");
      result.current.setFieldValue("password", "password123");
      result.current.setFieldValue("displayName", "John Doe");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      mockUI.get(),
      "test@example.com",
      "password123",
      "John Doe"
    );
  });
});

describe("<SignUpAuthForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the form correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          createAccount: "createAccount",
          emailAddress: "emailAddress",
          password: "password",
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

    // Make sure we have an email and password input with translated labels
    expect(screen.getByRole("textbox", { name: /emailAddress/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/)).toBeInTheDocument();

    // Ensure the "Create Account" button is present and is a submit button
    const createAccountButton = screen.getByRole("button", { name: "createAccount" });
    expect(createAccountButton).toBeInTheDocument();
    expect(createAccountButton).toHaveAttribute("type", "submit");
  });

  it("should render the back to sign in button callback when onSignInClick is provided", () => {
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

    const onSignInClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm onSignInClick={onSignInClickMock} />
      </FirebaseUIProvider>
    );

    const name = "foo bar";

    const backToSignInButton = screen.getByRole("button", { name });
    expect(backToSignInButton).toBeInTheDocument();
    expect(backToSignInButton).toHaveTextContent(name);

    // Make sure it's a button so it doesn't submit the form
    expect(backToSignInButton).toHaveAttribute("type", "button");

    fireEvent.click(backToSignInButton);
    expect(onSignInClickMock).toHaveBeenCalled();
  });

  it("should trigger validation errors when the form is blurred", () => {
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

  it("should render displayName field when requireDisplayName behavior is enabled", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          createAccount: "createAccount",
          emailAddress: "emailAddress",
          password: "password",
          displayName: "displayName",
        },
      }),
      behaviors: [
        {
          requireDisplayName: { type: "callable" as const, handler: vi.fn() },
        },
      ],
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
      </FirebaseUIProvider>
    );

    // There should be only one form
    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    // Make sure we have all three inputs with translated labels
    expect(screen.getByRole("textbox", { name: /emailAddress/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /displayName/ })).toBeInTheDocument();

    // Ensure the "Create Account" button is present and is a submit button
    const createAccountButton = screen.getByRole("button", { name: "createAccount" });
    expect(createAccountButton).toBeInTheDocument();
    expect(createAccountButton).toHaveAttribute("type", "submit");
  });

  it("should not render displayName field when requireDisplayName behavior is not enabled", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          createAccount: "createAccount",
          emailAddress: "emailAddress",
          password: "password",
          displayName: "displayName",
        },
      }),
      behaviors: [], // Explicitly set empty behaviors array
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /email/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /displayName/ })).not.toBeInTheDocument();
  });

  it("should trigger displayName validation errors when the form is blurred and requireDisplayName is enabled", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        errors: {
          displayNameRequired: "Please provide a display name",
        },
        labels: {
          displayName: "displayName",
        },
      }),
      behaviors: [
        {
          requireDisplayName: { type: "callable" as const, handler: vi.fn() },
        },
      ],
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form.fui-form");
    expect(form).toBeInTheDocument();

    const displayNameInput = screen.getByRole("textbox", { name: /displayName/ });
    expect(displayNameInput).toBeInTheDocument();

    act(() => {
      fireEvent.blur(displayNameInput);
    });

    expect(screen.getByText("Please provide a display name")).toBeInTheDocument();
  });

  it("should not trigger displayName validation when requireDisplayName is not enabled", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        errors: {
          displayNameRequired: "Please provide a display name",
        },
        labels: {
          displayName: "displayName",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form.fui-form");
    expect(form).toBeInTheDocument();

    // Display name field should not be present
    expect(screen.queryByRole("textbox", { name: "displayName" })).not.toBeInTheDocument();
  });
});

describe("useRequireDisplayName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should return true when requireDisplayName behavior is enabled", () => {
    const mockUI = createMockUI({
      behaviors: [
        {
          requireDisplayName: { type: "callable" as const, handler: vi.fn() },
        },
      ],
    });

    const { result } = renderHook(() => useRequireDisplayName(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBe(true);
  });

  it("should return false when requireDisplayName behavior is not enabled", () => {
    const mockUI = createMockUI({
      behaviors: [],
    });

    const { result } = renderHook(() => useRequireDisplayName(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBe(false);
  });

  it("should return false when behaviors array is empty", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useRequireDisplayName(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBe(false);
  });
});
