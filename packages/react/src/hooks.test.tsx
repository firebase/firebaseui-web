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
import {
  useUI,
  useRedirectError,
  useSignInAuthFormSchema,
  useSignUpAuthFormSchema,
  useForgotPasswordAuthFormSchema,
  useEmailLinkAuthFormSchema,
  usePhoneAuthNumberFormSchema,
  usePhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useOnUserAuthenticated,
} from "./hooks";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale, enUs } from "@firebase-oss/ui-translations";
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

  it("throws an error if no context is found", () => {
    expect(() => {
      renderHook(() => useUI());
    }).toThrow();
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

describe("useOnUserAuthenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("calls callback when a non-anonymous user is authenticated", () => {
    const mockCallback = vi.fn();
    let authStateChangeCallback: ((user: User | null) => void) | null = null;
    let unsubscribe: (() => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        unsubscribe = vi.fn();
        return unsubscribe;
      }),
    };

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    const mockUser = {
      uid: "test-user-id",
      isAnonymous: false,
    } as User;

    const { unmount } = renderHook(() => useOnUserAuthenticated(mockCallback), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(authStateChangeCallback).toBeDefined();

    act(() => {
      authStateChangeCallback!(mockUser);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(mockUser);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("does not call callback when user is anonymous", () => {
    const mockCallback = vi.fn();
    let authStateChangeCallback: ((user: User | null) => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        return vi.fn();
      }),
    };

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    const mockAnonymousUser = {
      uid: "anonymous-user-id",
      isAnonymous: true,
    } as User;

    renderHook(() => useOnUserAuthenticated(mockCallback), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      authStateChangeCallback!(mockAnonymousUser);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("does not call callback when user is null", () => {
    const mockCallback = vi.fn();
    let authStateChangeCallback: ((user: User | null) => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        return vi.fn();
      }),
    };

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    renderHook(() => useOnUserAuthenticated(mockCallback), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      authStateChangeCallback!(null);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("works without a callback", () => {
    let authStateChangeCallback: ((user: User | null) => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        return vi.fn();
      }),
    };

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    const mockUser = {
      uid: "test-user-id",
      isAnonymous: false,
    } as User;

    renderHook(() => useOnUserAuthenticated(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    act(() => {
      authStateChangeCallback!(mockUser);
    });

    expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes from auth state changes on unmount", () => {
    const mockCallback = vi.fn();
    let unsubscribe: (() => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn(() => {
        unsubscribe = vi.fn();
        return unsubscribe;
      }),
    };

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    const { unmount } = renderHook(() => useOnUserAuthenticated(mockCallback), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toBeDefined();

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("resubscribes when auth instance changes", () => {
    const mockCallback = vi.fn();
    const mockAuth1 = {
      onAuthStateChanged: vi.fn(() => vi.fn()),
    };
    const mockAuth2 = {
      onAuthStateChanged: vi.fn(() => vi.fn()),
    };

    const mockUI1 = createMockUI({
      auth: mockAuth1 as any,
    });
    const mockUI2 = createMockUI({
      auth: mockAuth2 as any,
    });

    const { rerender } = renderHook(() => useOnUserAuthenticated(mockCallback), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI1 }),
    });

    expect(mockAuth1.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(mockAuth2.onAuthStateChanged).not.toHaveBeenCalled();

    rerender();
    // Note: The hook depends on auth, but since we're using the same mockUI instance,
    // we need to create a new wrapper with a different UI
    const { rerender: rerender2 } = renderHook(() => useOnUserAuthenticated(mockCallback), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI2 }),
    });

    rerender2();

    // The effect should re-run when auth changes, but since we're using a new wrapper,
    // we need to check that the new auth instance's onAuthStateChanged is called
    expect(mockAuth2.onAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  it("resubscribes when callback changes", () => {
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();
    let authStateChangeCallback: ((user: User | null) => void) | null = null;
    const unsubscribeFunctions: (() => void)[] = [];

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        const unsubscribe = vi.fn();
        unsubscribeFunctions.push(unsubscribe);
        return unsubscribe;
      }),
    };

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    const mockUser = {
      uid: "test-user-id",
      isAnonymous: false,
    } as User;

    const { rerender } = renderHook(({ callback }) => useOnUserAuthenticated(callback), {
      initialProps: { callback: mockCallback1 },
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(unsubscribeFunctions).toHaveLength(1);

    act(() => {
      authStateChangeCallback!(mockUser);
    });

    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).not.toHaveBeenCalled();

    rerender({ callback: mockCallback2 });

    expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(2);
    expect(unsubscribeFunctions).toHaveLength(2);
    expect(unsubscribeFunctions[0]).toHaveBeenCalledTimes(1);

    act(() => {
      authStateChangeCallback!(mockUser);
    });

    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });
});
