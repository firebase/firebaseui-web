import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setAuthOverrideModule, getAuthImp, type AuthOverrides } from "./auth";
import { createMockUI } from "~/tests/utils";

// Mock firebase/auth module
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
}));

// Import the mocked functions after the mock
import { signInWithEmailAndPassword } from "firebase/auth";

describe("Auth Implementation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clear any overrides that might have been set
    vi.clearAllMocks();
  });

  describe("setAuthOverrideModule", () => {
    it("should store override module for a UI instance", () => {
      const mockUI = createMockUI();
      const overrideModule = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: vi.fn(),
      });

      setAuthOverrideModule(mockUI, overrideModule);

      // The function should not throw and should store the module
      expect(() => setAuthOverrideModule(mockUI, overrideModule)).not.toThrow();
    });

    it("should allow different UI instances to have different override modules", () => {
      const ui1 = createMockUI();
      const ui2 = createMockUI();
      
      const override1 = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: vi.fn().mockResolvedValue("result1"),
      });
      
      const override2 = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: vi.fn().mockResolvedValue("result2"),
      });

      setAuthOverrideModule(ui1, override1);
      setAuthOverrideModule(ui2, override2);

      // Both should be stored independently
      expect(() => setAuthOverrideModule(ui1, override1)).not.toThrow();
      expect(() => setAuthOverrideModule(ui2, override2)).not.toThrow();
    });
  });

  describe("getAuthImp", () => {
    it("should return a proxy object", () => {
      const mockUI = createMockUI();
      const authImp = getAuthImp(mockUI);
      
      expect(authImp).toBeDefined();
      expect(typeof authImp).toBe("object");
    });

    it("should resolve to firebase/auth functions when no override is set", async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockResolvedValue({ providerId: "password" } as any);

      const mockUI = createMockUI();
      const authImp = getAuthImp(mockUI);
      const result = await authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password");

      expect(mockSignIn).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
      expect(result.providerId).toBe("password");
    });

    it("should use override functions when override module is set", async () => {
      const mockOverrideFunction = vi.fn().mockResolvedValue({ providerId: "override" });
      const overrideModule = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: mockOverrideFunction,
      });

      const mockUI = createMockUI();
      setAuthOverrideModule(mockUI, overrideModule);

      const authImp = getAuthImp(mockUI);
      const result = await authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password");

      expect(overrideModule).toHaveBeenCalled();
      expect(mockOverrideFunction).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
      expect(result.providerId).toBe("override");
    });

    it("should fall back to firebase/auth when override function is not provided", async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockResolvedValue({ providerId: "fallback" } as any);

      // Set override module but don't include the specific function
      const overrideModule = vi.fn().mockResolvedValue({
        createUserWithEmailAndPassword: vi.fn(), // Different function
      });

      const mockUI = createMockUI();
      setAuthOverrideModule(mockUI, overrideModule);

      const authImp = getAuthImp(mockUI);
      const result = await authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password");

      expect(overrideModule).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
      expect(result.providerId).toBe("fallback");
    });

    it("should handle all auth override functions", async () => {
      const mockSignIn = vi.fn().mockResolvedValue("signInResult");
      const mockCreateUser = vi.fn().mockResolvedValue("createUserResult");
      const mockIsSignInWithEmailLink = vi.fn().mockResolvedValue("isSignInResult");

      const overrideModule = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: mockSignIn,
        createUserWithEmailAndPassword: mockCreateUser,
        isSignInWithEmailLink: mockIsSignInWithEmailLink,
      });

      const mockUI = createMockUI();
      setAuthOverrideModule(mockUI, overrideModule);

      const authImp = getAuthImp(mockUI);

      // Test all functions
      await authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password");
      await authImp.createUserWithEmailAndPassword(mockUI.auth, "test@example.com", "password");
      await authImp.isSignInWithEmailLink(mockUI.auth, "https://example.com");

      expect(mockSignIn).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
      expect(mockCreateUser).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
      expect(mockIsSignInWithEmailLink).toHaveBeenCalledWith(mockUI.auth, "https://example.com");
    });

    it("should throw error when firebase/auth function is not available", async () => {
      const mockUI = createMockUI();
      
      // Create a mock that doesn't have the function
      const originalMock = vi.mocked(signInWithEmailAndPassword);
      vi.mocked(signInWithEmailAndPassword).mockImplementation(() => {
        throw new Error("Function not available");
      });

      const authImp = getAuthImp(mockUI);

      await expect(
        authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password")
      ).rejects.toThrow("Function not available");
      
      // Restore the original mock
      vi.mocked(signInWithEmailAndPassword).mockImplementation(originalMock);
    });

    it("should handle override module that returns undefined", async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockResolvedValue({ providerId: "fallback" } as any);

      const mockUI = createMockUI();
      const overrideModule = vi.fn().mockResolvedValue(undefined);

      setAuthOverrideModule(mockUI, overrideModule);

      const authImp = getAuthImp(mockUI);
      const result = await authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password");

      expect(overrideModule).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
      expect(result.providerId).toBe("fallback");
    });

    it("should handle override module that throws an error", async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockResolvedValue({ providerId: "fallback" } as any);

      const mockUI = createMockUI();
      const overrideModule = vi.fn().mockRejectedValue(new Error("Override module error"));

      setAuthOverrideModule(mockUI, overrideModule);

      const authImp = getAuthImp(mockUI);

      await expect(
        authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password")
      ).rejects.toThrow("Override module error");
    });

    it("should handle override function that throws an error", async () => {
      const mockOverrideFunction = vi.fn().mockRejectedValue(new Error("Override function error"));
      const overrideModule = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: mockOverrideFunction,
      });

      const mockUI = createMockUI();
      setAuthOverrideModule(mockUI, overrideModule);

      const authImp = getAuthImp(mockUI);

      await expect(
        authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password")
      ).rejects.toThrow("Override function error");
    });

    it("should pass through all arguments to override functions", async () => {
      const mockOverrideFunction = vi.fn().mockResolvedValue("result");
      const overrideModule = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: mockOverrideFunction,
      });

      const mockUI = createMockUI();
      setAuthOverrideModule(mockUI, overrideModule);

      const authImp = getAuthImp(mockUI);
      await authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password");

      expect(mockOverrideFunction).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
    });

    it("should pass through all arguments to firebase/auth functions", async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockResolvedValue({ providerId: "password" } as any);

      const mockUI = createMockUI();
      const authImp = getAuthImp(mockUI);
      await authImp.signInWithEmailAndPassword(mockUI.auth, "test@example.com", "password");

      expect(mockSignIn).toHaveBeenCalledWith(mockUI.auth, "test@example.com", "password");
    });

    it("should maintain separate override modules for different UI instances", async () => {
      const ui1 = createMockUI();
      const ui2 = createMockUI();

      const mockOverride1 = vi.fn().mockResolvedValue("result1");
      const mockOverride2 = vi.fn().mockResolvedValue("result2");

      const overrideModule1 = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: mockOverride1,
      });

      const overrideModule2 = vi.fn().mockResolvedValue({
        signInWithEmailAndPassword: mockOverride2,
      });

      setAuthOverrideModule(ui1, overrideModule1);
      setAuthOverrideModule(ui2, overrideModule2);

      const authImp1 = getAuthImp(ui1);
      const authImp2 = getAuthImp(ui2);

      await authImp1.signInWithEmailAndPassword(ui1.auth, "test@example.com", "password");
      await authImp2.signInWithEmailAndPassword(ui2.auth, "test@example.com", "password");

      expect(mockOverride1).toHaveBeenCalledWith(ui1.auth, "test@example.com", "password");
      expect(mockOverride2).toHaveBeenCalledWith(ui2.auth, "test@example.com", "password");
      expect(mockOverride1).toHaveBeenCalledTimes(1);
      expect(mockOverride2).toHaveBeenCalledTimes(1);
    });
  });

  describe("Type Safety", () => {
    it("should maintain correct types for AuthOverrides", () => {
      const overrides: Partial<AuthOverrides> = {
        signInWithEmailAndPassword: vi.fn(),
        createUserWithEmailAndPassword: vi.fn(),
        isSignInWithEmailLink: vi.fn(),
      };

      expect(overrides).toBeDefined();
      expect(typeof overrides.signInWithEmailAndPassword).toBe("function");
      expect(typeof overrides.createUserWithEmailAndPassword).toBe("function");
      expect(typeof overrides.isSignInWithEmailLink).toBe("function");
    });

    it("should maintain correct types for AuthImp", () => {
      const mockUI = createMockUI();
      const authImp = getAuthImp(mockUI);

      expect(authImp).toBeDefined();
      expect(typeof authImp.signInWithEmailAndPassword).toBe("function");
      expect(typeof authImp.createUserWithEmailAndPassword).toBe("function");
      expect(typeof authImp.isSignInWithEmailLink).toBe("function");
    });
  });
});
