import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Auth, User } from "firebase/auth";
import { oneTapSignInHandler, type OneTapSignInOptions } from "./one-tap";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: {
    credential: vi.fn(),
  },
}));

vi.mock("~/auth", () => ({
  signInWithCredential: vi.fn(),
}));

const mockGoogleAccounts = {
  id: {
    initialize: vi.fn(),
    prompt: vi.fn(),
  },
};

Object.defineProperty(window, "google", {
  value: { accounts: mockGoogleAccounts },
  writable: true,
});

Object.defineProperty(document, "createElement", {
  value: vi.fn(() => ({
    setAttribute: vi.fn(),
    src: "",
    async: false,
    onload: null,
  })),
  writable: true,
});

Object.defineProperty(document, "querySelector", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(document.body, "appendChild", {
  value: vi.fn(),
  writable: true,
});

import { GoogleAuthProvider } from "firebase/auth";
import { signInWithCredential } from "~/auth";

describe("oneTapSignInHandler", () => {
  let mockUI: ReturnType<typeof createMockUI>;
  let mockScript: any;
  let mockCreateElement: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockScript = {
      setAttribute: vi.fn(),
      src: "",
      async: false,
      onload: null,
    };

    mockCreateElement = vi.fn(() => mockScript);
    Object.defineProperty(document, "createElement", {
      value: mockCreateElement,
      writable: true,
    });

    vi.mocked(document.querySelector).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("user authentication state checks", () => {
    it("should not initialize one-tap when user is already signed in with real account", async () => {
      const mockUser = { isAnonymous: false, uid: "real-user-123" } as User;
      mockUI = createMockUI({ auth: { currentUser: mockUser } as Auth });

      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      expect(document.createElement).not.toHaveBeenCalled();
      expect(mockGoogleAccounts.id.initialize).not.toHaveBeenCalled();
    });

    it("should initialize one-tap when user is anonymous", async () => {
      const mockUser = { isAnonymous: true, uid: "anonymous-123" } as User;
      mockUI = createMockUI({ auth: { currentUser: mockUser } as Auth });

      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      expect(document.createElement).toHaveBeenCalledWith("script");
      expect(mockScript.setAttribute).toHaveBeenCalledWith("data-one-tap-sign-in", "true");
      expect(mockScript.src).toBe("https://accounts.google.com/gsi/client");
      expect(mockScript.async).toBe(true);
    });

    it("should initialize one-tap when no current user exists", async () => {
      mockUI = createMockUI({ auth: { currentUser: null } as Auth });

      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      expect(document.createElement).toHaveBeenCalledWith("script");
      expect(mockScript.setAttribute).toHaveBeenCalledWith("data-one-tap-sign-in", "true");
      expect(mockScript.src).toBe("https://accounts.google.com/gsi/client");
      expect(mockScript.async).toBe(true);
    });
  });

  describe("script loading prevention", () => {
    it("should not load script if one-tap script already exists", async () => {
      mockUI = createMockUI({ auth: { currentUser: null } as Auth });

      const existingScript = { tagName: "script" };
      vi.mocked(document.querySelector).mockReturnValue(existingScript as any);

      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      expect(document.createElement).not.toHaveBeenCalled();
      expect(mockGoogleAccounts.id.initialize).not.toHaveBeenCalled();
    });

    it("should check for existing script with correct selector", async () => {
      mockUI = createMockUI({ auth: { currentUser: null } as Auth });

      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      expect(document.querySelector).toHaveBeenCalledWith("script[data-one-tap-sign-in]");
    });
  });

  describe("script loading and initialization", () => {
    beforeEach(() => {
      mockUI = createMockUI({ auth: { currentUser: null } as Auth });
    });

    it("should create and append script with correct attributes", async () => {
      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      expect(document.createElement).toHaveBeenCalledWith("script");
      expect(mockScript.setAttribute).toHaveBeenCalledWith("data-one-tap-sign-in", "true");
      expect(mockScript.src).toBe("https://accounts.google.com/gsi/client");
      expect(mockScript.async).toBe(true);
      expect(document.body.appendChild).toHaveBeenCalledWith(mockScript);
    });

    it("should initialize Google One Tap with basic options", async () => {
      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      if (mockScript.onload) {
        mockScript.onload();
      }

      expect(mockGoogleAccounts.id.initialize).toHaveBeenCalledWith({
        client_id: "test-client-id",
        auto_select: undefined,
        cancel_on_tap_outside: undefined,
        context: undefined,
        ux_mode: undefined,
        log_level: undefined,
        callback: expect.any(Function),
      });
    });

    it("should initialize Google One Tap with all options", async () => {
      const options: OneTapSignInOptions = {
        clientId: "test-client-id",
        autoSelect: true,
        cancelOnTapOutside: false,
        context: "signin",
        uxMode: "popup",
        logLevel: "debug",
      };

      await oneTapSignInHandler(mockUI, options);

      if (mockScript.onload) {
        mockScript.onload();
      }

      expect(mockGoogleAccounts.id.initialize).toHaveBeenCalledWith({
        client_id: "test-client-id",
        auto_select: true,
        cancel_on_tap_outside: false,
        context: "signin",
        ux_mode: "popup",
        log_level: "debug",
        callback: expect.any(Function),
      });
    });

    it("should call prompt after initialization", async () => {
      const options: OneTapSignInOptions = { clientId: "test-client-id" };

      await oneTapSignInHandler(mockUI, options);

      if (mockScript.onload) {
        mockScript.onload();
      }

      expect(mockGoogleAccounts.id.prompt).toHaveBeenCalled();
    });
  });

  describe("callback integration", () => {
    beforeEach(() => {
      mockUI = createMockUI({ auth: { currentUser: null } as Auth });
    });

    it("should handle Google One Tap callback with credential", async () => {
      const options: OneTapSignInOptions = { clientId: "test-client-id" };
      const mockCredential = { providerId: "google.com" };
      const mockGoogleCredential = { credential: "google-credential-token" };

      vi.mocked(GoogleAuthProvider.credential).mockReturnValue(mockCredential as any);
      vi.mocked(signInWithCredential).mockResolvedValue({} as any);

      await oneTapSignInHandler(mockUI, options);

      if (mockScript.onload) {
        mockScript.onload();
      }

      const initializeCall = vi.mocked(mockGoogleAccounts.id.initialize).mock.calls[0];
      const callback = initializeCall?.[0]?.callback;

      await callback(mockGoogleCredential);

      expect(GoogleAuthProvider.credential).toHaveBeenCalledWith("google-credential-token");
      expect(signInWithCredential).toHaveBeenCalledWith(mockUI, mockCredential);
    });

    it("should handle callback errors gracefully", async () => {
      const options: OneTapSignInOptions = { clientId: "test-client-id" };
      const mockError = new Error("Google One Tap error");

      vi.mocked(GoogleAuthProvider.credential).mockImplementation(() => {
        throw mockError;
      });

      await oneTapSignInHandler(mockUI, options);

      if (mockScript.onload) {
        mockScript.onload();
      }

      const initializeCall = vi.mocked(mockGoogleAccounts.id.initialize).mock.calls[0];
      const callback = initializeCall?.[0]?.callback;

      await expect(callback({ credential: "invalid-token" })).rejects.toThrow("Google One Tap error");
    });
  });

  describe("options handling", () => {
    beforeEach(() => {
      mockUI = createMockUI({ auth: { currentUser: null } as Auth });
    });

    it("should handle minimal options", async () => {
      const options: OneTapSignInOptions = { clientId: "minimal-client-id" };

      await oneTapSignInHandler(mockUI, options);

      if (mockScript.onload) {
        mockScript.onload();
      }

      expect(mockGoogleAccounts.id.initialize).toHaveBeenCalledWith({
        client_id: "minimal-client-id",
        auto_select: undefined,
        cancel_on_tap_outside: undefined,
        context: undefined,
        ux_mode: undefined,
        log_level: undefined,
        callback: expect.any(Function),
      });
    });

    it("should handle all available options", async () => {
      const options: OneTapSignInOptions = {
        clientId: "full-options-client-id",
        autoSelect: false,
        cancelOnTapOutside: true,
        context: "use",
        uxMode: "redirect",
        logLevel: "warn",
      };

      await oneTapSignInHandler(mockUI, options);

      if (mockScript.onload) {
        mockScript.onload();
      }

      expect(mockGoogleAccounts.id.initialize).toHaveBeenCalledWith({
        client_id: "full-options-client-id",
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "use",
        ux_mode: "redirect",
        log_level: "warn",
        callback: expect.any(Function),
      });
    });
  });
});
