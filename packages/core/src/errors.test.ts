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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { FirebaseError } from "firebase/app";
import { Auth, AuthCredential, MultiFactorResolver } from "firebase/auth";
import { ERROR_CODE_MAP } from "@firebase-oss/ui-translations";
import { FirebaseUIError, handleFirebaseError } from "./errors";
import { createMockUI } from "~/tests/utils";

vi.mock("./translations", () => ({
  getTranslation: vi.fn(),
}));

vi.mock("./behaviors", () => ({
  hasBehavior: vi.fn(),
  getBehavior: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getMultiFactorResolver: vi.fn(),
}));

import { getTranslation } from "./translations";
import { getBehavior, hasBehavior } from "./behaviors";
import { getMultiFactorResolver } from "firebase/auth";

let mockSessionStorage: Record<string, string>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(hasBehavior).mockReturnValue(false);

  mockSessionStorage = {};
  Object.defineProperty(window, "sessionStorage", {
    value: {
      setItem: vi.fn((key: string, value: string) => {
        mockSessionStorage[key] = value;
      }),
      getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
      removeItem: vi.fn((key: string) => {
        delete mockSessionStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);
      }),
    },
    writable: true,
  });
});

describe("FirebaseUIError", () => {
  it("creates a FirebaseUIError with translated message", () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/user-not-found", "User not found");

    vi.mocked(getTranslation).mockReturnValue("User not found (translated)");

    const error = new FirebaseUIError(mockUI, mockFirebaseError);

    expect(error).toBeInstanceOf(FirebaseError);
    expect(error.code).toBe("auth/user-not-found");
    expect(error.message).toBe("User not found (translated)");
    expect(getTranslation).toHaveBeenCalledWith(mockUI, "errors", ERROR_CODE_MAP["auth/user-not-found"]);
  });

  it("handles unknown error codes gracefully", () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/unknown-error", "Unknown error");

    vi.mocked(getTranslation).mockReturnValue("Unknown error (translated)");

    const error = new FirebaseUIError(mockUI, mockFirebaseError);

    expect(error.code).toBe("auth/unknown-error");
    expect(error.message).toBe("Unknown error (translated)");
  });
});

describe("handleFirebaseError", () => {
  it("throws non-Firebase errors as-is", async () => {
    const mockUI = createMockUI();

    await expect(handleFirebaseError(mockUI, new Error("Regular error"))).rejects.toThrow("Regular error");
  });

  it("throws non-Firebase errors with different types", async () => {
    const mockUI = createMockUI();

    await expect(handleFirebaseError(mockUI, "String error")).rejects.toBe("String error");
    await expect(handleFirebaseError(mockUI, 42)).rejects.toBe(42);
    await expect(handleFirebaseError(mockUI, null)).rejects.toBeNull();
    await expect(handleFirebaseError(mockUI, undefined)).rejects.toBeUndefined();
  });

  it("throws FirebaseUIError for Firebase errors", async () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/user-not-found", "User not found");

    vi.mocked(getTranslation).mockReturnValue("User not found (translated)");

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    try {
      await handleFirebaseError(mockUI, mockFirebaseError);
    } catch (error) {
      expect(error).toBeInstanceOf(FirebaseUIError);
      expect(error).toBeInstanceOf(FirebaseError);
      expect((error as FirebaseUIError).code).toBe("auth/user-not-found");
      expect((error as FirebaseUIError).message).toBe("User not found (translated)");
    }
  });

  it("stores credential in sessionStorage for account-exists-with-different-credential by default", async () => {
    const mockUI = createMockUI();
    const mockCredential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "mock-token" }),
    } as unknown as AuthCredential;
    const mockFirebaseError = {
      code: "auth/account-exists-with-different-credential",
      message: "Account exists with different credential",
      credential: mockCredential,
    } as FirebaseError & { credential: AuthCredential };

    vi.mocked(getTranslation).mockReturnValue("Account exists with different credential (translated)");

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith("pendingCred", JSON.stringify(mockCredential.toJSON()));
    expect(mockCredential.toJSON).toHaveBeenCalled();
  });

  it("delegates account-exists-with-different-credential to the behavior when enabled", async () => {
    const mockUI = createMockUI();
    const mockCredential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "mock-token" }),
    } as unknown as AuthCredential;
    const mockFirebaseError = {
      code: "auth/account-exists-with-different-credential",
      message: "Account exists with different credential",
      credential: mockCredential,
      customData: {
        email: "test@example.com",
      },
    } as unknown as FirebaseError & { credential: AuthCredential };
    const behavior = vi.fn().mockResolvedValue(undefined);

    vi.mocked(getTranslation).mockReturnValue("Account exists with different credential (translated)");
    vi.mocked(hasBehavior).mockImplementation((_, key) => key === "legacyFetchSignInWithEmail");
    vi.mocked(getBehavior).mockReturnValue(behavior);

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    expect(getBehavior).toHaveBeenCalledWith(mockUI, "legacyFetchSignInWithEmail");
    expect(behavior).toHaveBeenCalledWith(mockUI, mockFirebaseError);
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("delegates wrong-password to the recovery behavior when enabled", async () => {
    const mockUI = createMockUI();
    const mockFirebaseError = {
      code: "auth/wrong-password",
      message: "Wrong password",
      customData: {
        email: "test@example.com",
      },
    } as unknown as FirebaseError;
    const behavior = vi.fn().mockResolvedValue(undefined);

    vi.mocked(getTranslation).mockReturnValue("Wrong password (translated)");
    vi.mocked(hasBehavior).mockImplementation((_, key) => key === "legacyFetchSignInWithEmail");
    vi.mocked(getBehavior).mockReturnValue(behavior);

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    expect(getBehavior).toHaveBeenCalledWith(mockUI, "legacyFetchSignInWithEmail");
    expect(behavior).toHaveBeenCalledWith(mockUI, mockFirebaseError);
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("delegates invalid-credential to the recovery behavior when enabled", async () => {
    const mockUI = createMockUI();
    const mockFirebaseError = {
      code: "auth/invalid-credential",
      message: "Invalid credential",
      customData: {
        email: "test@example.com",
      },
    } as unknown as FirebaseError;
    const behavior = vi.fn().mockResolvedValue(undefined);

    vi.mocked(getTranslation).mockReturnValue("Invalid credential (translated)");
    vi.mocked(hasBehavior).mockImplementation((_, key) => key === "legacyFetchSignInWithEmail");
    vi.mocked(getBehavior).mockReturnValue(behavior);

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    expect(getBehavior).toHaveBeenCalledWith(mockUI, "legacyFetchSignInWithEmail");
    expect(behavior).toHaveBeenCalledWith(mockUI, mockFirebaseError);
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("delegates invalid-login-credentials to the recovery behavior when enabled", async () => {
    const mockUI = createMockUI();
    const mockFirebaseError = {
      code: "auth/invalid-login-credentials",
      message: "Invalid login credentials",
      customData: {
        email: "test@example.com",
      },
    } as unknown as FirebaseError;
    const behavior = vi.fn().mockResolvedValue(undefined);

    vi.mocked(getTranslation).mockReturnValue("Invalid login credentials (translated)");
    vi.mocked(hasBehavior).mockImplementation((_, key) => key === "legacyFetchSignInWithEmail");
    vi.mocked(getBehavior).mockReturnValue(behavior);

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    expect(getBehavior).toHaveBeenCalledWith(mockUI, "legacyFetchSignInWithEmail");
    expect(behavior).toHaveBeenCalledWith(mockUI, mockFirebaseError);
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("does not store credential for other error types", async () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/user-not-found", "User not found");

    vi.mocked(getTranslation).mockReturnValue("User not found (translated)");

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("handles account-exists-with-different-credential without credential", async () => {
    const mockUI = createMockUI();
    const mockFirebaseError = {
      code: "auth/account-exists-with-different-credential",
      message: "Account exists with different credential",
    } as FirebaseError;

    vi.mocked(getTranslation).mockReturnValue("Account exists with different credential (translated)");

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("calls setMultiFactorResolver when auth/multi-factor-auth-required is thrown", async () => {
    const mockUI = createMockUI();
    const mockResolver = {
      auth: {} as Auth,
      session: null,
      hints: [],
    } as unknown as MultiFactorResolver;
    const error = new FirebaseError("auth/multi-factor-auth-required", "Multi-factor authentication required");

    vi.mocked(getTranslation).mockReturnValue("Multi-factor authentication required (translated)");
    vi.mocked(getMultiFactorResolver).mockReturnValue(mockResolver);

    await expect(handleFirebaseError(mockUI, error)).rejects.toBeInstanceOf(FirebaseUIError);
    expect(getMultiFactorResolver).toHaveBeenCalledWith(mockUI.auth, error);
    expect(mockUI.setMultiFactorResolver).toHaveBeenCalledWith(mockResolver);
  });

  it("still throws FirebaseUIError after setting multi-factor resolver", async () => {
    const mockUI = createMockUI();
    const mockResolver = {
      auth: {} as Auth,
      session: null,
      hints: [],
    } as unknown as MultiFactorResolver;
    const error = new FirebaseError("auth/multi-factor-auth-required", "Multi-factor authentication required");

    vi.mocked(getTranslation).mockReturnValue("Multi-factor authentication required (translated)");
    vi.mocked(getMultiFactorResolver).mockReturnValue(mockResolver);

    try {
      await handleFirebaseError(mockUI, error);
    } catch (caught) {
      expect(getMultiFactorResolver).toHaveBeenCalledWith(mockUI.auth, error);
      expect(mockUI.setMultiFactorResolver).toHaveBeenCalledWith(mockResolver);
      expect(caught).toBeInstanceOf(FirebaseUIError);
      expect((caught as FirebaseUIError).code).toBe("auth/multi-factor-auth-required");
      expect((caught as FirebaseUIError).message).toBe("Multi-factor authentication required (translated)");
    }
  });

  it("does not call setMultiFactorResolver for other error types", async () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/user-not-found", "User not found");

    vi.mocked(getTranslation).mockReturnValue("User not found (translated)");

    await expect(handleFirebaseError(mockUI, mockFirebaseError)).rejects.toBeInstanceOf(FirebaseUIError);

    expect(getMultiFactorResolver).not.toHaveBeenCalled();
    expect(mockUI.setMultiFactorResolver).not.toHaveBeenCalled();
  });
});

describe("isFirebaseError utility", () => {
  it("identifies FirebaseError objects", async () => {
    const mockUI = createMockUI();
    vi.mocked(getTranslation).mockReturnValue("translated message");

    await expect(
      handleFirebaseError(mockUI, new FirebaseError("auth/user-not-found", "User not found"))
    ).rejects.toBeInstanceOf(FirebaseUIError);
  });

  it("treats plain objects with code and message like Firebase errors", async () => {
    const mockUI = createMockUI();
    vi.mocked(getTranslation).mockReturnValue("translated message");

    await expect(handleFirebaseError(mockUI, { code: "test", message: "test" })).rejects.toBeInstanceOf(
      FirebaseUIError
    );
  });

  it("rejects objects without code and message", async () => {
    const mockUI = createMockUI();

    await expect(handleFirebaseError(mockUI, { someProperty: "value" })).rejects.toEqual({
      someProperty: "value",
    });
  });
});
