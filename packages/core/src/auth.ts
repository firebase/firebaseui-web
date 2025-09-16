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
  type ActionCodeSettings,
  type AuthProvider,
  type ConfirmationResult,
  type RecaptchaVerifier,
  type UserCredential,
  EmailAuthProvider,
  PhoneAuthProvider,
} from "firebase/auth";
import { getBehavior, hasBehavior } from "./behaviors";
import { FirebaseUIConfiguration } from "./config";
import { handleFirebaseError } from "./errors";
import { getAuthImp } from "./imp/auth";

async function handlePendingCredential(ui: FirebaseUIConfiguration, user: UserCredential): Promise<UserCredential> {
  const pendingCredString = window.sessionStorage.getItem("pendingCred");
  if (!pendingCredString) return user;

  try {
    const pendingCred = JSON.parse(pendingCredString);
    ui.setState("pending");
    const result = await getAuthImp(ui).linkWithCredential(user.user, pendingCred);
    ui.setState("idle");
    window.sessionStorage.removeItem("pendingCred");
    return result;
  } catch (_error) {
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
    const credential = EmailAuthProvider.credential(email, password);

    if (hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const result = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState("pending");
    const result = await getAuthImp(ui).signInWithCredential(ui.auth, credential);
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
  password: string
): Promise<UserCredential> {
  try {
    const credential = EmailAuthProvider.credential(email, password);

    if (hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const result = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState("pending");
    const result = await getAuthImp(ui).createUserWithEmailAndPassword(ui.auth, email, password);
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
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    ui.setState("pending");
    return await getAuthImp(ui).signInWithPhoneNumber(ui.auth, phoneNumber, recaptchaVerifier);
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
    const currentUser = ui.auth.currentUser;
    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);

    if (currentUser?.isAnonymous && hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const result = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);

      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState("pending");
    const result = await getAuthImp(ui).signInWithCredential(ui.auth, credential);
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
    await getAuthImp(ui).sendPasswordResetEmail(ui.auth, email);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function sendSignInLinkToEmail(ui: FirebaseUIConfiguration, email: string): Promise<void> {
  try {
    const actionCodeSettings = {
      url: window.location.href,
      // TODO(ehesp): Check this...
      handleCodeInApp: true,
    } satisfies ActionCodeSettings;

    ui.setState("pending");
    await getAuthImp(ui).sendSignInLinkToEmail(ui.auth, email, actionCodeSettings);
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
  try {
    const credential = EmailAuthProvider.credentialWithLink(email, link);

    if (hasBehavior(ui, "autoUpgradeAnonymousCredential")) {
      const result = await getBehavior(ui, "autoUpgradeAnonymousCredential")(ui, credential);
      if (result) {
        return handlePendingCredential(ui, result);
      }
    }

    ui.setState("pending");
    const result = await getAuthImp(ui).signInWithCredential(ui.auth, credential);
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
    const result = await getAuthImp(ui).signInAnonymously(ui.auth);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

export async function signInWithProvider(ui: FirebaseUIConfiguration, provider: AuthProvider): Promise<void> {
  try {
    if (hasBehavior(ui, "autoUpgradeAnonymousProvider")) {
      await getBehavior(ui, "autoUpgradeAnonymousProvider")(ui, provider);
      // If we get to here, the user is not anonymous, otherwise they
      // have been redirected to the provider's sign in page.
    }

    ui.setState("pending");

    // TODO(ehesp): Handle popup or redirect based on behavior
    await getAuthImp(ui).signInWithRedirect(ui.auth, provider);
    // We don't modify state here since the user is redirected.
    // If we support popups, we'd need to modify state here.
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
    if (!getAuthImp(ui).isSignInWithEmailLink(ui.auth, currentUrl)) {
      return null;
    }

    const email = window.localStorage.getItem("emailForSignIn");
    if (!email) return null;

    ui.setState("pending");
    const result = await getAuthImp(ui).signInWithEmailLink(ui.auth, email, currentUrl);
    ui.setState("idle"); // TODO(ehesp): Do we need this here?
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
    window.localStorage.removeItem("emailForSignIn");
  }
}
