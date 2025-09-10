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

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  screen,
  fireEvent,
  waitFor,
  act,
  render,
} from "@testing-library/react";
import { EmailPasswordForm } from "../../../src/auth/forms/email-password-form";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";
import { FirebaseUIProvider } from "~/context";
import { initializeUI } from "@firebase-ui/core";

// Prepare the test environment
const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com",
  projectId: "test-project",
};

// Initialize app once for all tests
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const ui = initializeUI({
  app,
});

// Connect to the auth emulator
connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });

describe("Email Password Authentication Integration", () => {
  // Test user we'll create for our tests
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "Test123!";

  // Set up a test user before tests
  beforeAll(async () => {
    try {
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    } catch (error) {
      throw new Error(
        `Failed to set up test user: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // Clean up after tests
  afterAll(async () => {
    try {
      // First check if the user is already signed in
      if (auth.currentUser && auth.currentUser.email === testEmail) {
        await deleteUser(auth.currentUser);
      } else {
        // Try to sign in first
        const userCredential = await signInWithEmailAndPassword(
          auth,
          testEmail,
          testPassword
        );
        await deleteUser(userCredential.user);
      }
    } catch (error) {
      console.warn("Error in test cleanup process. Resuming, but this may indicate a problem.", error);
    }
  });

  it("should successfully sign in with email and password using actual Firebase Auth", async () => {
    const { container } = render(
      <FirebaseUIProvider ui={ui}>
        <EmailPasswordForm />
      </FirebaseUIProvider>
    );

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    await act(async () => {
      if (emailInput && passwordInput) {
        fireEvent.change(emailInput, { target: { value: testEmail } });
        fireEvent.blur(emailInput);
        fireEvent.change(passwordInput, { target: { value: testPassword } });
        fireEvent.blur(passwordInput);
      }
    });

    const submitButton = await screen.findByRole("button", {
      name: /sign in/i,
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/invalid credentials/i)).toBeNull();
      },
      { timeout: 5000 }
    );
  });

  it("should fail when using invalid credentials", async () => {
    const { container } = render(
      <FirebaseUIProvider ui={ui}>
        <EmailPasswordForm />
      </FirebaseUIProvider>
    );

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    await act(async () => {
      if (emailInput && passwordInput) {
        fireEvent.change(emailInput, { target: { value: testEmail } });
        fireEvent.blur(emailInput);
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
        fireEvent.blur(passwordInput);
      }
    });

    const submitButton = await screen.findByRole("button", {
      name: /sign in/i,
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(
      () => {
        expect(container.querySelector(".fui-form__error")).not.toBeNull();
      },
      { timeout: 5000 }
    );
  });

  it("should show an error message for invalid credentials", async () => {
    const { container } = render(
      <FirebaseUIProvider ui={ui}>
        <EmailPasswordForm />
      </FirebaseUIProvider>
    );

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    await act(async () => {
      if (emailInput && passwordInput) {
        fireEvent.change(emailInput, { target: { value: testEmail } });
        fireEvent.blur(emailInput);
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
        fireEvent.blur(passwordInput);
      }
    });

    const submitButton = await screen.findByRole("button", {
      name: /sign in/i,
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(
      () => {
        expect(container.querySelector(".fui-form__error")).not.toBeNull();
      },
      { timeout: 5000 }
    );
  });
});
