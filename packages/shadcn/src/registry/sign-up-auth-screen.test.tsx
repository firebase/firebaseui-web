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
import { render, screen, cleanup } from "@testing-library/react";
import { SignUpAuthScreen } from "./sign-up-auth-screen";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { FirebaseUIProvider } from "@invertase/firebaseui-react";

vi.mock("./sign-up-auth-form", () => ({
  SignUpAuthForm: ({ onSignUp, onBackToSignInClick }: any) => (
    <div data-testid="sign-up-auth-form">
      <div>SignUpAuthForm</div>
      {onSignUp && <div data-testid="onSignUp-prop">onSignUp provided</div>}
      {onBackToSignInClick && <div data-testid="onBackToSignInClick-prop">onBackToSignInClick provided</div>}
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
    expect(screen.getByText("or")).toBeInTheDocument();
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

    const onSignUpMock = vi.fn();
    const onBackToSignInClickMock = vi.fn();

    render(
      <FirebaseUIProvider ui={mockUI}>
        <SignUpAuthScreen onSignUp={onSignUpMock} onBackToSignInClick={onBackToSignInClickMock} />
      </FirebaseUIProvider>
    );

    expect(screen.getByTestId("onSignUp-prop")).toBeInTheDocument();
    expect(screen.getByTestId("onBackToSignInClick-prop")).toBeInTheDocument();
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
});
