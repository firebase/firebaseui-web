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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Policies } from "./policies";
import { FirebaseUIProvider } from "~/context";
import { createMockUI } from "~/tests/utils";

describe("<Policies />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders component with terms and privacy links", () => {
    render(
      <FirebaseUIProvider
        ui={createMockUI()}
        policies={{
          termsOfServiceUrl: "https://example.com/terms",
          privacyPolicyUrl: "https://example.com/privacy",
        }}
      >
        <Policies />
      </FirebaseUIProvider>
    );

    // Check that the text and links are rendered
    expect(screen.getByText(/By continuing, you agree to our/)).toBeInTheDocument();

    const tosLink = screen.getByText("Terms of Service");
    expect(tosLink).toBeInTheDocument();
    expect(tosLink.tagName).toBe("A");
    expect(tosLink).toHaveAttribute("target", "_blank");
    expect(tosLink).toHaveAttribute("rel", "noopener noreferrer");

    const privacyLink = screen.getByText("Privacy Policy");
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.tagName).toBe("A");
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("returns null when both tosUrl and privacyPolicyUrl are not provided", () => {
    const { container } = render(
      <FirebaseUIProvider ui={createMockUI()} policies={undefined}>
        <Policies />
      </FirebaseUIProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
