import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { initializeUI } from "./config";
import { enUs, registerLocale } from "@firebase-ui/translations";
import { autoUpgradeAnonymousUsers, defaultBehaviors } from "./behaviors";

describe('initializeUI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call authStateReady when initializing UI', async () => {
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const mockAuth = {
      authStateReady: mockAuthStateReady,
    } as unknown as Auth;

    const config = {
      app: {} as FirebaseApp,
      auth: mockAuth,
    };

    const ui = initializeUI(config);
    
    // Wait for the authStateReady promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockAuthStateReady).toHaveBeenCalled();
    expect(ui).toBeDefined();
  });

  it('should return a valid deep store with default values', () => {
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const config = {
      app: {} as FirebaseApp,
      auth: {
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
    };

    const ui = initializeUI(config);
    expect(ui).toBeDefined();
    expect(ui.get()).toBeDefined();
    expect(ui.get().app).toBe(config.app);
    expect(ui.get().auth).toBe(config.auth);
    expect(ui.get().behaviors).toEqual(defaultBehaviors);
    expect(ui.get().state).toEqual("idle");
    expect(ui.get().locale).toEqual(enUs);
  });

  it('should merge behaviors with defaultBehaviors', () => {
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const config = {
      app: {} as FirebaseApp,
      auth: {
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
      behaviors: [autoUpgradeAnonymousUsers()],
    };

    const ui = initializeUI(config);
    expect(ui).toBeDefined();
    expect(ui.get()).toBeDefined();
    
    // Should have default behaviors
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    
    // Should have custom behaviors
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousProvider");
  });

  it('should set state and update state when called', () => {
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const config = {
      app: {} as FirebaseApp,
      auth: {
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().state).toEqual("idle");
    ui.get().setState("loading");
    expect(ui.get().state).toEqual("loading");
    ui.get().setState("idle");
    expect(ui.get().state).toEqual("idle");
  });

  it('should set state and update locale when called', () => {
    const testLocale1 = registerLocale('test1', {});
    const testLocale2 = registerLocale('test2', {});
    
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const config = {
      app: {} as FirebaseApp,
      auth: {
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().locale.locale).toEqual('en-US');
    ui.get().setLocale(testLocale1);
    expect(ui.get().locale.locale).toEqual('test1');
    ui.get().setLocale(testLocale2);
    expect(ui.get().locale.locale).toEqual('test2');
  });

  it('should include defaultBehaviors even when no custom behaviors are provided', () => {
    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const config = {
      app: {} as FirebaseApp,
      auth: {
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().behaviors).toEqual(defaultBehaviors);
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
  });

  it('should allow overriding default behaviors', () => {
    const customRecaptchaVerification = {
      recaptchaVerification: () => {
        // Custom implementation
        return {} as any;
      }
    };

    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const config = {
      app: {} as FirebaseApp,
      auth: {
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
      behaviors: [customRecaptchaVerification],
    };

    const ui = initializeUI(config);
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    expect(ui.get().behaviors.recaptchaVerification).toBe(customRecaptchaVerification.recaptchaVerification);
  });

  it('should merge multiple behavior objects correctly', () => {
    const behavior1 = autoUpgradeAnonymousUsers();
    const behavior2 = {
      recaptchaVerification: () => {
        // Custom recaptcha implementation
        return {} as any;
      }
    };

    const mockAuthStateReady = vi.fn().mockResolvedValue(undefined);
    const config = {
      app: {} as FirebaseApp,
      auth: {
        authStateReady: mockAuthStateReady,
      } as unknown as Auth,
      behaviors: [behavior1, behavior2],
    };

    const ui = initializeUI(config);
    
    // Should have default behaviors
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    
    // Should have autoUpgrade behaviors
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousProvider");
    
    // Should have custom recaptcha implementation
    expect(ui.get().behaviors.recaptchaVerification).toBe(behavior2.recaptchaVerification);
  });
});

