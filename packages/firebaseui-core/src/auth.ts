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

import {
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
  isSignInWithEmailLink as _isSignInWithEmailLink,
  sendPasswordResetEmail as _sendPasswordResetEmail,
  sendSignInLinkToEmail as _sendSignInLinkToEmail,
  signInAnonymously as _signInAnonymously,
  signInWithPhoneNumber as _signInWithPhoneNumber,
  ActionCodeSettings,
  AuthProvider,
  ConfirmationResult,
  EmailAuthProvider,
  getAuth,
  linkWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithRedirect,
  UserCredential,
} from 'firebase/auth';
import { getBehavior, hasBehavior } from './behaviors';
import { FirebaseUIConfiguration } from './config';
import { handleFirebaseError } from './errors';

async function handlePendingCredential(ui: FirebaseUIConfiguration, user: UserCredential): Promise<UserCredential> {
  const pendingCredString = window.sessionStorage.getItem('pendingCred');
  if (!pendingCredString) return user;

  try {
    const pendingCred = JSON.parse(pendingCredString);
    ui.setState('linking');
    const result = await linkWithCredential(user.user, pendingCred);
    ui.setState('idle');
    window.sessionStorage.removeItem('pendingCred');
    return result;
  } catch (error) {
    window.sessionStorage.removeItem('pendingCred');
    return user;
  }
}

export async function signInWithEmailAndPassword(
  ui: FirebaseUIConfiguration,
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const auth = getAuth(ui.app);
    const credential = EmailAuthProvider.credential(email, password);

    if (hasBehavior(ui, 'autoUpgradeAnonymousCredential')) {
      const result = await getBehavior(ui, 'autoUpgradeAnonymousCredential')(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState('signing-in');
    const result = await signInWithCredential(auth, credential);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function createUserWithEmailAndPassword(
  ui: FirebaseUIConfiguration,
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const auth = getAuth(ui.app);
    const credential = EmailAuthProvider.credential(email, password);

    if (hasBehavior(ui, 'autoUpgradeAnonymousCredential')) {
      const result = await getBehavior(ui, 'autoUpgradeAnonymousCredential')(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState('creating-user');
    const result = await _createUserWithEmailAndPassword(auth, email, password);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function signInWithPhoneNumber(
  ui: FirebaseUIConfiguration,
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    const auth = getAuth(ui.app);
    ui.setState('signing-in');
    return await _signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function confirmPhoneNumber(
  ui: FirebaseUIConfiguration,
  confirmationResult: ConfirmationResult,
  verificationCode: string
): Promise<UserCredential> {
  try {
    const auth = getAuth(ui.app);
    const currentUser = auth.currentUser;
    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);

    if (currentUser?.isAnonymous && hasBehavior(ui, 'autoUpgradeAnonymousCredential')) {
      const result = await getBehavior(ui, 'autoUpgradeAnonymousCredential')(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState('signing-in');
    const result = await signInWithCredential(auth, credential);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function sendPasswordResetEmail(ui: FirebaseUIConfiguration, email: string): Promise<void> {
  try {
    const auth = getAuth(ui.app);
    ui.setState('sending-password-reset-email');
    await _sendPasswordResetEmail(auth, email);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function sendSignInLinkToEmail(ui: FirebaseUIConfiguration, email: string): Promise<void> {
  try {
    const auth = getAuth(ui.app);

    const actionCodeSettings = {
      url: window.location.href,
      // TODO(ehesp): Check this...
      handleCodeInApp: true,
    } satisfies ActionCodeSettings;

    ui.setState('sending-sign-in-link-to-email');
    await _sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function signInWithEmailLink(
  ui: FirebaseUIConfiguration,
  email: string,
  link: string
): Promise<UserCredential> {
  try {
    const auth = ui.getAuth();
    const credential = EmailAuthProvider.credentialWithLink(email, link);

    if (hasBehavior(ui, 'autoUpgradeAnonymousCredential')) {
      const result = await getBehavior(ui, 'autoUpgradeAnonymousCredential')(ui, credential);
      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState('signing-in');
    const result = await signInWithCredential(auth, credential);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function signInAnonymously(ui: FirebaseUIConfiguration): Promise<UserCredential> {
  try {
    const auth = getAuth(ui.app);
    ui.setState('signing-in');
    const result = await _signInAnonymously(auth);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function signInWithOAuth(ui: FirebaseUIConfiguration, provider: AuthProvider): Promise<void> {
  try {
    const auth = getAuth(ui.app);

    if (hasBehavior(ui, 'autoUpgradeAnonymousProvider')) {
      await getBehavior(ui, 'autoUpgradeAnonymousProvider')(ui, provider);
      // If we get to here, the user is not anonymous, otherwise they
      // have been redirected to the provider's sign in page.
    }

    ui.setState('signing-in');
    await signInWithRedirect(auth, provider);
    // We don't modify state here since the user is redirected.
    // If we support popups, we'd need to modify state here.
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
  }
}

export async function completeEmailLinkSignIn(
  ui: FirebaseUIConfiguration,
  currentUrl: string
): Promise<UserCredential | null> {
  try {
    const auth = ui.getAuth();
    if (!_isSignInWithEmailLink(auth, currentUrl)) {
      return null;
    }

    const email = window.localStorage.getItem('emailForSignIn');
    if (!email) return null;

    ui.setState('signing-in');
    const result = await signInWithEmailLink(ui, email, currentUrl);
    ui.setState('idle');
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState('idle');
    window.localStorage.removeItem('emailForSignIn');
  }
}
