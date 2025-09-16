import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber, confirmPhoneNumber, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailLink, signInAnonymously, signInWithProvider, completeEmailLinkSignIn,  } from "./auth";

// Mock the external dependencies
vi.mock("firebase/auth", () => ({
  signInWithCredential: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPhoneNumber: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  signInAnonymously: vi.fn(),
  signInWithRedirect: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
    credentialWithLink: vi.fn(),
  },
  PhoneAuthProvider: {
    credential: vi.fn(),
  },
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
import { signInWithCredential, EmailAuthProvider, PhoneAuthProvider, createUserWithEmailAndPassword as _createUserWithEmailAndPassword, signInWithPhoneNumber as _signInWithPhoneNumber, sendPasswordResetEmail as _sendPasswordResetEmail, sendSignInLinkToEmail as _sendSignInLinkToEmail, signInAnonymously as _signInAnonymously, signInWithRedirect, isSignInWithEmailLink as _isSignInWithEmailLink, UserCredential, Auth, ConfirmationResult, AuthProvider } from "firebase/auth";
import { hasBehavior, getBehavior } from "./behaviors";
import { handleFirebaseError } from "./errors";
import { FirebaseError } from "firebase/app";

import { createMockUI } from "~/tests/utils";

// TODO(ehesp): Add tests for handlePendingCredential.

describe("signInWithEmailAndPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call signInWithCredential with no behavior", async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(EmailAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(signInWithCredential).mockResolvedValue({ providerId: "password" } as UserCredential);

    const result = await signInWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    // Calls pending pre-signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(signInWithCredential).toHaveBeenCalledTimes(1);

    // Assert that the result is a valid UserCredential.
    expect(result.providerId).toBe("password");
  });

  it('should call the autoUpgradeAnonymousCredential behavior if enabled and return a value', async () => {
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

    // Only the `finally` block is called here.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([['idle']]);
  });

  it('should call the autoUpgradeAnonymousCredential behavior if enabled and handle no result from the behavior', async () => {
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

    expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(signInWithCredential).toHaveBeenCalledTimes(1);

    // Calls pending pre-signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it('should call handleFirebaseError if an error is thrown', async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    vi.mocked(hasBehavior).mockReturnValue(false);

    const error = new FirebaseError('foo/bar', 'Foo bar');

    vi.mocked(signInWithCredential).mockRejectedValue(error);

    await signInWithEmailAndPassword(mockUI, email, password);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"],["idle"]]);
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

  it('should call the autoUpgradeAnonymousCredential behavior if enabled and return a value', async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockReturnValue(true);
    const mockBehavior = vi.fn().mockResolvedValue({ providerId: "password" } as UserCredential);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    const result = await createUserWithEmailAndPassword(mockUI, email, password);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(result.providerId).toBe("password");

    // Only the `finally` block is called here.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([['idle']]);
  });

  it('should call the autoUpgradeAnonymousCredential behavior if enabled and handle no result from the behavior', async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    const credential = EmailAuthProvider.credential(email, password);
    vi.mocked(hasBehavior).mockReturnValue(true);
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

  it('should call handleFirebaseError if an error is thrown', async () => {
    const mockUI = createMockUI();
    const email = "test@example.com";
    const password = "password123";

    vi.mocked(hasBehavior).mockReturnValue(false);

    const error = new FirebaseError('foo/bar', 'Foo bar');

    vi.mocked(_createUserWithEmailAndPassword).mockRejectedValue(error);

    await createUserWithEmailAndPassword(mockUI, email, password);

    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"],["idle"]]);
  });
});

describe("signInWithPhoneNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update state and call signInWithPhoneNumber successfully", async () => {
    const mockUI = createMockUI();
    const phoneNumber = "+1234567890";
    const mockRecaptchaVerifier = {} as any;
    const mockConfirmationResult = {
      verificationId: "test-verification-id",
      confirm: vi.fn(),
    } as any;

    vi.mocked(_signInWithPhoneNumber).mockResolvedValue(mockConfirmationResult);

    const result = await signInWithPhoneNumber(mockUI, phoneNumber, mockRecaptchaVerifier);

    // Verify state management
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    // Verify the Firebase function was called with correct parameters
    expect(_signInWithPhoneNumber).toHaveBeenCalledWith(mockUI.auth, phoneNumber, mockRecaptchaVerifier);
    expect(_signInWithPhoneNumber).toHaveBeenCalledTimes(1);

    // Verify the result
    expect(result).toEqual(mockConfirmationResult);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI();
    const phoneNumber = "+1234567890";
    const mockRecaptchaVerifier = {} as any;
    const error = new FirebaseError('auth/invalid-phone-number', 'Invalid phone number');

    vi.mocked(_signInWithPhoneNumber).mockRejectedValue(error);

    await signInWithPhoneNumber(mockUI, phoneNumber, mockRecaptchaVerifier);

    // Verify error handling
    expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

    // Verify state management still happens
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should handle recaptcha verification errors", async () => {
    const mockUI = createMockUI();
    const phoneNumber = "+1234567890";
    const mockRecaptchaVerifier = {} as any;
    const error = new Error("reCAPTCHA verification failed");

    vi.mocked(_signInWithPhoneNumber).mockRejectedValue(error);

    await signInWithPhoneNumber(mockUI, phoneNumber, mockRecaptchaVerifier);

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

  it("should update state and call signInWithCredential with no behavior", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as Auth
    });
    const confirmationResult = { verificationId: "test-verification-id" } as ConfirmationResult;
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);
    vi.mocked(hasBehavior).mockReturnValue(false);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(signInWithCredential).mockResolvedValue({ providerId: "phone" } as UserCredential);

    const result = await confirmPhoneNumber(mockUI, confirmationResult, verificationCode);

    // Since currentUser is null, the behavior should not called.
    expect(hasBehavior).toHaveBeenCalledTimes(0);

    // Calls pending pre-signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

    expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(signInWithCredential).toHaveBeenCalledTimes(1);

    // Assert that the result is a valid UserCredential.
    expect(result.providerId).toBe("phone");
  });

  it("should call autoUpgradeAnonymousCredential behavior when user is anonymous", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: { isAnonymous: true } } as Auth
    });
    const confirmationResult = { verificationId: "test-verification-id" } as ConfirmationResult;
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);
    vi.mocked(hasBehavior).mockReturnValue(true);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    const mockBehavior = vi.fn().mockResolvedValue({ providerId: "phone" } as UserCredential);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    const result = await confirmPhoneNumber(mockUI, confirmationResult, verificationCode);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
    expect(result.providerId).toBe("phone");

    // Only the `finally` block is called here.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([['idle']]);
  });

  it("should not call behavior when user is not anonymous", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: { isAnonymous: false } } as Auth
    });
    const confirmationResult = { verificationId: "test-verification-id" } as ConfirmationResult;
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(signInWithCredential).mockResolvedValue({ providerId: "phone" } as UserCredential);

    const result = await confirmPhoneNumber(mockUI, confirmationResult, verificationCode);

    // Behavior should not be called when user is not anonymous
    expect(hasBehavior).not.toHaveBeenCalled();

    // Should proceed with normal sign-in flow
    expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    expect(result.providerId).toBe("phone");
  });

  it("should not call behavior when user is null", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as Auth
    });
    const confirmationResult = { verificationId: "test-verification-id" } as ConfirmationResult;
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    vi.mocked(signInWithCredential).mockResolvedValue({ providerId: "phone" } as UserCredential);

    const result = await confirmPhoneNumber(mockUI, confirmationResult, verificationCode);

    // Behavior should not be called when user is null
    expect(hasBehavior).not.toHaveBeenCalled();

    // Should proceed with normal sign-in flow
    expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    expect(result.providerId).toBe("phone");
  });

  it("should fall back to normal sign-in when behavior returns undefined", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: { isAnonymous: true } } as Auth
    });
    const confirmationResult = { verificationId: "test-verification-id" } as ConfirmationResult;
    const verificationCode = "123456";

    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);
    vi.mocked(hasBehavior).mockReturnValue(true);
    vi.mocked(PhoneAuthProvider.credential).mockReturnValue(credential);
    const mockBehavior = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getBehavior).mockReturnValue(mockBehavior);

    await confirmPhoneNumber(mockUI, confirmationResult, verificationCode);

    expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
    expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

    expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);

    expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
    expect(signInWithCredential).toHaveBeenCalledTimes(1);

    // Calls pending pre-signInWithCredential call, then idle after.
    expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
  });

  it("should call handleFirebaseError if an error is thrown", async () => {
    const mockUI = createMockUI({
      auth: { currentUser: null } as Auth
    });
    const confirmationResult = { verificationId: "test-verification-id" } as ConfirmationResult;
    const verificationCode = "123456";

    const error = new FirebaseError('auth/invalid-verification-code', 'Invalid verification code');

    vi.mocked(signInWithCredential).mockRejectedValue(error);

    await confirmPhoneNumber(mockUI, confirmationResult, verificationCode);

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
    const error = new FirebaseError('auth/user-not-found', 'User not found');

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
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com' },
        writable: true
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
        url: 'https://example.com',
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
      const error = new FirebaseError('auth/invalid-email', 'Invalid email address');

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
      
      Object.defineProperty(window, 'location', {
        value: { href: 'https://myapp.com/auth' },
        writable: true
      });

      vi.mocked(_sendSignInLinkToEmail).mockResolvedValue(undefined);

      await sendSignInLinkToEmail(mockUI, email);

      const expectedActionCodeSettings = {
        url: 'https://myapp.com/auth',
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

    it("should update state and call signInWithCredential with no behavior", async () => {
      const mockUI = createMockUI();
      const email = "test@example.com";
      const link = "https://example.com/auth?oobCode=abc123";

      const credential = EmailAuthProvider.credentialWithLink(email, link);
      vi.mocked(hasBehavior).mockReturnValue(false);
      vi.mocked(EmailAuthProvider.credentialWithLink).mockReturnValue(credential);
      vi.mocked(signInWithCredential).mockResolvedValue({ providerId: "emailLink" } as UserCredential);

      const result = await signInWithEmailLink(mockUI, email, link);

      expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

      // Calls pending pre-signInWithCredential call, then idle after.
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

      expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
      expect(signInWithCredential).toHaveBeenCalledTimes(1);

      // Assert that the result is a valid UserCredential.
      expect(result.providerId).toBe("emailLink");
    });

    it('should call the autoUpgradeAnonymousCredential behavior if enabled and return a value', async () => {
      const mockUI = createMockUI();
      const email = "test@example.com";
      const link = "https://example.com/auth?oobCode=abc123";

      const credential = EmailAuthProvider.credentialWithLink(email, link);
      vi.mocked(hasBehavior).mockReturnValue(true);
      vi.mocked(EmailAuthProvider.credentialWithLink).mockReturnValue(credential);
      const mockBehavior = vi.fn().mockResolvedValue({ providerId: "emailLink" } as UserCredential);
      vi.mocked(getBehavior).mockReturnValue(mockBehavior);

      const result = await signInWithEmailLink(mockUI, email, link);

      expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
      expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

      expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);
      expect(result.providerId).toBe("emailLink");

      // Only the `finally` block is called here.
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([['idle']]);
    });

    it('should call the autoUpgradeAnonymousCredential behavior if enabled and handle no result from the behavior', async () => {
      const mockUI = createMockUI();
      const email = "test@example.com";
      const link = "https://example.com/auth?oobCode=abc123";

      const credential = EmailAuthProvider.credentialWithLink(email, link);
      vi.mocked(hasBehavior).mockReturnValue(true);
      vi.mocked(EmailAuthProvider.credentialWithLink).mockReturnValue(credential);
      const mockBehavior = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getBehavior).mockReturnValue(mockBehavior);

      await signInWithEmailLink(mockUI, email, link);

      expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");
      expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousCredential");

      expect(mockBehavior).toHaveBeenCalledWith(mockUI, credential);

      expect(signInWithCredential).toHaveBeenCalledWith(mockUI.auth, credential);
      expect(signInWithCredential).toHaveBeenCalledTimes(1);

      // Calls pending pre-signInWithCredential call, then idle after.
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    });

    it("should call handleFirebaseError if an error is thrown", async () => {
      const mockUI = createMockUI();
      const email = "test@example.com";
      const link = "https://example.com/auth?oobCode=abc123";

      vi.mocked(hasBehavior).mockReturnValue(false);

      const error = new FirebaseError('auth/invalid-action-code', 'Invalid action code');

      vi.mocked(signInWithCredential).mockRejectedValue(error);

      await signInWithEmailLink(mockUI, email, link);

      expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
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

      // Verify state management
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

      // Verify the Firebase function was called with correct parameters
      expect(_signInAnonymously).toHaveBeenCalledWith(mockUI.auth);
      expect(_signInAnonymously).toHaveBeenCalledTimes(1);

      // Verify the result
      expect(result).toEqual(mockUserCredential);
    });

    it("should call handleFirebaseError if an error is thrown", async () => {
      const mockUI = createMockUI();
      const error = new FirebaseError('auth/operation-not-allowed', 'Anonymous sign-in is not enabled');

      vi.mocked(_signInAnonymously).mockRejectedValue(error);

      await signInAnonymously(mockUI);

      // Verify error handling
      expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

      // Verify state management still happens
      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    });
  });

  describe("signInWithProvider", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should call signInWithRedirect with no behavior", async () => {
      const mockUI = createMockUI();
      const provider = { providerId: "google.com" } as AuthProvider;

      vi.mocked(hasBehavior).mockReturnValue(false);
      vi.mocked(signInWithRedirect).mockResolvedValue(undefined as never);

      await signInWithProvider(mockUI, provider);

      expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousProvider");

      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

      expect(signInWithRedirect).toHaveBeenCalledWith(mockUI.auth, provider);
      expect(signInWithRedirect).toHaveBeenCalledTimes(1);
    });

    it("should call autoUpgradeAnonymousProvider behavior if enabled", async () => {
      const mockUI = createMockUI();
      const provider = { providerId: "google.com" } as AuthProvider;

      vi.mocked(hasBehavior).mockReturnValue(true);
      const mockBehavior = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getBehavior).mockReturnValue(mockBehavior);
      vi.mocked(signInWithRedirect).mockResolvedValue(undefined as never);

      await signInWithProvider(mockUI, provider);

      expect(hasBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousProvider");
      expect(getBehavior).toHaveBeenCalledWith(mockUI, "autoUpgradeAnonymousProvider");
      expect(mockBehavior).toHaveBeenCalledWith(mockUI, provider);

      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);

      expect(signInWithRedirect).toHaveBeenCalledWith(mockUI.auth, provider);
    });

    it("should call handleFirebaseError if an error is thrown", async () => {
      const mockUI = createMockUI();
      const provider = { providerId: "google.com" } as AuthProvider;
      const error = new FirebaseError('auth/operation-not-allowed', 'Google sign-in is not enabled');

      vi.mocked(hasBehavior).mockReturnValue(false);
      vi.mocked(signInWithRedirect).mockRejectedValue(error);

      await signInWithProvider(mockUI, provider);

      expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    });

    it("should handle behavior errors", async () => {
      const mockUI = createMockUI();
      const provider = { providerId: "google.com" } as AuthProvider;
      const error = new Error("Behavior error");

      vi.mocked(hasBehavior).mockReturnValue(true);
      const mockBehavior = vi.fn().mockRejectedValue(error);
      vi.mocked(getBehavior).mockReturnValue(mockBehavior);

      await signInWithProvider(mockUI, provider);

      expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["idle"]]);

      expect(signInWithRedirect).not.toHaveBeenCalled();
    });

    it("should handle errors from signInWithRedirect", async () => {
      const mockUI = createMockUI();
      const provider = { providerId: "google.com" } as AuthProvider;
      const error = new FirebaseError("auth/operation-not-allowed", "Operation not allowed");

      vi.mocked(hasBehavior).mockReturnValue(false);
      vi.mocked(signInWithRedirect).mockRejectedValue(error);

      await signInWithProvider(mockUI, provider);

      expect(handleFirebaseError).toHaveBeenCalledWith(mockUI, error);

      expect(vi.mocked(mockUI.setState).mock.calls).toEqual([["pending"], ["idle"]]);
    });
  });

// TODO(ehesp): Test completeEmailLinkSignIn - it depends on an internal function
// which you can't mock: https://vitest.dev/guide/mocking.html#mocking-pitfalls