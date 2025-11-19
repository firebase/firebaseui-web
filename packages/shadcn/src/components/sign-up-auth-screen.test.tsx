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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { SignUpAuthScreen } from "./sign-up-auth-screen";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import { MultiFactorResolver, type User } from "firebase/auth";

vi.mock("./sign-up-auth-form", () => ({
  SignUpAuthForm: ({ onSignUp, onSignInClick }: any) => (
    <div data-testid="sign-up-auth-form">
      <div>SignUpAuthForm</div>
      {onSignUp && <div data-testid="onSignUp-prop">onSignUp provided</div>}
      {onSignInClick && <div data-testid="onSignInClick-prop">onSignInClick provided</div>}
    </div>
  ),
}));

vi.mock("@/components/multi-factor-auth-assertion-screen", () => ({
  MultiFactorAuthAssertionScreen: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div data-testid="multi-factor-auth-assertion-screen">
      <button data-testid="mfa-on-success" onClick={() => onSuccess?.({ user: { uid: "signup-mfa-user" } })}>
        MFA Success
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

  it("should render the screen correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signUp: "Register",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Enter your details to create an account")).toBeInTheDocument();
    expect(screen.getByTestId("sign-up-auth-form")).toBeInTheDocument();
  });

  it("should render with children", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signUp: "Register",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
        messages: {
          dividerOr: "or",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen>
          <div data-testid="child-component">Child Component</div>
        </SignUpAuthScreen>
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Enter your details to create an account")).toBeInTheDocument();
    expect(screen.getByTestId("sign-up-auth-form")).toBeInTheDocument();
    expect(screen.getByTestId("child-component")).toBeInTheDocument();
  });

  it("should pass props to SignUpAuthForm", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signUp: "Register",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
      }),
    });

    const onSignInClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen onSignInClick={onSignInClickMock} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("onSignInClick-prop")).toBeInTheDocument();
  });

  it("should not render separator when no children", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signUp: "Register",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
        messages: {
          dividerOr: "or",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Enter your details to create an account")).toBeInTheDocument();
    expect(screen.getByTestId("sign-up-auth-form")).toBeInTheDocument();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
  });

  it("should render MultiFactorAuthAssertionScreen when multiFactorResolver is present", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signUp: "Register",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
      }),
    });
    mockUI.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("sign-up-auth-form")).not.toBeInTheDocument();
  });

  it("should not render SignUpAuthForm when MFA resolver exists", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signUp: "Register",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
        messages: {
          dividerOr: "or",
        },
      }),
    });
    mockUI.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen>
          <div data-testid="child-component">Child Component</div>
        </SignUpAuthScreen>
      </FirebaseUIProvider>
    );

    expect(screen.queryByTestId("sign-up-auth-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeInTheDocument();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child-component")).not.toBeInTheDocument();
  });

  it("should render SignUpAuthForm when MFA resolver is not present", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signUp: "Register",
        },
        prompts: {
          enterDetailsToCreate: "Enter your details to create an account",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("sign-up-auth-form")).toBeInTheDocument();
    expect(screen.queryByTestId("multi-factor-auth-assertion-screen")).not.toBeInTheDocument();
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

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });
    mockUI.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSignUp = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen onSignUp={onSignUp} />
      </FirebaseUIProvider>
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

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen onSignUp={onSignUp} />
      </FirebaseUIProvider>
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

    const mockUI = createMockUI({
      auth: mockAuth as any,
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen onSignUp={onSignUp} />
      </FirebaseUIProvider>
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
