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
import { renderHook, act, cleanup } from "@testing-library/react";
import {
  useUI,
  useSignInAuthFormSchema,
  useSignUpAuthFormSchema,
  useForgotPasswordAuthFormSchema,
  useEmailLinkAuthFormSchema,
  usePhoneAuthFormSchema,
} from "./hooks";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";

beforeEach(() => {
  vi.clearAllMocks();
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
      expect(emailResult.error.issues[0].message).toBe("Please enter a valid email address");
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0].message).toBe("Password should be at least 8 characters");
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
      expect(emailResult.error.issues[0].message).toBe("Por favor ingresa un email válido");
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0].message).toBe("La contraseña debe tener al menos 8 caracteres");
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
      mockUI.setKey("locale", customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const emailResult = result.current.safeParse({ email: "invalid-email", password: "validpassword123" });
    expect(emailResult.success).toBe(false);

    if (!emailResult.success) {
      expect(emailResult.error.issues[0].message).toBe("Custom email error");
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
      expect(emailResult.error.issues[0].message).toBe("Please enter a valid email address");
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123", confirmPassword: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0].message).toBe("Password should be at least 8 characters");
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
      expect(emailResult.error.issues[0].message).toBe("Por favor ingresa un email válido");
    }

    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123", confirmPassword: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0].message).toBe("La contraseña debe tener al menos 8 caracteres");
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
      mockUI.setKey("locale", customLocale);
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
      expect(emailResult.error.issues[0].message).toBe("Custom email error");
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
      expect(emailResult.error.issues[0].message).toBe("Please enter a valid email address");
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
      expect(emailResult.error.issues[0].message).toBe("Por favor ingresa un email válido");
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
      mockUI.setKey("locale", customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const emailResult = result.current.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);

    if (!emailResult.success) {
      expect(emailResult.error.issues[0].message).toBe("Custom email error");
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
      expect(emailResult.error.issues[0].message).toBe("Please enter a valid email address");
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
      expect(emailResult.error.issues[0].message).toBe("Por favor ingresa un email válido");
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
      mockUI.setKey("locale", customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const emailResult = result.current.safeParse({ email: "invalid-email" });
    expect(emailResult.success).toBe(false);

    if (!emailResult.success) {
      expect(emailResult.error.issues[0].message).toBe("Custom email error");
    }
  });
});

describe("usePhoneAuthFormSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns schema with default English error messages", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => usePhoneAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const phoneResult = schema.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);
    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0].message).toBe("Please enter a valid phone number");
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

    const { result } = renderHook(() => usePhoneAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const schema = result.current;

    const phoneResult = schema.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);
    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0].message).toBe("Por favor ingresa un número de teléfono válido");
    }
  });

  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => usePhoneAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    const initialSchema = result.current;

    rerender();

    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => usePhoneAuthFormSchema(), {
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
      mockUI.setKey("locale", customLocale);
    });

    rerender();

    expect(result.current).not.toBe(initialSchema);

    const phoneResult = result.current.safeParse({ phoneNumber: "invalid-phone" });
    expect(phoneResult.success).toBe(false);

    if (!phoneResult.success) {
      expect(phoneResult.error.issues[0].message).toBe("Custom phone error");
    }
  });
});
