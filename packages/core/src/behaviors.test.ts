import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockUI } from "~/tests/utils";
import { autoAnonymousLogin, autoUpgradeAnonymousUsers, getBehavior, hasBehavior, recaptchaVerification, oneTapSignIn } from "./behaviors";
import { Auth, signInAnonymously, User, UserCredential, linkWithCredential, linkWithRedirect, AuthCredential, AuthProvider, RecaptchaVerifier, GoogleAuthProvider } from "firebase/auth";
import { signInWithCredential } from "./auth";

vi.mock("firebase/auth", () => ({
  signInAnonymously: vi.fn(),
  linkWithCredential: vi.fn(),
  linkWithRedirect: vi.fn(),
  RecaptchaVerifier: vi.fn(),
  GoogleAuthProvider: {
    credential: vi.fn(),
  },
}));

vi.mock("./auth", () => ({
  signInWithCredential: vi.fn(),
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
    const mockUI = createMockUI({
      auth: {
        currentUser: null,
      } as unknown as Auth,
    });
    
    vi.mocked(signInAnonymously).mockResolvedValue({} as UserCredential);
    
    await autoAnonymousLogin().autoAnonymousLogin(mockUI);

    expect(signInAnonymously).toHaveBeenCalledWith(mockUI.auth);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["loading"], ["idle"]]);
  });

  it('should not attempt to sign in anonymously if the user is already signed in', async () => {
    const mockUI = createMockUI({
      auth: {
        currentUser: { uid: "test-user" } as User,
      } as unknown as Auth,
    });
    
    vi.mocked(signInAnonymously).mockResolvedValue({} as UserCredential);
    
    await autoAnonymousLogin().autoAnonymousLogin(mockUI);

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

describe("oneTapSignIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window and document
    Object.defineProperty(window, 'google', {
      value: {
        accounts: {
          id: {
            initialize: vi.fn(),
            prompt: vi.fn(),
          },
        },
      },
      writable: true,
    });
    
    // Mock document methods
    Object.defineProperty(document, 'createElement', {
      value: vi.fn(() => ({
        setAttribute: vi.fn(),
        src: '',
        async: false,
        onload: null as (() => void) | null,
      })),
      writable: true,
    });
    
    Object.defineProperty(document, 'querySelector', {
      value: vi.fn(),
      writable: true,
    });
    
    Object.defineProperty(document.body, 'appendChild', {
      value: vi.fn(),
      writable: true,
    });
  });

  it("should initialize Google One Tap with default options", () => {
    const mockScript = {
      setAttribute: vi.fn(),
      src: '',
      async: false,
      onload: null as (() => void) | null,
    };
    
    vi.mocked(document.createElement).mockReturnValue(mockScript as any);
    vi.mocked(document.querySelector).mockReturnValue(null);
    
    const mockUI = createMockUI({
      auth: {
        currentUser: null,
      } as unknown as Auth,
    });
    
    const options = {
      clientId: "test-client-id",
    };
    
    const behavior = oneTapSignIn(options);
    behavior.oneTapSignIn(mockUI);
    
    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(mockScript.setAttribute).toHaveBeenCalledWith('data-one-tap-sign-in', 'true');
    expect(mockScript.src).toBe('https://accounts.google.com/gsi/client');
    expect(mockScript.async).toBe(true);
    expect(document.body.appendChild).toHaveBeenCalledWith(mockScript);
  });

  it("should initialize Google One Tap with custom options", () => {
    const mockScript = {
      setAttribute: vi.fn(),
      src: '',
      async: false,
      onload: null as (() => void) | null,
    };
    
    vi.mocked(document.createElement).mockReturnValue(mockScript as any);
    vi.mocked(document.querySelector).mockReturnValue(null);
    
    const mockUI = createMockUI({
      auth: {
        currentUser: null,
      } as unknown as Auth,
    });
    
    const options = {
      clientId: "test-client-id",
      autoSelect: true,
      cancelOnTapOutside: false,
      context: "signin" as const,
      uxMode: "popup" as const,
      logLevel: "debug" as const,
    };
    
    const behavior = oneTapSignIn(options);
    behavior.oneTapSignIn(mockUI);
    
    // Simulate script load
    const onload = mockScript.onload;
    if (onload && typeof onload === 'function') {
      onload();
    }
    
    expect(window.google.accounts.id.initialize).toHaveBeenCalledWith({
      client_id: "test-client-id",
      auto_select: true,
      cancel_on_tap_outside: false,
      context: "signin",
      ux_mode: "popup",
      log_level: "debug",
      callback: expect.any(Function),
    });
    expect(window.google.accounts.id.prompt).toHaveBeenCalled();
  });

  it("should handle callback and sign in with credential", async () => {
    const mockScript = {
      setAttribute: vi.fn(),
      src: '',
      async: false,
      onload: null as (() => void) | null,
    };
    
    vi.mocked(document.createElement).mockReturnValue(mockScript as any);
    vi.mocked(document.querySelector).mockReturnValue(null);
    
    const mockCredential = { 
      providerId: "google.com",
      pendingToken: null,
      buildRequest: vi.fn()
    } as any;
    const mockUserCredential = { user: { uid: "test-user" } } as UserCredential;
    
    vi.mocked(GoogleAuthProvider.credential).mockReturnValue(mockCredential);
    vi.mocked(signInWithCredential).mockResolvedValue(mockUserCredential);
    
    const mockUI = createMockUI({
      auth: {
        currentUser: null,
      } as unknown as Auth,
    });
    
    const options = {
      clientId: "test-client-id",
    };
    
    const behavior = oneTapSignIn(options);
    behavior.oneTapSignIn(mockUI);
    
    // Simulate script load and get the callback
    const onload = mockScript.onload;
    if (onload && typeof onload === 'function') {
      onload();
    }
    
    // Get the callback function that was passed to initialize
    const initializeCall = vi.mocked(window.google.accounts.id.initialize).mock.calls[0];
    const callback = initializeCall?.[0]?.callback;
    
    // Simulate the callback with a mock response
    const mockResponse = {
      credential: "test-credential-string",
      select_by: "user" as const,
    };
    
    if (callback && typeof callback === 'function') {
      await callback(mockResponse);
    }
    
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith("test-credential-string");
    expect(signInWithCredential).toHaveBeenCalledWith(mockUI, mockCredential);
  });

  it("should not initialize if user is already signed in (non-anonymous)", () => {
    const mockUI = createMockUI({
      auth: {
        currentUser: { uid: "test-user", isAnonymous: false } as User,
      } as unknown as Auth,
    });
    
    const options = {
      clientId: "test-client-id",
    };
    
    const behavior = oneTapSignIn(options);
    behavior.oneTapSignIn(mockUI);
    
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("should initialize if user is anonymous", () => {
    const mockScript = {
      setAttribute: vi.fn(),
      src: '',
      async: false,
      onload: null as (() => void) | null,
    };
    
    vi.mocked(document.createElement).mockReturnValue(mockScript as any);
    vi.mocked(document.querySelector).mockReturnValue(null);
    
    const mockUI = createMockUI({
      auth: {
        currentUser: { uid: "anonymous-user", isAnonymous: true } as User,
      } as unknown as Auth,
    });
    
    const options = {
      clientId: "test-client-id",
    };
    
    const behavior = oneTapSignIn(options);
    behavior.oneTapSignIn(mockUI);
    
    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockScript);
  });

  it("should not initialize if script already exists", () => {
    const mockExistingScript = { tagName: 'script' };
    vi.mocked(document.querySelector).mockReturnValue(mockExistingScript as any);
    
    const mockUI = createMockUI({
      auth: {
        currentUser: null,
      } as unknown as Auth,
    });
    
    const options = {
      clientId: "test-client-id",
    };
    
    const behavior = oneTapSignIn(options);
    behavior.oneTapSignIn(mockUI);
    
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("should return early in SSR mode", () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const mockUI = createMockUI();
    const options = {
      clientId: "test-client-id",
    };
    
    const behavior = oneTapSignIn(options);
    behavior.oneTapSignIn(mockUI);
    
    expect(document.createElement).not.toHaveBeenCalled();
    
    // Restore window
    global.window = originalWindow;
  });

  it("should work with hasBehavior and getBehavior", () => {
    const mockScript = {
      setAttribute: vi.fn(),
      src: '',
      async: false,
      onload: null as (() => void) | null,
    };
    
    vi.mocked(document.createElement).mockReturnValue(mockScript as any);
    vi.mocked(document.querySelector).mockReturnValue(null);
    
    const mockUI = createMockUI({
      auth: {
        currentUser: null,
      } as unknown as Auth,
      behaviors: {
        oneTapSignIn: oneTapSignIn({ clientId: "test-client-id" }).oneTapSignIn,
      },
    });

    expect(hasBehavior(mockUI, "oneTapSignIn")).toBe(true);
    
    const behavior = getBehavior(mockUI, "oneTapSignIn");
    behavior(mockUI);

    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockScript);
  });

  it("should throw error when trying to get non-existent oneTapSignIn behavior", () => {
    const mockUI = createMockUI();
    
    expect(hasBehavior(mockUI, "oneTapSignIn")).toBe(false);
    expect(() => getBehavior(mockUI, "oneTapSignIn")).toThrow("Behavior oneTapSignIn not found");
  });
});



