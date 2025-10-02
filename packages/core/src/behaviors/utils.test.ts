import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  callableBehavior, 
  redirectBehavior, 
  initBehavior,
  type CallableBehavior,
  type RedirectBehavior,
  type InitBehavior,
  type CallableHandler,
  type RedirectHandler,
  type InitHandler
} from "./utils";
import type { UserCredential } from "firebase/auth";
import type { FirebaseUIConfiguration } from "~/config";

describe("Behaviors Utils", () => {
  describe("callableBehavior", () => {
    it("should return a callable behavior with correct type", () => {
      const handler = vi.fn();
      const behavior = callableBehavior(handler);
      
      expect(behavior).toEqual({
        type: "callable",
        handler
      });
      expect(behavior.type).toBe("callable");
      expect(behavior.handler).toBe(handler);
    });

    it("should preserve handler function type", () => {
      const handler: CallableHandler = vi.fn();
      const behavior = callableBehavior(handler);
      
      expect(behavior.handler).toBe(handler);
    });

    it("should work with different handler signatures", () => {
      const handler1 = vi.fn((arg1: string) => arg1);
      const handler2 = vi.fn((arg1: number, arg2: boolean) => ({ arg1, arg2 }));
      
      const behavior1 = callableBehavior(handler1);
      const behavior2 = callableBehavior(handler2);
      
      expect(behavior1.type).toBe("callable");
      expect(behavior2.type).toBe("callable");
      expect(behavior1.handler).toBe(handler1);
      expect(behavior2.handler).toBe(handler2);
    });
  });

  describe("redirectBehavior", () => {
    it("should return a redirect behavior with correct type", () => {
      const handler = vi.fn();
      const behavior = redirectBehavior(handler);
      
      expect(behavior).toEqual({
        type: "redirect",
        handler
      });
      expect(behavior.type).toBe("redirect");
      expect(behavior.handler).toBe(handler);
    });

    it("should preserve handler function type", () => {
      const handler: RedirectHandler = vi.fn();
      const behavior = redirectBehavior(handler);
      
      expect(behavior.handler).toBe(handler);
    });

    it("should work with async handlers", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const behavior = redirectBehavior(handler);
      
      expect(behavior.type).toBe("redirect");
      expect(behavior.handler).toBe(handler);
      
      const mockUI = {} as FirebaseUIConfiguration;
      const mockResult = {} as UserCredential;
      
      await behavior.handler(mockUI, mockResult);
      expect(handler).toHaveBeenCalledWith(mockUI, mockResult);
    });
  });

  describe("initBehavior", () => {
    it("should return an init behavior with correct type", () => {
      const handler = vi.fn();
      const behavior = initBehavior(handler);
      
      expect(behavior).toEqual({
        type: "init",
        handler
      });
      expect(behavior.type).toBe("init");
      expect(behavior.handler).toBe(handler);
    });

    it("should preserve handler function type", () => {
      const handler: InitHandler = vi.fn();
      const behavior = initBehavior(handler);
      
      expect(behavior.handler).toBe(handler);
    });

    it("should work with async handlers", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const behavior = initBehavior(handler);
      
      expect(behavior.type).toBe("init");
      expect(behavior.handler).toBe(handler);
      
      const mockUI = {} as FirebaseUIConfiguration;
      
      await behavior.handler(mockUI);
      expect(handler).toHaveBeenCalledWith(mockUI);
    });

    it("should work with sync handlers", () => {
      const handler = vi.fn();
      const behavior = initBehavior(handler);
      
      expect(behavior.type).toBe("init");
      expect(behavior.handler).toBe(handler);
      
      const mockUI = {} as FirebaseUIConfiguration;
      
      behavior.handler(mockUI);
      expect(handler).toHaveBeenCalledWith(mockUI);
    });
  });

  describe("Behavior Types", () => {
    it("should have correct type structure for CallableBehavior", () => {
      const handler = vi.fn();
      const behavior: CallableBehavior = callableBehavior(handler);
      
      expect(behavior).toHaveProperty("type", "callable");
      expect(behavior).toHaveProperty("handler");
      expect(typeof behavior.handler).toBe("function");
    });

    it("should have correct type structure for RedirectBehavior", () => {
      const handler = vi.fn();
      const behavior: RedirectBehavior = redirectBehavior(handler);
      
      expect(behavior).toHaveProperty("type", "redirect");
      expect(behavior).toHaveProperty("handler");
      expect(typeof behavior.handler).toBe("function");
    });

    it("should have correct type structure for InitBehavior", () => {
      const handler = vi.fn();
      const behavior: InitBehavior = initBehavior(handler);
      
      expect(behavior).toHaveProperty("type", "init");
      expect(behavior).toHaveProperty("handler");
      expect(typeof behavior.handler).toBe("function");
    });
  });

  describe("Handler Type Compatibility", () => {
    it("should accept handlers with correct signatures", () => {
      const callableHandler: CallableHandler = vi.fn();
      expect(() => callableBehavior(callableHandler)).not.toThrow();
      
      const redirectHandler: RedirectHandler = vi.fn();
      expect(() => redirectBehavior(redirectHandler)).not.toThrow();
      
      const initHandler: InitHandler = vi.fn();
      expect(() => initBehavior(initHandler)).not.toThrow();
    });
  });
});