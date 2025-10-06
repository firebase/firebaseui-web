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

    expect(signInWithRedirect).toHaveBeenCalledWith(mockAuth, mockProvider);
  });
});

describe("signInWithPopupHandler", () => {
  it("should call signInWithPopup and return result", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "test-user" } } as UserCredential;

    vi.mocked(signInWithPopup).mockResolvedValue(mockResult);

    const result = await signInWithPopupHandler(mockUI, mockProvider);

    expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, mockProvider);
    expect(result).toBe(mockResult);
  });

  it("should throw error when signInWithPopup fails", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockError = new Error("Popup sign in failed");

    vi.mocked(signInWithPopup).mockRejectedValue(mockError);

    await expect(signInWithPopupHandler(mockUI, mockProvider)).rejects.toThrow("Popup sign in failed");
  });
});

describe("linkWithRedirectHandler", () => {
  it("should call linkWithRedirect", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockUser = { uid: "test-user" } as User;
    const mockProvider = { providerId: "google.com" } as AuthProvider;

    vi.mocked(linkWithRedirect).mockResolvedValue({} as never);

    await linkWithRedirectHandler(mockUI, mockUser, mockProvider);

    expect(linkWithRedirect).toHaveBeenCalledWith(mockUser, mockProvider);
  });
});

describe("linkWithPopupHandler", () => {
  it("should call linkWithPopup and return result", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockUser = { uid: "test-user" } as User;
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "linked-user" } } as UserCredential;

    vi.mocked(linkWithPopup).mockResolvedValue(mockResult);

    const result = await linkWithPopupHandler(mockUI, mockUser, mockProvider);

    expect(linkWithPopup).toHaveBeenCalledWith(mockUser, mockProvider);
    expect(result).toBe(mockResult);
  });

  it("should throw error when linkWithPopup fails", async () => {
    const mockAuth = {} as Auth;
    const mockUI = createMockUI({ auth: mockAuth });
    const mockUser = { uid: "test-user" } as User;
    const mockProvider = { providerId: "google.com" } as AuthProvider;
    const mockError = new Error("Popup link failed");

    vi.mocked(linkWithPopup).mockRejectedValue(mockError);

    await expect(linkWithPopupHandler(mockUI, mockUser, mockProvider)).rejects.toThrow("Popup link failed");
  });
});
