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
import { legacyFetchSignInWithEmailHandler } from "./legacy-fetch-sign-in-with-email";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  fetchSignInMethodsForEmail: vi.fn(),
}));

import { fetchSignInMethodsForEmail } from "firebase/auth";

let mockSessionStorage: Record<string, string>;

beforeEach(() => {
  vi.clearAllMocks();

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

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith("pendingCred", JSON.stringify(credential.toJSON()));
    expect(fetchSignInMethodsForEmail).toHaveBeenCalledWith(ui.auth, "test@example.com");
    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "test@example.com",
      signInMethods: ["password", "emailLink"],
      attemptedProviderId: "google.com",
      pendingProviderId: "google.com",
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

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith("pendingCred", JSON.stringify(credential.toJSON()));
    expect(ui.clearLegacySignInRecovery).toHaveBeenCalledTimes(1);
  });

  it("preserves an empty sign-in method list", async () => {
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

    expect(ui.setLegacySignInRecovery).toHaveBeenCalledWith({
      email: "test@example.com",
      signInMethods: [],
      attemptedProviderId: undefined,
      pendingProviderId: undefined,
    });
  });
});
