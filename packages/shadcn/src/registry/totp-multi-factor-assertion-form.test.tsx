import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { TotpMultiFactorAssertionForm } from "./totp-multi-factor-assertion-form";
import { createFirebaseUIProvider, createMockUI } from "../../tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { TotpMultiFactorGenerator } from "firebase/auth";
import { useTotpMultiFactorAssertionFormAction } from "@firebase-ui/react";

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
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

    expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("should call onSuccess when verification is successful", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "Test TOTP",
      enrollmentTime: "2023-01-01T00:00:00Z",
    };

    const mockAction = vi.fn().mockResolvedValue(undefined);
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
    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
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
    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("TOTP verification failed")).toBeInTheDocument();
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
    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid code")).toBeInTheDocument();
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

    const mockAction = vi.fn().mockResolvedValue(undefined);
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

    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });
  });
});
