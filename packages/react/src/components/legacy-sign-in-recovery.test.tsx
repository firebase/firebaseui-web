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

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { registerLocale } from "@firebase-oss/ui-translations";
import { LegacySignInRecovery } from "~/components/legacy-sign-in-recovery";
import { CreateFirebaseUIProvider, createMockUI } from "~/tests/utils";

vi.mock("~/auth/oauth/google-sign-in-button", () => ({
  GoogleSignInButton: ({ onSignIn }: { onSignIn?: (credential: unknown) => void }) => (
    <button data-testid="google-recovery-button" onClick={() => onSignIn?.({})}>
      Google Recovery
    </button>
  ),
}));

vi.mock("~/auth/oauth/github-sign-in-button", () => ({
  GitHubSignInButton: ({ onSignIn }: { onSignIn?: (credential: unknown) => void }) => (
    <button data-testid="github-recovery-button" onClick={() => onSignIn?.({})}>
      GitHub Recovery
    </button>
  ),
}));

vi.mock("~/auth/oauth/facebook-sign-in-button", () => ({
  FacebookSignInButton: () => <button data-testid="facebook-recovery-button">Facebook Recovery</button>,
}));

vi.mock("~/auth/oauth/apple-sign-in-button", () => ({
  AppleSignInButton: () => <button data-testid="apple-recovery-button">Apple Recovery</button>,
}));

vi.mock("~/auth/oauth/microsoft-sign-in-button", () => ({
  MicrosoftSignInButton: () => <button data-testid="microsoft-recovery-button">Microsoft Recovery</button>,
}));

vi.mock("~/auth/oauth/twitter-sign-in-button", () => ({
  TwitterSignInButton: () => <button data-testid="twitter-recovery-button">Twitter Recovery</button>,
}));

vi.mock("~/auth/oauth/yahoo-sign-in-button", () => ({
  YahooSignInButton: () => <button data-testid="yahoo-recovery-button">Yahoo Recovery</button>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("<LegacySignInRecovery />", () => {
  const recoveryLocale = registerLocale("legacy-recovery", {
    messages: {
      legacySignInRecoveryPrompt: "You have previously signed in with a different method for {email}.",
      legacySignInRecoverySelectMethod: "Choose one of your previous sign-in methods to continue.",
      legacySignInRecoveryEmailPassword: "Use the email and password form to continue.",
      legacySignInRecoveryEmailLink: "Use your email link sign-in flow to continue.",
    },
    labels: {
      dismiss: "Dismiss",
    },
  });

  it("returns null when there is no recovery state", () => {
    const ui = createMockUI();

    const { container } = render(
      <CreateFirebaseUIProvider ui={ui}>
        <LegacySignInRecovery />
      </CreateFirebaseUIProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders recovery copy and recognized provider buttons", () => {
    const ui = createMockUI({ locale: recoveryLocale });
    ui.get().setLegacySignInRecovery({
      email: "test@example.com",
      signInMethods: ["google.com", "github.com", "password", "emailLink"],
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <LegacySignInRecovery />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(
      screen.getByText("You have previously signed in with a different method for test@example.com.")
    ).toBeDefined();
    expect(screen.getByText("Choose one of your previous sign-in methods to continue.")).toBeDefined();
    expect(screen.getByTestId("google-recovery-button")).toBeDefined();
    expect(screen.getByTestId("github-recovery-button")).toBeDefined();
    expect(screen.getByText("Use the email and password form to continue.")).toBeDefined();
    expect(screen.getByText("Use your email link sign-in flow to continue.")).toBeDefined();
  });

  it("clears recovery when dismissed", () => {
    const ui = createMockUI({ locale: recoveryLocale });
    ui.get().setLegacySignInRecovery({
      email: "test@example.com",
      signInMethods: ["google.com"],
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <LegacySignInRecovery />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(ui.get().legacySignInRecovery).toBeUndefined();
  });

  it("clears recovery when the modal backdrop is clicked", () => {
    const ui = createMockUI({ locale: recoveryLocale });
    ui.get().setLegacySignInRecovery({
      email: "test@example.com",
      signInMethods: ["google.com"],
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <LegacySignInRecovery />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);

    expect(ui.get().legacySignInRecovery).toBeUndefined();
  });

  it("clears recovery after a successful recovery sign-in", () => {
    const ui = createMockUI({ locale: recoveryLocale });
    ui.get().setLegacySignInRecovery({
      email: "test@example.com",
      signInMethods: ["google.com"],
    });

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <LegacySignInRecovery />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByTestId("google-recovery-button"));

    expect(ui.get().legacySignInRecovery).toBeUndefined();
  });
});
