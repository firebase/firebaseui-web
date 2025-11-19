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
import { render, screen, cleanup, act } from "@testing-library/react";
import { PhoneAuthScreen } from "~/auth/screens/phone-auth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import { MultiFactorResolver, type User } from "firebase/auth";

vi.mock("~/auth/forms/phone-auth-form", () => ({
  PhoneAuthForm: ({ resendDelay }: { resendDelay?: number }) => (
    <div data-testid="phone-auth-form" data-resend-delay={resendDelay}>
      Phone Auth Form
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
      <button data-testid="mfa-on-success" onClick={() => onSuccess?.({ user: { uid: "phone-mfa-user" } })}>
        Trigger MFA Success
      </button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("<PhoneAuthScreen />", () => {
  afterEach(() => {
    vi.clearAllMocks();
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
        <PhoneAuthScreen />
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("signIn");
    expect(title).toBeDefined();
    expect(title.className).toContain("fui-card__title");

    const subtitle = screen.getByText("signInToAccount");
    expect(subtitle).toBeDefined();
    expect(subtitle.className).toContain("fui-card__subtitle");
  });

  it("renders the <PhoneAuthForm /> component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <PhoneAuthScreen />
      </CreateFirebaseUIProvider>
    );

    // Mocked so only has as test id
    expect(screen.getByTestId("phone-auth-form")).toBeDefined();
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
        <PhoneAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </PhoneAuthScreen>
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
        <PhoneAuthScreen />
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
        <PhoneAuthScreen>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </PhoneAuthScreen>
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
        <PhoneAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
    expect(screen.queryByTestId("phone-auth-form")).toBeNull();
  });

  it("does not render PhoneAuthForm when MFA resolver exists", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <PhoneAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("phone-auth-form")).toBeNull();
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
        <PhoneAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </PhoneAuthScreen>
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
        <PhoneAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </PhoneAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("redirect-error")).toBeNull();
    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
  });

  it("calls onSignIn with credential when MFA flow succeeds", () => {
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

    const onSignIn = vi.fn();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <PhoneAuthScreen onSignIn={onSignIn} />
      </CreateFirebaseUIProvider>
    );

    // Simulate the MFA flow success - this would trigger auth state change
    const mockUser = {
      uid: "phone-mfa-user",
      isAnonymous: false,
    } as User;

    act(() => {
      authStateChangeCallback!(mockUser);
    });

    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledWith(mockUser);
  });

  it("calls onSignIn when user authenticates via useOnUserAuthenticated hook", () => {
    const onSignIn = vi.fn();
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
        <PhoneAuthScreen onSignIn={onSignIn} />
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

    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledWith(mockUser);
  });

  it("does not call onSignIn for anonymous users", () => {
    const onSignIn = vi.fn();
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
        <PhoneAuthScreen onSignIn={onSignIn} />
      </CreateFirebaseUIProvider>
    );

    const mockAnonymousUser = {
      uid: "anonymous-user-id",
      isAnonymous: true,
    } as User;

    act(() => {
      authStateChangeCallback!(mockAnonymousUser);
    });

    expect(onSignIn).not.toHaveBeenCalled();
  });
});
