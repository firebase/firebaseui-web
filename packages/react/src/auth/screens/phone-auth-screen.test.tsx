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
import { PhoneAuthScreen } from "~/auth/screens/phone-auth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { MultiFactorResolver } from "firebase/auth";

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

vi.mock("~/auth/forms/multi-factor-auth-assertion-form", () => ({
  MultiFactorAuthAssertionForm: () => <div data-testid="mfa-assertion-form">MFA Assertion Form</div>,
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

  // it("passes resendDelay prop to PhoneAuthForm", () => {
  //   const ui = createMockUI();

  //   render(
  //     <CreateFirebaseUIProvider ui={ui}>
  //       <PhoneAuthScreen resendDelay={60} />
  //     </CreateFirebaseUIProvider>
  //   );

  //   const phoneForm = screen.getByTestId("phone-auth-form");
  //   expect(phoneForm).toBeDefined();
  //   expect(phoneForm.getAttribute("data-resend-delay")).toBe("60");
  // });

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
        <PhoneAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
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
    expect(screen.getByTestId("mfa-assertion-form")).toBeDefined();
  });
});
