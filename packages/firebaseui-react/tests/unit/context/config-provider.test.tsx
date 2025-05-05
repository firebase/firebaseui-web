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

import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/react";
import { FirebaseUIProvider, FirebaseUIContext } from "../../../src/context";
import { map } from "nanostores";
import { useContext } from "react";
import { FirebaseUI, FirebaseUIConfiguration } from "@firebase-ui/core";

// Mock component to test context value
function TestConsumer() {
  const config = useContext(FirebaseUIContext);
  return <div data-testid="test-value">{config.locale || "no-value"}</div>;
}

describe("ConfigProvider", () => {
  it("provides the config value to children", () => {
    // Create a mock config store with the correct FUIConfig properties
    const mockConfig = map<Pick<FirebaseUIConfiguration, 'locale'>>({
      locale: "en-US",
    }) as FirebaseUI;

    const { getByTestId } = render(
      <FirebaseUIProvider ui={mockConfig}>
        <TestConsumer />
      </FirebaseUIProvider>
    );

    expect(getByTestId("test-value").textContent).toBe("en-US");
  });

  it("updates when the config store changes", () => {
    // Create a mock config store
    const mockConfig = map<Pick<FirebaseUIConfiguration, 'locale'>>({
      locale: "en-US",
    }) as FirebaseUI;

    const { getByTestId } = render(
      <FirebaseUIProvider ui={mockConfig}>
        <TestConsumer />
      </FirebaseUIProvider>
    );

    expect(getByTestId("test-value").textContent).toBe("en-US");

    // Update the config store inside act()
    act(() => {
      mockConfig.setKey("locale", "fr-FR");
    });

    // Check that the context value was updated
    expect(getByTestId("test-value").textContent).toBe("fr-FR");
  });
});
