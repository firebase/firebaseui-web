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
