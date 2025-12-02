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

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RedirectError } from "@/components/redirect-error";
import { CreateFirebaseUIProvider, createMockUI } from "../../tests/utils";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("<RedirectError />", () => {
  it("renders error message when redirectError is present in UI state", () => {
    const errorMessage = "Authentication failed";
    const ui = createMockUI();
    ui.get().setRedirectError(new Error(errorMessage));

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <RedirectError />
      </CreateFirebaseUIProvider>
    );

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeDefined();
    expect(errorElement.className).toContain("text-destructive");
  });

  it("returns null when no redirectError exists", () => {
    const ui = createMockUI();

    const { container } = render(
      <CreateFirebaseUIProvider ui={ui}>
        <RedirectError />
      </CreateFirebaseUIProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("properly formats error messages for Error objects", () => {
    const errorMessage = "Network error occurred";
    const ui = createMockUI();
    ui.get().setRedirectError(new Error(errorMessage));

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <RedirectError />
      </CreateFirebaseUIProvider>
    );

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeDefined();
    expect(errorElement.className).toContain("text-destructive");
  });

  it("properly formats error messages for string values", () => {
    const errorMessage = "Custom error string";
    const ui = createMockUI();
    ui.get().setRedirectError(errorMessage as any);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <RedirectError />
      </CreateFirebaseUIProvider>
    );

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeDefined();
    expect(errorElement.className).toContain("text-destructive");
  });

  it("displays error with correct CSS class", () => {
    const errorMessage = "Test error";
    const ui = createMockUI();
    ui.get().setRedirectError(new Error(errorMessage));

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <RedirectError />
      </CreateFirebaseUIProvider>
    );

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement.className).toBe("text-sm text-destructive");
  });

  it("handles undefined redirectError", () => {
    const ui = createMockUI();
    ui.get().setRedirectError(undefined);

    const { container } = render(
      <CreateFirebaseUIProvider ui={ui}>
        <RedirectError />
      </CreateFirebaseUIProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
