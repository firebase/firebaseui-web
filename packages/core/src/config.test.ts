import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { describe, it, expect } from "vitest";
import { initializeUI } from "./config";
import { enUs, registerLocale } from "@firebase-ui/translations";
import { autoUpgradeAnonymousUsers, defaultBehaviors } from "./behaviors";

describe('initializeUI', () => {
  it('should return a valid deep store with default values', () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
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
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      behaviors: [autoUpgradeAnonymousUsers()],
    };

    const ui = initializeUI(config);
    expect(ui).toBeDefined();
    expect(ui.get()).toBeDefined();
    
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousProvider");
  });

  it('should set state and update state when called', () => {
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

  it('should set state and update locale when called', () => {
    const testLocale1 = registerLocale('test1', {});
    const testLocale2 = registerLocale('test2', {});
    
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().locale.locale).toEqual('en-US');
    ui.get().setLocale(testLocale1);
    expect(ui.get().locale.locale).toEqual('test1');
    ui.get().setLocale(testLocale2);
    expect(ui.get().locale.locale).toEqual('test2');
  });

  it('should include defaultBehaviors even when no custom behaviors are provided', () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().behaviors).toEqual(defaultBehaviors);
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
  });

  it('should allow overriding default behaviors', () => {
    const customRecaptchaVerification = {
      recaptchaVerification: () => {
        return {} as any;
      }
    };

    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
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
        return {} as any;
      }
    };

    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      behaviors: [behavior1, behavior2],
    };

    const ui = initializeUI(config);
    
    expect(ui.get().behaviors).toHaveProperty("recaptchaVerification");
    
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousCredential");
    expect(ui.get().behaviors).toHaveProperty("autoUpgradeAnonymousProvider");
    
    // Should have custom recaptcha implementation
    expect(ui.get().behaviors.recaptchaVerification).toBe(behavior2.recaptchaVerification);
  });

  it('should initialize with undefined multiFactorResolver', () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    expect(ui.get().multiFactorResolver).toBeUndefined();
  });

  it('should set and get multiFactorResolver', () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    const mockResolver = {} as any;

    expect(ui.get().multiFactorResolver).toBeUndefined();

    ui.get().setMultiFactorResolver(mockResolver);
    expect(ui.get().multiFactorResolver).toBe(mockResolver);

    ui.get().setMultiFactorResolver(undefined);
    expect(ui.get().multiFactorResolver).toBeUndefined();
  });

  it('should allow setting different multiFactorResolver instances', () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    const mockResolver1 = { id: 'resolver1' } as any;
    const mockResolver2 = { id: 'resolver2' } as any;

    ui.get().setMultiFactorResolver(mockResolver1);
    expect(ui.get().multiFactorResolver).toBe(mockResolver1);
    expect(ui.get().multiFactorResolver).toEqual({ id: 'resolver1' });

    ui.get().setMultiFactorResolver(mockResolver2);
    expect(ui.get().multiFactorResolver).toBe(mockResolver2);
    expect(ui.get().multiFactorResolver).toEqual({ id: 'resolver2' });
  });

  it('should maintain multiFactorResolver state across multiple get calls', () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
    };

    const ui = initializeUI(config);
    const mockResolver = { session: 'test-session' } as any;

    ui.get().setMultiFactorResolver(mockResolver);

    expect(ui.get().multiFactorResolver).toBe(mockResolver);
    expect(ui.get().multiFactorResolver).toBe(mockResolver);
  });
});

