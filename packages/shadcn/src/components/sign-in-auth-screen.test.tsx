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
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SignInAuthScreen } from "./sign-in-auth-screen";
import { createMockUI } from "../../tests/utils";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";
import { registerLocale } from "@invertase/firebaseui-translations";
import { MultiFactorResolver } from "firebase/auth";

vi.mock("./sign-in-auth-form", () => ({
  SignInAuthForm: ({ onSignIn, onForgotPasswordClick, onRegisterClick }: any) => (
    <div data-testid="sign-in-auth-form">
      <div>SignInAuthForm</div>
      {onSignIn && <div data-testid="onSignIn-prop">onSignIn provided</div>}
      {onForgotPasswordClick && <div data-testid="onForgotPasswordClick-prop">onForgotPasswordClick provided</div>}
      {onRegisterClick && <div data-testid="onRegisterClick-prop">onRegisterClick provided</div>}
    </div>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: ({ children }: { children: React.ReactNode }) => <div data-testid="separator">{children}</div>,
}));

vi.mock("./multi-factor-auth-assertion-screen", () => ({
  MultiFactorAuthAssertionScreen: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div data-testid="multi-factor-auth-assertion-screen">
      <button data-testid="mfa-on-success" onClick={() => onSuccess?.({ user: { uid: "mfa-user" } })}>
        MFA Success
      </button>
    </div>
  ),
}));

describe("<SignInAuthScreen />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the screen with title and subtitle correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          signIn: "Sign In",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
      }),
    });

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();

    expect(screen.getByTestId("card-title")).toHaveTextContent("Sign In");
    expect(screen.getByTestId("card-description")).toHaveTextContent("Sign in to your account");
  });

  it("should render the SignInAuthForm within the card content", () => {
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("sign-in-auth-form")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toContainElement(screen.getByTestId("sign-in-auth-form"));
  });

  it("should not render separator and children section when no children provided", () => {
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.queryByTestId("separator")).not.toBeInTheDocument();
    expect(screen.queryByText("dividerOr")).not.toBeInTheDocument();
  });

  it("should render children with separator when children are provided", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        messages: {
          dividerOr: "or",
        },
      }),
    });

    const TestChild = () => <div data-testid="test-child">Test Child Component</div>;

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen>
          <TestChild />
        </SignInAuthScreen>
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("separator")).toBeInTheDocument();

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByTestId("test-child")).toHaveTextContent("Test Child Component");
  });

  it("should forward props to SignInAuthForm", () => {
    const mockUI = createMockUI();
    const onForgotPasswordClickMock = vi.fn();
    const onRegisterClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen onForgotPasswordClick={onForgotPasswordClickMock} onRegisterClick={onRegisterClickMock} />
      </FirebaseUIProvider>
    );

    const form = screen.getByTestId("sign-in-auth-form");
    expect(form).toBeInTheDocument();
  });

  it("should render multiple children correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        messages: {
          dividerOr: "or",
        },
      }),
    });

    const TestChild1 = () => <div data-testid="test-child-1">Child 1</div>;
    const TestChild2 = () => <div data-testid="test-child-2">Child 2</div>;

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen>
          <TestChild1 />
          <TestChild2 />
        </SignInAuthScreen>
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("separator")).toBeInTheDocument();

    expect(screen.getByTestId("test-child-1")).toBeInTheDocument();
    expect(screen.getByTestId("test-child-2")).toBeInTheDocument();
    expect(screen.getByTestId("test-child-1")).toHaveTextContent("Child 1");
    expect(screen.getByTestId("test-child-2")).toHaveTextContent("Child 2");
  });

  it("should handle empty children array", () => {
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen>{[]}</SignInAuthScreen>
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("should not render separator when children is null", () => {
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.queryByTestId("separator")).not.toBeInTheDocument();
  });

  it("should use default translations when custom locale is not provided", () => {
    const mockUI = createMockUI();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignInAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("card-title")).toBeInTheDocument();
    expect(screen.getByTestId("card-description")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-auth-form")).toBeInTheDocument();
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
      <FirebaseUIProvider ui={ui}>
        <SignInAuthScreen />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
    expect(screen.queryByTestId("sign-in-auth-form")).toBeNull();
  });

  it("calls onSignIn with credential when MFA flow succeeds", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSignIn = vi.fn();

    render(
      <FirebaseUIProvider ui={ui}>
        <SignInAuthScreen onSignIn={onSignIn} />
      </FirebaseUIProvider>
    );

    fireEvent.click(screen.getByTestId("mfa-on-success"));

    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "mfa-user" }) })
    );
  });
});
