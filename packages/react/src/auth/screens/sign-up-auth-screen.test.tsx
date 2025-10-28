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

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SignUpAuthScreen } from "~/auth/screens/sign-up-auth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";

vi.mock("~/auth/forms/sign-up-auth-form", () => ({
  SignUpAuthForm: ({ onBackToSignInClick }: { onBackToSignInClick?: () => void }) => (
    <div data-testid="sign-up-auth-form">
      <button data-testid="back-to-sign-in-button" onClick={onBackToSignInClick}>
        Back to Sign In
      </button>
    </div>
  ),
}));

vi.mock("~/components/divider", async (originalModule) => {
  const module = await originalModule();
  return {
    ...(module as object),
    Divider: ({ children }: { children: React.ReactNode }) => <div data-testid="divider">{children}</div>,
  };
});

describe("<SignUpAuthScreen />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with correct title and subtitle", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          register: "register",
        },
        prompts: {
          enterDetailsToCreate: "enterDetailsToCreate",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen />
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("register");
    expect(title).toBeDefined();
    expect(title.className).toContain("fui-card__title");

    const subtitle = screen.getByText("enterDetailsToCreate");
    expect(subtitle).toBeDefined();
    expect(subtitle.className).toContain("fui-card__subtitle");
  });

  it("renders the <SignUpAuthForm /> component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen />
      </CreateFirebaseUIProvider>
    );

    // Mocked so only has as test id
    expect(screen.getByTestId("sign-up-auth-form")).toBeDefined();
  });

  it("passes onBackToSignInClick to SignUpAuthForm", () => {
    const mockOnBackToSignInClick = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen onBackToSignInClick={mockOnBackToSignInClick} />
      </CreateFirebaseUIProvider>
    );

    const backButton = screen.getByTestId("back-to-sign-in-button");
    fireEvent.click(backButton);

    expect(mockOnBackToSignInClick).toHaveBeenCalledTimes(1);
  });

  it("renders a divider with children when present", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        messages: {
          dividerOr: "dividerOr",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </SignUpAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("divider")).toBeDefined();
    expect(screen.getByText("dividerOr")).toBeDefined();
    expect(screen.getByTestId("test-child")).toBeDefined();
  });

  it("does not render divider and children when no children are provided", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("divider")).toBeNull();
  });

  it("renders multiple children when provided", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        messages: {
          dividerOr: "dividerOr",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </SignUpAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("divider")).toBeDefined();
    expect(screen.getByTestId("child-1")).toBeDefined();
    expect(screen.getByTestId("child-2")).toBeDefined();
  });
});
