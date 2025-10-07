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
