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
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Policies } from "./policies";
import { createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FirebaseUIProvider } from "@firebase-ui/react";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    signInWithEmailAndPassword: vi.fn(),
  };
});

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    useSignInAuthFormAction: vi.fn(),
  };
});

describe("<Policies />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should return null when no policies are provided", () => {
    const mockUI = createMockUI();

    const { container } = render(
      <FirebaseUIProvider ui={mockUI}>
        <Policies />
      </FirebaseUIProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render policies with navigation callback", () => {
    const onNavigateMock = vi.fn();
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        messages: {
          termsAndPrivacy: "{tos} and {privacy}",
        },
        labels: {
          termsOfService: "tos",
          privacyPolicy: "pp",
        },
      }),
    });

    const mockPolicies = {
      termsOfServiceUrl: "https://example.com/terms",
      privacyPolicyUrl: "https://example.com/privacy",
      onNavigate: onNavigateMock,
    };

    const { container } = render(
      <FirebaseUIProvider ui={mockUI} policies={mockPolicies}>
        <Policies />
      </FirebaseUIProvider>
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);

    const termsButton = screen.getByText("tos");
    const privacyButton = screen.getByText("pp");

    expect(termsButton).toBeInTheDocument();
    expect(privacyButton).toBeInTheDocument();

    fireEvent.click(termsButton);
    expect(onNavigateMock).toHaveBeenCalledWith("https://example.com/terms");

    fireEvent.click(privacyButton);
    expect(onNavigateMock).toHaveBeenCalledWith("https://example.com/privacy");
  });

  it("should render policies with external links when no navigation callback", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        messages: {
          termsAndPrivacy: "{tos} and {privacy}",
        },
        labels: {
          termsOfService: "tos",
          privacyPolicy: "pp",
        },
      }),
    });

    const mockPolicies = {
      termsOfServiceUrl: "https://example.com/terms",
      privacyPolicyUrl: "https://example.com/privacy",
      onNavigate: undefined,
    };

    const { container } = render(
      <FirebaseUIProvider ui={mockUI} policies={mockPolicies}>
        <Policies />
      </FirebaseUIProvider>
    );

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);

    const termsLink = screen.getByText("tos");
    const privacyLink = screen.getByText("pp");

    expect(termsLink).toHaveAttribute("href", "https://example.com/terms");
    expect(termsLink).toHaveAttribute("target", "_blank");
    expect(termsLink).toHaveAttribute("rel", "noopener noreferrer");

    expect(privacyLink).toHaveAttribute("href", "https://example.com/privacy");
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
