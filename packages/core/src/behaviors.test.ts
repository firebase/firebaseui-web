import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockUI } from "~/tests/utils";
import { autoAnonymousLogin, autoUpgradeAnonymousUsers, getBehavior, hasBehavior } from "./behaviors";
import { Auth, signInAnonymously, User, UserCredential, linkWithCredential, linkWithRedirect, AuthCredential, AuthProvider } from "firebase/auth";

vi.mock("firebase/auth", () => ({
  signInAnonymously: vi.fn(),
  linkWithCredential: vi.fn(),
  linkWithRedirect: vi.fn(),
}));

describe("hasBehavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true if the behavior is enabled, but not call it", () => {
    const mockBehavior = vi.fn();
    const ui = createMockUI({
      behaviors: {
        autoAnonymousLogin: mockBehavior,
      },
    });

    expect(hasBehavior(ui, "autoAnonymousLogin")).toBe(true);
    expect(mockBehavior).not.toHaveBeenCalled();
  });

  it("should return false if the behavior is not enabled", () => {
    const ui = createMockUI();
    expect(hasBehavior(ui, "autoAnonymousLogin")).toBe(false);
  });
});

describe("getBehavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw if the behavior is not enabled", () => {
    const ui = createMockUI();
    expect(() => getBehavior(ui, "autoAnonymousLogin")).toThrow();
  });

  it("should call the behavior if it is enabled", () => {
    const mockBehavior = vi.fn();
    const ui = createMockUI({
      behaviors: {
        autoAnonymousLogin: mockBehavior,
      },
    });

    expect(hasBehavior(ui, "autoAnonymousLogin")).toBe(true);
    expect(getBehavior(ui, "autoAnonymousLogin")).toBe(mockBehavior);
  });
});

describe("autoAnonymousLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sign the user in anonymously if they are not signed in', async () => {
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const mockUI = createMockUI({
      auth: {
        currentUser: null,
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
    });
    
    vi.mocked(signInAnonymously).mockResolvedValue({} as UserCredential);
    
    await autoAnonymousLogin().autoAnonymousLogin(mockUI);

    expect(mockAuthStateReady).toHaveBeenCalled();
    expect(signInAnonymously).toHaveBeenCalledWith(mockUI.auth);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["loading"], ["idle"]]);
  });

  it('should not attempt to sign in anonymously if the user is already signed in', async () => {
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const mockUI = createMockUI({
      auth: {
        currentUser: { uid: "test-user" } as User,
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
    });
    
    vi.mocked(signInAnonymously).mockResolvedValue({} as UserCredential);
    
    await autoAnonymousLogin().autoAnonymousLogin(mockUI);

    expect(mockAuthStateReady).toHaveBeenCalled();
    expect(signInAnonymously).not.toHaveBeenCalled();

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([ ["idle"]]);
  });

  it("should return noop behavior in SSR mode", async () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const behavior = autoAnonymousLogin();
    const mockUI = createMockUI();

    const result = await behavior.autoAnonymousLogin(mockUI);

    expect(result).toEqual({ uid: "server-placeholder" });
    expect(signInAnonymously).not.toHaveBeenCalled();

    // Restore window
    global.window = originalWindow;
  });
});

describe("autoUpgradeAnonymousUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("autoUpgradeAnonymousCredential", () => {
    it("should upgrade anonymous user with credential", async () => {
      const mockCredential = { providerId: "password" } as AuthCredential;
      const mockUserCredential = { user: { uid: "test-user" } } as UserCredential;
      const mockAnonymousUser = { uid: "anonymous-user", isAnonymous: true } as User;
      
      const mockUI = createMockUI({
        auth: {
          currentUser: mockAnonymousUser,
        } as unknown as Auth,
      });

      vi.mocked(linkWithCredential).mockResolvedValue(mockUserCredential);

      const behavior = autoUpgradeAnonymousUsers();
      const result = await behavior.autoUpgradeAnonymousCredential(mockUI, mockCredential);

      expect(linkWithCredential).toHaveBeenCalledWith(mockAnonymousUser, mockCredential);
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
      expect(result).toBe(mockUserCredential);
    });

    it("should return undefined if user is not anonymous", async () => {
      const mockCredential = { providerId: "password" } as AuthCredential;
      const mockRegularUser = { uid: "regular-user", isAnonymous: false } as User;
      
      const mockUI = createMockUI({
        auth: {
          currentUser: mockRegularUser,
        } as unknown as Auth,
      });

      const behavior = autoUpgradeAnonymousUsers();
      const result = await behavior.autoUpgradeAnonymousCredential(mockUI, mockCredential);

      expect(linkWithCredential).not.toHaveBeenCalled();
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([]);
      expect(result).toBeUndefined();
    });

    it("should return undefined if no current user", async () => {
      const mockCredential = { providerId: "password" } as AuthCredential;
      
      const mockUI = createMockUI({
        auth: {
          currentUser: null,
        } as unknown as Auth,
      });

      const behavior = autoUpgradeAnonymousUsers();
      const result = await behavior.autoUpgradeAnonymousCredential(mockUI, mockCredential);

      expect(linkWithCredential).not.toHaveBeenCalled();
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([]);
      expect(result).toBeUndefined();
    });
  });

  describe("autoUpgradeAnonymousProvider", () => {
    it("should upgrade anonymous user with provider", async () => {
      const mockProvider = { providerId: "google.com" } as AuthProvider;
      const mockAnonymousUser = { uid: "anonymous-user", isAnonymous: true } as User;
      
      const mockUI = createMockUI({
        auth: {
          currentUser: mockAnonymousUser,
        } as unknown as Auth,
      });

      vi.mocked(linkWithRedirect).mockResolvedValue(undefined as never);

      const behavior = autoUpgradeAnonymousUsers();
      await behavior.autoUpgradeAnonymousProvider(mockUI, mockProvider);

      expect(linkWithRedirect).toHaveBeenCalledWith(mockAnonymousUser, mockProvider);
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"]]);
    });

    it("should return early if user is not anonymous", async () => {
      const mockProvider = { providerId: "google.com" } as AuthProvider;
      const mockRegularUser = { uid: "regular-user", isAnonymous: false } as User;
      
      const mockUI = createMockUI({
        auth: {
          currentUser: mockRegularUser,
        } as unknown as Auth,
      });

      const behavior = autoUpgradeAnonymousUsers();
      await behavior.autoUpgradeAnonymousProvider(mockUI, mockProvider);

      expect(linkWithRedirect).not.toHaveBeenCalled();
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([]);
    });
  });
});
