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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OAuthButton } from "../../../../src/auth/oauth/oauth-button";
import type { AuthProvider } from "firebase/auth";
import { signInWithOAuth } from "@firebase-ui/core";

// Mock signInWithOAuth function
vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    signInWithOAuth: vi.fn(),
  };
});


// Create a mock provider that matches the AuthProvider interface
const mockGoogleProvider = { providerId: "google.com" } as AuthProvider;

// Mock React hooks from the package
const useAuthMock = vi.fn();

vi.mock("../../../../src/hooks", () => ({
  useAuth: () => useAuthMock(),
  useUI: () => vi.fn(),
}));

// Mock the Button component
vi.mock("../../../../src/components/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="oauth-button">
      {children}
    </button>
  ),
}));

describe("OAuthButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a button with the provided children", () => {
    render(
      <OAuthButton provider={mockGoogleProvider}>
        Sign in with Google
      </OAuthButton>
    );

    const button = screen.getByTestId("oauth-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Sign in with Google");
  });

  // TODO: Fix this test
  it.skip("calls signInWithOAuth when clicked", async () => {
    // Mock the signInWithOAuth to resolve immediately
    vi.mocked(signInWithOAuth).mockResolvedValueOnce(undefined);

    render(
      <OAuthButton provider={mockGoogleProvider}>
        Sign in with Google
      </OAuthButton>
    );

    const button = screen.getByTestId("oauth-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledTimes(1);
      expect(signInWithOAuth).toHaveBeenCalledWith(
        expect.anything(),
        mockGoogleProvider
      );
    });
  });

  // TODO: Fix this test
  it.skip("displays error message when non-Firebase error occurs", async () => {
    // Mock console.error to prevent test output noise
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock a non-Firebase error to trigger console.error
    const regularError = new Error("Regular error");
    vi.mocked(signInWithOAuth).mockRejectedValueOnce(regularError);

    render(
      <OAuthButton provider={mockGoogleProvider}>
        Sign in with Google
      </OAuthButton>
    );

    const button = screen.getByTestId("oauth-button");

    // Click the button to trigger the error
    fireEvent.click(button);

    // Wait for the error message to be displayed
    await waitFor(() => {
      // Verify console.error was called with the regular error
      expect(consoleErrorSpy).toHaveBeenCalledWith(regularError);

      // Verify the error message is displayed
      const errorMessage = screen.getByText("An unknown error occurred");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass("fui-form__error");
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
