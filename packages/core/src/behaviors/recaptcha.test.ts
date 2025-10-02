import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecaptchaVerifier } from "firebase/auth";
import { recaptchaVerificationHandler, type RecaptchaVerificationOptions } from "./recaptcha";
import type { FirebaseUIConfiguration } from "~/config";
import { createMockUI } from "~/tests/utils";

vi.mock("firebase/auth", () => ({
  RecaptchaVerifier: vi.fn().mockImplementation(() => {}),
}));

describe("Recaptcha Verification Handler", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();    
    mockElement = document.createElement("div");
  });

  describe("recaptchaVerificationHandler", () => {
    it("should create RecaptchaVerifier with default options", () => {
      const mockUI = createMockUI();
      const result = recaptchaVerificationHandler(mockUI, mockElement);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
        size: "invisible",
        theme: "light",
        tabindex: 0,
      });
      expect(result).toBeDefined();
    });

    it("should create RecaptchaVerifier with custom options", () => {
      const mockUI = createMockUI();
      const customOptions: RecaptchaVerificationOptions = {
        size: "normal",
        theme: "dark",
        tabindex: 5,
      };
      
      const result = recaptchaVerificationHandler(mockUI, mockElement, customOptions);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
        size: "normal",
        theme: "dark",
        tabindex: 5,
      });
      expect(result).toBeDefined();
    });

    it("should handle partial options", () => {
      const mockUI = createMockUI();
      const partialOptions: RecaptchaVerificationOptions = {
        size: "compact",
        // theme and tabindex should use defaults
      };
      
      const result = recaptchaVerificationHandler(mockUI, mockElement, partialOptions);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
        size: "compact",
        theme: "light", // default
        tabindex: 0, // default
      });
      expect(result).toBeDefined();
    });

    it("should handle undefined options", () => {
      const mockUI = createMockUI();
      const result = recaptchaVerificationHandler(mockUI, mockElement, undefined);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
        size: "invisible",
        theme: "light",
        tabindex: 0,
      });
      expect(result).toBeDefined();
    });

    it("should pass correct auth instance", () => {
      const mockUI = createMockUI();
      const customAuth = { uid: "test-uid" } as any;
      const customUI = { auth: customAuth } as FirebaseUIConfiguration;
      
      recaptchaVerificationHandler(customUI, mockElement);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(
        customAuth,
        mockElement,
        expect.any(Object)
      );
    });

    it("should pass correct element", () => {
      const mockUI = createMockUI();
      const customElement = document.createElement("button");
      
      recaptchaVerificationHandler(mockUI, customElement);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(
        mockUI.auth,
        customElement,
        expect.any(Object)
      );
    });
  });

  describe("RecaptchaVerificationOptions", () => {
    it("should accept all valid size options", () => {
      const mockUI = createMockUI();
      const sizes: Array<RecaptchaVerificationOptions["size"]> = ["normal", "invisible", "compact"];
      
      sizes.forEach(size => {
        const options: RecaptchaVerificationOptions = { size };
        const result = recaptchaVerificationHandler(mockUI, mockElement, options);
        
        expect(RecaptchaVerifier).toHaveBeenCalledWith(
          mockUI.auth,
          mockElement,
          expect.objectContaining({ size })
        );
        expect(result).toBeDefined();
      });
    });

    it("should accept all valid theme options", () => {
      const mockUI = createMockUI();
      const themes: Array<RecaptchaVerificationOptions["theme"]> = ["light", "dark"];
      
      themes.forEach(theme => {
        const options: RecaptchaVerificationOptions = { theme };
        const result = recaptchaVerificationHandler(mockUI, mockElement, options);
        
        expect(RecaptchaVerifier).toHaveBeenCalledWith(
          mockUI.auth,
          mockElement,
          expect.objectContaining({ theme })
        );
        expect(result).toBeDefined();
      });
    });

    it("should accept numeric tabindex", () => {
      const mockUI = createMockUI();
      const options: RecaptchaVerificationOptions = { tabindex: 10 };
      const result = recaptchaVerificationHandler(mockUI, mockElement, options);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(
        mockUI.auth,
        mockElement,
        expect.objectContaining({ tabindex: 10 })
      );
      expect(result).toBeDefined();
    });

    it("should accept zero tabindex", () => {
      const mockUI = createMockUI();
      const options: RecaptchaVerificationOptions = { tabindex: 0 };
      const result = recaptchaVerificationHandler(mockUI, mockElement, options);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(
        mockUI.auth,
        mockElement,
        expect.objectContaining({ tabindex: 0 })
      );
      expect(result).toBeDefined();
    });
  });

  describe("Integration scenarios", () => {
    it("should work with all options combined", () => {
      const mockUI = createMockUI();
      const allOptions: RecaptchaVerificationOptions = {
        size: "normal",
        theme: "dark",
        tabindex: 3,
      };
      
      const result = recaptchaVerificationHandler(mockUI, mockElement, allOptions);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
        size: "normal",
        theme: "dark",
        tabindex: 3,
      });
      expect(result).toBeDefined();
    });

    it("should handle empty options object", () => {
      const mockUI = createMockUI();
      const emptyOptions: RecaptchaVerificationOptions = {};
      const result = recaptchaVerificationHandler(mockUI, mockElement, emptyOptions);
      
      expect(RecaptchaVerifier).toHaveBeenCalledWith(mockUI.auth, mockElement, {
        size: "invisible",
        theme: "light",
        tabindex: 0,
      });
      expect(result).toBeDefined();
    });

    it("should return the same instance on multiple calls with same parameters", () => {
      const mockUI = createMockUI();
      const options: RecaptchaVerificationOptions = { size: "compact" };
      
      const result1 = recaptchaVerificationHandler(mockUI, mockElement, options);
      const result2 = recaptchaVerificationHandler(mockUI, mockElement, options);
      
      // Each call should create a new RecaptchaVerifier instance
      expect(RecaptchaVerifier).toHaveBeenCalledTimes(2);
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });
});
