import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MultiFactorAuthAssertionForm } from "./multi-factor-auth-assertion-form";
import { createFirebaseUIProvider, createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { FactorId, MultiFactorResolver, PhoneMultiFactorGenerator, TotpMultiFactorGenerator } from "firebase/auth";

vi.mock("@/components/sms-multi-factor-assertion-form", () => ({
  SmsMultiFactorAssertionForm: ({ hint, onSuccess }: { hint: any; onSuccess?: (credential: any) => void }) => (
    <div data-testid="sms-assertion-form">
      <div data-testid="sms-hint-factor-id">{hint?.factorId || "undefined"}</div>
      <button data-testid="sms-on-success" onClick={() => onSuccess?.({ user: { uid: "sms-mfa-user" } })}>
        SMS Success
      </button>
    </div>
  ),
}));

vi.mock("@/components/totp-multi-factor-assertion-form", () => ({
  TotpMultiFactorAssertionForm: ({ hint, onSuccess }: { hint: any; onSuccess?: (credential: any) => void }) => (
    <div data-testid="totp-assertion-form">
      <div data-testid="totp-hint-factor-id">{hint?.factorId || "undefined"}</div>
      <button data-testid="totp-on-success" onClick={() => onSuccess?.({ user: { uid: "totp-mfa-user" } })}>
        TOTP Success
      </button>
    </div>
  ),
}));

describe("<MultiFactorAuthAssertionForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("throws error when no multiFactorResolver is present", () => {
    const ui = createMockUI();

    expect(() => {
      render(
        createFirebaseUIProvider({
          children: <MultiFactorAuthAssertionForm />,
          ui: ui,
        })
      );
    }).toThrow("MultiFactorAuthAssertionForm requires a multi-factor resolver");
  });

  it("auto-selects single hint and renders corresponding form", () => {
    const mockResolver: MultiFactorResolver = {
      hints: [
        {
          uid: "test-uid",
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          displayName: "Test Phone",
        },
      ],
    } as MultiFactorResolver;

    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      createFirebaseUIProvider({
        children: <MultiFactorAuthAssertionForm />,
        ui: ui,
      })
    );

    expect(screen.getByTestId("sms-assertion-form")).toBeInTheDocument();
    expect(screen.getByTestId("sms-hint-factor-id")).toHaveTextContent(PhoneMultiFactorGenerator.FACTOR_ID);
  });

  it("shows buttons for multiple hints and allows selection", () => {
    const mockResolver: MultiFactorResolver = {
      hints: [
        {
          uid: "test-uid-1",
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          displayName: "Test Phone",
        },
        {
          uid: "test-uid-2",
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          displayName: "Test TOTP",
        },
      ],
    } as MultiFactorResolver;

    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      createFirebaseUIProvider({
        children: <MultiFactorAuthAssertionForm />,
        ui: ui,
      })
    );

    expect(screen.getByRole("button", { name: "Set up SMS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set up TOTP" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set up TOTP" }));

    expect(screen.getByTestId("totp-assertion-form")).toBeInTheDocument();
    expect(screen.getByTestId("totp-hint-factor-id")).toHaveTextContent(TotpMultiFactorGenerator.FACTOR_ID);
    expect(screen.queryByTestId("sms-assertion-form")).not.toBeInTheDocument();
  });

  it("renders SMS form when SMS hint is selected", () => {
    const mockResolver: MultiFactorResolver = {
      hints: [
        {
          uid: "test-uid-1",
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          displayName: "Test Phone",
        },
        {
          uid: "test-uid-2",
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          displayName: "Test TOTP",
        },
      ],
    } as MultiFactorResolver;

    const ui = createMockUI({
      locale: registerLocale("test", {
        labels: {
          mfaTotpVerification: "Set up TOTP",
          mfaSmsVerification: "Set up SMS",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      createFirebaseUIProvider({
        children: <MultiFactorAuthAssertionForm />,
        ui: ui,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Set up SMS" }));

    expect(screen.getByTestId("sms-assertion-form")).toBeInTheDocument();
    expect(screen.getByTestId("sms-hint-factor-id")).toHaveTextContent(PhoneMultiFactorGenerator.FACTOR_ID);
    expect(screen.queryByTestId("totp-assertion-form")).not.toBeInTheDocument();
  });

  it("shows selection message when multiple hints are available", () => {
    const mockResolver: MultiFactorResolver = {
      hints: [
        {
          uid: "test-uid-1",
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          displayName: "Test Phone",
        },
        {
          uid: "test-uid-2",
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          displayName: "Test TOTP",
        },
      ],
    } as MultiFactorResolver;

    const ui = createMockUI({
      locale: registerLocale("test", {
        prompts: {
          mfaAssertionFactorPrompt: "Please choose a multi-factor authentication method",
        },
      }),
    });
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    render(
      createFirebaseUIProvider({
        children: <MultiFactorAuthAssertionForm />,
        ui: ui,
      })
    );

    expect(screen.getByText("Please choose a multi-factor authentication method")).toBeInTheDocument();
  });

  it("calls onSuccess with credential when SMS form succeeds", () => {
    const mockResolver: MultiFactorResolver = {
      hints: [
        {
          uid: "test-uid",
          factorId: PhoneMultiFactorGenerator.FACTOR_ID,
          displayName: "Test Phone",
        },
      ],
    } as MultiFactorResolver;

    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSuccess = vi.fn();

    render(
      createFirebaseUIProvider({
        children: <MultiFactorAuthAssertionForm onSuccess={onSuccess} />,
        ui: ui,
      })
    );

    expect(screen.getByTestId("sms-assertion-form")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sms-on-success"));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "sms-mfa-user" }) })
    );
  });

  it("calls onSuccess with credential when TOTP form succeeds", () => {
    const mockResolver: MultiFactorResolver = {
      hints: [
        {
          uid: "test-uid",
          factorId: TotpMultiFactorGenerator.FACTOR_ID,
          displayName: "Test TOTP",
        },
      ],
    } as MultiFactorResolver;

    const ui = createMockUI();
    ui.get().setMultiFactorResolver(mockResolver as unknown as MultiFactorResolver);

    const onSuccess = vi.fn();

    render(
      createFirebaseUIProvider({
        children: <MultiFactorAuthAssertionForm onSuccess={onSuccess} />,
        ui: ui,
      })
    );

    expect(screen.getByTestId("totp-assertion-form")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("totp-on-success"));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "totp-mfa-user" }) })
    );
  });
});
