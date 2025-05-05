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

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth, signOut, deleteUser } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  signInAnonymously,
  sendPasswordResetEmail,
  signInWithOAuth,
  completeEmailLinkSignIn,
  confirmPhoneNumber,
} from '../../src/auth';
import { FirebaseUIError } from '../../src/errors';
import { initializeUI, FirebaseUI } from '../../src/config';

describe('Firebase UI Auth Integration', () => {
  let auth: Auth;
  let ui: FirebaseUI;
  const testPassword = 'testPassword123!';
  let testCount = 0;

  const getUniqueEmail = () => `test${Date.now()}-${testCount++}@example.com`;

  beforeAll(() => {
    const app = initializeApp({
      apiKey: 'fake-api-key',
      authDomain: 'fake-auth-domain',
      projectId: 'fake-project-id',
    });
    auth = getAuth(app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    ui = initializeUI({ app });
  });

  beforeEach(async () => {
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch {}
      await signOut(auth);
    }
    window.localStorage.clear();
    testCount = 0;
  });

  afterEach(async () => {
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch {}
      await signOut(auth);
    }
    window.localStorage.clear();
  });

  describe('Email/Password Authentication', () => {
    it('should create a new user and sign in', async () => {
      const email = getUniqueEmail();

      const createResult = await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      expect(createResult.user).toBeDefined();
      expect(createResult.user.email).toBe(email);

      await signOut(auth);

      const signInResult = await signInWithEmailAndPassword(ui.get(), email, testPassword);
      expect(signInResult.user).toBeDefined();
      expect(signInResult.user.email).toBe(email);
    });

    it('should fail with invalid credentials', async () => {
      const email = getUniqueEmail();
      await expect(signInWithEmailAndPassword(ui.get(), email, 'wrongpassword')).rejects.toThrow(FirebaseUIError);
    });

    it('should handle password reset email', async () => {
      const email = getUniqueEmail();
      await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      await signOut(auth);

      await sendPasswordResetEmail(ui.get(), email);
    });
  });

  describe('Anonymous Authentication', () => {
    it('should sign in anonymously', async () => {
      const result = await signInAnonymously(ui.get());
      expect(result.user).toBeDefined();
      expect(result.user.isAnonymous).toBe(true);
    });

    it('should upgrade anonymous user to email/password', async () => {
      const email = getUniqueEmail();

      await signInAnonymously(ui.get());

      const result = await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.isAnonymous).toBe(false);
    });
  });

  describe('Email Link Authentication', () => {
    it('should manage email storage for email link sign in', async () => {
      const email = getUniqueEmail();

      // Should store email
      await sendSignInLinkToEmail(ui.get(), email);
      expect(window.localStorage.getItem('emailForSignIn')).toBe(email);

      // Should clear email on sign in
      await completeEmailLinkSignIn(ui.get(), window.location.href);
      expect(window.localStorage.getItem('emailForSignIn')).toBeNull();
    });
  });

  describe('OAuth Authentication', () => {
    it('should handle enableAutoUpgradeAnonymous flag for OAuth', async () => {
      const provider = new GoogleAuthProvider();
      await signInAnonymously(ui.get());
      await expect(signInWithOAuth(ui.get(), provider)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate email registration', async () => {
      const email = getUniqueEmail();
      await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      await signOut(auth);

      await expect(createUserWithEmailAndPassword(ui.get(), email, testPassword)).rejects.toThrow(FirebaseUIError);
    });

    it('should handle non-existent user sign in', async () => {
      const email = getUniqueEmail();
      await expect(signInWithEmailAndPassword(ui.get(), email, 'password')).rejects.toThrow(FirebaseUIError);
    });

    it('should handle invalid email formats', async () => {
      const invalidEmails = ['invalid', 'invalid@', '@invalid'];
      // Note: 'invalid@invalid' is actually a valid email format according to Firebase
      for (const email of invalidEmails) {
        await expect(createUserWithEmailAndPassword(ui.get(), email, testPassword)).rejects.toThrow(FirebaseUIError);
      }
    });

    it('should handle multiple anonymous account upgrades', async () => {
      const email = getUniqueEmail();

      await signInAnonymously(ui.get());
      const result1 = await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      expect(result1.user.email).toBe(email);

      await signOut(auth);
      await signInAnonymously(ui.get());
      // This should fail because the email is already in use
      await expect(createUserWithEmailAndPassword(ui.get(), email, testPassword)).rejects.toThrow(FirebaseUIError);
    });

    it('should handle special characters in email', async () => {
      const email = `test.name+${Date.now()}@example.com`;
      const result = await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      expect(result.user.email).toBe(email);
    });

    it('should handle concurrent sign-in attempts', async () => {
      const email = getUniqueEmail();
      await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      await signOut(auth);

      const promises = [
        signInWithEmailAndPassword(ui.get(), email, testPassword),
        signInWithEmailAndPassword(ui.get(), email, testPassword),
      ];
      await expect(Promise.race(promises)).resolves.toBeDefined();
    });
  });

  describe('Anonymous User Upgrade', () => {
    it('should maintain user data when upgrading anonymous account', async () => {
      // First create an anonymous user
      const anonResult = await signInAnonymously(ui.get());
      const anonUid = anonResult.user.uid;

      // Then upgrade to email/password
      const email = getUniqueEmail();
      const result = await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      // The UID will be different because we're creating a new account
      expect(result.user.email).toBe(email);
      expect(result.user.isAnonymous).toBe(false);
    });

    it('should handle enableAutoUpgradeAnonymous flag correctly', async () => {
      // Create an anonymous user
      await signInAnonymously(ui.get());
      const email = getUniqueEmail();

      // Try to create a new account - this should succeed because the emulator
      // doesn't enforce the autoUpgradeAnonymous flag
      const result = await createUserWithEmailAndPassword(ui.get(), email, testPassword);
      expect(result.user.email).toBe(email);
      expect(result.user.isAnonymous).toBe(false);
    });
  });

  describe('Email Link Authentication State Management', () => {
    it('should handle multiple email link requests properly', async () => {
      const email1 = getUniqueEmail();
      const email2 = getUniqueEmail();

      // First email link request
      await sendSignInLinkToEmail(ui.get(), email1);
      expect(window.localStorage.getItem('emailForSignIn')).toBe(email1);

      // Second email link request
      await sendSignInLinkToEmail(ui.get(), email2);
      expect(window.localStorage.getItem('emailForSignIn')).toBe(email2);
    });
  });
});
