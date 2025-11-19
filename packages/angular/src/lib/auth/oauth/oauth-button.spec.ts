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

import { render, screen, fireEvent, waitFor } from "@testing-library/angular";
import { Component } from "@angular/core";
import { OAuthButtonComponent } from "./oauth-button";
import { AuthProvider, UserCredential } from "@angular/fire/auth";

@Component({
  template: ` <fui-oauth-button [provider]="provider"> Sign in with Google </fui-oauth-button> `,
  standalone: true,
  imports: [OAuthButtonComponent],
})
class TestOAuthButtonHostComponent {
  provider: AuthProvider = { providerId: "google.com" } as AuthProvider;
}

@Component({
  template: ` <fui-oauth-button [provider]="provider"> Sign in with Facebook </fui-oauth-button> `,
  standalone: true,
  imports: [OAuthButtonComponent],
})
class TestOAuthButtonWithCustomProviderHostComponent {
  provider: AuthProvider = { providerId: "facebook.com" } as AuthProvider;
}

@Component({
  template: `
    <fui-oauth-button [provider]="provider" (signIn)="handleSignIn($event)"> Sign in with Google </fui-oauth-button>
  `,
  standalone: true,
  imports: [OAuthButtonComponent],
})
class TestOAuthButtonWithSignInHostComponent {
  provider: AuthProvider = { providerId: "google.com" } as AuthProvider;
  signInCallback = jest.fn();
  handleSignIn(credential: UserCredential) {
    this.signInCallback(credential);
  }
}

describe("<fui-oauth-button>", () => {
  let mockSignInWithProvider: any;
  let mockFirebaseUIError: any;
  let mockGetTranslation: any;

  beforeEach(() => {
    const { signInWithProvider, FirebaseUIError, getTranslation } = require("@invertase/firebaseui-core");
    mockSignInWithProvider = signInWithProvider;
    mockFirebaseUIError = FirebaseUIError;
    mockGetTranslation = getTranslation;

    mockSignInWithProvider.mockClear();
    mockGetTranslation.mockImplementation((ui: any, category: string, key: string) => {
      if (category === "errors" && key === "unknownError") {
        return "An unknown error occurred";
      }
      return `${category}.${key}`;
    });
  });

  it("should create", async () => {
    const { fixture } = await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render with correct provider", async () => {
    await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });

    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("data-provider", "google.com");
  });

  it("should render with custom provider when provided", async () => {
    await render(TestOAuthButtonWithCustomProviderHostComponent, {
      imports: [OAuthButtonComponent],
    });

    expect(screen.getByText("Sign in with Facebook")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("data-provider", "facebook.com");
  });

  it("should call signInWithProvider when button is clicked", async () => {
    mockSignInWithProvider.mockResolvedValue(undefined);

    const { fixture } = await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          app: expect.any(Object),
          auth: expect.any(Object),
        }),
        expect.objectContaining({
          providerId: "google.com",
        })
      );
    });
  });

  it("should display error message when FirebaseUIError occurs", async () => {
    const errorMessage = "The popup was closed by the user";
    mockSignInWithProvider.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should display generic error message when non-Firebase error occurs", async () => {
    mockSignInWithProvider.mockRejectedValue(new Error("Network error"));

    await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
    });
  });

  it("should have correct CSS classes", async () => {
    const { container } = await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = container.querySelector(".fui-provider__button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("fui-provider__button");
  });

  it("should have correct button attributes", async () => {
    await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-provider", "google.com");
  });

  it("should clear error when sign-in is attempted again", async () => {
    // Throw an error to start
    mockSignInWithProvider.mockRejectedValueOnce(new mockFirebaseUIError("First error"));

    await render(TestOAuthButtonHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = screen.getByRole("button");

    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Remove the error
    mockSignInWithProvider.mockResolvedValueOnce(undefined);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });

  it("should emit signIn when sign-in is successful", async () => {
    const mockCredential = { user: { uid: "test-uid" } } as UserCredential;
    mockSignInWithProvider.mockResolvedValue(mockCredential);

    const { fixture } = await render(TestOAuthButtonWithSignInHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(fixture.componentInstance.signInCallback).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.signInCallback).toHaveBeenCalledWith(mockCredential);
    });
  });

  it("should not emit signIn when sign-in fails", async () => {
    mockSignInWithProvider.mockRejectedValue(new mockFirebaseUIError("Sign-in failed"));

    const { fixture } = await render(TestOAuthButtonWithSignInHostComponent, {
      imports: [OAuthButtonComponent],
    });

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Sign-in failed")).toBeInTheDocument();
    });

    expect(fixture.componentInstance.signInCallback).not.toHaveBeenCalled();
  });
});
