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
import { render, screen, fireEvent, cleanup, renderHook } from "@testing-library/react";
import {
  MultiFactorAuthAssertionForm,
  useMultiFactorAssertionCleanup,
} from "~/auth/forms/multi-factor-auth-assertion-form";
import { CreateFirebaseUIProvider, createMockUI, createFirebaseUIProvider } from "~/tests/utils";
import { registerLocale } from "@firebase-oss/ui-translations";
import { FactorId, MultiFactorResolver, PhoneMultiFactorGenerator, TotpMultiFactorGenerator } from "firebase/auth";

vi.mock("~/auth/forms/mfa/sms-multi-factor-assertion-form", () => ({
  SmsMultiFactorAssertionForm: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div>
      <div data-testid="sms-assertion-form">SMS Assertion Form</div>
      <button data-testid="sms-on-success" onClick={() => onSuccess?.({ user: { uid: "sms-user" } })}>
        Trigger SMS Success
      </button>
    </div>
  ),
}));

vi.mock("~/auth/forms/mfa/totp-multi-factor-assertion-form", () => ({
  TotpMultiFactorAssertionForm: ({ onSuccess }: { onSuccess?: (credential: any) => void }) => (
    <div>
      <div data-testid="totp-assertion-form">TOTP Assertion Form</div>
      <button data-testid="totp-on-success" onClick={() => onSuccess?.({ user: { uid: "totp-user" } })}>
        Trigger TOTP Success
      </button>
    </div>
  ),
}));

vi.mock("~/components/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="mfa-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useMultiFactorAssertionCleanup", () => {
  it("calls setMultiFactorResolver on unmount", () => {
    const ui = createMockUI();
    const setMultiFactorResolverSpy = vi.spyOn(ui.get(), "setMultiFactorResolver");

    const { unmount } = renderHook(() => useMultiFactorAssertionCleanup(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui }),
    });

    expect(setMultiFactorResolverSpy).not.toHaveBeenCalled();

    unmount();

    expect(setMultiFactorResolverSpy).toHaveBeenCalledTimes(1);
  });

  it("clears multiFactorResolver when component unmounts", () => {
    const ui = createMockUI();
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [],
    } as unknown as MultiFactorResolver;
    ui.get().setMultiFactorResolver(mockResolver);

    const setMultiFactorResolverSpy = vi.spyOn(ui.get(), "setMultiFactorResolver");

    const { unmount } = renderHook(() => useMultiFactorAssertionCleanup(), {
      wrapper: ({ children }) => createFirebaseUIProvider({ children, ui }),
    });

    expect(ui.get().multiFactorResolver).toBe(mockResolver);

    unmount();

    expect(setMultiFactorResolverSpy).toHaveBeenCalledTimes(1);
    expect(ui.get().multiFactorResolver).toBeUndefined();
  });
});

describe("<MultiFactorAuthAssertionForm />", () => {
  it("throws error when no multiFactorResolver is present", () => {
    const ui = createMockUI();

    expect(() => {
      render(
        <CreateFirebaseUIProvider ui={ui}>
          <MultiFactorAuthAssertionForm />
        </CreateFirebaseUIProvider>
      );
    }).toThrow("MultiFactorAuthAssertionForm requires a multi-factor resolver");
  });

  it("auto-selects single factor when only one hint exists", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid",
          displayName: "Test Phone",
        },
      ],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("sms-assertion-form")).toBeDefined();
    expect(screen.queryByTestId("mfa-button")).toBeNull();
  });

  it("invokes onSuccess with credential from SMS assertion child", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid",
          displayName: "Test Phone",
        },
      ],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSuccess = vi.fn();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm onSuccess={onSuccess} />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByTestId("sms-on-success"));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "sms-user" }) })
    );
  });

  it("invokes onSuccess with credential from TOTP assertion child", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid",
          displayName: "Test TOTP",
        },
      ],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSuccess = vi.fn();

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm onSuccess={onSuccess} />
      </CreateFirebaseUIProvider>
    );

    fireEvent.click(screen.getByTestId("totp-on-success"));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "totp-user" }) })
    );
  });

  it("auto-selects TOTP factor when only one TOTP hint exists", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid",
          displayName: "Test TOTP",
        },
      ],
    };
    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByTestId("totp-assertion-form")).toBeDefined();
    expect(screen.queryByTestId("mfa-button")).toBeNull();
  });

  it("displays factor selection UI when multiple hints exist", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-1",
          displayName: "Test Phone",
        },
        {
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-2",
          displayName: "Test TOTP",
        },
      ],
    };
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "TOTP Verification",
          mfaSmsVerification: "SMS Verification",
        },
        prompts: {
          mfaAssertionFactorPrompt: "Please choose a multi-factor authentication method",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Please choose a multi-factor authentication method")).toBeDefined();
    expect(screen.getAllByTestId("mfa-button")).toHaveLength(2);
    expect(screen.getByText("TOTP Verification")).toBeDefined();
    expect(screen.getByText("SMS Verification")).toBeDefined();
  });

  it("renders SmsMultiFactorAssertionForm when SMS factor is selected", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-1",
          displayName: "Test Phone",
        },
        {
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-2",
          displayName: "Test TOTP",
        },
      ],
    };
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "TOTP Verification",
          mfaSmsVerification: "SMS Verification",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    const smsButton = screen.getByText("SMS Verification");
    fireEvent.click(smsButton);

    expect(screen.getByTestId("sms-assertion-form")).toBeDefined();
    expect(screen.queryByTestId("totp-assertion-form")).toBeNull();
  });

  it("renders TotpMultiFactorAssertionForm when TOTP factor is selected", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-1",
          displayName: "Test Phone",
        },
        {
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-2",
          displayName: "Test TOTP",
        },
      ],
    };
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "TOTP Verification",
          mfaSmsVerification: "SMS Verification",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    const totpButton = screen.getByText("TOTP Verification");
    fireEvent.click(totpButton);

    expect(screen.getByTestId("totp-assertion-form")).toBeDefined();
    expect(screen.queryByTestId("sms-assertion-form")).toBeNull();
  });

  it("buttons display correct translated labels", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-1",
          displayName: "Test Phone",
        },
        {
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-2",
          displayName: "Test TOTP",
        },
      ],
    };
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Custom TOTP Label",
          mfaSmsVerification: "Custom SMS Label",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Custom TOTP Label")).toBeDefined();
    expect(screen.getByText("Custom SMS Label")).toBeDefined();
  });

  it("factor selection triggers correct form rendering", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-1",
          displayName: "Test Phone",
        },
        {
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          uid: "test-uid-2",
          displayName: "Test TOTP",
        },
      ],
    };
    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "TOTP Verification",
          mfaSmsVerification: "SMS Verification",
        },
        prompts: {
          mfaAssertionFactorPrompt: "Please choose a multi-factor authentication method",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const { rerender } = render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    expect(screen.getByText("Please choose a multi-factor authentication method")).toBeDefined();
    expect(screen.queryByTestId("sms-assertion-form")).toBeNull();
    expect(screen.queryByTestId("totp-assertion-form")).toBeNull();

    const smsButton = screen.getByText("SMS Verification");
    fireEvent.click(smsButton);

    rerender(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    // Should now show SMS form
    expect(screen.getByTestId("sms-assertion-form")).toBeDefined();
    expect(screen.queryByTestId("totp-assertion-form")).toBeNull();
    expect(screen.queryByText("Please choose a multi-factor authentication method")).toBeNull();
  });

  it("handles unknown factor types gracefully", () => {
    const mockResolver = {
      auth: {} as any,
      session: null,
      hints: [
        {
          factorId: "unknown-factor" as any,
          uid: "test-uid",
          displayName: "Unknown Factor",
        },
      ],
    };
    const ui = createMockUI({
      locale: registerLocale("test", {
        prompts: {
          mfaAssertionFactorPrompt: "Please choose a multi-factor authentication method",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      <CreateFirebaseUIProvider ui={ui}>
        <MultiFactorAuthAssertionForm />
      </CreateFirebaseUIProvider>
    );

    // Should show selection UI for unknown factor
    expect(screen.getByText("Please choose a multi-factor authentication method")).toBeDefined();
    expect(screen.queryByTestId("sms-assertion-form")).toBeNull();
    expect(screen.queryByTestId("totp-assertion-form")).toBeNull();
  });
});
