import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { SmsMultiFactorAssertionForm } from "./sms-multi-factor-assertion-form";
import { createFirebaseUIProvider, createMockUI } from "~/tests/utils";
import { registerLocale } from "@firebase-ui/translations";
import { PhoneMultiFactorGenerator } from "firebase/auth";
import { verifyPhoneNumber, signInWithMultiFactorAssertion } from "@firebase-ui/core";
import {
  useSmsMultiFactorAssertionPhoneFormAction,
  useSmsMultiFactorAssertionVerifyFormAction,
} from "@firebase-ui/react";

vi.mock("@firebase-ui/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/core")>();
  return {
    ...mod,
    verifyPhoneNumber: vi.fn(),
    signInWithMultiFactorAssertion: vi.fn(),
  };
});

vi.mock("@firebase-ui/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@firebase-ui/react")>();
  return {
    ...mod,
    useRecaptchaVerifier: () => ({
      render: vi.fn(),
      verify: vi.fn(),
    }),
    useSmsMultiFactorAssertionPhoneFormAction: vi.fn(),
    useSmsMultiFactorAssertionVerifyFormAction: vi.fn(),
  };
});

describe("<SmsMultiFactorAssertionForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the phone number form initially", () => {
    const mockHint = {
      uid: "test-uid",
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Test Phone",
      phoneNumber: "+1234567890",
    };

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+1234567890")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Code" })).toBeInTheDocument();
  });

  it("should transition to verification form on successful phone number submission", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Test Phone",
      phoneNumber: "+1234567890",
    };

    const mockPhoneAction = vi.fn().mockResolvedValue("verification-id-123");
    vi.mocked(useSmsMultiFactorAssertionPhoneFormAction).mockReturnValue(mockPhoneAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
    });
  });

  it("should call onSuccess when verification is successful", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Test Phone",
      phoneNumber: "+1234567890",
    };

    const mockPhoneAction = vi.fn().mockResolvedValue("verification-id-123");
    vi.mocked(useSmsMultiFactorAssertionPhoneFormAction).mockReturnValue(mockPhoneAction);

    const mockVerifyAction = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useSmsMultiFactorAssertionVerifyFormAction).mockReturnValue(mockVerifyAction);

    const mockOnSuccess = vi.fn();

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} onSuccess={mockOnSuccess} />,
        ui: mockUI,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    // Simulate entering verification code
    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should handle phone number form submission error", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Test Phone",
      phoneNumber: "+1234567890",
    };

    const mockPhoneAction = vi.fn().mockRejectedValue(new Error("Phone verification failed"));
    vi.mocked(useSmsMultiFactorAssertionPhoneFormAction).mockReturnValue(mockPhoneAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByText("Phone verification failed")).toBeInTheDocument();
    });
  });

  it("should handle verification form submission error", async () => {
    const mockHint = {
      uid: "test-uid",
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Test Phone",
      phoneNumber: "+1234567890",
    };

    const mockPhoneAction = vi.fn().mockResolvedValue("verification-id-123");
    vi.mocked(useSmsMultiFactorAssertionPhoneFormAction).mockReturnValue(mockPhoneAction);

    const mockVerifyAction = vi.fn().mockRejectedValue(new Error("Verification failed"));
    vi.mocked(useSmsMultiFactorAssertionVerifyFormAction).mockReturnValue(mockVerifyAction);

    const mockUI = createMockUI({
      locale: registerLocale("test", {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
      }),
    });

    render(
      createFirebaseUIProvider({
        children: <SmsMultiFactorAssertionForm hint={mockHint} />,
        ui: mockUI,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    // Simulate entering verification code
    const verificationInput = screen.getByLabelText("Verification Code");
    fireEvent.change(verificationInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("Verification failed")).toBeInTheDocument();
    });
  });
});
