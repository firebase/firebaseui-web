/**
 * Copyright 2026 Google LLC
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

/**
 * Regression coverage for the "swallowed error" bug fixed by commit 5977d79f.
 *
 * Every catch block in `auth.ts` used to call `handleFirebaseError(ui, error);`
 * without `await`/`return`. Since `handleFirebaseError` is async and always
 * throws, the rejection became an unhandled promise rejection instead of
 * propagating to the caller, and the enclosing function resolved with
 * `undefined` via its `finally` block.
 *
 * `auth.test.ts` mocks `./errors` at module scope (`vi.mock("./errors", () =>
 * ({ handleFirebaseError: vi.fn() }))`), so it only proves `handleFirebaseError`
 * was *called* - it can never prove that the caller's promise actually
 * rejects, because the mock never rejects. This file deliberately does NOT
 * mock `./errors`, so the real implementation (which always throws) runs
 * end-to-end. Without `return await handleFirebaseError(...)` at each call
 * site, every test below would fail because the awaited call would resolve to
 * `undefined` instead of rejecting.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, signInWithProvider } from "./auth";
import { FirebaseUIError } from "./errors";
import { providerPopupStrategy } from "./behaviors";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  signInWithCredential: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn((email: string, password: string) => ({ providerId: "password", email, password })),
  },
}));

import { signInWithCredential as _signInWithCredential, signInWithPopup as _signInWithPopup } from "firebase/auth";

describe("auth.ts error propagation (real handleFirebaseError, no ./errors mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signInWithEmailAndPassword rejects with a FirebaseUIError when the underlying sign-in call throws", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const sdkError = new FirebaseError("auth/user-not-found", "There is no user record for this identifier.");
    vi.mocked(_signInWithCredential).mockRejectedValue(sdkError);

    await expect(signInWithEmailAndPassword(mockUI, email, password)).rejects.toThrow(FirebaseUIError);

    // The promise must reject with the *real* FirebaseUIError, carrying the original error code.
    await expect(signInWithEmailAndPassword(mockUI, email, password)).rejects.toMatchObject({
      code: "auth/user-not-found",
    });

    // Regardless of the error, state must still settle back to idle (finally block).
    expect(mockUI.setState).toHaveBeenCalledWith("idle");
  });

  it("signInWithProvider rejects with a FirebaseUIError when the underlying popup sign-in call throws", async () => {
    const mockUI = createMockUI({
      // Use the real popup strategy behavior so `getBehavior(ui, "providerSignInStrategy")`
      // resolves to a genuine handler that calls the (mocked) Firebase SDK.
      behaviors: providerPopupStrategy(),
    });
    const provider = { providerId: "google.com" } as any;

    const sdkError = new FirebaseError("auth/operation-not-allowed", "Google sign-in is not enabled.");
    vi.mocked(_signInWithPopup).mockRejectedValue(sdkError);

    await expect(signInWithProvider(mockUI, provider)).rejects.toThrow(FirebaseUIError);

    await expect(signInWithProvider(mockUI, provider)).rejects.toMatchObject({
      code: "auth/operation-not-allowed",
    });

    expect(mockUI.setState).toHaveBeenCalledWith("idle");
  });
});
