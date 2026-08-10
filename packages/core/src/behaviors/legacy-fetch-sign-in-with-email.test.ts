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

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isLegacySignInRecoveryErrorCode,
  legacyFetchSignInWithEmailHandler,
  PENDING_CREDENTIAL_STORAGE_KEY,
} from "./legacy-fetch-sign-in-with-email";
import { createMockUI } from "~/tests/utils";
import { initializeUI } from "~/config";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

vi.mock("firebase/auth", () => ({
  fetchSignInMethodsForEmail: vi.fn(),
  OAuthProvider: {
    credentialFromError: vi.fn().mockReturnValue(null),
  },
  getRedirectResult: vi.fn().mockResolvedValue(null),
}));

import { fetchSignInMethodsForEmail, OAuthProvider } from "firebase/auth";

let mockSessionStorage: Record<string, string>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(OAuthProvider.credentialFromError).mockReset().mockReturnValue(null);

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

describe("legacyFetchSignInWithEmailHandler", () => {
  it("stores the pending credential and recovery data when the email is available", async () => {
    const ui = createMockUI();
    const credential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "token" }),
    } as any;
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      credential,
      customData: {
        email: "test@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["password", "emailLink"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      PENDING_CREDENTIAL_STORAGE_KEY,
      JSON.stringify(credential.toJSON())
    );
    expect(fetchSignInMethodsForEmail).toHaveBeenCalledWith(ui.auth, "test@example.com");
    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "test@example.com",
      signInMethods: ["password", "emailLink"],
      attemptedProviderId: "google.com",
      pendingProviderId: "google.com",
    });
  });

  it("extracts the pending credential from a Firebase OAuth error", async () => {
    const ui = createMockUI();
    const credential = {
      providerId: "github.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "github.com", token: "token" }),
    } as any;
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      customData: {
        email: "oauth@example.com",
      },
    } as any;

    vi.mocked(OAuthProvider.credentialFromError).mockReturnValue(credential);
    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["google.com"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(OAuthProvider.credentialFromError).toHaveBeenCalledWith(error);
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      PENDING_CREDENTIAL_STORAGE_KEY,
      JSON.stringify(credential.toJSON())
    );
    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "oauth@example.com",
      signInMethods: ["google.com"],
      attemptedProviderId: "github.com",
      pendingProviderId: "github.com",
    });
  });

  it("continues recovery without a pending credential when OAuth extraction fails", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      customData: {
        email: "oauth@example.com",
      },
    } as any;

    vi.mocked(OAuthProvider.credentialFromError).mockImplementation(() => {
      throw new Error("Malformed OAuth response");
    });
    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["google.com"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "oauth@example.com",
      signInMethods: ["google.com"],
      attemptedProviderId: undefined,
      pendingProviderId: undefined,
    });
  });

  it("falls back to the top-level error email field", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      email: "fallback@example.com",
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["github.com"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(fetchSignInMethodsForEmail).toHaveBeenCalledWith(ui.auth, "fallback@example.com");
    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "fallback@example.com",
      signInMethods: ["github.com"],
      attemptedProviderId: undefined,
      pendingProviderId: undefined,
    });
  });

  it("marks password as the attempted provider for wrong-password recovery", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/wrong-password",
      message: "Wrong password",
      customData: {
        email: "password@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["google.com"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(fetchSignInMethodsForEmail).toHaveBeenCalledWith(ui.auth, "password@example.com");
    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "password@example.com",
      signInMethods: ["google.com"],
      attemptedProviderId: "password",
      pendingProviderId: undefined,
    });
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("marks password as the attempted provider for invalid-credential recovery", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/invalid-credential",
      message: "Invalid credential",
      customData: {
        email: "invalid@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["github.com"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "invalid@example.com",
      signInMethods: ["github.com"],
      attemptedProviderId: "password",
      pendingProviderId: undefined,
    });
  });

  it("marks password as the attempted provider for invalid-login-credentials recovery", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/invalid-login-credentials",
      message: "Invalid login credentials",
      customData: {
        email: "login@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["google.com"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "login@example.com",
      signInMethods: ["google.com"],
      attemptedProviderId: "password",
      pendingProviderId: undefined,
    });
  });

  it("clears recovery state when no email can be extracted", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
    } as any;

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(fetchSignInMethodsForEmail).not.toHaveBeenCalled();
    expect(ui.clearLegacySignInRecovery).toHaveBeenCalledTimes(1);
  });

  it("clears recovery state when fetching sign-in methods fails", async () => {
    const ui = createMockUI();
    const credential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "token" }),
    } as any;
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      credential,
      customData: {
        email: "test@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockRejectedValue(new Error("Network failure"));

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      PENDING_CREDENTIAL_STORAGE_KEY,
      JSON.stringify(credential.toJSON())
    );
    expect(ui.clearLegacySignInRecovery).toHaveBeenCalledTimes(1);
  });

  it("clears recovery state when no sign-in methods are returned", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      customData: {
        email: "test@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue([]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(ui.clearLegacySignInRecovery).toHaveBeenCalledTimes(1);
    expect(ui.setLegacySignInRecovery).not.toHaveBeenCalled();
  });

  it("clears recovery state when the only sign-in method matches the attempted password", async () => {
    const ui = createMockUI();
    const error = {
      code: "auth/wrong-password",
      message: "Wrong password",
      customData: {
        email: "typo@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["password"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(fetchSignInMethodsForEmail).toHaveBeenCalledWith(ui.auth, "typo@example.com");
    expect(ui.clearLegacySignInRecovery).toHaveBeenCalledTimes(1);
    expect(ui.setLegacySignInRecovery).not.toHaveBeenCalled();
  });

  it("sets recovery state when an OAuth conflict resolves to a genuinely different method", async () => {
    const ui = createMockUI();
    const credential = {
      providerId: "github.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "github.com", token: "token" }),
    } as any;
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      credential,
      customData: {
        email: "oauth@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue(["google.com"]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "oauth@example.com",
      signInMethods: ["google.com"],
      attemptedProviderId: "github.com",
      pendingProviderId: "github.com",
    });
    expect(ui.clearLegacySignInRecovery).not.toHaveBeenCalled();
  });
});

/**
 * Uses the real `clearLegacySignInRecovery` (via `initializeUI`), instead of the
 * `createMockUI()` no-op mock, to prove the actual regression scenario is fixed end-to-end:
 * a pending credential persisted by this handler must not survive an abandoned recovery
 * attempt, since `handlePendingCredential` in `auth.ts` would otherwise silently link it to
 * an unrelated, later sign-in.
 */
describe("legacyFetchSignInWithEmailHandler (real clearLegacySignInRecovery)", () => {
  function createRealUI() {
    const store = initializeUI({
      app: {} as FirebaseApp,
      auth: {} as Auth,
    });
    return store.get();
  }

  it("removes the pending credential from sessionStorage when no email can be extracted", async () => {
    const ui = createRealUI();
    const credential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "token" }),
    } as any;
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      credential,
    } as any;

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(window.sessionStorage.getItem(PENDING_CREDENTIAL_STORAGE_KEY)).toBeNull();
  });

  it("removes the pending credential from sessionStorage when fetching sign-in methods fails", async () => {
    const ui = createRealUI();
    const credential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "token" }),
    } as any;
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      credential,
      customData: {
        email: "test@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockRejectedValue(new Error("Network failure"));

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(window.sessionStorage.getItem(PENDING_CREDENTIAL_STORAGE_KEY)).toBeNull();
  });

  it("removes the pending credential from sessionStorage when there is no actionable recovery method", async () => {
    const ui = createRealUI();
    const credential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "token" }),
    } as any;
    const error = {
      code: "auth/account-exists-with-different-credential",
      message: "Mismatch",
      credential,
      customData: {
        email: "test@example.com",
      },
    } as any;

    vi.mocked(fetchSignInMethodsForEmail).mockResolvedValue([]);

    await legacyFetchSignInWithEmailHandler(ui, error);

    expect(window.sessionStorage.getItem(PENDING_CREDENTIAL_STORAGE_KEY)).toBeNull();
  });
});

/**
 * Proves the generation guard closes the race described in the review finding: a slow or
 * duplicate `legacyFetchSignInWithEmailHandler` call must not act on a stale
 * `fetchSignInMethodsForEmail()` resolution once a newer state transition (another call
 * completing, or the user dismissing recovery) has already superseded it. Uses the real
 * `initializeUI` store (not `createMockUI()`) since the guard is driven by the real
 * `setLegacySignInRecovery`/`clearLegacySignInRecovery` implementations bumping an internal
 * generation counter.
 */
describe("legacyFetchSignInWithEmailHandler (generation guard against stale async resolutions)", () => {
  function createRealUI() {
    const store = initializeUI({
      app: {} as FirebaseApp,
      auth: {} as Auth,
    });
    return { store, ui: store.get() };
  }

  function createDeferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
      resolve = res;
    });
    return { promise, resolve };
  }

  it("does not reopen recovery after the user dismisses it, when a duplicate, superseded call resolves late (double-submit race)", async () => {
    const { store, ui } = createRealUI();
    const setSpy = vi.spyOn(ui, "setLegacySignInRecovery");

    const error = {
      code: "auth/wrong-password",
      message: "Wrong password",
      customData: { email: "race@example.com" },
    } as any;

    const deferredFirst = createDeferred<string[]>();
    const deferredSecond = createDeferred<string[]>();
    vi.mocked(fetchSignInMethodsForEmail)
      .mockImplementationOnce(() => deferredFirst.promise)
      .mockImplementationOnce(() => deferredSecond.promise);

    // Simulate a double-submit: two handler invocations in flight for the same failed
    // sign-in attempt, both capturing the same starting generation.
    const firstCall = legacyFetchSignInWithEmailHandler(ui, error);
    const secondCall = legacyFetchSignInWithEmailHandler(ui, error);

    // The first call's fetch resolves first, opening the recovery UI.
    deferredFirst.resolve(["google.com"]);
    await firstCall;
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(store.get().legacySignInRecovery).toMatchObject({ email: "race@example.com" });

    // The user dismisses the recovery UI before the second (duplicate) call resolves.
    ui.clearLegacySignInRecovery();
    expect(store.get().legacySignInRecovery).toBeUndefined();

    // The superseded second call finally resolves. It must not reopen the modal the user
    // just dismissed.
    deferredSecond.resolve(["google.com"]);
    await secondCall;

    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(store.get().legacySignInRecovery).toBeUndefined();
  });

  it("does not clobber a newer recovery already set by a second call, when a stale call's fetch resolves with no actionable methods", async () => {
    const { store, ui } = createRealUI();
    const clearSpy = vi.spyOn(ui, "clearLegacySignInRecovery");

    const staleError = {
      code: "auth/wrong-password",
      message: "Wrong password",
      customData: { email: "stale@example.com" },
    } as any;
    const freshError = {
      code: "auth/wrong-password",
      message: "Wrong password",
      customData: { email: "fresh@example.com" },
    } as any;

    const deferredStale = createDeferred<string[]>();
    vi.mocked(fetchSignInMethodsForEmail)
      .mockImplementationOnce(() => deferredStale.promise)
      .mockResolvedValueOnce(["google.com"]);

    // A slow, stale attempt starts first...
    const staleCall = legacyFetchSignInWithEmailHandler(ui, staleError);
    // ...but a second, unrelated attempt completes first and sets genuine recovery data.
    await legacyFetchSignInWithEmailHandler(ui, freshError);
    expect(store.get().legacySignInRecovery).toMatchObject({ email: "fresh@example.com" });

    // The stale call's fetch finally resolves with no actionable recovery method, which
    // would normally clear recovery state - but it must not wipe out the fresh data.
    deferredStale.resolve(["password"]);
    await staleCall;

    expect(clearSpy).not.toHaveBeenCalled();
    expect(store.get().legacySignInRecovery).toMatchObject({ email: "fresh@example.com" });
  });
});

describe("isLegacySignInRecoveryErrorCode", () => {
  it.each([
    "auth/account-exists-with-different-credential",
    "auth/wrong-password",
    "auth/invalid-credential",
    "auth/invalid-login-credentials",
  ])("returns true for %s", (code) => {
    expect(isLegacySignInRecoveryErrorCode(code)).toBe(true);
  });

  it("returns false for unrelated error codes", () => {
    expect(isLegacySignInRecoveryErrorCode("auth/user-not-found")).toBe(false);
    expect(isLegacySignInRecoveryErrorCode("auth/too-many-requests")).toBe(false);
  });
});
