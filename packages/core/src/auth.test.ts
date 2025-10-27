import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  verifyPhoneNumber,
  confirmPhoneNumber,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithCredential,
  signInAnonymously,
  signInWithProvider,
  signInWithCustomToken,
  generateTotpQrCode,
} from "./auth";

vi.mock("firebase/auth", () => ({
  signInWithCredential: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  signInAnonymously: vi.fn(),
  signInWithCustomToken: vi.fn(),
  signInWithRedirect: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
    credentialWithLink: vi.fn(),
  },
  PhoneAuthProvider: Object.assign(vi.fn(), {
    credential: vi.fn(),
  }),
  linkWithCredential: vi.fn(),
}));

vi.mock("./behaviors", () => ({
  hasBehavior: vi.fn(),
  getBehavior: vi.fn(),
}));

vi.mock("./errors", () => ({
  handleFirebaseError: vi.fn(),
}));

// Import the mocked functions
import {
  signInWithCredential as _signInWithCredential,
  EmailAuthProvider,
  PhoneAuthProvider,
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
  sendPasswordResetEmail as _sendPasswordResetEmail,
  sendSignInLinkToEmail as _sendSignInLinkToEmail,
  signInAnonymously as _signInAnonymously,
  signInWithCustomToken as _signInWithCustomToken,
  isSignInWithEmailLink as _isSignInWithEmailLink,
  UserCredential,
  Auth,
  AuthProvider,
  TotpSecret,
} from "firebase/auth";
import { hasBehavior, getBehavior } from "./behaviors";
import { handleFirebaseError } from "./errors";
import { FirebaseError } from "firebase/app";

import { createMockUI } from "~/tests/utils";

// TODO(ehesp): Add tests for handlePendingCredential.

describe("signInWithEmailAndPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call _signInWithCredential with no behavior", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(EmailAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(_signInWithCredential).mockResolvedValue({ providerId: "password" } as UserCredential);

    const result = await signInWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    // Calls pending pre-_signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Assert that the result is a valid UserCredential.
    expect(result.providerId).toBe("password");
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and return a value", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockReturnValue(true);
    const mockBehavior = vi.fn().mockResolvedValue({ providerId: "password" } as UserCredential);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    const result = await signInWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(result.providerId).toBe("password");

    // Auth method sets pending at start, then idle in finally block.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and handle no result from the behavior", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockReturnValue(true);
    const mockBehavior = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    await signInWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);

    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Calls pending pre-_signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    vi.mocked(hasBehavior).mockReturnValue(false);

    const error = new FirebaseError("foo/bar", "Foo bar");

    vi.mocked(_signInWithCredential).mockRejectedValue(error);

    await signInWithEmailAndPassword(mockUI, email, password);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("createUserWithEmailAndPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call createUserWithEmailAndPassword with no behavior", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(EmailAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(_createUserWithEmailAndPassword).mockResolvedValue({ providerId: "password" } as UserCredential);

    const result = await createUserWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    // Calls pending pre-createUserWithEmailAndPassword call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(_createUserWithEmailAndPassword).toHaveBeenCalledWith(mockUI.auth, email, password);
    expect(_createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);

    // Assert that the result is a valid UserCredential.
    expect(result.providerId).toBe("password");
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and return a value", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockImplementation((_, behavior) => {
      if (behavior === "autoUpgradeAnonymousCredential") return true;
      if (behavior === "requireDisplayName") return false;
      return false;
    });
    const mockBehavior = vi.fn().mockResolvedValue({ providerId: "password" } as UserCredential);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    const result = await createUserWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(result.providerId).toBe("password");

    // Auth method sets pending at start, then idle in finally block.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and handle no result from the behavior", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockImplementation((_, behavior) => {
      if (behavior === "autoUpgradeAnonymousCredential") return true;
      if (behavior === "requireDisplayName") return false;
      return false;
    });
    const mockBehavior = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    await createUserWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);

    expect(_createUserWithEmailAndPassword).toHaveBeenCalledWith(mockUI.auth, email, password);
    expect(_createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);

    // Calls pending pre-createUserWithEmailAndPassword call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    vi.mocked(hasBehavior).mockReturnValue(false);

    const error = new FirebaseError("foo/bar", "Foo bar");

    vi.mocked(_createUserWithEmailAndPassword).mockRejectedValue(error);

    await createUserWithEmailAndPassword(mockUI, email, password);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call handleFirebaseError when requireDisplayName behavior is enabled but no displayName provided", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    vi.mocked(hasBehavior).mockImplementation((_, behavior) => {
      if (behavior === "requireDisplayName") return true;
      if (behavior === "autoUpgradeAnonymousCredential") return false;
      return false;
    });

    await createUserWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "requireDisplayName");
    expect(_createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(handleFirebaseError).toHaveBeenCalled();
  });

  it("should call requireDisplayName behavior when enabled and displayName provided", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";
    const displayName = "John Doe";

    const mockRequireDisplayNameBehavior = vi.fn().mockResolvedValue(undefined);
    const mockResult = { providerId: "password", user: { uid: "user123" } } as UserCredential;

    vi.mocked(hasBehavior).mockImplementation((_, behavior) => {
      if (behavior === "requireDisplayName") return true;
      if (behavior === "autoUpgradeAnonymousCredential") return false;
      return false;
    });
    vi.mocked(getBehavior).mockReturnValue(mockRequireDisplayNameBehavior);
    vi.mocked(_createUserWithEmailAndPassword).mockResolvedValue(mockResult);

    const result = await createUserWithEmailAndPassword(mockUI, email, password, displayName);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "requireDisplayName");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "requireDisplayName");
    expect(mockRequireDisplayNameBehavior).toHaveBeenCalledWith(mockUI, mockResult.user, displayName);
    expect(result).toBe(mockResult);
  });

  it("should call requireDisplayName behavior after autoUpgradeAnonymousCredential when both enabled", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";
    const displayName = "John Doe";

    const mockAutoUpgradeBehavior = vi
      .fn()
      .mockResolvedValue({ providerId: "upgraded", user: { uid: "upgraded-user" } } as UserCredential);
    const mockRequireDisplayNameBehavior = vi.fn().mockResolvedValue(undefined);
    const credential = EmailAuthProvider.credential(email, password);

    vi.mocked(hasBehavior).mockImplementation((_, behavior) => {
      if (behavior === "requireDisplayName") return true;
      if (behavior === "autoUpgradeAnonymousCredential") return true;
      return false;
    });

    vi.mocked(getBehavior).mockImplementation((_, behavior) => {
      if (behavior === "autoUpgradeAnonymousCredential") return mockAutoUpgradeBehavior;
      if (behavior === "requireDisplayName") return mockRequireDisplayNameBehavior;
      return vi.fn();
    });

    vi.mocked(EmailAuthProvider.credential).mockReturnValue(credential);

    const result = await createUserWithEmailAndPassword(mockUI, email, password, displayName);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "requireDisplayName");
    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(mockAutoUpgradeBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(mockRequireDisplayNameBehavior).toHaveBeenCalledWith(mockUI, { uid: "upgraded-user" }, displayName);
    expect(result).toEqual({ providerId: "upgraded", user: { uid: "upgraded-user" } });
  });

  it("should not call requireDisplayName behavior when not enabled", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";
    const displayName = "John Doe";

    const mockResult = { providerId: "password", user: { uid: "user123" } } as UserCredential;

    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(_createUserWithEmailAndPassword).mockResolvedValue(mockResult);

    const result = await createUserWithEmailAndPassword(mockUI, email, password, displayName);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "requireDisplayName");
    expect(getBehavior).not.toHaveBeenCalledWith(mockUI, "requireDisplayName");
    expect(result).toBe(mockResult);
  });

  it("should handle requireDisplayName behavior errors", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";
    const displayName = "John Doe";

    const mockRequireDisplayNameBehavior = vi.fn().mockRejectedValue(new Error("Display name update failed"));
    const mockResult = { providerId: "password", user: { uid: "user123" } } as UserCredential;

    vi.mocked(hasBehavior).mockImplementation((_, behavior) => {
      if (behavior === "requireDisplayName") return true;
      if (behavior === "autoUpgradeAnonymousCredential") return false;
      return false;
    });
    vi.mocked(getBehavior).mockReturnValue(mockRequireDisplayNameBehavior);
    vi.mocked(_createUserWithEmailAndPassword).mockResolvedValue(mockResult);

    await createUserWithEmailAndPassword(mockUI, email, password, displayName);

    expect(mockRequireDisplayNameBehavior).toHaveBeenCalledWith(mockUI, mockResult.user, displayName);
    expect(handleFirebaseError).toHaveBeenCalled();
  });
});

describe("verifyPhoneNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call PhoneAuthProvider.verifyPhoneNumber successfully", async () => {
    const mockUI = createMockUI();
    const phoneNumber = "+1234567890";
    const mockAppVerifier = {} as any;
    const mockVerificationId = "test-verification-id";

    const mockVerifyPhoneNumber = vi.fn().mockResolvedValue(mockVerificationId);
    vi.mocked(PhoneAuthProvider).mockImplementation(
      () =>
        ({
          verifyPhoneNumber: mockVerifyPhoneNumber,
        }) as any
    );

    const result = await verifyPhoneNumber(mockUI, phoneNumber, mockAppVerifier);

    // Verify state management
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    // Verify the PhoneAuthProvider was created and verifyPhoneNumber was called
    expect(PhoneAuthProvider).toHaveBeenCalledWith(mockUI.auth);
    expect(mockVerifyPhoneNumber).toHaveBeenCalledWith(phoneNumber, mockAppVerifier);
    expect(mockVerifyPhoneNumber).toHaveBeenCalledTimes(1);

    // Verify the result
    expect(result).toEqual(mockVerificationId);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const phoneNumber = "+1234567890";
    const mockAppVerifier = {} as any;
    const error = new FirebaseError("auth/invalid-phone-number", "Invalid phone number");

    const mockVerifyPhoneNumber = vi.fn().mockRejectedValue(error);
    vi.mocked(PhoneAuthProvider).mockImplementation(
      () =>
        ({
          verifyPhoneNumber: mockVerifyPhoneNumber,
        }) as any
    );

    await verifyPhoneNumber(mockUI, phoneNumber, mockAppVerifier);

    // Verify error handling
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    // Verify state management still happens
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should handle recaptcha verification errors", async () => {
    const mockUI = createMockUI();
    const phoneNumber = "+1234567890";
    const mockAppVerifier = {} as any;
    const error = new Error("reCAPTCHA verification failed");

    const mockVerifyPhoneNumber = vi.fn().mockRejectedValue(error);
    vi.mocked(PhoneAuthProvider).mockImplementation(
      () =>
        ({
          verifyPhoneNumber: mockVerifyPhoneNumber,
        }) as any
    );

    await verifyPhoneNumber(mockUI, phoneNumber, mockAppVerifier);

    // Verify error handling
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    // Verify state management
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("confirmPhoneNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call _signInWithCredential with no behavior", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as Auth,
    });
    const verificationId = "test-verification-id";
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(_signInWithCredential).mockResolvedValue({ providerId: "phone" } as UserCredential);

    const result = await confirmPhoneNumber(mockUI, verificationId, verificationCode);

    // Since currentUser is null, the behavior should not called.
    expect(hasBehavior).toHaveBeenCalledTimes(0);

    // Calls pending pre-_signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Assert that the result is a valid UserCredential.
    expect(result.providerId).toBe("phone");
  });

  it("should call autoUpgradeAnonymousCredential behavior when user is anonymous", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: { isAnonymous: true } } as Auth,
    });
    const verificationId = "test-verification-id";
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    vi.mocked(hasBehavior).mockReturnValue(true);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    const mockBehavior = vi.fn().mockResolvedValue({ providerId: "phone" } as UserCredential);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    const result = await confirmPhoneNumber(mockUI, verificationId, verificationCode);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(result.providerId).toBe("phone");

    // Auth method sets pending at start, then idle in finally block.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should not call behavior when user is not anonymous", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: { isAnonymous: false } } as Auth,
    });
    const verificationId = "test-verification-id";
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(_signInWithCredential).mockResolvedValue({ providerId: "phone" } as UserCredential);

    const result = await confirmPhoneNumber(mockUI, verificationId, verificationCode);

    // Behavior should not be called when user is not anonymous
    expect(hasBehavior).not.toHaveBeenCalled();

    // Should proceed with normal sign-in flow
    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    expect(result.providerId).toBe("phone");
  });

  it("should not call behavior when user is null", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as Auth,
    });
    const verificationId = "test-verification-id";
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(_signInWithCredential).mockResolvedValue({ providerId: "phone" } as UserCredential);

    const result = await confirmPhoneNumber(mockUI, verificationId, verificationCode);

    // Behavior should not be called when user is null
    expect(hasBehavior).not.toHaveBeenCalled();

    // Should proceed with normal sign-in flow
    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    expect(result.providerId).toBe("phone");
  });

  it("should fall back to normal sign-in when behavior returns undefined", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: { isAnonymous: true } } as Auth,
    });
    const verificationId = "test-verification-id";
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    vi.mocked(hasBehavior).mockReturnValue(true);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    const mockBehavior = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    await confirmPhoneNumber(mockUI, verificationId, verificationCode);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);

    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Calls pending pre-_signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as Auth,
    });
    const verificationId = "test-verification-id";
    const verificationCode = "123456";

    const error = new FirebaseError("auth/invalid-verification-code", "Invalid verification code");

    vi.mocked(_signInWithCredential).mockRejectedValue(error);

    await confirmPhoneNumber(mockUI, verificationId, verificationCode);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("sendPasswordResetEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call sendPasswordResetEmail successfully", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";

    vi.mocked(_sendPasswordResetEmail).mockResolvedValue(undefined);

    await sendPasswordResetEmail(mockUI, email);

    // Verify state management
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    // Verify the Firebase function was called with correct parameters
    expect(_sendPasswordResetEmail).toHaveBeenCalledWith(mockUI.auth, email);
    expect(_sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const error = new FirebaseError("auth/user-not-found", "User not found");

    vi.mocked(_sendPasswordResetEmail).mockRejectedValue(error);

    await sendPasswordResetEmail(mockUI, email);

    // Verify error handling
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    // Verify state management still happens
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("sendSignInLinkToEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com" },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up localStorage after each test
    window.localStorage.clear();
  });

  it("should update state and call sendSignInLinkToEmail successfully", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";

    vi.mocked(_sendSignInLinkToEmail).mockResolvedValue(undefined);

    await sendSignInLinkToEmail(mockUI, email);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    const expectedActionCodeSettings = {
      url: "https://example.com",
      handleCodeInApp: true,
    };
    expect(_sendSignInLinkToEmail).toHaveBeenCalledWith(mockUI.auth, email, expectedActionCodeSettings);
    expect(_sendSignInLinkToEmail).toHaveBeenCalledTimes(1);

    // Verify email is stored in localStorage
    expect(window.localStorage.getItem("emailForSignIn")).toBe(email);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const error = new FirebaseError("auth/invalid-email", "Invalid email address");

    vi.mocked(_sendSignInLinkToEmail).mockRejectedValue(error);

    await sendSignInLinkToEmail(mockUI, email);

    // Verify error handling
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    // Verify state management still happens
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    // Verify email is NOT stored in localStorage on error
    expect(window.localStorage.getItem("emailForSignIn")).toBeNull();
  });

  it("should use current window location for action code settings", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";

    Object.defineProperty(window, "location", {
      value: { href: "https://myapp.com/auth" },
      writable: true,
    });

    vi.mocked(_sendSignInLinkToEmail).mockResolvedValue(undefined);

    await sendSignInLinkToEmail(mockUI, email);

    const expectedActionCodeSettings = {
      url: "https://myapp.com/auth",
      handleCodeInApp: true,
    };
    expect(_sendSignInLinkToEmail).toHaveBeenCalledWith(mockUI.auth, email, expectedActionCodeSettings);
  });

  it("should overwrite existing email in localStorage", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const existingEmail = "old@example.com";

    window.localStorage.setItem("emailForSignIn", existingEmail);

    vi.mocked(_sendSignInLinkToEmail).mockResolvedValue(undefined);

    await sendSignInLinkToEmail(mockUI, email);

    expect(window.localStorage.getItem("emailForSignIn")).toBe(email);
  });
});

describe("signInWithEmailLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create credential and call signInWithCredential with no behavior", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const link = "https://example.com/auth?oobCode=abc123";

    const credential = EmailAuthProvider.credentialWithLink(email, link);
    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(EmailAuthProvider.credentialWithLink).mockReturnValue(credential);
    vi.mocked(_signInWithCredential).mockResolvedValue({ providerId: "emailLink" } as UserCredential);

    const result = await signInWithEmailLink(mockUI, email, link);

    // Verify credential was created correctly
    expect(EmailAuthProvider.credentialWithLink).toHaveBeenCalledWith(email, link);

    // Verify our signInWithCredential function was called (which internally calls Firebase)
    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Assert that the result is a valid UserCredential.
    expect(result.providerId).toBe("emailLink");
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and return a value", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const link = "https://example.com/auth?oobCode=abc123";

    const credential = EmailAuthProvider.credentialWithLink(email, link);
    vi.mocked(hasBehavior).mockReturnValue(true);
    vi.mocked(EmailAuthProvider.credentialWithLink).mockReturnValue(credential);
    const mockBehavior = vi.fn().mockResolvedValue({ providerId: "emailLink" } as UserCredential);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    const result = await signInWithEmailLink(mockUI, email, link);

    // Verify credential was created correctly
    expect(EmailAuthProvider.credentialWithLink).toHaveBeenCalledWith(email, link);

    // Verify our signInWithCredential function was called with behavior
    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(result.providerId).toBe("emailLink");

    // Auth method sets pending at start, then idle in finally block.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and handle no result from the behavior", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const link = "https://example.com/auth?oobCode=abc123";

    const credential = EmailAuthProvider.credentialWithLink(email, link);
    vi.mocked(hasBehavior).mockReturnValue(true);
    vi.mocked(EmailAuthProvider.credentialWithLink).mockReturnValue(credential);
    const mockBehavior = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    await signInWithEmailLink(mockUI, email, link);

    // Verify credential was created correctly
    expect(EmailAuthProvider.credentialWithLink).toHaveBeenCalledWith(email, link);

    // Verify our signInWithCredential function was called with behavior
    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);

    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Calls pending pre-_signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const link = "https://example.com/auth?oobCode=abc123";

    vi.mocked(hasBehavior).mockReturnValue(false);

    const error = new FirebaseError("auth/invalid-action-code", "Invalid action code");

    vi.mocked(_signInWithCredential).mockRejectedValue(error);

    await signInWithEmailLink(mockUI, email, link);

    // Verify credential was created correctly
    expect(EmailAuthProvider.credentialWithLink).toHaveBeenCalledWith(email, link);

    // Verify our signInWithCredential function was called and error was handled
    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("signInWithCredential", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call _signInWithCredential with no behavior", async () => {
    const mockUI = createMockUI();
    const credential = { providerId: "password" } as any;

    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(_signInWithCredential).mockResolvedValue({ providerId: "password" } as UserCredential);

    const result = await signInWithCredential(mockUI, credential);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    // Calls pending pre-_signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Assert that the result is a valid UserCredential.
    expect(result.providerId).toBe("password");
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and return a value", async () => {
    const mockUI = createMockUI();
    const credential = { providerId: "password" } as any;

    vi.mocked(hasBehavior).mockReturnValue(true);
    const mockBehavior = vi.fn().mockResolvedValue({ providerId: "password" } as UserCredential);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    const result = await signInWithCredential(mockUI, credential);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(result.providerId).toBe("password");

    // Auth method sets pending at start, then idle in finally block.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call the autoUpgradeAnonymousCredential behavior if enabled and handle no result from the behavior", async () => {
    const mockUI = createMockUI();
    const credential = { providerId: "password" } as any;

    vi.mocked(hasBehavior).mockReturnValue(true);
    const mockBehavior = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    await signInWithCredential(mockUI, credential);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);

    expect(_signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(_signInWithCredential).toHaveBeenCalledTimes(1);

    // Calls pending pre-_signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const credential = { providerId: "password" } as any;

    vi.mocked(hasBehavior).mockReturnValue(false);

    const error = new FirebaseError("auth/invalid-credential", "Invalid credential");

    vi.mocked(_signInWithCredential).mockRejectedValue(error);

    await signInWithCredential(mockUI, credential);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should handle behavior errors", async () => {
    const mockUI = createMockUI();
    const credential = { providerId: "password" } as any;
    const error = new Error("Behavior error");

    vi.mocked(hasBehavior).mockReturnValue(true);
    const mockBehavior = vi.fn().mockRejectedValue(error);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    await signInWithCredential(mockUI, credential);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(_signInWithCredential).not.toHaveBeenCalled();
  });
});

describe("signInAnonymously", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call signInAnonymously successfully", async () => {
    const mockUI = createMockUI();
    const mockUserCredential = {
      user: { uid: "anonymous-uid", isAnonymous: true },
      providerId: "anonymous",
      operationType: "signIn",
    } as UserCredential;

    vi.mocked(_signInAnonymously).mockResolvedValue(mockUserCredential);

    const result = await signInAnonymously(mockUI);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(_signInAnonymously).toHaveBeenCalledWith(mockUI.auth);
    expect(_signInAnonymously).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockUserCredential);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const error = new FirebaseError("auth/operation-not-allowed", "Anonymous sign-in is not enabled");

    vi.mocked(_signInAnonymously).mockRejectedValue(error);

    await signInAnonymously(mockUI);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("signInWithCustomToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call signInWithCustomToken successfully", async () => {
    const mockUI = createMockUI();
    const customToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...";
    const mockUserCredential = {
      user: { uid: "custom-user-uid", email: "user@example.com" },
      providerId: "custom",
      operationType: "signIn",
    } as UserCredential;

    vi.mocked(_signInWithCustomToken).mockResolvedValue(mockUserCredential);

    const result = await signInWithCustomToken(mockUI, customToken);

    expect(mockUI.setRedirectError).toHaveBeenCalledWith(undefined);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(_signInWithCustomToken).toHaveBeenCalledWith(mockUI.auth, customToken);
    expect(_signInWithCustomToken).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockUserCredential);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const customToken = "invalid-token";
    const error = new FirebaseError("auth/invalid-custom-token", "Invalid custom token");

    vi.mocked(_signInWithCustomToken).mockRejectedValue(error);

    await signInWithCustomToken(mockUI, customToken);

    expect(mockUI.setRedirectError).toHaveBeenCalledWith(undefined);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should handle network errors", async () => {
    const mockUI = createMockUI();
    const customToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...";
    const error = new Error("Network error");

    vi.mocked(_signInWithCustomToken).mockRejectedValue(error);

    await signInWithCustomToken(mockUI, customToken);

    // Verify redirect error is cleared even when network error occurs
    expect(mockUI.setRedirectError).toHaveBeenCalledWith(undefined);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should handle expired custom token", async () => {
    const mockUI = createMockUI();
    const customToken = "expired-token";
    const error = new FirebaseError("auth/custom-token-mismatch", "Custom token expired");

    vi.mocked(_signInWithCustomToken).mockRejectedValue(error);

    await signInWithCustomToken(mockUI, customToken);

    // Verify redirect error is cleared even when token is expired
    expect(mockUI.setRedirectError).toHaveBeenCalledWith(undefined);
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("signInWithProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call providerSignInStrategy behavior when no autoUpgradeAnonymousProvider", async () => {
    const mockUI = createMockUI();
    const provider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "test-user" } } as UserCredential;

    // Mock behaviors - no autoUpgradeAnonymousProvider
    vi.mocked(hasBehavior).mockReturnValue(false);

    const mockProviderStrategy = vi.fn().mockResolvedValue(mockResult);
    vi.mocked(getBehavior).mockReturnValue(mockProviderStrategy);

    const result = await signInWithProvider(mockUI, provider);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousProvider");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "providerSignInStrategy");
    expect(mockProviderStrategy).toHaveBeenCalledWith(mockUI, provider);
    expect(result).toBe(mockResult);
  });

  it("should call autoUpgradeAnonymousProvider behavior if enabled and return result", async () => {
    const mockUI = createMockUI();
    const provider = { providerId: "google.com" } as AuthProvider;
    const mockCredential = { user: { uid: "upgraded-user" } } as UserCredential;

    vi.mocked(hasBehavior).mockReturnValue(true);
    const mockUpgradeBehavior = vi.fn().mockResolvedValue(mockCredential);
    vi.mocked(getBehavior).mockReturnValue(mockUpgradeBehavior);

    const result = await signInWithProvider(mockUI, provider);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousProvider");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousProvider");
    expect(mockUpgradeBehavior).toHaveBeenCalledWith(mockUI, provider);
    expect(result).toBe(mockCredential);
  });

  it("should call providerSignInStrategy when autoUpgradeAnonymousProvider returns undefined", async () => {
    const mockUI = createMockUI();
    const provider = { providerId: "google.com" } as AuthProvider;
    const mockResult = { user: { uid: "test-user" } } as UserCredential;

    // Mock behaviors - autoUpgradeAnonymousProvider enabled but returns undefined
    vi.mocked(hasBehavior).mockReturnValue(true);

    const mockUpgradeBehavior = vi.fn().mockResolvedValue(undefined);
    const mockProviderStrategy = vi.fn().mockResolvedValue(mockResult);
    vi.mocked(getBehavior).mockImplementation((_ui, behavior) => {
      if (behavior === "autoUpgradeAnonymousProvider") return mockUpgradeBehavior;
      if (behavior === "providerSignInStrategy") return mockProviderStrategy;
      return vi.fn();
    });

    const result = await signInWithProvider(mockUI, provider);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousProvider");
    expect(mockUpgradeBehavior).toHaveBeenCalledWith(mockUI, provider);
    expect(mockProviderStrategy).toHaveBeenCalledWith(mockUI, provider);
    expect(result).toBe(mockResult);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const provider = { providerId: "google.com" } as AuthProvider;
    const error = new FirebaseError("auth/operation-not-allowed", "Google sign-in is not enabled");

    vi.mocked(hasBehavior).mockReturnValue(false);
    const mockProviderStrategy = vi.fn().mockRejectedValue(error);
    vi.mocked(getBehavior).mockReturnValue(mockProviderStrategy);

    await signInWithProvider(mockUI, provider);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });
});

describe("generateTotpQrCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate QR code successfully with authenticated user", () => {
    const mockUI = createMockUI({
      auth: { currentUser: { email: "test@example.com" } } as Auth,
    });
    const mockSecret = {
      generateQrCodeUrl: vi.fn().mockReturnValue("otpauth://totp/test@example.com?secret=ABC123&issuer=TestApp"),
    } as unknown as TotpSecret;

    const result = generateTotpQrCode(mockUI, mockSecret);

    expect(mockSecret.generateQrCodeUrl).toHaveBeenCalledWith("test@example.com", undefined);
    expect(result).toMatch(/^data:image\/gif;base64,/);
  });

  it("should generate QR code with custom account name and issuer", () => {
    const mockUI = createMockUI({
      auth: { currentUser: { email: "test@example.com" } } as Auth,
    });
    const mockSecret = {
      generateQrCodeUrl: vi.fn().mockReturnValue("otpauth://totp/CustomAccount?secret=ABC123&issuer=CustomIssuer"),
    } as unknown as TotpSecret;

    const result = generateTotpQrCode(mockUI, mockSecret, "CustomAccount", "CustomIssuer");

    expect(mockSecret.generateQrCodeUrl).toHaveBeenCalledWith("CustomAccount", "CustomIssuer");
    expect(result).toMatch(/^data:image\/gif;base64,/);
  });

  it("should use user email as account name when no custom account name provided", () => {
    const mockUI = createMockUI({
      auth: { currentUser: { email: "user@example.com" } } as Auth,
    });
    const mockSecret = {
      generateQrCodeUrl: vi.fn().mockReturnValue("otpauth://totp/user@example.com?secret=ABC123"),
    } as unknown as TotpSecret;

    generateTotpQrCode(mockUI, mockSecret);

    expect(mockSecret.generateQrCodeUrl).toHaveBeenCalledWith("user@example.com", undefined);
  });

  it("should use empty string as account name when user has no email", () => {
    const mockUI = createMockUI({
      auth: { currentUser: { email: null } } as Auth,
    });
    const mockSecret = {
      generateQrCodeUrl: vi.fn().mockReturnValue("otpauth://totp/?secret=ABC123"),
    } as unknown as TotpSecret;

    generateTotpQrCode(mockUI, mockSecret);

    expect(mockSecret.generateQrCodeUrl).toHaveBeenCalledWith("", undefined);
  });

  it("should throw error when user is not authenticated", () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as Auth,
    });
    const mockSecret = {
      generateQrCodeUrl: vi.fn(),
    } as unknown as TotpSecret;

    expect(() => generateTotpQrCode(mockUI, mockSecret)).toThrow(
      "User must be authenticated to generate a TOTP QR code"
    );
    expect(mockSecret.generateQrCodeUrl).not.toHaveBeenCalled();
  });

  it("should throw error when currentUser is undefined", () => {
    const mockUI = createMockUI({
      auth: { currentUser: undefined } as unknown as Auth,
    });
    const mockSecret = {
      generateQrCodeUrl: vi.fn(),
    } as unknown as TotpSecret;

    expect(() => generateTotpQrCode(mockUI, mockSecret)).toThrow(
      "User must be authenticated to generate a TOTP QR code"
    );
    expect(mockSecret.generateQrCodeUrl).not.toHaveBeenCalled();
  });
});
