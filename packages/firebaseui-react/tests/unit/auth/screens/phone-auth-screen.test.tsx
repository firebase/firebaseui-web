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

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { PhoneAuthScreen } from "~/auth/screens/phone-auth-screen";

// Mock the hooks
vi.mock("~/hooks", () => ({
  useUI: () => ({
    locale: "en-US",
    translations: {
      "en-US": {
        labels: {
          signIn: "Sign in",
          dividerOr: "or",
        },
        prompts: {
          signInToAccount: "Sign in to your account",
        },
      },
    },
  }),
}));

// Mock the PhoneForm component
vi.mock("~/auth/forms/phone-form", () => ({
  PhoneForm: ({ resendDelay }: { resendDelay?: number }) => (
    <div data-testid="phone-form" data-resend-delay={resendDelay}>
      Phone Form
    </div>
  ),
}));

describe("PhoneAuthScreen", () => {
  it("displays the correct title and subtitle", () => {
    const { getByText } = render(<PhoneAuthScreen />);

    expect(getByText("Sign in")).toBeInTheDocument();
    expect(getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("calls useConfig to retrieve the language", () => {
    const { getByText } = render(<PhoneAuthScreen />);

    expect(getByText("Sign in")).toBeInTheDocument();
  });

  it("includes the PhoneForm with the correct resendDelay prop", () => {
    const { getByTestId } = render(<PhoneAuthScreen resendDelay={60} />);

    const phoneForm = getByTestId("phone-form");
    expect(phoneForm).toBeInTheDocument();
    expect(phoneForm.getAttribute("data-resend-delay")).toBe("60");
  });

  it("renders children when provided", () => {
    const { getByText, getByTestId } = render(
      <PhoneAuthScreen>
        <button data-testid="test-button">Test Button</button>
      </PhoneAuthScreen>
    );

    expect(getByTestId("test-button")).toBeInTheDocument();
    expect(getByText("or")).toBeInTheDocument();
  });

  it("does not render children or divider when not provided", () => {
    const { queryByText } = render(<PhoneAuthScreen />);

    expect(queryByText("or")).not.toBeInTheDocument();
  });
});
