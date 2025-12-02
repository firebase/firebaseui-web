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
import { User } from "firebase/auth";
import { requireDisplayNameHandler } from "./require-display-name";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  updateProfile: vi.fn(),
}));

import { updateProfile } from "firebase/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireDisplayNameHandler", () => {
  it("should update user profile with display name", async () => {
    const mockUser = { uid: "test-user-123" } as User;
    const mockUI = createMockUI();
    const displayName = "John Doe";

    vi.mocked(updateProfile).mockResolvedValue();

    await requireDisplayNameHandler(mockUI, mockUser, displayName);

    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName });
  });

  it("should handle updateProfile errors", async () => {
    const mockUser = { uid: "test-user-123" } as User;
    const mockUI = createMockUI();
    const displayName = "John Doe";
    const mockError = new Error("Profile update failed");

    vi.mocked(updateProfile).mockRejectedValue(mockError);

    await expect(requireDisplayNameHandler(mockUI, mockUser, displayName)).rejects.toThrow("Profile update failed");
  });
});
