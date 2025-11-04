/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, renderHook, cleanup, fireEvent, waitFor } from "@testing-library/react";
import {
  TotpMultiFactorAssertionForm,
  useTotpMultiFactorAssertionFormAction,
} from "./totp-multi-factor-assertion-form";
import { act } from "react";
import { signInWithMultiFactorAssertion } from "@invertase/firebaseui-core";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { TotpMultiFactorGenerator } from "firebase/auth";

vi.mock("@invertase/firebaseui-core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-core")>();
  return {
    ...mod,
    signInWithMultiFactorAssertion: vi.fn(),
  };
});

vi.mock("firebase/auth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...mod,
    TotpMultiFactorGenerator: {
      assertionForSignIn: vi.fn(),
    },
  };
});

describe("useTotpMultiFactorAssertionFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a function", () => {
    const mockUI = createMockUI();
    const { result } = renderHook(() => useTotpMultiFactorAssertionFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    expect(typeof result.current).toBe("function");
  });

  it("should call TotpMultiFactorGenerator.assertionForSignIn and signInWithMultiFactorAssertion", async () => {
    const mockUI = createMockUI();
    const mockAssertion = { assertion: true };
    const signInWithMultiFactorAssertionMock = vi.mocked(signInWithMultiFactorAssertion);
    const mockHint = {
      factorId: "totp" as const,
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    vi.mocked(TotpMultiFactorGenerator.assertionForSignIn).mockReturnValue(mockAssertion as any);

    const { result } = renderHook(() => useTotpMultiFactorAssertionFormAction(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui: mockUI }),
    });

    await act(async () => {
      await result.current({ verificationCode: "123456", hint: mockHint });
    });

    expect(TotpMultiFactorGenerator.assertionForSignIn).toHaveBeenCalledWith("test-uid", "123456");
    expect(signInWithMultiFactorAssertionMock).toHaveBeenCalledWith(expect.any(Object), mockAssertion);
  });
});

describe("<TotpMultiFactorAssertionForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the form correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "verificationCode",
          verifyCode: "verifyCode",
        },
      }),
    });

    const mockHint = {
      factorId: "totp" as const,
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const { container } = render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    const form = container.querySelectorAll("form.fui-form");
    expect(form.length).toBe(1);

    expect(screen.getByRole("textbox", { name: /verificationCode/i })).toBeInTheDocument();

    const verifyCodeButton = screen.getByRole("button", { name: "verifyCode" });
    expect(verifyCodeButton).toBeInTheDocument();
    expect(verifyCodeButton).toHaveAttribute("type", "submit");
  });

  it("should accept onSuccess callback prop", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "verificationCode",
        },
      }),
    });

    const mockHint = {
      factorId: "totp" as const,
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };
    const onSuccessMock = vi.fn();

    expect(() => {
      render(
        createFirebaseUIProvider({
          children: <TotpMultiFactorAssertionForm hint={mockHint} onSuccess={onSuccessMock} />,
          ui: mockUI,
        })
      );
    }).not.toThrow();
  });

  it("should render form elements correctly", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "verificationCode",
          verifyCode: "verifyCode",
        },
      }),
    });

    const mockHint = {
      factorId: "totp" as const,
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    expect(screen.getByRole("textbox", { name: /verificationCode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "verifyCode" })).toBeInTheDocument();
  });

  it("should render input field for TOTP code", () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "verificationCode",
        },
      }),
    });

    const mockHint = {
      factorId: "totp" as const,
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    const input = screen.getByRole("textbox", { name: /verificationCode/i });
    expect(input).toBeInTheDocument();
  });

  it("invokes onSuccess with credential after successful verification", async () => {
    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "verificationCode",
          verifyCode: "verifyCode",
        },
      }),
    });

    const mockHint = {
      factorId: "totp" as const,
      uid: "test-uid",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const mockCredential = { user: { uid: "totp-cred-user" } } as any;
    vi.mocked(signInWithMultiFactorAssertion).mockResolvedValue(mockCredential);

    const onSuccessMock = vi.fn();

    const { container } = render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} onSuccess={onSuccessMock} />,
        ui: mockUI,
      })
    );

    const input = screen.getByRole("textbox", { name: /verificationCode/i });
    const form = input.closest("form");

    await act(async () => {
      fireEvent.change(input, { target: { value: "123456" } });
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(signInWithMultiFactorAssertion).toHaveBeenCalled();
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onSuccessMock).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "totp-cred-user" }) })
    );
  });
});
