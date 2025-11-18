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
import { Auth, signInAnonymously, User } from "firebase/auth";
import { autoAnonymousLoginHandler } from "./auto-anonymous-login";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  signInAnonymously: vi.fn(),
}));

describe("autoAnonymousLoginHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should sign in anonymously when no current user exists", async () => {
    const mockUI = createMockUI({ auth: { currentUser: null } as Auth });

    const mockSignInResult = { user: { uid: "anonymous-123" } };
    vi.mocked(signInAnonymously).mockResolvedValue(mockSignInResult as any);

    await autoAnonymousLoginHandler(mockUI);

    expect(signInAnonymously).toHaveBeenCalledWith(mockUI.auth);
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it("should not sign in when current user already exists", async () => {
    const mockUI = createMockUI({ auth: { currentUser: { uid: "existing-user-123" } as User } as Auth });
    await autoAnonymousLoginHandler(mockUI);
    expect(signInAnonymously).not.toHaveBeenCalled();
  });
});
