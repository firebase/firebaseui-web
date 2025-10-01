/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";
import { FirebaseUIProvider, FirebaseUIContext } from "./context";
import { createMockUI } from "~/tests/utils";
import { useContext } from "react";

// Mock component to test context value
function TestConsumer() {
  const config = useContext(FirebaseUIContext);
  return <div data-testid="test-value">{config.state || "no-value"}</div>;
}

// Mock component to test policy context
function PolicyTestConsumer() {
  const config = useContext(FirebaseUIContext);
  return <div data-testid="policy-test">{config.state || "no-policy"}</div>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("FirebaseUIProvider", () => {
  it("provides the config value to children", () => {
    const mockUI = createMockUI();

    const { getByTestId } = render(
      <FirebaseUIProvider ui={mockUI}>
        <TestConsumer />
      </FirebaseUIProvider>
    );

    expect(getByTestId("test-value").textContent).toBe("idle");
  });

  it("updates when the nanostore changes", () => {
    const mockUI = createMockUI();

    const { getByTestId } = render(
      <FirebaseUIProvider ui={mockUI}>
        <TestConsumer />
      </FirebaseUIProvider>
    );

    expect(getByTestId("test-value").textContent).toBe("idle");

    // Update the nanostore directly
    act(() => {
      mockUI.setKey("state", "pending");
    });

    // Check that the context value was updated
    expect(getByTestId("test-value").textContent).toBe("pending");
  });

  it("provides stable references when nanostore value hasn't changed", () => {
    const mockUI = createMockUI();
    let providerRenderCount = 0;
    const contextValues: any[] = [];

    const TestConsumer = () => {
      const contextValue = useContext(FirebaseUIContext);
      contextValues.push(contextValue);
      return <div data-testid="context-value">{contextValue.state}</div>;
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => {
      providerRenderCount++;
      return <FirebaseUIProvider ui={mockUI}>{children}</FirebaseUIProvider>;
    };

    const { rerender } = render(
      <TestProvider>
        <TestConsumer />
      </TestProvider>
    );

    // Initial render
    expect(providerRenderCount).toBe(1);
    expect(contextValues).toHaveLength(1);

    // Re-render the provider without changing nanostore
    rerender(
      <TestProvider>
        <TestConsumer />
      </TestProvider>
    );
    
    // Provider should render again, but nanostores should provide stable reference
    expect(providerRenderCount).toBe(2);
    expect(contextValues).toHaveLength(2);
    
    // The context values should be the same reference (nanostores handles this)
    expect(contextValues[0]).toBe(contextValues[1]);
    expect(contextValues[0].state).toBe(contextValues[1].state);
  });

  it("passes policies to PolicyProvider", () => {
    const mockUI = createMockUI();
    const mockPolicies = {
      privacyPolicyUrl: "https://example.com/privacy",
      termsOfServiceUrl: "https://example.com/terms"
    };

    const { getByTestId } = render(
      <FirebaseUIProvider ui={mockUI} policies={mockPolicies}>
        <PolicyTestConsumer />
      </FirebaseUIProvider>
    );

    // The component should render successfully with policies
    expect(getByTestId("policy-test").textContent).toBe("idle");
  });

  it("works without policies", () => {
    const mockUI = createMockUI();

    const { getByTestId } = render(
      <FirebaseUIProvider ui={mockUI}>
        <TestConsumer />
      </FirebaseUIProvider>
    );

    expect(getByTestId("test-value").textContent).toBe("idle");
  });

  it("handles multiple state changes correctly", () => {
    const mockUI = createMockUI();

    const { getByTestId } = render(
      <FirebaseUIProvider ui={mockUI}>
        <TestConsumer />
      </FirebaseUIProvider>
    );

    expect(getByTestId("test-value").textContent).toBe("idle");

    act(() => {
      mockUI.setKey("state", "pending");
    });
    expect(getByTestId("test-value").textContent).toBe("pending");

    act(() => {
      mockUI.setKey("state", "loading");
    });
    expect(getByTestId("test-value").textContent).toBe("loading");

    act(() => {
      mockUI.setKey("state", "idle");
    });
    expect(getByTestId("test-value").textContent).toBe("idle");
  });
});