import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { TotpMultiFactorAssertionForm } from "./totp-multi-factor-assertion-form";
import { createFirebaseUIProvider, createMockUI } from "../../tests/utils";
import { registerLocale } from "@invertase/firebaseui-translations";
import { TotpMultiFactorGenerator } from "firebase/auth";
import { useTotpMultiFactorAssertionFormAction } from "@invertase/firebaseui-react";
import React from "react";

// Mock input-otp components to prevent window access issues
vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "input-otp", ...props }, children),
  InputOTPGroup: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "input-otp-group", ...props }, children),
  InputOTPSlot: ({ index, ...props }: any) =>
    React.createElement("input", {
      "data-testid": `input-otp-slot-${index}`,
      "aria-label": "Verification Code",
      ...props,
    }),
}));

vi.mock("@invertase/firebaseui-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@invertase/firebaseui-react")>();
  return {
    ...mod,
    useTotpMultiFactorAssertionFormAction: vi.fn(),
  };
});

describe("<TotpMultiFactorAssertionForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the verification form", () => {
    const mockHint = {
      uid: "test-uid",
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "Test TOTP",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    expect(screen.getByTestId("input-otp-slot-0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("should call onSuccess when verification is successful", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "Test TOTP",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const mockAction = vi.fn().mockResolvedValue({ user: { uid: "totp-mfa-user" } });
    vi.mocked(useTotpMultiFactorAssertionFormAction).mockReturnValue(mockAction);

    const mockOnSuccess = vi.fn();

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} onSuccess={mockOnSuccess} />,
        ui: mockUI,
      })
    );

    // Simulate entering verification code
    const verificationInput = screen.getByTestId("input-otp-slot-0");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({ user: { uid: "totp-mfa-user" } });
    });
  });

  it("should handle verification form submission error", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "Test TOTP",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const mockAction = vi.fn().mockRejectedValue(new Error("TOTP verification failed"));
    vi.mocked(useTotpMultiFactorAssertionFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    // Simulate entering verification code
    const verificationInput = screen.getByTestId("input-otp-slot-0");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("Error: TOTP verification failed")).toBeInTheDocument();
    });
  });

  it("should not call onSuccess when verification fails", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "Test TOTP",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const mockAction = vi.fn().mockRejectedValue(new Error("Invalid code"));
    vi.mocked(useTotpMultiFactorAssertionFormAction).mockReturnValue(mockAction);

    const mockOnSuccess = vi.fn();

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} onSuccess={mockOnSuccess} />,
        ui: mockUI,
      })
    );

    // Simulate entering verification code
    const verificationInput = screen.getByTestId("input-otp-slot-0");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("Error: Invalid code")).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should work without onSuccess callback", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "Test TOTP",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const mockAction = vi.fn().mockResolvedValue({ user: { uid: "totp-mfa-user" } });
    vi.mocked(useTotpMultiFactorAssertionFormAction).mockReturnValue(mockAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <TotpMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    const verificationInput = screen.getByTestId("input-otp-slot-0");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });
  });
});
