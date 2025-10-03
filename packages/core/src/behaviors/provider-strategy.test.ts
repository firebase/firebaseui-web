import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Auth,
  AuthProvider,
  linkWithPopup,
  linkWithRedirect,
  signInWithPopup,
  signInWithRedirect,
  User,
  UserCredential,
} from "firebase/auth";
import {
  signInWithRediectHandler,
  signInWithPopupHandler,
  linkWithRedirectHandler,
  linkWithPopupHandler,
} from "./provider-strategy";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  signInWithRedirect: vi.fn(),
  signInWithPopup: vi.fn(),
  linkWithRedirect: vi.fn(),
  linkWithPopup: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signInWithRediectHandler", () => {
  it("should set state to pending and call signInWithRedirect", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;

    vi.mocked(signInWithRedirect).mockResolvedValue({} as never);

    await signInWithRediectHandler(mockUI, mockProvider);

    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(signInWithRedirect).toHaveBeenCalledWith(mockAuth, mockProvider);
  });
});

describe("signInWithPopupHandler", () => {
  it("should set state to pending, call signInWithPopup, set state to idle, and return result", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "test-user" } } as UserCredential;

    vi.mocked(signInWithPopup).mockResolvedValue(mockResult);

    const result = await signInWithPopupHandler(mockUI, mockProvider);

    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, mockProvider);
    expect(mockUI.setState).toHaveBeenCalledWith("idle");
    expect(result).toBe(mockResult);
  });

  it("should not set state to idle when signInWithPopup fails", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockError = new Error("Popup sign in failed");

    vi.mocked(signInWithPopup).mockRejectedValue(mockError);

    await expect(signInWithPopupHandler(mockUI, mockProvider)).rejects.toThrow("Popup sign in failed");
    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(mockUI.setState).not.toHaveBeenCalledWith("idle");
  });
});

describe("linkWithRedirectHandler", () => {
  it("should set state to pending and call linkWithRedirect", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockUser = { uid: "test-user" } as User;
    const mockProvider = { providerId: "google.com" } as AuthProvider;

    vi.mocked(linkWithRedirect).mockResolvedValue({} as never);

    await linkWithRedirectHandler(mockUI, mockUser, mockProvider);

    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(linkWithRedirect).toHaveBeenCalledWith(mockUser, mockProvider);
  });
});

describe("linkWithPopupHandler", () => {
  it("should set state to pending, call linkWithPopup, set state to idle, and return result", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockUser = { uid: "test-user" } as User;
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "linked-user" } } as UserCredential;

    vi.mocked(linkWithPopup).mockResolvedValue(mockResult);

    const result = await linkWithPopupHandler(mockUI, mockUser, mockProvider);

    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(linkWithPopup).toHaveBeenCalledWith(mockUser, mockProvider);
    expect(mockUI.setState).toHaveBeenCalledWith("idle");
    expect(result).toBe(mockResult);
  });

  it("should not set state to idle when linkWithPopup fails", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockUser = { uid: "test-user" } as User;
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockError = new Error("Popup link failed");

    vi.mocked(linkWithPopup).mockRejectedValue(mockError);

    await expect(linkWithPopupHandler(mockUI, mockUser, mockProvider)).rejects.toThrow("Popup link failed");
    expect(mockUI.setState).toHaveBeenCalledWith("pending");
    expect(mockUI.setState).not.toHaveBeenCalledWith("idle");
  });
});
