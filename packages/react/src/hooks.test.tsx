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
import { useUI, useSignInAuthFormSchema } from "./hooks";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUI", () => {
  it("returns the config from context", () => {
    const mockUI = createMockUI();

    const { result } = renderHook(() => useUI(), { 
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI })
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
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui })
    });

    // Initial state should be "idle"
    expect(result.current.state).toBeDefined();

    // Change the state using setState
    act(() => {
      result.current.setState("pending");
    });

    // The hook should return the updated state
    expect(result.current.state).toBe("pending");

    // Change it again
    act(() => {
      result.current.setState("loading");
    });

    // The hook should return the new state
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
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui })
    });

    expect(hookCallCount).toBe(1);
    expect(results).toHaveLength(1);

    // Re-render without changing nanostore
    rerender();
    
    // Hook should be called again, but nanostores should provide stable reference
    expect(hookCallCount).toBe(2);
    expect(results).toHaveLength(2);
    
    // The returned values should be the same (nanostores handles this)
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
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI })
    });

    const schema = result.current;
    
    // Test invalid email validation - should use default English message
    const emailResult = schema.safeParse({ email: "invalid-email", password: "validpassword123" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0].message).toBe("Please enter a valid email address");
    }
    
    // Test weak password validation - should use default English message
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
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI })
    });

    const schema = result.current;
    
    // Test invalid email validation with custom message
    const emailResult = schema.safeParse({ email: "invalid-email", password: "validpassword123" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0].message).toBe("Por favor ingresa un email válido");
    }
    
    // Test weak password validation with custom message
    const passwordResult = schema.safeParse({ email: "test@example.com", password: "123" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0].message).toBe("La contraseña debe tener al menos 8 caracteres");
    }
  });


  it("returns stable reference when UI hasn't changed", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useSignInAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI })
    });

    const initialSchema = result.current;

    // Re-render without changing UI
    rerender();
    
    // The returned schema should be the same reference due to useMemo
    expect(result.current).toBe(initialSchema);
  });

  it("returns new schema when locale changes", () => {
    const mockUI = createMockUI();

    const { result, rerender } = renderHook(() => useSignInAuthFormSchema(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI })
    });

    const initialSchema = result.current;

    // Change the locale
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

    // Re-render after locale change
    rerender();
    
    // The returned schema should be a different reference due to locale change
    expect(result.current).not.toBe(initialSchema);
    
    // The new schema should have the custom error messages
    const emailResult = result.current.safeParse({ email: "invalid-email", password: "validpassword123" });
    expect(emailResult.success).toBe(false);
    
    if (!emailResult.success) {
      expect(emailResult.error.issues[0].message).toBe("Custom email error");
    }
  });

});
