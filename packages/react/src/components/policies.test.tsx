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
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Policies } from "./policies";
import { FirebaseUIProvider } from "~/context";
import { createMockUI } from "~/tests/utils";

describe("<Policies />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders component with terms and privacy links using anchor tags", () => {
    const { container } = render(
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
    expect(container.querySelector(".fui-policies")).toBeInTheDocument();

    const tosLink = container.querySelector('a[href="https://example.com/terms"]');
    expect(tosLink).toBeInTheDocument();
    expect(tosLink?.tagName).toBe("A");
    expect(tosLink).toHaveAttribute("target", "_blank");
    expect(tosLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(tosLink).toHaveTextContent("Terms of Service");

    const privacyLink = container.querySelector('a[href="https://example.com/privacy"]');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink?.tagName).toBe("A");
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(privacyLink).toHaveTextContent("Privacy Policy");
  });

  it("renders component with custom navigation handler using buttons", () => {
    const mockNavigate = vi.fn();
    const { container } = render(
      <FirebaseUIProvider
        ui={createMockUI()}
        policies={{
          termsOfServiceUrl: "https://example.com/terms",
          privacyPolicyUrl: "https://example.com/privacy",
          onNavigate: mockNavigate,
        }}
      >
        <Policies />
      </FirebaseUIProvider>
    );

    // Check that the text and buttons are rendered
    expect(container.querySelector(".fui-policies")).toBeInTheDocument();

    const tosButton = container.querySelector("button");
    expect(tosButton).toBeInTheDocument();
    expect(tosButton?.tagName).toBe("BUTTON");
    expect(tosButton).not.toHaveAttribute("href");
    expect(tosButton).not.toHaveAttribute("target");
    expect(tosButton).toHaveTextContent("Terms of Service");

    const privacyButton = container.querySelectorAll("button")[1];
    expect(privacyButton).toBeInTheDocument();
    expect(privacyButton?.tagName).toBe("BUTTON");
    expect(privacyButton).not.toHaveAttribute("href");
    expect(privacyButton).not.toHaveAttribute("target");
    expect(privacyButton).toHaveTextContent("Privacy Policy");

    fireEvent.click(tosButton!);
    expect(mockNavigate).toHaveBeenCalledWith("https://example.com/terms");

    fireEvent.click(privacyButton!);
    expect(mockNavigate).toHaveBeenCalledWith("https://example.com/privacy");
  });

  it("handles URL objects correctly", () => {
    const termsUrl = new URL("https://example.com/terms");
    const privacyUrl = new URL("https://example.com/privacy");
    const { container } = render(
      <FirebaseUIProvider
        ui={createMockUI()}
        policies={{
          termsOfServiceUrl: termsUrl,
          privacyPolicyUrl: privacyUrl,
        }}
      >
        <Policies />
      </FirebaseUIProvider>
    );

    const tosLink = container.querySelector('a[href="https://example.com/terms"]');
    expect(tosLink).toHaveAttribute("href", "https://example.com/terms");

    const privacyLink = container.querySelector('a[href="https://example.com/privacy"]');
    expect(privacyLink).toHaveAttribute("href", "https://example.com/privacy");
  });

  it("returns null when policies are not provided", () => {
    const { container } = render(
      <FirebaseUIProvider ui={createMockUI()} policies={undefined}>
        <Policies />
      </FirebaseUIProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("handles custom navigation with URL objects", () => {
    const mockNavigate = vi.fn();
    const termsUrl = new URL("https://example.com/terms");
    const privacyUrl = new URL("https://example.com/privacy");
    const { container } = render(
      <FirebaseUIProvider
        ui={createMockUI()}
        policies={{
          termsOfServiceUrl: termsUrl,
          privacyPolicyUrl: privacyUrl,
          onNavigate: mockNavigate,
        }}
      >
        <Policies />
      </FirebaseUIProvider>
    );

    const tosButton = container.querySelector("button");
    const privacyButton = container.querySelectorAll("button")[1];

    fireEvent.click(tosButton!);
    expect(mockNavigate).toHaveBeenCalledWith(termsUrl);

    fireEvent.click(privacyButton!);
    expect(mockNavigate).toHaveBeenCalledWith(privacyUrl);
  });
});
