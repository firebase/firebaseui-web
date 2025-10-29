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
import { SignInAuthForm } from "./sign-in-auth-form";
import { act } from "react";
import { useSignInAuthFormAction } from "@firebase-ui/react";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";
import { UserCredential } from "firebase/auth";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    signInWithEmailAndPassword: vi.fn(),
  };
});

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    useSignInAuthFormAction: vi.fn(),
  };
});

vi.mock("./policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

describe("<SignInAuthForm />", () => {
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
        <SignInAuthForm />
      </FirebaseUIProvider>
    );

    expect(container.querySelector("input[name='email']")).toBeInTheDocument();
    expect(container.querySelector("input[name='password']")).toBeInTheDocument();
    expect(container.querySelector("button[type='submit']")).toBeInTheDocument();
  });

  it("should render with forgot password callback", () => {
    const onForgotPasswordClickMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          forgotPassword: "forgotPassword",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm onForgotPasswordClick={onForgotPasswordClickMock} />
      </FirebaseUIProvider>
    );

    screen.debug();

    const button = container.querySelector("button[type='button']");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("forgotPassword");

    act(() => {
      fireEvent.click(button!);
    });

    expect(onForgotPasswordClickMock).toHaveBeenCalled();
  });

  it("should render with onSignUp callback", () => {
    const onSignUpClickMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        prompts: {
          noAccount: "noAccount",
        },
        labels: {
          register: "register",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm onSignUpClick={onSignUpClickMock} />
      </FirebaseUIProvider>
    );

    const button = container.querySelector("button[type='button']");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("noAccount register");

    act(() => {
      fireEvent.click(button!);
    });

    expect(onSignUpClickMock).toHaveBeenCalled();
  });

  it("should call the onSignIn callback when the form is submitted", async () => {
    const mockAction = vi.fn().mockResolvedValue({} as unknown as UserCredential);
    vi.mocked(useSignInAuthFormAction).mockReturnValue(mockAction);
    const onSignInMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          signIn: "Sign In",
        },
        errors: {
          invalidEmail: "Invalid email",
          weakPassword: "Password too weak",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm onSignIn={onSignInMock} />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();

    const emailInput = container.querySelector("input[name='email']");
    const passwordInput = container.querySelector("input[name='password']");

    act(() => {
      fireEvent.change(emailInput!, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput!, { target: { value: "password123" } });
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });

    expect(mockAction).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
    expect(onSignInMock).toHaveBeenCalled();
  });

  it("should display error message when form submission fails", async () => {
    const mockAction = vi.fn().mockRejectedValue(new Error("foo"));

    vi.mocked(useSignInAuthFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          signIn: "Sign In",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthForm />
      </FirebaseUIProvider>
    );

    const emailInput = container.querySelector("input[name='email']")!;
    const passwordInput = container.querySelector("input[name='password']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "somepassword" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText("Error: foo")).toBeInTheDocument();
  });
});
