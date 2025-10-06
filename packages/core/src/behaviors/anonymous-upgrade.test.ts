import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Auth,
  AuthCredential,
  AuthProvider,
  linkWithCredential,
  linkWithRedirect,
  User,
  UserCredential,
} from "firebase/auth";
import {
  autoUpgradeAnonymousCredentialHandler,
  autoUpgradeAnonymousProviderHandler,
  autoUpgradeAnonymousUserRedirectHandler,
  OnUpgradeCallback,
} from "./anonymous-upgrade";
import { createMockUI } from "~/tests/utils";
import { getBehavior } from "~/behaviors";

vi.mock("firebase/auth", () => ({
  linkWithCredential: vi.fn(),
  linkWithRedirect: vi.fn(),
}));

vi.mock("~/behaviors", () => ({
  getBehavior: vi.fn(),
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

  it("should call onUpgrade callback when provided", async () => {
    const mockUser = { isAnonymous: true, uid: "anonymous-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockCredential = { providerId: "password" } as AuthCredential;
    const mockResult = { user: { uid: "upgraded-123" } } as UserCredential;

    vi.mocked(linkWithCredential).mockResolvedValue(mockResult);

    const onUpgrade = vi.fn().mockResolvedValue(undefined);

    const result = await autoUpgradeAnonymousCredentialHandler(mockUI, mockCredential, onUpgrade);

    expect(onUpgrade).toHaveBeenCalledWith(mockUI, "anonymous-123", mockResult);
    expect(result).toBe(mockResult);
  });

  it("should handle onUpgrade callback errors", async () => {
    const mockUser = { isAnonymous: true, uid: "anonymous-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockCredential = { providerId: "password" } as AuthCredential;
    const mockResult = { user: { uid: "upgraded-123" } } as UserCredential;

    vi.mocked(linkWithCredential).mockResolvedValue(mockResult);

    const onUpgrade = vi.fn().mockRejectedValue(new Error("Callback error"));

    await expect(autoUpgradeAnonymousCredentialHandler(mockUI, mockCredential, onUpgrade)).rejects.toThrow(
      "Callback error"
    );
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
    const mockResult = { user: { uid: "upgraded-123" } } as UserCredential;

    const mockProviderLinkStrategy = vi.fn().mockResolvedValue(mockResult);
    vi.mocked(getBehavior).mockReturnValue(mockProviderLinkStrategy);

    const localStorageSpy = vi.spyOn(Storage.prototype, "setItem");
    const localStorageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");

    const result = await autoUpgradeAnonymousProviderHandler(mockUI, mockProvider);

    expect(getBehavior).toHaveBeenCalledWith(mockUI, "providerLinkStrategy");
    expect(mockProviderLinkStrategy).toHaveBeenCalledWith(mockUI, mockUser, mockProvider);
    expect(localStorageSpy).toHaveBeenCalledWith("fbui:upgrade:oldUserId", "anonymous-123");
    expect(localStorageRemoveSpy).toHaveBeenCalledWith("fbui:upgrade:oldUserId");
    expect(result).toBe(mockResult);
  });

  it("should call onUpgrade callback when provided", async () => {
    const mockUser = { isAnonymous: true, uid: "anonymous-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "upgraded-123" } } as UserCredential;

    const mockProviderLinkStrategy = vi.fn().mockResolvedValue(mockResult);
    vi.mocked(getBehavior).mockReturnValue(mockProviderLinkStrategy);

    const onUpgrade = vi.fn().mockResolvedValue(undefined);

    const result = await autoUpgradeAnonymousProviderHandler(mockUI, mockProvider, onUpgrade);

    expect(onUpgrade).toHaveBeenCalledWith(mockUI, "anonymous-123", mockResult);
    expect(result).toBe(mockResult);
  });

  it("should handle onUpgrade callback errors", async () => {
    const mockUser = { isAnonymous: true, uid: "anonymous-123" } as User;
    const mockAuth = { currentUser: mockUser } as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "upgraded-123" } } as UserCredential;

    const mockProviderLinkStrategy = vi.fn().mockResolvedValue(mockResult);
    vi.mocked(getBehavior).mockReturnValue(mockProviderLinkStrategy);

    const onUpgrade = vi.fn().mockRejectedValue(new Error("Callback error"));

    await expect(autoUpgradeAnonymousProviderHandler(mockUI, mockProvider, onUpgrade)).rejects.toThrow(
      "Callback error"
    );
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

describe("autoUpgradeAnonymousUserRedirectHandler", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should call onUpgrade callback when oldUserId exists in localStorage", async () => {
    const mockUI = createMockUI();
    const mockCredential = { user: { uid: "upgraded-123" } } as UserCredential;
    const oldUserId = "anonymous-123";

    window.localStorage.setItem("fbui:upgrade:oldUserId", oldUserId);

    const onUpgrade = vi.fn().mockResolvedValue(undefined);

    await autoUpgradeAnonymousUserRedirectHandler(mockUI, mockCredential, onUpgrade);

    expect(onUpgrade).toHaveBeenCalledWith(mockUI, oldUserId, mockCredential);
    expect(window.localStorage.getItem("fbui:upgrade:oldUserId")).toBeNull();
  });

  it("should not call onUpgrade callback when no oldUserId in localStorage", async () => {
    const mockUI = createMockUI();
    const mockCredential = { user: { uid: "upgraded-123" } } as UserCredential;

    const onUpgrade = vi.fn().mockResolvedValue(undefined);

    await autoUpgradeAnonymousUserRedirectHandler(mockUI, mockCredential, onUpgrade);

    expect(onUpgrade).not.toHaveBeenCalled();
  });

  it("should not call onUpgrade callback when no credential provided", async () => {
    const mockUI = createMockUI();
    const oldUserId = "anonymous-123";

    window.localStorage.setItem("fbui:upgrade:oldUserId", oldUserId);

    const onUpgrade = vi.fn().mockResolvedValue(undefined);

    await autoUpgradeAnonymousUserRedirectHandler(mockUI, null, onUpgrade);

    expect(onUpgrade).not.toHaveBeenCalled();
  });

  it("should not call onUpgrade callback when no onUpgrade callback provided", async () => {
    const mockUI = createMockUI();
    const mockCredential = { user: { uid: "upgraded-123" } } as UserCredential;
    const oldUserId = "anonymous-123";

    window.localStorage.setItem("fbui:upgrade:oldUserId", oldUserId);

    await autoUpgradeAnonymousUserRedirectHandler(mockUI, mockCredential);

    // Should not throw and should clean up localStorage even when no callback provided
    expect(window.localStorage.getItem("fbui:upgrade:oldUserId")).toBeNull();
  });

  it("should handle onUpgrade callback errors", async () => {
    const mockUI = createMockUI();
    const mockCredential = { user: { uid: "upgraded-123" } } as UserCredential;
    const oldUserId = "anonymous-123";

    window.localStorage.setItem("fbui:upgrade:oldUserId", oldUserId);

    const onUpgrade = vi.fn().mockRejectedValue(new Error("Callback error"));

    await expect(autoUpgradeAnonymousUserRedirectHandler(mockUI, mockCredential, onUpgrade)).rejects.toThrow(
      "Callback error"
    );

    // Should clean up localStorage even when callback throws error
    expect(window.localStorage.getItem("fbui:upgrade:oldUserId")).toBeNull();
  });
});
