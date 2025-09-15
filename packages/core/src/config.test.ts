import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initializeUI } from "./config";
import { enUs, registerLocale } from "@firebase-ui/translations";
import { autoAnonymousLogin, autoUpgradeAnonymousUsers } from "./behaviors";

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
    expect(ui.get().behaviors).toEqual({});
    expect(ui.get().state).toEqual("idle");
    expect(ui.get().locale).toEqual(enUs);
  });

  it('should merge behaviors', () => {
    const config = {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      behaviors: [autoUpgradeAnonymousUsers()],
    };

    const ui = initializeUI(config);
    expect(ui).toBeDefined();
    expect(ui.get()).toBeDefined();
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
});

