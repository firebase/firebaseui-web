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
import { SignUpAuthForm } from "./sign-up-auth-form";
import { act } from "react";
import { useSignUpAuthFormAction } from "@firebase-ui/react";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";
import { UserCredential } from "firebase/auth";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    createUserWithEmailAndPassword: vi.fn(),
  };
});

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    useSignUpAuthFormAction: vi.fn(),
  };
});

vi.mock("./policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

describe("<SignUpAuthForm />", () => {
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
        <SignUpAuthForm />
      </FirebaseUIProvider>
    );

    expect(container.querySelector("input[name='email']")).toBeInTheDocument();
    expect(container.querySelector("input[name='password']")).toBeInTheDocument();
    expect(container.querySelector("button[type='submit']")).toBeInTheDocument();
  });

  it("should render with back to sign in callback", () => {
    const onBackToSignInClickMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        prompts: {
          haveAccount: "haveAccount",
        },
        labels: {
          signIn: "signIn",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm onBackToSignInClick={onBackToSignInClickMock} />
      </FirebaseUIProvider>
    );

    const button = container.querySelector("button[type='button']");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("haveAccount signIn");

    act(() => {
      fireEvent.click(button!);
    });

    expect(onBackToSignInClickMock).toHaveBeenCalled();
  });

  it("should call the onSignUp callback when the form is submitted", async () => {
    const mockAction = vi.fn().mockResolvedValue({} as unknown as UserCredential);
    vi.mocked(useSignUpAuthFormAction).mockReturnValue(mockAction);
    const onSignUpMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          createAccount: "Create Account",
        },
        errors: {
          invalidEmail: "Invalid email",
          weakPassword: "Password too weak",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm onSignUp={onSignUpMock} />
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

    expect(mockAction).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      displayName: undefined,
    });
    expect(onSignUpMock).toHaveBeenCalled();
  });

  it("should display error message when form submission fails", async () => {
    const mockAction = vi.fn().mockRejectedValue(new Error("foo"));

    vi.mocked(useSignUpAuthFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          createAccount: "Create Account",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
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

    expect(await screen.findByText("foo")).toBeInTheDocument();
  });

  it("should render displayName field when requireDisplayName is true", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          displayName: "Display Name",
          createAccount: "Create Account",
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

    expect(container.querySelector("input[name='email']")).toBeInTheDocument();
    expect(container.querySelector("input[name='password']")).toBeInTheDocument();
    expect(container.querySelector("input[name='displayName']")).toBeInTheDocument();
    expect(container.querySelector("button[type='submit']")).toBeInTheDocument();
  });

  it("should not render displayName field when requireDisplayName is false", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          displayName: "Display Name",
          createAccount: "Create Account",
        },
      }),
      behaviors: [], // Explicitly set empty behaviors array
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthForm />
      </FirebaseUIProvider>
    );

    expect(container.querySelector("input[name='email']")).toBeInTheDocument();
    expect(container.querySelector("input[name='password']")).toBeInTheDocument();
    expect(container.querySelector("input[name='displayName']")).not.toBeInTheDocument();
    expect(container.querySelector("button[type='submit']")).toBeInTheDocument();
  });

  it("should call the onSignUp callback with displayName when requireDisplayName is true", async () => {
    const mockAction = vi.fn().mockResolvedValue({} as unknown as UserCredential);
    vi.mocked(useSignUpAuthFormAction).mockReturnValue(mockAction);
    const onSignUpMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          displayName: "Display Name",
          createAccount: "Create Account",
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
        <SignUpAuthForm onSignUp={onSignUpMock} />
      </FirebaseUIProvider>
    );

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();

    const emailInput = container.querySelector("input[name='email']");
    const passwordInput = container.querySelector("input[name='password']");
    const displayNameInput = container.querySelector("input[name='displayName']");

    act(() => {
      fireEvent.change(emailInput!, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput!, { target: { value: "password123" } });
      fireEvent.change(displayNameInput!, { target: { value: "John Doe" } });
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });

    expect(mockAction).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      displayName: "John Doe",
    });
    expect(onSignUpMock).toHaveBeenCalled();
  });
});
