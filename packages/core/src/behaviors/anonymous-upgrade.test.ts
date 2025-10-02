import { describe, it, expect, vi, beforeEach } from "vitest";
import { Auth, AuthCredential, AuthProvider, linkWithCredential, linkWithRedirect, User } from "firebase/auth";
import { autoUpgradeAnonymousCredentialHandler, autoUpgradeAnonymousProviderHandler } from "./anonymous-upgrade";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  linkWithCredential: vi.fn(),
  linkWithRedirect: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("autoUpgradeAnonymousCredentialHandler", () => {
  it("should upgrade anonymous user with credential", async () => {
    const mockUser = { isAnonymous: true, uid: "anonymous-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockCredential = { providerId: "password" } as AuthCredential;

    const mockResult = { user: { uid: "upgraded-123" } };
    vi.mocked(linkWithCredential).mockResolvedValue(mockResult as any);

    const result = await autoUpgradeAnonymousCredentialHandler(mockUI, mockCredential);

    expect(linkWithCredential).toHaveBeenCalledWith(mockUser, mockCredential);
    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(mockUI.setState).toHaveBeenCalledWith("idle");
    expect(result).toBe(mockResult);
  });

  it("should not upgrade when user is not anonymous", async () => {
    const mockUser = { isAnonymous: false, uid: "regular-user-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockCredential = { providerId: "password" } as AuthCredential;

    const result = await autoUpgradeAnonymousCredentialHandler(mockUI, mockCredential);

    expect(linkWithCredential).not.toHaveBeenCalled();
    expect(mockUI.setState).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should not upgrade when no current user", async () => {
    const mockAuth = { currentUser: null } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockCredential = { providerId: "password" } as AuthCredential;

    const result = await autoUpgradeAnonymousCredentialHandler(mockUI, mockCredential);

    expect(linkWithCredential).not.toHaveBeenCalled();
    expect(mockUI.setState).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});

describe("autoUpgradeAnonymousProviderHandler", () => {
  it("should upgrade anonymous user with provider", async () => {
    const mockUser = { isAnonymous: true, uid: "anonymous-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;

    vi.mocked(linkWithRedirect).mockResolvedValue({} as never);

    await autoUpgradeAnonymousProviderHandler(mockUI, mockProvider);

    expect(linkWithRedirect).toHaveBeenCalledWith(mockUser, mockProvider);
    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(mockUI.setState).not.toHaveBeenCalledWith("idle");
  });

  it("should not upgrade when user is not anonymous", async () => {
    const mockUser = { isAnonymous: false, uid: "regular-user-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;

    await autoUpgradeAnonymousProviderHandler(mockUI, mockProvider);

    expect(linkWithRedirect).not.toHaveBeenCalled();
    expect(mockUI.setState).not.toHaveBeenCalled();
  });

  it("should not upgrade when no current user", async () => {
    const mockAuth = { currentUser: null } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;

    await autoUpgradeAnonymousProviderHandler(mockUI, mockProvider);

    expect(linkWithRedirect).not.toHaveBeenCalled();
    expect(mockUI.setState).not.toHaveBeenCalled();
  });
});
