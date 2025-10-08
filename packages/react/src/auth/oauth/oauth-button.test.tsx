/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, renderHook, act } from "@testing-library/react";
import { OAuthButton, useSignInWithProvider } from "./oauth-button";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { enUs, registerLocale } from "@firebase-ui/translations";
import type { AuthProvider, UserCredential } from "firebase/auth";
import { ComponentProps } from "react";

import { signInWithProvider } from "@firebase-ui/core";
import { FirebaseError } from "firebase/app";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...(mod as object),
    signInWithProvider: vi.fn(),
  };
});

vi.mock("~/components/button", async (importOriginal) => {
  const mod = await importOriginal<typeof import("~/components/button")>();
  return {
    ...mod,
    Button: (props: ComponentProps<"button">) => <mod.Button data-testid="oauth-button" {...props} />,
  };
});

afterEach(() => {
  cleanup();
});

describe("<OAuthButton />", () => {
  const mockGoogleProvider = { providerId: "google.com" } as AuthProvider;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a button with the provided children", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Sign in with Google");
  });

  it("applies correct CSS classes", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).toHaveClass("fui-provider__button");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("is disabled when UI state is not idle", () => {
    const ui = createMockUI();
    ui.setKey("state", "pending");

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("is enabled when UI state is idle", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).not.toHaveAttribute("disabled");
  });

  it("calls signInWithProvider when clicked", async () => {
    const mockSignInWithProvider = vi.mocked(signInWithProvider);

    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    fireEvent.click(button);

    expect(mockSignInWithProvider).toHaveBeenCalledTimes(1);
    expect(mockSignInWithProvider).toHaveBeenCalledWith(expect.anything(), mockGoogleProvider);
  });

  it("displays FirebaseUIError message when FirebaseUIError occurs", async () => {
    const { FirebaseUIError } = await import("@firebase-ui/core");
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const ui = createMockUI();
    const mockError = new FirebaseUIError(
      ui.get(),
      new FirebaseError("auth/user-not-found", "No account found with this email address")
    );
    mockSignInWithProvider.mockRejectedValue(mockError);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    fireEvent.click(button);

    // Next tick - wait for the mock to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorMessage = screen.getByText("No account found with this email address");
    expect(errorMessage).toBeDefined();
    expect(errorMessage.className).toContain("fui-form__error");
  });

  it("displays unknown error message when non-Firebase error occurs", async () => {
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const regularError = new Error("Regular error");
    mockSignInWithProvider.mockRejectedValue(regularError);

    // Mock console.error to prevent test output noise
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const ui = createMockUI({
      locale: registerLocale("test", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    fireEvent.click(button);

    // Wait for error to appear
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleErrorSpy).toHaveBeenCalledWith(regularError);

    const errorMessage = screen.getByText("unknownError");
    expect(errorMessage).toBeDefined();
    expect(errorMessage.className).toContain("fui-form__error");

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("clears error when button is clicked again", async () => {
    const { FirebaseUIError } = await import("@firebase-ui/core");
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const ui = createMockUI();

    // First call fails, second call succeeds
    mockSignInWithProvider
      .mockRejectedValueOnce(new FirebaseUIError(ui.get(), new FirebaseError("auth/wrong-password", "...")))
      .mockResolvedValueOnce({} as UserCredential);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </CreateFirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");

    // First click - should show error
    fireEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const expectedError = enUs.translations.errors!.wrongPassword!;

    // The error message will be the translated message for auth/wrong-password
    const errorMessage = screen.getByText(expectedError);
    expect(errorMessage).toBeDefined();

    // Second click - should clear error
    fireEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByText(expectedError)).toBeNull();
  });
});

describe("useSignInWithProvider", () => {
  const mockGoogleProvider = { providerId: "google.com" } as AuthProvider;
  const mockFacebookProvider = { providerId: "facebook.com" } as AuthProvider;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error and callback", () => {
    const ui = createMockUI();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CreateFirebaseUIProvider ui={ui}>{children}</CreateFirebaseUIProvider>
    );

    const { result } = renderHook(() => useSignInWithProvider(mockGoogleProvider), { wrapper });

    expect(result.current.error).toBeNull();
    expect(typeof result.current.callback).toBe("function");
  });

  it("calls signInWithProvider when callback is executed", async () => {
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const ui = createMockUI();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CreateFirebaseUIProvider ui={ui}>{children}</CreateFirebaseUIProvider>
    );

    const { result } = renderHook(() => useSignInWithProvider(mockGoogleProvider), { wrapper });

    await act(async () => {
      await result.current.callback();
    });

    expect(mockSignInWithProvider).toHaveBeenCalledTimes(1);
    expect(mockSignInWithProvider).toHaveBeenCalledWith(ui.get(), mockGoogleProvider);
  });

  it("sets error state when FirebaseUIError occurs", async () => {
    const { FirebaseUIError } = await import("@firebase-ui/core");
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const ui = createMockUI();
    const mockError = new FirebaseUIError(
      ui.get(),
      new FirebaseError("auth/user-not-found", "No account found with this email address")
    );
    mockSignInWithProvider.mockRejectedValue(mockError);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CreateFirebaseUIProvider ui={ui}>{children}</CreateFirebaseUIProvider>
    );

    const { result } = renderHook(() => useSignInWithProvider(mockGoogleProvider), { wrapper });

    await act(async () => {
      await result.current.callback();
    });

    expect(result.current.error).toBe("No account found with this email address");
  });

  it("sets unknown error message when non-Firebase error occurs", async () => {
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const regularError = new Error("Regular error");
    mockSignInWithProvider.mockRejectedValue(regularError);

    // Mock console.error to prevent test output noise
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const ui = createMockUI({
      locale: registerLocale("test", {
        errors: {
          unknownError: "unknownError",
        },
      }),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CreateFirebaseUIProvider ui={ui}>{children}</CreateFirebaseUIProvider>
    );

    const { result } = renderHook(() => useSignInWithProvider(mockGoogleProvider), { wrapper });

    await act(async () => {
      await result.current.callback();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(regularError);
    expect(result.current.error).toBe("unknownError");

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("clears error when callback is called again", async () => {
    const { FirebaseUIError } = await import("@firebase-ui/core");
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const ui = createMockUI();

    // First call fails, second call succeeds
    mockSignInWithProvider
      .mockRejectedValueOnce(
        new FirebaseUIError(ui.get(), new FirebaseError("auth/wrong-password", "Incorrect password"))
      )
      .mockResolvedValueOnce({} as UserCredential);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CreateFirebaseUIProvider ui={ui}>{children}</CreateFirebaseUIProvider>
    );

    const { result } = renderHook(() => useSignInWithProvider(mockGoogleProvider), { wrapper });

    // First call - should set error
    await act(async () => {
      await result.current.callback();
    });

    expect(result.current.error).toBe("Incorrect password");

    // Second call - should clear error
    await act(async () => {
      await result.current.callback();
    });

    expect(result.current.error).toBeNull();
  });

  it("maintains stable callback reference when provider changes", () => {
    const ui = createMockUI();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CreateFirebaseUIProvider ui={ui}>{children}</CreateFirebaseUIProvider>
    );

    const { result, rerender } = renderHook(({ provider }) => useSignInWithProvider(provider), {
      wrapper,
      initialProps: { provider: mockGoogleProvider },
    });

    const firstCallback = result.current.callback;

    // Change provider
    rerender({ provider: mockFacebookProvider });

    // Callback should be different due to dependency change
    expect(result.current.callback).not.toBe(firstCallback);
  });
});
