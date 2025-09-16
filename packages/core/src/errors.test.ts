import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebaseError } from "firebase/app";
import { AuthCredential } from "firebase/auth";
import { FirebaseUIError, handleFirebaseError } from "./errors";
import { createMockUI } from "~/tests/utils";
import { ERROR_CODE_MAP } from "@firebase-ui/translations";

// Mock the translations module
vi.mock("./translations", () => ({
  getTranslation: vi.fn(),
}));

import { getTranslation } from "./translations";

let mockSessionStorage: { [key: string]: string };

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock sessionStorage
  mockSessionStorage = {};
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      setItem: vi.fn((key: string, value: string) => {
        mockSessionStorage[key] = value;
      }),
      getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
      removeItem: vi.fn((key: string) => {
        delete mockSessionStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
      }),
    },
    writable: true,
  });
});

describe("FirebaseUIError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a FirebaseUIError with translated message", () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/user-not-found", "User not found");
    const expectedTranslation = "User not found (translated)";
    
    vi.mocked(getTranslation).mockReturnValue(expectedTranslation);

    const error = new FirebaseUIError(mockUI, mockFirebaseError);

    expect(error).toBeInstanceOf(FirebaseError);
    expect(error.code).toBe("auth/user-not-found");
    expect(error.message).toBe(expectedTranslation);
    expect(getTranslation).toHaveBeenCalledWith(
      mockUI,
      "errors",
      ERROR_CODE_MAP["auth/user-not-found"]
    );
  });

  it("should handle unknown error codes gracefully", () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/unknown-error", "Unknown error");
    const expectedTranslation = "Unknown error (translated)";
    
    vi.mocked(getTranslation).mockReturnValue(expectedTranslation);

    const error = new FirebaseUIError(mockUI, mockFirebaseError);

    expect(error.code).toBe("auth/unknown-error");
    expect(error.message).toBe(expectedTranslation);
    expect(getTranslation).toHaveBeenCalledWith(
      mockUI,
      "errors",
      ERROR_CODE_MAP["auth/unknown-error" as keyof typeof ERROR_CODE_MAP]
    );
  });
});

describe("handleFirebaseError", () => {
  it("should throw non-Firebase errors as-is", () => {
    const mockUI = createMockUI();
    const nonFirebaseError = new Error("Regular error");

    expect(() => handleFirebaseError(mockUI, nonFirebaseError)).toThrow("Regular error");
  });

  it("should throw non-Firebase errors with different types", () => {
    const mockUI = createMockUI();
    const stringError = "String error";
    const numberError = 42;
    const nullError = null;
    const undefinedError = undefined;

    expect(() => handleFirebaseError(mockUI, stringError)).toThrow("String error");
    expect(() => handleFirebaseError(mockUI, numberError)).toThrow();
    expect(() => handleFirebaseError(mockUI, nullError)).toThrow();
    expect(() => handleFirebaseError(mockUI, undefinedError)).toThrow();
  });

  it("should throw FirebaseUIError for Firebase errors", () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/user-not-found", "User not found");
    const expectedTranslation = "User not found (translated)";
    
    vi.mocked(getTranslation).mockReturnValue(expectedTranslation);

    expect(() => handleFirebaseError(mockUI, mockFirebaseError)).toThrow(FirebaseUIError);
    
    try {
      handleFirebaseError(mockUI, mockFirebaseError);
    } catch (error) {
      // Should be an instance of both FirebaseUIError and FirebaseError
      expect(error).toBeInstanceOf(FirebaseUIError);
      expect(error).toBeInstanceOf(FirebaseError);
      expect((error as FirebaseUIError).code).toBe("auth/user-not-found");
      expect((error as FirebaseUIError).message).toBe(expectedTranslation);
    }
  });

  it("should store credential in sessionStorage for account-exists-with-different-credential", () => {
    const mockUI = createMockUI();
    const mockCredential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com", token: "mock-token" })
    } as unknown as AuthCredential;
    
    const mockFirebaseError = {
      code: "auth/account-exists-with-different-credential",
      message: "Account exists with different credential",
      credential: mockCredential
    } as FirebaseError & { credential: AuthCredential };
    
    const expectedTranslation = "Account exists with different credential (translated)";
    vi.mocked(getTranslation).mockReturnValue(expectedTranslation);

    expect(() => handleFirebaseError(mockUI, mockFirebaseError)).toThrow(FirebaseUIError);
    
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      "pendingCred",
      JSON.stringify(mockCredential.toJSON())
    );
    expect(mockCredential.toJSON).toHaveBeenCalled();
  });

  it("should not store credential for other error types", () => {
    const mockUI = createMockUI();
    const mockFirebaseError = new FirebaseError("auth/user-not-found", "User not found");
    const expectedTranslation = "User not found (translated)";
    
    vi.mocked(getTranslation).mockReturnValue(expectedTranslation);

    expect(() => handleFirebaseError(mockUI, mockFirebaseError)).toThrow(FirebaseUIError);
    
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("should handle account-exists-with-different-credential without credential", () => {
    const mockUI = createMockUI();
    const mockFirebaseError = {
      code: "auth/account-exists-with-different-credential",
      message: "Account exists with different credential"
    } as FirebaseError;
    
    const expectedTranslation = "Account exists with different credential (translated)";
    vi.mocked(getTranslation).mockReturnValue(expectedTranslation);

    expect(() => handleFirebaseError(mockUI, mockFirebaseError)).toThrow(FirebaseUIError);
    
    // Should not try to store credential if it doesn't exist
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });
});

describe("isFirebaseError utility", () => {
  it("should identify FirebaseError objects", () => {
    const firebaseError = new FirebaseError("auth/user-not-found", "User not found");
    
    // We can't directly test the private function, but we can test it through handleFirebaseError
    const mockUI = createMockUI();
    vi.mocked(getTranslation).mockReturnValue("translated message");

    expect(() => handleFirebaseError(mockUI, firebaseError)).toThrow(FirebaseUIError);
  });

  it("should reject non-FirebaseError objects", () => {
    const mockUI = createMockUI();
    const nonFirebaseError = { code: "test", message: "test" }; // Missing proper structure
    
    expect(() => handleFirebaseError(mockUI, nonFirebaseError)).toThrow();
  });

  it("should reject objects without code and message", () => {
    const mockUI = createMockUI();
    const invalidObject = { someProperty: "value" };
    
    expect(() => handleFirebaseError(mockUI, invalidObject)).toThrow();
  });
});

describe("errorContainsCredential utility", () => {
  it("should identify FirebaseError with credential", () => {
    const mockUI = createMockUI();
    const mockCredential = {
      providerId: "google.com",
      toJSON: vi.fn().mockReturnValue({ providerId: "google.com" })
    } as unknown as AuthCredential;
    
    const firebaseErrorWithCredential = {
      code: "auth/account-exists-with-different-credential",
      message: "Account exists with different credential",
      credential: mockCredential
    } as FirebaseError & { credential: AuthCredential };
    
    vi.mocked(getTranslation).mockReturnValue("translated message");

    expect(() => handleFirebaseError(mockUI, firebaseErrorWithCredential)).toThrowError(FirebaseUIError);
    
    // Should have stored the credential
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      "pendingCred",
      JSON.stringify(mockCredential.toJSON())
    );
  });

  it("should handle FirebaseError without credential", () => {
    const mockUI = createMockUI();
    const firebaseErrorWithoutCredential = {
      code: "auth/account-exists-with-different-credential",
      message: "Account exists with different credential"
    } as FirebaseError;
    
    vi.mocked(getTranslation).mockReturnValue("translated message");

    expect(() => handleFirebaseError(mockUI, firebaseErrorWithoutCredential)).toThrowError(FirebaseUIError);
    
    // Should not have stored any credential
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });
});

