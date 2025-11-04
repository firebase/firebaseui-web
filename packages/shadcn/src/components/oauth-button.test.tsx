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

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { OAuthButton } from "./oauth-button";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import type { AuthProvider, UserCredential } from "firebase/auth";
import { ComponentProps } from "react";

import { signInWithProvider } from "@invertase/firebaseui-core";
import { FirebaseError } from "firebase/app";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";

vi.mock("@invertase/firebaseui-core", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...(mod as object),
    signInWithProvider: vi.fn(),
  };
});

vi.mock("@/components/ui/button", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/components/ui/button")>();
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
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Sign in with Google");
  });

  it("applies correct attributes", () => {
    const ui = createMockUI();

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-provider")).toBe("google.com");
  });

  it("applies themed attribute when provided", () => {
    const ui = createMockUI();

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider} themed="neutral">
          Sign in with Google
        </OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button.getAttribute("data-themed")).toBe("neutral");
  });

  it("is disabled when UI state is not idle", () => {
    const ui = createMockUI();
    ui.setKey("state", "pending");

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("is enabled when UI state is idle", () => {
    const ui = createMockUI();

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).not.toHaveAttribute("disabled");
  });

  it("calls signInWithProvider when clicked", async () => {
    const mockSignInWithProvider = vi.mocked(signInWithProvider);

    const ui = createMockUI();

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    fireEvent.click(button);

    expect(mockSignInWithProvider).toHaveBeenCalledTimes(1);
    expect(mockSignInWithProvider).toHaveBeenCalledWith(expect.anything(), mockGoogleProvider);
  });

  it("displays FirebaseUIError message when FirebaseUIError occurs", async () => {
    const { FirebaseUIError } = await import("@invertase/firebaseui-core");
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const ui = createMockUI();
    const mockError = new FirebaseUIError(
      ui.get(),
      new FirebaseError("auth/user-not-found", "No account found with this email address")
    );
    mockSignInWithProvider.mockRejectedValue(mockError);

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    fireEvent.click(button);

    // Next tick - wait for the mock to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorMessage = screen.getByText("No account found with this email address");
    expect(errorMessage).toBeDefined();

    // Make sure we use the shadcn theme name, rather than a "text-red-500"
    expect(errorMessage.className).toContain("text-destructive");
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
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");
    fireEvent.click(button);

    // Wait for error to appear
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleErrorSpy).toHaveBeenCalledWith(regularError);

    const errorMessage = screen.getByText("unknownError");
    expect(errorMessage).toBeDefined();

    // Make sure we use the shadcn theme name, rather than a "text-red-500"
    expect(errorMessage.className).toContain("text-destructive");

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("clears error when button is clicked again", async () => {
    const { FirebaseUIError } = await import("@invertase/firebaseui-core");
    const mockSignInWithProvider = vi.mocked(signInWithProvider);
    const ui = createMockUI();

    // First call fails, second call succeeds
    mockSignInWithProvider
      .mockRejectedValueOnce(
        new FirebaseUIError(ui.get(), new FirebaseError("auth/wrong-password", "Incorrect password"))
      )
      .mockResolvedValueOnce({} as UserCredential);

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    const button = screen.getByTestId("oauth-button");

    // First click - should show error
    fireEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorMessage = screen.getByText("Incorrect password");
    expect(errorMessage).toBeDefined();

    // Second click - should clear error
    fireEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByText("Incorrect password")).toBeNull();
  });

  it("does not display error message initially", () => {
    const ui = createMockUI();

    render(
      <FirebaseUIProvider ui={ui}>
        <OAuthButton provider={mockGoogleProvider}>Sign in with Google</OAuthButton>
      </FirebaseUIProvider>
    );

    expect(screen.queryByText("No account found with this email address")).toBeNull();
  });
});
