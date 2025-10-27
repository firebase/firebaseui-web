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
import { EmailLinkAuthScreen } from "~/auth/screens/email-link-auth-screen";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";

vi.mock("~/auth/forms/email-link-auth-form", () => ({
  EmailLinkAuthForm: () => <div data-testid="email-link-auth-form">Email Link Form</div>,
}));

vi.mock("~/components/divider", () => ({
  Divider: () => <div data-testid="divider">Divider</div>,
}));

vi.mock("~/components/redirect-error", () => ({
  RedirectError: () => <div data-testid="redirect-error">Redirect Error</div>,
}));

describe("<EmailLinkAuthScreen />", () => {
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
        <EmailLinkAuthScreen />
      </CreateFirebaseUIProvider>
    );

    const title = screen.getByText("signIn");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("fui-card__title");

    const subtitle = screen.getByText("signInToAccount");
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass("fui-card__subtitle");
  });

  it("renders the <EmailLinkForm /> component", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <EmailLinkAuthScreen />
      </CreateFirebaseUIProvider>
    );

    // Mocked so only has as test id
    expect(screen.getByTestId("email-link-auth-form")).toBeInTheDocument();
  });

  it("renders the a divider with children when present", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <EmailLinkAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </EmailLinkAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("divider")).toBeInTheDocument();
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("renders RedirectError component in children section", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <EmailLinkAuthScreen>
          <div data-testid="test-child">Test Child</div>
        </EmailLinkAuthScreen>
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("redirect-error")).toBeInTheDocument();
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("does not render RedirectError when no children are provided", () => {
    const ui = createMockUI();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <EmailLinkAuthScreen />
      </CreateFirebaseUIProvider>
    );

    expect(screen.queryByTestId("redirect-error")).toBeNull();
  });
});
