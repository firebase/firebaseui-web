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
import { renderHook, act } from "@testing-library/react";
import { useUI } from "./hooks";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";

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
