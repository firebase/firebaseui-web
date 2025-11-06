/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import {
  useUI,
  useRedirectError,
  useSignInAuthFormSchema,
  useSignUpAuthFormSchema,
  useForgotPasswordAuthFormSchema,
  useEmailLinkAuthFormSchema,
  useMultiFactorPhoneAuthAssertionFormSchema,
  usePhoneAuthNumberFormSchema,
  usePhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
} from "./hooks";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale, enUs } from "@invertase/firebaseui-translations";
import type { RecaptchaVerifier } from "firebase/auth";

// Mock RecaptchaVerifier from firebase/auth
const mockRender = vi.fn();
const mockVerifier = {
  render: mockRender,
} as unknown as RecaptchaVerifier;

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    RecaptchaVerifier: vi.fn().mockImplementation(() => mockVerifier),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockRender.mockClear();
});

describe("useUI", () => {
  it("returns the config from context", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useUI(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toEqual(mockUI.get());
  });

  // TODO(ehesp): This test is not working as expected.
  it.skip("throws an error if no context is found", () => {
    expect(() => {
      renderHook(() => useUI());
    }).toThrow("No FirebaseUI context found. Your application must be wrapped in a <FirebaseUIProvider> component.");
  });

  it("returns updated values when nanostore state changes via setState", () => {
    const ui = createMockUI();

    const { result } = renderHook(() => useUI(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui }),
    });

    expect(result.current.state).toBeDefined();

    act(() => {
      result.current.setState("pending");
    });

    expect(result.current.state).toBe("pending");

    act(() => {
      result.current.setState("loading");
    });

    expect(result.current.state).toBe("loading");
  });

  it("returns stable reference when nanostore value hasn't changed", () => {
    const ui = createMockUI();
    let hookCallCount = 0;
    const results: any[] = [];

    const TestHook = () => {
      hookCallCount++;
      const result = useUI();
      results.push(result);
      return result;
    };

    const { rerender } = renderHook(() => TestHook(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui }),
    });

    expect(hookCallCount).toBe(1);
    expect(results).toHaveLength(1);

    rerender();

    expect(hookCallCount).toBe(2);
    expect(results).toHaveLength(2);

    expect(results[0]).toBe(results[1]);
    expect(results[0].state).toBe(results[1].state);
  });
});

describe("useSignInAuthFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignInAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({ email: "invalid-email", password: "validpassword123" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe(enUs.translations.errors!.invalidEmail);
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0]!.message).toBe(enUs.translations.errors!.weakPassword);
    }
  });

  it("returns schema with custom error messages when locale changes", () => {
    const customTranslations = {
      errors: {
        invalidEmail: "Por favor ingresa un email válido",
        weakPassword: "La contraseña debe tener al menos 8 caracteres",
      },
    };

    const customLocale = registerLocale("es-ES", customTranslations);
    const mockUI = createMockUI({ locale: customLocale });

    const { result } = renderHook(() => useSignInAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({ email: "invalid-email", password: "validpassword123" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Por favor ingresa un email válido");
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0]!.message).toBe("La contraseña debe tener al menos 8 caracteres");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useSignInAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useSignInAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    const customTranslations = {
      errors: {
        invalidEmail: "Custom email error",
        weakPassword: "Custom password error",
      },
    };
    const customLocale = registerLocale("fr-FR", customTranslations);

    act(() => {
      mockUI.get().setLocale(customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const emailResult = result.current.safeParse({ email: "invalid-email", password: "validpassword123" });
    expect(emailResult.success).toBe(false);

    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Custom email error");
    }
  });
});

describe("useSignUpAuthFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useSignUpAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({
      email: "invalid-email",
      password: "validpassword123",
      confirmPassword: "validpassword123",
    });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe(enUs.translations.errors!.invalidEmail);
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123", confirmPassword: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0]!.message).toBe(enUs.translations.errors!.weakPassword);
    }
  });

  it("returns schema with custom error messages when locale changes", () => {
    const customTranslations = {
      errors: {
        invalidEmail: "Por favor ingresa un email válido",
        weakPassword: "La contraseña debe tener al menos 8 caracteres",
      },
    };

    const customLocale = registerLocale("es-ES", customTranslations);
    const mockUI = createMockUI({ locale: customLocale });

    const { result } = renderHook(() => useSignUpAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({
      email: "invalid-email",
      password: "validpassword123",
      confirmPassword: "validpassword123",
    });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Por favor ingresa un email válido");
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123", confirmPassword: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0]!.message).toBe("La contraseña debe tener al menos 8 caracteres");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useSignUpAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useSignUpAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    const customTranslations = {
      errors: {
        invalidEmail: "Custom email error",
        weakPassword: "Custom password error",
      },
    };
    const customLocale = registerLocale("fr-FR", customTranslations);

    act(() => {
      mockUI.get().setLocale(customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const emailResult = result.current.safeParse({
      email: "invalid-email",
      password: "validpassword123",
      confirmPassword: "validpassword123",
    });
    expect(emailResult.success).toBe(false);

    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Custom email error");
    }
  });
});

describe("useForgotPasswordAuthFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useForgotPasswordAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe(enUs.translations.errors!.invalidEmail);
    }
  });

  it("returns schema with custom error messages when locale changes", () => {
    const customTranslations = {
      errors: {
        invalidEmail: "Por favor ingresa un email válido",
      },
    };

    const customLocale = registerLocale("es-ES", customTranslations);
    const mockUI = createMockUI({ locale: customLocale });

    const { result } = renderHook(() => useForgotPasswordAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Por favor ingresa un email válido");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useForgotPasswordAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useForgotPasswordAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    const customTranslations = {
      errors: {
        invalidEmail: "Custom email error",
      },
    };
    const customLocale = registerLocale("fr-FR", customTranslations);

    act(() => {
      mockUI.get().setLocale(customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const emailResult = result.current.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);

    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Custom email error");
    }
  });
});

describe("useEmailLinkAuthFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useEmailLinkAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe(enUs.translations.errors!.invalidEmail);
    }
  });

  it("returns schema with custom error messages when locale changes", () => {
    const customTranslations = {
      errors: {
        invalidEmail: "Por favor ingresa un email válido",
      },
    };

    const customLocale = registerLocale("es-ES", customTranslations);
    const mockUI = createMockUI({ locale: customLocale });

    const { result } = renderHook(() => useEmailLinkAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const emailResult = schema.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Por favor ingresa un email válido");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useEmailLinkAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useEmailLinkAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    const customTranslations = {
      errors: {
        invalidEmail: "Custom email error",
      },
    };
    const customLocale = registerLocale("fr-FR", customTranslations);

    act(() => {
      mockUI.get().setLocale(customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const emailResult = result.current.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);

    if (!emailResult.success) {
      expect(emailResult.error.issues[0]!.message).toBe("Custom email error");
    }
  });
});

describe("usePhoneAuthNumberFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => usePhoneAuthNumberFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const phoneResult = schema.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);
    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0]!.message).toBe(enUs.translations.errors!.invalidPhoneNumber);
    }
  });

  it("returns schema with custom error messages when locale changes", () => {
    const customTranslations = {
      errors: {
        invalidPhoneNumber: "Por favor ingresa un número de teléfono válido",
      },
    };

    const customLocale = registerLocale("es-ES", customTranslations);
    const mockUI = createMockUI({ locale: customLocale });

    const { result } = renderHook(() => usePhoneAuthNumberFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const phoneResult = schema.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);
    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0]!.message).toBe("Por favor ingresa un número de teléfono válido");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => usePhoneAuthNumberFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => usePhoneAuthNumberFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    const customTranslations = {
      errors: {
        invalidPhoneNumber: "Custom phone error",
      },
    };
    const customLocale = registerLocale("fr-FR", customTranslations);

    act(() => {
      mockUI.get().setLocale(customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const phoneResult = result.current.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);

    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0]!.message).toBe("Custom phone error");
    }
  });
});

describe("usePhoneAuthVerifyFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => usePhoneAuthVerifyFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const verifyResult = schema.safeParse({ verificationId: "test-id", verificationCode: "123" });
    expect(verifyResult.success).toBe(false);
    if (!verifyResult.success) {
      expect(verifyResult.error.issues[0]!.message).toBe(enUs.translations.errors!.invalidVerificationCode);
    }
  });

  it("returns schema with custom error messages when locale changes", () => {
    const customTranslations = {
      errors: {
        invalidVerificationCode: "Por favor ingresa un código de verificación válido",
      },
    };

    const customLocale = registerLocale("es-ES", customTranslations);
    const mockUI = createMockUI({ locale: customLocale });

    const { result } = renderHook(() => usePhoneAuthVerifyFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const verifyResult = schema.safeParse({ verificationId: "test-id", verificationCode: "123" });
    expect(verifyResult.success).toBe(false);
    if (!verifyResult.success) {
      expect(verifyResult.error.issues[0]!.message).toBe("Por favor ingresa un código de verificación válido");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => usePhoneAuthVerifyFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => usePhoneAuthVerifyFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    const customTranslations = {
      errors: {
        invalidVerificationCode: "Custom verification error",
      },
    };
    const customLocale = registerLocale("fr-FR", customTranslations);

    act(() => {
      mockUI.get().setLocale(customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const verifyResult = result.current.safeParse({ verificationId: "test-id", verificationCode: "123" });
    expect(verifyResult.success).toBe(false);

    if (!verifyResult.success) {
      expect(verifyResult.error.issues[0]!.message).toBe("Custom verification error");
    }
  });
});

describe("useMultiFactorPhoneAuthAssertionFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useMultiFactorPhoneAuthAssertionFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const phoneResult = schema.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);
    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0]!.message).toBe(enUs.translations.errors!.invalidPhoneNumber);
    }
  });

  it("returns schema with custom error messages when locale changes", () => {
    const customTranslations = {
      errors: {
        invalidPhoneNumber: "Por favor ingresa un número de teléfono válido",
      },
    };

    const customLocale = registerLocale("es-ES", customTranslations);
    const mockUI = createMockUI({ locale: customLocale });

    const { result } = renderHook(() => useMultiFactorPhoneAuthAssertionFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const phoneResult = schema.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);
    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0]!.message).toBe("Por favor ingresa un número de teléfono válido");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useMultiFactorPhoneAuthAssertionFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useMultiFactorPhoneAuthAssertionFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    const customTranslations = {
      errors: {
        invalidPhoneNumber: "Custom phone error",
      },
    };
    const customLocale = registerLocale("fr-FR", customTranslations);

    act(() => {
      mockUI.get().setLocale(customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const phoneResult = result.current.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);

    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0]!.message).toBe("Custom phone error");
    }
  });

  it("accepts valid phone number without requiring displayName", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useMultiFactorPhoneAuthAssertionFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const phoneResult = schema.safeParse({ phoneNumber: "1234567890" });
    expect(phoneResult.success).toBe(true);
    if (phoneResult.success) {
      expect(phoneResult.data).toEqual({ phoneNumber: "1234567890" });
      // Should not have displayName field
      expect(phoneResult.data).not.toHaveProperty("displayName");
    }
  });
});

describe("useRedirectError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns undefined when no redirect error exists", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useRedirectError(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBeUndefined();
  });

  it("returns error message string when Error object is present", () => {
    const errorMessage = "Authentication failed";
    const mockUI = createMockUI();
    mockUI.get().setRedirectError(new Error(errorMessage));

    const { result } = renderHook(() => useRedirectError(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBe(errorMessage);
  });

  it("returns string value when error is not an Error object", () => {
    const errorMessage = "Custom error string";
    const mockUI = createMockUI();
    mockUI.get().setRedirectError(errorMessage as any);

    const { result } = renderHook(() => useRedirectError(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBe(errorMessage);
  });

  it("returns stable reference when error hasn't changed", () => {
    const mockUI = createMockUI();
    const error = new Error("Test error");
    mockUI.get().setRedirectError(error);

    let hookCallCount = 0;
    const results: any[] = [];

    const TestHook = () => {
      hookCallCount++;
      const result = useRedirectError();
      results.push(result);
      return result;
    };

    const { rerender } = renderHook(() => TestHook(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(hookCallCount).toBe(1);
    expect(results).toHaveLength(1);

    rerender();

    expect(hookCallCount).toBe(2);
    expect(results).toHaveLength(2);

    expect(results[0]).toBe(results[1]);
    expect(results[0]).toBe("Test error");
  });

  it("updates when redirectError changes in UI state", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useRedirectError(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBeUndefined();

    act(() => {
      mockUI.get().setRedirectError(new Error("First error"));
    });

    rerender();

    expect(result.current).toBe("First error");

    act(() => {
      mockUI.get().setRedirectError(new Error("Second error"));
    });

    rerender();

    expect(result.current).toBe("Second error");

    act(() => {
      mockUI.get().setRedirectError(undefined);
    });

    rerender();

    expect(result.current).toBeUndefined();
  });

  it("handles null and undefined errors", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useRedirectError(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBeUndefined();

    act(() => {
      mockUI.get().setRedirectError(null as any);
    });

    rerender();

    expect(result.current).toBeUndefined();

    act(() => {
      mockUI.get().setRedirectError(undefined);
    });

    rerender();

    expect(result.current).toBeUndefined();
  });
});

describe("useRecaptchaVerifier", () => {
  beforeEach(() => {
    cleanup();
  });

  it("creates verifier when element is available", async () => {
    const mockUI = createMockUI();
    const element = document.createElement("div");
    const ref = { current: element };

    const { result } = renderHook(() => useRecaptchaVerifier(ref), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await waitFor(() => {
      expect(result.current).toBe(mockVerifier);
    });

    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it("returns null when element is not available", () => {
    const mockUI = createMockUI();
    const ref = { current: null };

    const { result } = renderHook(() => useRecaptchaVerifier(ref), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(result.current).toBeNull();
    expect(mockRender).not.toHaveBeenCalled();
  });

  it("does not recreate verifier when ui changes", async () => {
    const mockUI = createMockUI();
    const element = document.createElement("div");
    const ref = { current: element };

    const { result, rerender } = renderHook(() => useRecaptchaVerifier(ref), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await waitFor(() => {
      expect(result.current).toBe(mockVerifier);
    });

    const firstVerifier = result.current;
    expect(mockRender).toHaveBeenCalledTimes(1);

    act(() => {
      mockUI.get().setState("pending");
    });

    rerender();

    expect(result.current).toBe(firstVerifier);
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it("recreates verifier when element changes", async () => {
    const mockUI = createMockUI();
    const element1 = document.createElement("div");
    const element2 = document.createElement("div");

    const { result, rerender } = renderHook((props) => useRecaptchaVerifier(props.ref), {
      initialProps: { ref: { current: element1 } },
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await waitFor(() => {
      expect(result.current).toBe(mockVerifier);
    });

    expect(mockRender).toHaveBeenCalledTimes(1);

    act(() => {
      rerender({ ref: { current: element2 } });
    });

    // Verifier should be recreated - wait for effect to run
    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledTimes(2);
    });

    expect(result.current).toBe(mockVerifier);
  });
});
