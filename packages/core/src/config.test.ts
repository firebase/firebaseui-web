import { FirebaseApp } from "firebase/app";
import { Auth, MultiFactorResolver } from "firebase/auth";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { initializeUI } from "./config";
import { enUs, registerLocale } from "@firebase-oss/ui-translations";
import { autoUpgradeAnonymousUsers, autoAnonymousLogin } from "./behaviors";

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInAnonymously: vi.fn(),
  linkWithCredential: vi.fn(),
  linkWithRedirect: vi.fn(),
  RecaptchaVerifier: vi.fn(),
}));

describe("initializeUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a valid deep store with default values", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui).toBeDefined();
    expect(ui.get()).toBeDefined();
    expect(ui.get().app).toBe(config.app);
    expect(ui.get().auth).toBe(config.auth);
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    expect(ui.get().behaviors.recaptchaVerification).toHaveProperty("type", "callable");
    expect(ui.get().state).toEqual("idle");
    expect(ui.get().locale).toEqual(enUs);
  });

  it("should merge behaviors with defaultBehaviors", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      behaviors: [autoUpgradeAnonymousUsers()],
    };

    const ui = initializeUI(config);
    expect(ui).toBeDefined();
    expect(ui.get()).toBeDefined();

    // Default behaviors
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    expect(ui.get().behaviors.recaptchaVerification).toHaveProperty("type", "callable");
    expect(ui.get().behaviors.recaptchaVerification).toHaveProperty("handler");

    // Custom behaviors
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousProvider");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousUserRedirectHandler");
  });

  it("should set state and update state when called", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().state).toEqual("idle");
    ui.get().setState("loading");
    expect(ui.get().state).toEqual("loading");
    ui.get().setState("idle");
    expect(ui.get().state).toEqual("idle");
  });

  it("should set state and update locale when called", () => {
    const testLocale1 = registerLocale("test1", {});
    const testLocale2 = registerLocale("test2", {});

    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().locale.locale).toEqual("en-US");
    ui.get().setLocale(testLocale1);
    expect(ui.get().locale.locale).toEqual("test1");
    ui.get().setLocale(testLocale2);
    expect(ui.get().locale.locale).toEqual("test2");
  });

  it("should include defaultBehaviors even when no custom behaviors are provided", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    expect(ui.get().behaviors.recaptchaVerification).toHaveProperty("type", "callable");
  });

  it("should allow overriding default behaviors", () => {
    const customRecaptchaVerification = {
      recaptchaVerification: {
        type: "callable" as const,
        handler: vi.fn(() => {
          // Custom implementation
          return {} as any;
        }),
      },
    };

    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      behaviors: [customRecaptchaVerification],
    };

    const ui = initializeUI(config);
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    expect(ui.get().behaviors.recaptchaVerification).toHaveProperty("type", "callable");
  });

  it("should merge multiple behavior objects correctly", () => {
    const behavior1 = autoUpgradeAnonymousUsers();
    const behavior2 = {
      recaptchaVerification: {
        type: "callable" as const,
        handler: vi.fn(() => {
          // Custom recaptcha implementation
          return {} as any;
        }),
      },
    };

    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      behaviors: [behavior1, behavior2],
    };

    const ui = initializeUI(config);

    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    expect(ui.get().behaviors.recaptchaVerification).toHaveProperty("type", "callable");

    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousProvider");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousUserRedirectHandler");
  });

  it("should handle init behaviors correctly", () => {
    const mockAuth = {
      authStateReady: vi.fn().mockResolvedValue(undefined),
      currentUser: null,
    } as any;

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
      behaviors: [autoAnonymousLogin()],
    };

    const ui = initializeUI(config);

    expect(ui.get().behaviors).toHaveProperty("autoAnonymousLogin");
  });

  it("should handle redirect behaviors correctly", () => {
    const mockAuth = {
      currentUser: null,
    } as any;

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
      behaviors: [autoUpgradeAnonymousUsers()],
    };

    const ui = initializeUI(config);

    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousUserRedirectHandler");
  });

  it("should handle mixed behavior types", () => {
    const mockAuth = {
      authStateReady: vi.fn().mockResolvedValue(undefined),
      currentUser: null,
    } as any;

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
      behaviors: [autoAnonymousLogin(), autoUpgradeAnonymousUsers()],
    };

    const ui = initializeUI(config);

    expect(ui.get().behaviors).toHaveProperty("autoAnonymousLogin");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousProvider");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousUserRedirectHandler");

    // Default..
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
  });

  it("should execute init behaviors when window is defined", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
      configurable: true,
    });

    const mockAuth = {
      authStateReady: vi.fn().mockResolvedValue(undefined),
      currentUser: null,
    } as any;

    const mockInitHandler = vi.fn().mockResolvedValue(undefined);

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
      behaviors: [
        {
          customInit: {
            type: "init" as const,
            handler: mockInitHandler,
          },
        },
      ],
    };

    const ui = initializeUI(config);

    // Process next tick to make sure the noop promises are resolved
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAuth.authStateReady).toHaveBeenCalledTimes(1);
    expect(mockInitHandler).toHaveBeenCalledTimes(1);
    expect(mockInitHandler).toHaveBeenCalledWith(ui.get());

    delete (global as any).window;
  });

  it("should execute redirect behaviors when window is defined", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
      configurable: true,
    });

    const mockAuth = {
      currentUser: null,
    } as any;

    const mockRedirectHandler = vi.fn().mockResolvedValue(undefined);
    const mockRedirectResult = { user: { uid: "test-123" } };

    const { getRedirectResult } = await import("firebase/auth");
    vi.mocked(getRedirectResult).mockClear();
    vi.mocked(getRedirectResult).mockResolvedValue(mockRedirectResult as any);

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
      behaviors: [
        {
          customRedirect: {
            type: "redirect" as const,
            handler: mockRedirectHandler,
          },
        },
      ],
    };

    const ui = initializeUI(config);

    // Process next tick to make sure the noop promises are resolved
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getRedirectResult).toHaveBeenCalledTimes(1);
    expect(getRedirectResult).toHaveBeenCalledWith(mockAuth);
    expect(mockRedirectHandler).toHaveBeenCalledTimes(1);
    expect(mockRedirectHandler).toHaveBeenCalledWith(ui.get(), mockRedirectResult);

    delete (global as any).window;
  });

  it("should not execute behaviors when window is undefined", async () => {
    const mockAuth = {
      authStateReady: vi.fn().mockResolvedValue(undefined),
      currentUser: null,
    } as any;

    const { getRedirectResult } = await import("firebase/auth");
    vi.mocked(getRedirectResult).mockClear();

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
      behaviors: [
        {
          customInit: {
            type: "init" as const,
            handler: vi.fn(),
          },
          customRedirect: {
            type: "redirect" as const,
            handler: vi.fn(),
          },
        },
      ],
    };

    const ui = initializeUI(config);

    // Process next tick to make sure the noop promises are resolved
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAuth.authStateReady).not.toHaveBeenCalled();
    expect(getRedirectResult).not.toHaveBeenCalled();

    expect(ui.get().state).toBe("idle");
  });

  it("should have multiFactorResolver undefined by default", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().multiFactorResolver).toBeUndefined();
  });

  it("should set and get multiFactorResolver correctly", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    const mockMultiFactorResolver = {
      auth: {} as Auth,
      session: null,
      hints: [],
    } as unknown as MultiFactorResolver;

    expect(ui.get().multiFactorResolver).toBeUndefined();
    ui.get().setMultiFactorResolver(mockMultiFactorResolver);
    expect(ui.get().multiFactorResolver).toBe(mockMultiFactorResolver);
    ui.get().setMultiFactorResolver(undefined);
    expect(ui.get().multiFactorResolver).toBeUndefined();
  });

  it("should update multiFactorResolver multiple times", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    const mockResolver1 = {
      auth: {} as Auth,
      session: null,
      hints: [],
    } as unknown as MultiFactorResolver;

    const mockResolver2 = {
      auth: {} as Auth,
      session: null,
      hints: [],
    } as unknown as MultiFactorResolver;

    ui.get().setMultiFactorResolver(mockResolver1);
    expect(ui.get().multiFactorResolver).toBe(mockResolver1);
    ui.get().setMultiFactorResolver(mockResolver2);
    expect(ui.get().multiFactorResolver).toBe(mockResolver2);
    ui.get().setMultiFactorResolver(undefined);
    expect(ui.get().multiFactorResolver).toBeUndefined();
  });

  it("should have redirectError undefined by default", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().redirectError).toBeUndefined();
  });

  it("should set and get redirectError correctly", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    const mockError = new Error("Test redirect error");

    expect(ui.get().redirectError).toBeUndefined();
    ui.get().setRedirectError(mockError);
    expect(ui.get().redirectError).toBe(mockError);
    ui.get().setRedirectError(undefined);
    expect(ui.get().redirectError).toBeUndefined();
  });

  it("should update redirectError multiple times", () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    const mockError1 = new Error("First error");
    const mockError2 = new Error("Second error");

    ui.get().setRedirectError(mockError1);
    expect(ui.get().redirectError).toBe(mockError1);
    ui.get().setRedirectError(mockError2);
    expect(ui.get().redirectError).toBe(mockError2);
    ui.get().setRedirectError(undefined);
    expect(ui.get().redirectError).toBeUndefined();
  });

  it("should handle redirect error when getRedirectResult throws", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
      configurable: true,
    });

    const mockAuth = {
      currentUser: null,
    } as any;

    const mockError = new Error("Redirect failed");
    const { getRedirectResult } = await import("firebase/auth");
    vi.mocked(getRedirectResult).mockClear();
    vi.mocked(getRedirectResult).mockRejectedValue(mockError);

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
    };

    const ui = initializeUI(config);

    // Process next tick to make sure the promise is resolved
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getRedirectResult).toHaveBeenCalledTimes(1);
    expect(getRedirectResult).toHaveBeenCalledWith(mockAuth);
    expect(ui.get().redirectError).toBe(mockError);

    delete (global as any).window;
  });

  it("should convert non-Error objects to Error instances in redirect catch", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
      configurable: true,
    });

    const mockAuth = {
      currentUser: null,
    } as any;

    const { getRedirectResult } = await import("firebase/auth");
    vi.mocked(getRedirectResult).mockClear();
    vi.mocked(getRedirectResult).mockRejectedValue("String error");

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
    };

    const ui = initializeUI(config);

    // Process next tick to make sure the promise is resolved
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getRedirectResult).toHaveBeenCalledTimes(1);
    expect(ui.get().redirectError).toBeInstanceOf(Error);
    expect(ui.get().redirectError?.message).toBe("String error");

    delete (global as any).window;
  });
});
