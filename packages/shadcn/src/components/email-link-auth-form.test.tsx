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
import { EmailLinkAuthForm } from "./email-link-auth-form";
import { act } from "react";
import { useEmailLinkAuthFormAction } from "@firebase-ui/react";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";
import { UserCredential } from "firebase/auth";
import { completeEmailLinkSignIn } from "@firebase-ui/core";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    sendSignInLinkToEmail: vi.fn(),
    completeEmailLinkSignIn: vi.fn(),
  };
});

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    useEmailLinkAuthFormAction: vi.fn(),
  };
});

vi.mock("./policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

describe("<EmailLinkAuthForm />", () => {
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
        <EmailLinkAuthForm />
      </FirebaseUIProvider>
    );

    expect(container.querySelector("input[name='email']")).toBeInTheDocument();
    expect(container.querySelector("button[type='submit']")).toBeInTheDocument();
  });

  it("should call the onEmailSent callback when the form is submitted successfully", async () => {
    const mockAction = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEmailLinkAuthFormAction).mockReturnValue(mockAction);
    const onEmailSentMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          sendSignInLink: "Send Sign In Link",
        },
        errors: {
          invalidEmail: "Invalid email",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm onEmailSent={onEmailSentMock} />
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
    expect(onEmailSentMock).toHaveBeenCalled();
  });

  it("should display error message when form submission fails", async () => {
    const mockAction = vi.fn().mockRejectedValue(new Error("foo"));

    vi.mocked(useEmailLinkAuthFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          sendSignInLink: "Send Sign In Link",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm />
      </FirebaseUIProvider>
    );

    const emailInput = container.querySelector("input[name='email']")!;
    const submitButton = container.querySelector("button[type='submit']")!;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText("Error: foo")).toBeInTheDocument();
  });

  it("should show success message after successful submission", async () => {
    const mockAction = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEmailLinkAuthFormAction).mockReturnValue(mockAction);
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          emailAddress: "Email Address",
          sendSignInLink: "Send Sign In Link",
        },
        messages: {
          signInLinkSent: "Sign in link sent to your email",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm />
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
      expect(screen.getByText("Sign in link sent to your email")).toBeInTheDocument();
    });

    // Form should no longer be visible
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });

  it("should not show success message initially", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        messages: {
          signInLinkSent: "Sign in link sent to your email",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm />
      </FirebaseUIProvider>
    );

    expect(screen.queryByText("Sign in link sent to your email")).not.toBeInTheDocument();
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("should attempt to complete email link sign-in on mount", () => {
    const completeEmailLinkSignInMock = vi.mocked(completeEmailLinkSignIn);
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm />
      </FirebaseUIProvider>
    );

    expect(completeEmailLinkSignInMock).toHaveBeenCalled();
  });

  it("should call onSignIn when email link sign-in is completed successfully", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;
    const completeEmailLinkSignInMock = vi.mocked(completeEmailLinkSignIn).mockResolvedValue(mockCredential);
    const onSignInMock = vi.fn();
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm onSignIn={onSignInMock} />
      </FirebaseUIProvider>
    );

    await waitFor(() => {
      expect(completeEmailLinkSignInMock).toHaveBeenCalled();
    });

    expect(onSignInMock).toHaveBeenCalledWith(mockCredential);
  });
});
