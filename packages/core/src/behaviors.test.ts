import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockUI } from "~/tests/utils";
import { autoAnonymousLogin, autoUpgradeAnonymousUsers, getBehavior, hasBehavior, recaptchaVerification } from "./behaviors";
import { Auth, signInAnonymously, User, UserCredential, linkWithCredential, linkWithRedirect, AuthCredential, AuthProvider, RecaptchaVerifier } from "firebase/auth";

vi.mock("firebase/auth", () => ({
  signInAnonymously: vi.fn(),
  linkWithCredential: vi.fn(),
  linkWithRedirect: vi.fn(),
  RecaptchaVerifier: vi.fn(),
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

describe("recaptchaVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a RecaptchaVerifier with default options", () => {
    const mockRecaptchaVerifier = { render: vi.fn() };
    vi.mocked(RecaptchaVerifier).mockImplementation(() => mockRecaptchaVerifier as any);
    
    const mockElement = document.createElement("div");
    const mockUI = createMockUI();
    
    const behavior = recaptchaVerification();
    const result = behavior.recaptchaVerification(mockUI, mockElement);

    expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
      size: "invisible",
      theme: "light",
      tabindex: 0,
    });
    expect(result).toBe(mockRecaptchaVerifier);
  });

  it("should create a RecaptchaVerifier with custom options", () => {
    const mockRecaptchaVerifier = { render: vi.fn() };
    vi.mocked(RecaptchaVerifier).mockImplementation(() => mockRecaptchaVerifier as any);
    
    const mockElement = document.createElement("div");
    const mockUI = createMockUI();
    const customOptions = {
      size: "normal" as const,
      theme: "dark" as const,
      tabindex: 5,
    };
    
    const behavior = recaptchaVerification(customOptions);
    const result = behavior.recaptchaVerification(mockUI, mockElement);

    expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
      size: "normal",
      theme: "dark",
      tabindex: 5,
    });
    expect(result).toBe(mockRecaptchaVerifier);
  });

  it("should create a RecaptchaVerifier with partial custom options", () => {
    const mockRecaptchaVerifier = { render: vi.fn() };
    vi.mocked(RecaptchaVerifier).mockImplementation(() => mockRecaptchaVerifier as any);
    
    const mockElement = document.createElement("div");
    const mockUI = createMockUI();
    const partialOptions = {
      size: "compact" as const,
    };
    
    const behavior = recaptchaVerification(partialOptions);
    const result = behavior.recaptchaVerification(mockUI, mockElement);

    expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
      size: "compact",
      theme: "light",
      tabindex: 0,
    });
    expect(result).toBe(mockRecaptchaVerifier);
  });

  it("should work with hasBehavior and getBehavior", () => {
    const mockRecaptchaVerifier = { render: vi.fn() };
    vi.mocked(RecaptchaVerifier).mockImplementation(() => mockRecaptchaVerifier as any);
    
    const mockElement = document.createElement("div");
    const mockUI = createMockUI({
      behaviors: {
        recaptchaVerification: recaptchaVerification().recaptchaVerification,
      },
    });

    expect(hasBehavior(mockUI, "recaptchaVerification")).toBe(true);
    
    const behavior = getBehavior(mockUI, "recaptchaVerification");
    const result = behavior(mockUI, mockElement);

    expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
      size: "invisible",
      theme: "light",
      tabindex: 0,
    });
    expect(result).toBe(mockRecaptchaVerifier);
  });

  it("should throw error when trying to get non-existent recaptchaVerification behavior", () => {
    const mockUI = createMockUI();
    
    expect(hasBehavior(mockUI, "recaptchaVerification")).toBe(false);
    expect(() => getBehavior(mockUI, "recaptchaVerification")).toThrow("Behavior recaptchaVerification not found");
  });
});


