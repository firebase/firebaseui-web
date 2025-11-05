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
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { OAuthScreen } from "@/components/oauth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { MultiFactorResolver } from "firebase/auth";

vi.mock("@/components/policies", () => ({
  Policies: () => <div data-testid="policies">Policies</div>,
}));

vi.mock("@/components/redirect-error", () => ({
  RedirectError: () => <div data-testid="redirect-error">Redirect Error</div>,
}));

vi.mock("@/components/multi-factor-auth-assertion-screen", () => ({
  MultiFactorAuthAssertionScreen: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div data-testid="multi-factor-auth-assertion-screen">
      <button data-testid="mfa-on-success" onClick={() => onSuccess?.({ user: { uid: "oauth-mfa-user" } })}>
        MFA Success
      </button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("<OAuthScreen />", () => {
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
        <OAuthScreen>OAuth Provider</OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("signIn");
    expect(title).toBeDefined();

    const subtitle = screen.getByText("signInToAccount");
    expect(subtitle).toBeDefined();
  });

  it("renders children", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthScreen>OAuth Provider</OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("OAuth Provider")).toBeDefined();
  });

  it("renders multiple children when provided", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthScreen>
          <div>Provider 1</div>
          <div>Provider 2</div>
        </OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Provider 1")).toBeDefined();
    expect(screen.getByText("Provider 2")).toBeDefined();
  });

  it("includes the Policies component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthScreen>OAuth Provider</OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("policies")).toBeDefined();
  });

  it("renders children before the Policies component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthScreen>
          <div data-testid="oauth-provider">OAuth Provider</div>
        </OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    const oauthProvider = screen.getByTestId("oauth-provider");
    const policies = screen.getByTestId("policies");

    expect(oauthProvider).toBeDefined();
    expect(policies).toBeDefined();

    const oauthContainer = oauthProvider.closest(".space-y-2");
    const policiesContainer = policies.closest(".mt-4.space-y-4");

    expect(oauthContainer).toBeDefined();
    expect(policiesContainer).toBeDefined();

    const cardContent = oauthContainer?.parentElement;
    const children = Array.from(cardContent?.children || []);
    const oauthContainerIndex = children.indexOf(oauthContainer as Element);
    const policiesContainerIndex = children.indexOf(policiesContainer as Element);

    expect(oauthContainerIndex).toBeLessThan(policiesContainerIndex);
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
        <OAuthScreen>OAuth Provider</OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
    expect(screen.queryByText("OAuth Provider")).toBeNull();
    expect(screen.queryByTestId("policies")).toBeNull();
  });

  it("does not render children or Policies when MFA resolver exists", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthScreen>
          <div data-testid="oauth-provider">OAuth Provider</div>
        </OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("oauth-provider")).toBeNull();
    expect(screen.queryByTestId("policies")).toBeNull();
    expect(screen.getByTestId("multi-factor-auth-assertion-screen")).toBeDefined();
  });

  it("renders RedirectError component with children when no MFA resolver", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthScreen>
          <div data-testid="oauth-provider">OAuth Provider</div>
        </OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("redirect-error")).toBeDefined();
    expect(screen.getByTestId("oauth-provider")).toBeDefined();
    expect(screen.getByTestId("policies")).toBeDefined();
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
        <OAuthScreen>
          <div data-testid="oauth-provider">OAuth Provider</div>
        </OAuthScreen>
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
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSignIn = vi.fn();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <OAuthScreen onSignIn={onSignIn}>OAuth Provider</OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByTestId("mfa-on-success"));

    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "oauth-mfa-user" }) })
    );
  });
});
