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
import { render } from "@testing-library/react";
import { EmailLinkAuthScreen } from "~/auth/screens/email-link-auth-screen";
import * as hooks from "~/hooks";

// Mock the hooks
vi.mock("~/hooks", () => ({
  useUI: vi.fn(() => ({
    locale: "en-US",
    translations: {
      "en-US": {
        labels: {
          signIn: "Sign In",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
        messages: {
          dividerOr: "or",
        },
      },
    },
  })),
}));

// Mock the EmailLinkForm component
vi.mock("~/auth/forms/email-link-form", () => ({
  EmailLinkForm: () => <div data-testid="email-link-form">Email Link Form</div>,
}));

describe("EmailLinkAuthScreen", () => {
  beforeEach(() => {
    // Setup default mock values
    vi.mocked(hooks.useUI).mockReturnValue({
      locale: "en-US",
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct title and subtitle", () => {
    const { getByText } = render(<EmailLinkAuthScreen />);

    expect(getByText("Sign In")).toBeInTheDocument();
    expect(getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("calls useUI to get the locale", () => {
    render(<EmailLinkAuthScreen />);
    expect(hooks.useUI).toHaveBeenCalled();
  });

  it("includes the EmailLinkForm component", () => {
    const { getByTestId } = render(<EmailLinkAuthScreen />);

    expect(getByTestId("email-link-form")).toBeInTheDocument();
  });

  it("does not render divider and children when no children are provided", () => {
    const { queryByText } = render(<EmailLinkAuthScreen />);

    expect(queryByText("or")).not.toBeInTheDocument();
  });

  it("renders divider and children when children are provided", () => {
    const { getByText } = render(
      <EmailLinkAuthScreen>
        <div>Test Child</div>
      </EmailLinkAuthScreen>
    );

    expect(getByText("or")).toBeInTheDocument();
    expect(getByText("Test Child")).toBeInTheDocument();
  });
});
