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
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { SignUpAuthScreen } from "~/auth/screens/sign-up-auth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import { MultiFactorResolver, type User } from "firebase/auth";

vi.mock("~/auth/forms/sign-up-auth-form", () => ({
  SignUpAuthForm: ({ onSignInClick }: { onSignInClick?: () => void }) => (
    <div data-testid="sign-up-auth-form">
      <button data-testid="back-to-sign-in-button" onClick={onSignInClick}>
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

vi.mock("~/components/redirect-error", () => ({
  RedirectError: () => <div data-testid="redirect-error">Redirect Error</div>,
}));

vi.mock("~/auth/screens/multi-factor-auth-assertion-screen", () => ({
  MultiFactorAuthAssertionScreen: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div data-testid="multi-factor-auth-assertion-screen">
      <button data-testid="mfa-on-success" onClick={() => onSuccess?.({ user: { uid: "signup-mfa-user" } })}>
        Trigger MFA Success
      </button>
    </div>
  ),
}));

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
          signUp: "register",
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

    expect(screen.getByTestId("sign-up-auth-form")).toBeDefined();
  });

  it("passes onSignInClick to SignUpAuthForm", () => {
    const mockOnSignInClick = vi.fn();
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen onSignInClick={mockOnSignInClick} />
      </CreateFirebaseUIProvider>
    );

    const backButton = screen.getByTestId("back-to-sign-in-button");
    fireEvent.click(backButton);

    expect(mockOnSignInClick).toHaveBeenCalledTimes(1);
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

  it("renders MultiFactorAuthAssertionScreen when multiFactorResolver is present", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
    expect(screen.queryByTestId("sign-up-auth-form")).toBeNull();
  });

  it("does not render SignUpAuthForm when MFA resolver exists", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("sign-up-auth-form")).toBeNull();
    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
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
        <SignUpAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </SignUpAuthScreen>
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
        <SignUpAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </SignUpAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("redirect-error")).toBeNull();
    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
  });

  it("calls onSignUp with credential when MFA flow succeeds", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    let authStateChangeCallback: ((user: User | null) => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        return vi.fn();
      }),
    };

    const ui = createMockUI({
      auth: mockAuth as any,
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSignUp = vi.fn();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen onSignUp={onSignUp} />
      </CreateFirebaseUIProvider>
    );

    const mockUser = {
      uid: "signup-mfa-user",
      isAnonymous: false,
    } as User;

    act(() => {
      authStateChangeCallback!(mockUser);
    });

    expect(onSignUp).toHaveBeenCalledTimes(1);
    expect(onSignUp).toHaveBeenCalledWith(mockUser);
  });

  it("calls onSignUp when user authenticates via useOnUserAuthenticated hook", () => {
    const onSignUp = vi.fn();
    let authStateChangeCallback: ((user: User | null) => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        return vi.fn();
      }),
    };

    const ui = createMockUI({
      auth: mockAuth as any,
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen onSignUp={onSignUp} />
      </CreateFirebaseUIProvider>
    );

    expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(1);

    const mockUser = {
      uid: "test-user-id",
      isAnonymous: false,
    } as User;

    act(() => {
      authStateChangeCallback!(mockUser);
    });

    expect(onSignUp).toHaveBeenCalledTimes(1);
    expect(onSignUp).toHaveBeenCalledWith(mockUser);
  });

  it("does not call onSignUp for anonymous users", () => {
    const onSignUp = vi.fn();
    let authStateChangeCallback: ((user: User | null) => void) | null = null;

    const mockAuth = {
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        authStateChangeCallback = callback;
        return vi.fn();
      }),
    };

    const ui = createMockUI({
      auth: mockAuth as any,
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <SignUpAuthScreen onSignUp={onSignUp} />
      </CreateFirebaseUIProvider>
    );

    const mockAnonymousUser = {
      uid: "anonymous-user-id",
      isAnonymous: true,
    } as User;

    act(() => {
      authStateChangeCallback!(mockAnonymousUser);
    });

    expect(onSignUp).not.toHaveBeenCalled();
  });
});
