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
import { SignInAuthScreen } from "~/auth/screens/sign-in-auth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { MultiFactorResolver } from "firebase/auth";

vi.mock("~/auth/forms/sign-in-auth-form", () => ({
  SignInAuthForm: ({
    onForgotPasswordClick,
    onRegisterClick,
  }: {
    onForgotPasswordClick?: () => void;
    onRegisterClick?: () => void;
  }) => (
    <div data-testid="sign-in-auth-form">
      <button data-testid="forgot-password-button" onClick={onForgotPasswordClick}>
        Forgot Password
      </button>
      <button data-testid="register-button" onClick={onRegisterClick}>
        Register
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

vi.mock("~/components/redirect-error", () => ({
  RedirectError: () => <div data-testid="redirect-error">Redirect Error</div>,
}));

vi.mock("~/auth/forms/multi-factor-auth-assertion-form", () => ({
  MultiFactorAuthAssertionForm: () => <div data-testid="mfa-assertion-form">MFA Assertion Form</div>,
}));

describe("<SignInAuthScreen />", () => {
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
          signIn: "signIn",
        },
        prompts: {
          signInToAccount: "signInToAccount",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen />
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("signIn");
    expect(title).toBeDefined();
    expect(title.className).toContain("fui-card__title");

    const subtitle = screen.getByText("signInToAccount");
    expect(subtitle).toBeDefined();
    expect(subtitle.className).toContain("fui-card__subtitle");
  });

  it("renders the <SignInAuthForm /> component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen />
      </CreateFirebaseUIProvider>
    );

    // Mocked so only has as test id
    expect(screen.getByTestId("sign-in-auth-form")).toBeDefined();
  });

  it("passes onForgotPasswordClick to SignInAuthForm", () => {
    const mockOnForgotPasswordClick = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen onForgotPasswordClick={mockOnForgotPasswordClick} />
      </CreateFirebaseUIProvider>
    );

    const forgotPasswordButton = screen.getByTestId("forgot-password-button");
    fireEvent.click(forgotPasswordButton);

    expect(mockOnForgotPasswordClick).toHaveBeenCalledTimes(1);
  });

  it("passes onRegisterClick to SignInAuthForm", () => {
    const mockOnRegisterClick = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen onRegisterClick={mockOnRegisterClick} />
      </CreateFirebaseUIProvider>
    );

    const registerButton = screen.getByTestId("register-button");
    fireEvent.click(registerButton);

    expect(mockOnRegisterClick).toHaveBeenCalledTimes(1);
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
        <SignInAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </SignInAuthScreen>
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
        <SignInAuthScreen />
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
        <SignInAuthScreen>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </SignInAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("divider")).toBeDefined();
    expect(screen.getByTestId("child-1")).toBeDefined();
    expect(screen.getByTestId("child-2")).toBeDefined();
  });

  it("renders MultiFactorAuthAssertionForm when multiFactorResolver is present", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
    expect(screen.queryByTestId("sign-in-auth-form")).toBeNull();
  });

  it("does not render SignInAuthForm when MFA resolver exists", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("sign-in-auth-form")).toBeNull();
    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
  });

  it("renders RedirectError component in children section when no MFA resolver", () => {
    const ui = createMockUI({
      locale: registerLocale("test", {
        messages: {
          dividerOr: "dividerOr",
        },
      }),
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </SignInAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("redirect-error")).toBeDefined();
    expect(screen.getByTestId("test-child")).toBeDefined();
  });

  it("does not render RedirectError when MFA resolver is present", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignInAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </SignInAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("redirect-error")).toBeNull();
    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
  });
});
