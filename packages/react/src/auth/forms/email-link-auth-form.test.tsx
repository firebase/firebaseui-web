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
import { render, screen, fireEvent, renderHook, cleanup, waitFor } from "@testing-library/react";
import {
  EmailLinkAuthForm,
  useEmailLinkAuthForm,
  useEmailLinkAuthFormAction,
  useEmailLinkAuthFormCompleteSignIn,
} from "./email-link-auth-form";
import { act } from "react";
import { sendSignInLinkToEmail, completeEmailLinkSignIn } from "@firebase-ui/core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "~/context";
import type { UserCredential } from "firebase/auth";

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual("firebase/auth");
  return {
    ...actual,
    getRedirectResult: vi.fn().mockResolvedValue(null),
  };
});

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    sendSignInLinkToEmail: vi.fn(),
    completeEmailLinkSignIn: vi.fn(),
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

describe("useEmailLinkAuthFormCompleteSignIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call onSignIn when email link sign-in is completed successfully", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;
    const completeEmailLinkSignInMock = vi.mocked(completeEmailLinkSignIn).mockResolvedValue(mockCredential);
    const onSignInMock = vi.fn();
    const mockUI = createMockUI();

    renderHook(() => useEmailLinkAuthFormCompleteSignIn(onSignInMock), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await waitFor(() => {
      expect(completeEmailLinkSignInMock).toHaveBeenCalledWith(mockUI.get(), window.location.href);
      expect(onSignInMock).toHaveBeenCalledWith(mockCredential);
    });
  });

  it("should not call onSignIn when email link sign-in returns null", async () => {
    const completeEmailLinkSignInMock = vi.mocked(completeEmailLinkSignIn).mockResolvedValue(null);
    const onSignInMock = vi.fn();
    const mockUI = createMockUI();

    renderHook(() => useEmailLinkAuthFormCompleteSignIn(onSignInMock), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await waitFor(() => {
      expect(completeEmailLinkSignInMock).toHaveBeenCalledWith(mockUI.get(), window.location.href);
      expect(onSignInMock).not.toHaveBeenCalled();
    });

    expect(completeEmailLinkSignInMock).toHaveBeenCalledWith(mockUI.get(), window.location.href);
    expect(onSignInMock).not.toHaveBeenCalled();
  });

  it("should not call onSignIn when onSignIn is not provided", async () => {
    const mockCredential = { credential: true } as unknown as UserCredential;
    const completeEmailLinkSignInMock = vi.mocked(completeEmailLinkSignIn).mockResolvedValue(mockCredential);
    const mockUI = createMockUI();

    renderHook(() => useEmailLinkAuthFormCompleteSignIn(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await waitFor(() => {
      expect(completeEmailLinkSignInMock).toHaveBeenCalledWith(mockUI.get(), window.location.href);
    });
  });
});

describe("useEmailLinkAuthFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a callback which accept an email", async () => {
    const sendSignInLinkToEmailMock = vi.mocked(sendSignInLinkToEmail);
    const mockUI = createMockUI();

    const { result } = renderHook(() => useEmailLinkAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ email: "test@example.com" });
    });

    expect(sendSignInLinkToEmailMock).toHaveBeenCalledWith(expect.any(Object), "test@example.com");
  });

  it("should throw an unknown error when its not a FirebaseUIError", async () => {
    const sendSignInLinkToEmailMock = vi.mocked(sendSignInLinkToEmail).mockRejectedValue(new Error("Unknown error"));

    const mockUI = createMockUI({
      locale: registerLocale("es-ES", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const { result } = renderHook(() => useEmailLinkAuthFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await expect(async () => {
      await act(async () => {
        await result.current({ email: "test@example.com" });
      });
    }).rejects.toThrow("unknownError");

    expect(sendSignInLinkToEmailMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com");
  });
});

describe("useEmailLinkAuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should allow the form to be submitted", async () => {
    const mockUI = createMockUI();
    const sendSignInLinkToEmailMock = vi.mocked(sendSignInLinkToEmail);

    const { result } = renderHook(() => useEmailLinkAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "test@example.com");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(sendSignInLinkToEmailMock).toHaveBeenCalledWith(mockUI.get(), "test@example.com");
  });

  it("should not allow the form to be submitted if the form is invalid", async () => {
    const mockUI = createMockUI();
    const sendSignInLinkToEmailMock = vi.mocked(sendSignInLinkToEmail);

    const { result } = renderHook(() => useEmailLinkAuthForm(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      result.current.setFieldValue("email", "123");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.getFieldMeta("email")!.errors[0].length).toBeGreaterThan(0);
    expect(sendSignInLinkToEmailMock).not.toHaveBeenCalled();
  });
});

describe("<EmailLinkAuthForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          sendSignInLink: "sendSignInLink",
        },
      }),
    });

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm />
      </FirebaseUIProvider>
    );

    // There should be only one form
    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    // Make sure we have an email input
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();

    // Ensure the "Send Sign In Link" button is present and is a submit button
    const sendSignInLinkButton = screen.getByRole("button", { name: "sendSignInLink" });
    expect(sendSignInLinkButton).toBeInTheDocument();
    expect(sendSignInLinkButton).toHaveAttribute("type", "submit");
  });

  it("should attempt to complete email link sign-in on load", () => {
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

    await act(async () => {
      // Wait for the useEffect to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(completeEmailLinkSignInMock).toHaveBeenCalledWith(mockUI.get(), window.location.href);
    expect(onSignInMock).toHaveBeenCalledWith(mockCredential);
  });

  it("should not call onSignIn when email link sign-in returns null", async () => {
    const completeEmailLinkSignInMock = vi.mocked(completeEmailLinkSignIn).mockResolvedValue(null);
    const onSignInMock = vi.fn();
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm onSignIn={onSignInMock} />
      </FirebaseUIProvider>
    );

    await act(async () => {
      // Wait for the useEffect to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(completeEmailLinkSignInMock).toHaveBeenCalledWith(mockUI.get(), window.location.href);
    expect(onSignInMock).not.toHaveBeenCalled();
  });

  it("should trigger validation errors when the form is blurred", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <EmailLinkAuthForm />
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
