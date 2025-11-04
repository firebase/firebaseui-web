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
import { OAuthScreen } from "~/auth/screens/oauth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { MultiFactorResolver } from "firebase/auth";

vi.mock("~/components/policies", async (originalModule) => {
  const module = await originalModule();
  return {
    ...(module as object),
    Policies: () => <div data-testid="policies">Policies</div>,
  };
});

vi.mock("~/components/redirect-error", () => ({
  RedirectError: () => <div data-testid="redirect-error">Redirect Error</div>,
}));

vi.mock("~/auth/forms/multi-factor-auth-assertion-form", () => ({
  MultiFactorAuthAssertionForm: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div>
      <div data-testid="mfa-assertion-form">MFA Assertion Form</div>
      <button data-testid="mfa-on-success" onClick={() => onSuccess?.({ user: { uid: "oauth-mfa-user" } })}>
        Trigger MFA Success
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
    expect(title.className).toContain("fui-card__title");

    const subtitle = screen.getByText("signInToAccount");
    expect(subtitle).toBeDefined();
    expect(subtitle.className).toContain("fui-card__subtitle");
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

    // Both should be present
    expect(oauthProvider).toBeDefined();
    expect(policies).toBeDefined();

    // OAuth provider should come before policies
    const cardContent = oauthProvider.parentElement;
    const children = Array.from(cardContent?.children || []);
    const oauthIndex = children.indexOf(oauthProvider);
    const policiesIndex = children.indexOf(policies);

    expect(oauthIndex).toBeLessThan(policiesIndex);
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
        <OAuthScreen>OAuth Provider</OAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
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
    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
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
    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
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
