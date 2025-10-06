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
  signInWithCredential as _signInWithCredential,
  ActionCodeSettings,
  ApplicationVerifier,
  AuthProvider,
  ConfirmationResult,
  EmailAuthProvider,
  linkWithCredential,
  PhoneAuthProvider,
  UserCredential,
  AuthCredential,
  TotpSecret,
} from "firebase/auth";
import QRCode from "qrcode-generator";
import { FirebaseUIConfiguration } from "./config";
import { handleFirebaseError } from "./errors";
import { hasBehavior, getBehavior } from "./behaviors/index";
import { FirebaseError } from "firebase/app";
import { getTranslation } from "./translations";

async function handlePendingCredential(_ui: FirebaseUIConfiguration, user: UserCredential): Promise<UserCredential> {
  const pendingCredString = window.sessionStorage.getItem("pendingCred");
  if (!pendingCredString) return user;

  try {
    const pendingCred = JSON.parse(pendingCredString);
    const result = await linkWithCredential(user.user, pendingCred);
    window.sessionStorage.removeItem("pendingCred");
    return result;
  } catch {
    window.sessionStorage.removeItem("pendingCred");
    return user;
  }
}

export async function signInWithEmailAndPassword(
  ui: FirebaseUIConfiguration,
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    ui.setState("pending");
    const credential = EmailAuthProvider.credential(email, password);

    if (hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const result = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    const result = await _signInWithCredential(ui.auth, credential);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function createUserWithEmailAndPassword(
  ui: FirebaseUIConfiguration,
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  try {
    ui.setState("pending");
    const credential = EmailAuthProvider.credential(email, password);

    if (hasBehavior(ui, "requireDisplayName") && !displayName) {
      throw new FirebaseError("auth/display-name-required", getTranslation(ui, "errors", "displayNameRequired"));
    }

    if (hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const result = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);

      if (result) {
        if (hasBehavior(ui, "requireDisplayName")) {
          await getBehavior(ui, "requireDisplayName")(ui, result.user, displayName!);
        }

        return handlePendingCredential(ui, result);
      }
    }

    const result = await _createUserWithEmailAndPassword(ui.auth, email, password);

    if (hasBehavior(ui, "requireDisplayName")) {
      await getBehavior(ui, "requireDisplayName")(ui, result.user, displayName!);
    }

    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function signInWithPhoneNumber(
  ui: FirebaseUIConfiguration,
  phoneNumber: string,
  appVerifier: ApplicationVerifier
): Promise<ConfirmationResult> {
  try {
    ui.setState("pending");
    return await _signInWithPhoneNumber(ui.auth, phoneNumber, appVerifier);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function confirmPhoneNumber(
  ui: FirebaseUIConfiguration,
  confirmationResult: ConfirmationResult,
  verificationCode: string
): Promise<UserCredential> {
  try {
    ui.setState("pending");
    const currentUser = ui.auth.currentUser;
    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);

    if (currentUser?.isAnonymous && hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const result = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    const result = await _signInWithCredential(ui.auth, credential);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function sendPasswordResetEmail(ui: FirebaseUIConfiguration, email: string): Promise<void> {
  try {
    ui.setState("pending");
    await _sendPasswordResetEmail(ui.auth, email);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function sendSignInLinkToEmail(ui: FirebaseUIConfiguration, email: string): Promise<void> {
  try {
    ui.setState("pending");
    const actionCodeSettings = {
      url: window.location.href,
      // TODO(ehesp): Check this...
      handleCodeInApp: true,
    } satisfies ActionCodeSettings;

    await _sendSignInLinkToEmail(ui.auth, email, actionCodeSettings);
    // TODO: Should this be a behavior ("storageStrategy")?
    window.localStorage.setItem("emailForSignIn", email);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function signInWithEmailLink(
  ui: FirebaseUIConfiguration,
  email: string,
  link: string
): Promise<UserCredential> {
  const credential = EmailAuthProvider.credentialWithLink(email, link);
  return signInWithCredential(ui, credential);
}

export async function signInWithCredential(
  ui: FirebaseUIConfiguration,
  credential: AuthCredential
): Promise<UserCredential> {
  try {
    ui.setState("pending");
    if (hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const userCredential = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);

      // If they got here, they're either not anonymous or they've been linked.
      // If the credential has been linked, we don't need to sign them in, so return early.
      if (userCredential) {
        return handlePendingCredential(ui, userCredential);
      }
    }

    const result = await _signInWithCredential(ui.auth, credential);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function signInAnonymously(ui: FirebaseUIConfiguration): Promise<UserCredential> {
  try {
    ui.setState("pending");
    const result = await _signInAnonymously(ui.auth);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function signInWithProvider(
  ui: FirebaseUIConfiguration,
  provider: AuthProvider
): Promise<UserCredential | never> {
  try {
    ui.setState("pending");
    if (hasBehavior(ui, "autoUpgradeAnonymousProvider")) {
      const credential = await getBehavior(ui, "autoUpgradeAnonymousProvider")(ui, provider);

      // If we got here, the user is either not anonymous, or they have been linked
      // via a popup, and the credential has been created.
      if (credential) {
        return handlePendingCredential(ui, credential);
      }
    }

    const strategy = getBehavior(ui, "providerSignInStrategy");
    const result = await strategy(ui, provider);

    // If we got here, the user has been signed in via a popup.
    // Otherwise, they will have been redirected.
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function completeEmailLinkSignIn(
  ui: FirebaseUIConfiguration,
  currentUrl: string
): Promise<UserCredential | null> {
  try {
    if (!_isSignInWithEmailLink(ui.auth, currentUrl)) {
      return null;
    }

    const email = window.localStorage.getItem("emailForSignIn");
    if (!email) return null;

    ui.setState("pending");
    const result = await signInWithEmailLink(ui, email, currentUrl);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
    window.localStorage.removeItem("emailForSignIn");
  }
}

export function generateTotpQrCode(
  ui: FirebaseUIConfiguration,
  secret: TotpSecret,
  accountName?: string,
  issuer?: string
): string {
  const currentUser = ui.auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated to generate a TOTP QR code");
  }

  const uri = secret.generateQrCodeUrl(accountName || currentUser.email || "", issuer);

  const qr = QRCode(0, "L");
  qr.addData(uri);
  qr.make();
  return qr.createDataURL();
}
