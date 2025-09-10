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

/// <reference lib="dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Auth,
  EmailAuthProvider,
  PhoneAuthProvider,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  getAuth,
  isSignInWithEmailLink as fbIsSignInWithEmailLink,
  linkWithCredential,
  linkWithRedirect,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  sendSignInLinkToEmail as fbSendSignInLinkToEmail,
  signInAnonymously as fbSignInAnonymously,
  signInWithCredential,
  signInWithPhoneNumber as fbSignInWithPhoneNumber,
  signInWithRedirect,
} from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  confirmPhoneNumber,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInAnonymously,
  signInWithOAuth,
  completeEmailLinkSignIn,
} from '../../src/auth';
import { FirebaseUIConfiguration } from '../../src/config';
import { english } from '@firebase-ui/translations';

// Mock all Firebase Auth functions
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...(actual as object),
    getAuth: vi.fn(),
    signInWithCredential: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPhoneNumber: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    sendSignInLinkToEmail: vi.fn(),
    isSignInWithEmailLink: vi.fn(),
    signInAnonymously: vi.fn(),
    linkWithCredential: vi.fn(),
    linkWithRedirect: vi.fn(),
    signInWithRedirect: vi.fn(),
    EmailAuthProvider: {
      credential: vi.fn(),
      credentialWithLink: vi.fn(),
    },
    PhoneAuthProvider: {
      credential: vi.fn(),
    },
  };
});

describe('Firebase UI Auth', () => {
  let mockAuth: Auth;
  let mockUi: FirebaseUIConfiguration;

  const mockCredential = { type: 'password', token: 'mock-token' };
  const mockUserCredential = { user: { uid: 'mock-uid' } };
  const mockConfirmationResult = { verificationId: 'mock-verification-id' };
  const mockError = { name: 'FirebaseError', code: 'auth/user-not-found' };
  const mockProvider = { providerId: 'google.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = { currentUser: null } as Auth;
    window.localStorage.clear();
    window.sessionStorage.clear();
    (EmailAuthProvider.credential as any).mockReturnValue(mockCredential);
    (EmailAuthProvider.credentialWithLink as any).mockReturnValue(mockCredential);
    (PhoneAuthProvider.credential as any).mockReturnValue(mockCredential);
    (getAuth as any).mockReturnValue(mockAuth);

    // Create a mock FirebaseUIConfiguration
    mockUi = {
      app: { name: 'test' } as any,
      getAuth: () => mockAuth,
      setLocale: vi.fn(),
      state: 'idle',
      setState: vi.fn(),
      locale: 'en-US',
      translations: { 'en-US': english.translations },
      behaviors: {},
      recaptchaMode: 'normal',
    };
  });

  describe('signInWithEmailAndPassword', () => {
    it('should sign in with email and password', async () => {
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);

      const result = await signInWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(EmailAuthProvider.credential).toHaveBeenCalledWith('test@test.com', 'password');
      expect(signInWithCredential).toHaveBeenCalledWith(mockAuth, mockCredential);
      expect(result).toBe(mockUserCredential);
    });

    it('should upgrade anonymous user when enabled', async () => {
      mockAuth = { currentUser: { isAnonymous: true } } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      (linkWithCredential as any).mockResolvedValue(mockUserCredential);

      mockUi.behaviors.autoUpgradeAnonymousCredential = vi.fn().mockResolvedValue(mockUserCredential);

      const result = await signInWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(mockUi.behaviors.autoUpgradeAnonymousCredential).toHaveBeenCalledWith(mockUi, mockCredential);
      expect(result).toBe(mockUserCredential);
    });
  });

  describe('createUserWithEmailAndPassword', () => {
    it('should create user with email and password', async () => {
      (fbCreateUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);

      const result = await createUserWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(fbCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password');
      expect(result).toBe(mockUserCredential);
    });

    it('should upgrade anonymous user when enabled', async () => {
      mockAuth = { currentUser: { isAnonymous: true } } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      (linkWithCredential as any).mockResolvedValue(mockUserCredential);

      mockUi.behaviors.autoUpgradeAnonymousCredential = vi.fn().mockResolvedValue(mockUserCredential);

      const result = await createUserWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(mockUi.behaviors.autoUpgradeAnonymousCredential).toHaveBeenCalledWith(mockUi, mockCredential);
      expect(result).toBe(mockUserCredential);
    });
  });

  describe('signInWithPhoneNumber', () => {
    it('should initiate phone number sign in', async () => {
      (fbSignInWithPhoneNumber as any).mockResolvedValue(mockConfirmationResult);
      const mockRecaptcha = { type: 'recaptcha' };

      const result = await signInWithPhoneNumber(mockUi, '+1234567890', mockRecaptcha as any);

      expect(fbSignInWithPhoneNumber).toHaveBeenCalledWith(mockAuth, '+1234567890', mockRecaptcha);
      expect(result).toBe(mockConfirmationResult);
    });
  });

  describe('confirmPhoneNumber', () => {
    it('should confirm phone number sign in', async () => {
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);

      const result = await confirmPhoneNumber(mockUi, { verificationId: 'mock-id' } as any, '123456');

      expect(PhoneAuthProvider.credential).toHaveBeenCalledWith('mock-id', '123456');
      expect(signInWithCredential).toHaveBeenCalledWith(mockAuth, mockCredential);
      expect(result).toBe(mockUserCredential);
    });

    it('should upgrade anonymous user when enabled', async () => {
      mockAuth = { currentUser: { isAnonymous: true } } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      (linkWithCredential as any).mockResolvedValue(mockUserCredential);

      mockUi.behaviors.autoUpgradeAnonymousCredential = vi.fn().mockResolvedValue(mockUserCredential);

      const result = await confirmPhoneNumber(mockUi, { verificationId: 'mock-id' } as any, '123456');

      expect(mockUi.behaviors.autoUpgradeAnonymousCredential).toHaveBeenCalled();
      expect(result).toBe(mockUserCredential);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      (fbSendPasswordResetEmail as any).mockResolvedValue(undefined);

      await sendPasswordResetEmail(mockUi, 'test@test.com');

      expect(fbSendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'test@test.com');
    });
  });

  describe('sendSignInLinkToEmail', () => {
    it('should send sign in link to email', async () => {
      (fbSendSignInLinkToEmail as any).mockResolvedValue(undefined);

      const expectedActionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(mockUi, 'test@test.com');

      expect(fbSendSignInLinkToEmail).toHaveBeenCalledWith(mockAuth, 'test@test.com', expectedActionCodeSettings);
      expect(mockUi.setState).toHaveBeenCalledWith('sending-sign-in-link-to-email');
      expect(mockUi.setState).toHaveBeenCalledWith('idle');
      expect(window.localStorage.getItem('emailForSignIn')).toBe('test@test.com');
    });
  });

  describe('signInWithEmailLink', () => {
    it('should sign in with email link', async () => {
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);

      const result = await signInWithEmailLink(mockUi, 'test@test.com', 'mock-link');

      expect(EmailAuthProvider.credentialWithLink).toHaveBeenCalledWith('test@test.com', 'mock-link');
      expect(signInWithCredential).toHaveBeenCalledWith(mockAuth, mockCredential);
      expect(result).toBe(mockUserCredential);
    });

    it('should upgrade anonymous user when enabled', async () => {
      mockAuth = { currentUser: { isAnonymous: true } } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      window.localStorage.setItem('emailLinkAnonymousUpgrade', 'true');
      (linkWithCredential as any).mockResolvedValue(mockUserCredential);

      mockUi.behaviors.autoUpgradeAnonymousCredential = vi.fn().mockResolvedValue(mockUserCredential);

      const result = await signInWithEmailLink(mockUi, 'test@test.com', 'mock-link');

      expect(mockUi.behaviors.autoUpgradeAnonymousCredential).toHaveBeenCalled();
      expect(result).toBe(mockUserCredential);
    });
  });

  describe('signInAnonymously', () => {
    it('should sign in anonymously', async () => {
      (fbSignInAnonymously as any).mockResolvedValue(mockUserCredential);

      const result = await signInAnonymously(mockUi);

      expect(fbSignInAnonymously).toHaveBeenCalledWith(mockAuth);
      expect(result).toBe(mockUserCredential);
    });

    it('should handle operation not allowed error', async () => {
      const operationNotAllowedError = { name: 'FirebaseError', code: 'auth/operation-not-allowed' };
      (fbSignInAnonymously as any).mockRejectedValue(operationNotAllowedError);

      await expect(signInAnonymously(mockUi)).rejects.toThrow();
    });

    it('should handle admin restricted operation error', async () => {
      const adminRestrictedError = { name: 'FirebaseError', code: 'auth/admin-restricted-operation' };
      (fbSignInAnonymously as any).mockRejectedValue(adminRestrictedError);

      await expect(signInAnonymously(mockUi)).rejects.toThrow();
    });
  });

  describe('Anonymous User Upgrade', () => {
    it('should handle upgrade with existing email', async () => {
      mockAuth = { currentUser: { isAnonymous: true } } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      const emailExistsError = { name: 'FirebaseError', code: 'auth/email-already-in-use' };
      (fbCreateUserWithEmailAndPassword as any).mockRejectedValue(emailExistsError);

      await expect(createUserWithEmailAndPassword(mockUi, 'existing@test.com', 'password')).rejects.toThrow();
    });

    it('should handle upgrade of non-anonymous user', async () => {
      mockAuth = { currentUser: { isAnonymous: false } } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      (fbCreateUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);

      const result = await createUserWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(fbCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password');
      expect(result).toBe(mockUserCredential);
    });

    it('should handle null user during upgrade', async () => {
      mockAuth = { currentUser: null } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      (fbCreateUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);

      const result = await createUserWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(fbCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password');
      expect(result).toBe(mockUserCredential);
    });
  });

  describe('signInWithOAuth', () => {
    it('should sign in with OAuth provider', async () => {
      (signInWithRedirect as any).mockResolvedValue(undefined);

      await signInWithOAuth(mockUi, mockProvider as any);

      expect(signInWithRedirect).toHaveBeenCalledWith(mockAuth, mockProvider);
    });

    it('should upgrade anonymous user when enabled', async () => {
      mockAuth = { currentUser: { isAnonymous: true } } as Auth;
      (getAuth as any).mockReturnValue(mockAuth);
      (linkWithRedirect as any).mockResolvedValue(undefined);

      mockUi.behaviors.autoUpgradeAnonymousProvider = vi.fn();

      await signInWithOAuth(mockUi, mockProvider as any);

      expect(mockUi.behaviors.autoUpgradeAnonymousProvider).toHaveBeenCalledWith(mockUi, mockProvider);
    });
  });

  describe('completeEmailLinkSignIn', () => {
    it('should complete email link sign in when valid', async () => {
      (fbIsSignInWithEmailLink as any).mockReturnValue(true);
      window.localStorage.setItem('emailForSignIn', 'test@test.com');
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);

      const result = await completeEmailLinkSignIn(mockUi, 'https://example.com?oob=code');

      expect(fbIsSignInWithEmailLink).toHaveBeenCalled();
      expect(result).toBe(mockUserCredential);
    });

    it('should clean up all storage items after sign in attempt', async () => {
      (fbIsSignInWithEmailLink as any).mockReturnValue(true);
      window.localStorage.setItem('emailForSignIn', 'test@test.com');
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);

      await completeEmailLinkSignIn(mockUi, 'https://example.com?oob=code');

      expect(window.localStorage.getItem('emailForSignIn')).toBeNull();
    });

    it('should return null when not a valid sign in link', async () => {
      (fbIsSignInWithEmailLink as any).mockReturnValue(false);

      const result = await completeEmailLinkSignIn(mockUi, 'https://example.com?invalidlink=true');

      expect(result).toBeNull();
    });

    it('should return null when no email in storage', async () => {
      (fbIsSignInWithEmailLink as any).mockReturnValue(true);
      window.localStorage.clear();

      const result = await completeEmailLinkSignIn(mockUi, 'https://example.com?oob=code');

      expect(result).toBeNull();
    });

    it('should clean up storage even when sign in fails', async () => {
      // Patch localStorage for testing
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('test@test.com'),
        removeItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

      // Make isSignInWithEmailLink return true
      (fbIsSignInWithEmailLink as any).mockReturnValue(true);

      // Make signInWithCredential throw an error
      const error = new Error('Sign in failed');
      (signInWithCredential as any).mockRejectedValue(error);

      // Mock handleFirebaseError to throw our actual error instead
      vi.mock('../../src/errors', async () => {
        const actual = await vi.importActual('../../src/errors');
        return {
          ...(actual as object),
          handleFirebaseError: vi.fn().mockImplementation((ui, e) => {
            throw e;
          }),
        };
      });

      // Use rejects matcher with our specific error
      await expect(completeEmailLinkSignIn(mockUi, 'https://example.com?oob=code')).rejects.toThrow('Sign in failed');

      // Check localStorage was cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('emailForSignIn');
    });
  });

  describe('Pending Credential Handling', () => {
    it('should handle pending credential during email sign in', async () => {
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);
      window.sessionStorage.setItem('pendingCred', JSON.stringify(mockCredential));
      (linkWithCredential as any).mockResolvedValue({ ...mockUserCredential, linked: true });

      const result = await signInWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(linkWithCredential).toHaveBeenCalledWith(mockUserCredential.user, mockCredential);
      expect((result as any).linked).toBe(true);
      expect(window.sessionStorage.getItem('pendingCred')).toBeNull();
    });

    it('should handle invalid pending credential gracefully', async () => {
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);
      window.sessionStorage.setItem('pendingCred', 'invalid-json');

      const result = await signInWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(result).toBe(mockUserCredential);
    });

    it('should handle linking failure gracefully', async () => {
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);
      window.sessionStorage.setItem('pendingCred', JSON.stringify(mockCredential));
      (linkWithCredential as any).mockRejectedValue(new Error('Linking failed'));

      const result = await signInWithEmailAndPassword(mockUi, 'test@test.com', 'password');

      expect(result).toBe(mockUserCredential);
      expect(window.sessionStorage.getItem('pendingCred')).toBeNull();
    });
  });

  describe('Storage Management', () => {
    it('should clean up all storage items after successful email link sign in', async () => {
      (fbIsSignInWithEmailLink as any).mockReturnValue(true);

      // Patch localStorage for testing
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('test@test.com'),
        removeItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

      // Create mocks to ensure a successful sign in
      (signInWithCredential as any).mockResolvedValue(mockUserCredential);
      (EmailAuthProvider.credentialWithLink as any).mockReturnValue(mockCredential);

      const result = await completeEmailLinkSignIn(mockUi, 'https://example.com?oob=code');

      expect(result).not.toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('emailForSignIn');
    });

    it('should clean up storage even when sign in fails', async () => {
      // Patch localStorage for testing
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('test@test.com'),
        removeItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

      // Make isSignInWithEmailLink return true
      (fbIsSignInWithEmailLink as any).mockReturnValue(true);

      // Make signInWithCredential throw an error
      const error = new Error('Sign in failed');
      (signInWithCredential as any).mockRejectedValue(error);

      // Mock handleFirebaseError to throw our actual error instead
      vi.mock('../../src/errors', async () => {
        const actual = await vi.importActual('../../src/errors');
        return {
          ...(actual as object),
          handleFirebaseError: vi.fn().mockImplementation((ui, e) => {
            throw e;
          }),
        };
      });

      // Use rejects matcher with our specific error
      await expect(completeEmailLinkSignIn(mockUi, 'https://example.com?oob=code')).rejects.toThrow('Sign in failed');

      // Check localStorage was cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('emailForSignIn');
    });
  });
});
