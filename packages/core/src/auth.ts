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
  signInWithCredential as _signInWithCredential,
  signInWithCustomToken as _signInWithCustomToken,
  EmailAuthProvider,
  linkWithCredential,
  PhoneAuthProvider,
  TotpMultiFactorGenerator,
  multiFactor,
  type ActionCodeSettings,
  type ApplicationVerifier,
  type AuthProvider,
  type UserCredential,
  type AuthCredential,
  type TotpSecret,
  type MultiFactorAssertion,
  type MultiFactorUser,
  type MultiFactorInfo,
} from "firebase/auth";
import QRCode from "qrcode-generator";
import { type FirebaseUI } from "./config";
import { handleFirebaseError } from "./errors";
import { hasBehavior, getBehavior } from "./behaviors/index";
import { FirebaseError } from "firebase/app";
import { getTranslation } from "./translations";

async function handlePendingCredential(_ui: FirebaseUI, user: UserCredential): Promise<UserCredential> {
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

function setPendingState(ui: FirebaseUI) {
  ui.setRedirectError(undefined);
  ui.setState("pending");
}

/**
 * Signs in with an email and password.
 *
 * If the `autoUpgradeAnonymousUsers` behavior is enabled, it will attempt to upgrade an anonymous user to a regular user.
 *
 * @param ui - The FirebaseUI instance.
 * @param email - The email to sign in with.
 * @param password - The password to sign in with.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function signInWithEmailAndPassword(
  ui: FirebaseUI,
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    setPendingState(ui);
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

/**
 * Creates a new user account with an email and password.
 *
 * If the `requireDisplayName` behavior is enabled, a display name must be provided.
 * If the `autoUpgradeAnonymousUsers` behavior is enabled, it will attempt to upgrade an anonymous user to a regular user.
 *
 * @param ui - The FirebaseUI instance.
 * @param email - The email address for the new account.
 * @param password - The password for the new account.
 * @param displayName - Optional display name for the user.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function createUserWithEmailAndPassword(
  ui: FirebaseUI,
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  try {
    setPendingState(ui);
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

/**
 * Verifies a phone number for authentication.
 *
 * Supports regular phone authentication, MFA enrollment, and MFA assertion flows.
 *
 * @param ui - The FirebaseUI instance.
 * @param phoneNumber - The phone number to verify.
 * @param appVerifier - The application verifier (reCAPTCHA).
 * @param mfaUser - Optional multi-factor user for MFA enrollment flow.
 * @param mfaHint - Optional multi-factor info hint for MFA assertion flow.
 * @returns {Promise<string>} A promise containing the verification ID.
 */
export async function verifyPhoneNumber(
  ui: FirebaseUI,
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
  mfaUser?: MultiFactorUser,
  mfaHint?: MultiFactorInfo
): Promise<string> {
  try {
    setPendingState(ui);
    const provider = new PhoneAuthProvider(ui.auth);

    if (mfaHint && ui.multiFactorResolver) {
      // MFA assertion flow
      return await provider.verifyPhoneNumber(
        {
          multiFactorHint: mfaHint,
          session: ui.multiFactorResolver.session,
        },
        appVerifier
      );
    } else if (mfaUser) {
      // MFA enrollment flow
      const session = await mfaUser.getSession();
      return await provider.verifyPhoneNumber(
        {
          phoneNumber,
          session,
        },
        appVerifier
      );
    } else {
      // Regular phone auth flow
      return await provider.verifyPhoneNumber(phoneNumber, appVerifier);
    }
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

/**
 * Confirms a phone number verification code and signs in the user.
 *
 * If the `autoUpgradeAnonymousUsers` behavior is enabled and the current user is anonymous, it will attempt to upgrade the anonymous user to a regular user.
 *
 * @param ui - The FirebaseUI instance.
 * @param verificationId - The verification ID from the phone verification process.
 * @param verificationCode - The verification code sent to the phone.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function confirmPhoneNumber(
  ui: FirebaseUI,
  verificationId: string,
  verificationCode: string
): Promise<UserCredential> {
  try {
    setPendingState(ui);
    const currentUser = ui.auth.currentUser;
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);

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

/**
 * Sends a password reset email to the specified email address.
 *
 * @param ui - The FirebaseUI instance.
 * @param email - The email address to send the password reset email to.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
export async function sendPasswordResetEmail(ui: FirebaseUI, email: string): Promise<void> {
  try {
    setPendingState(ui);
    await _sendPasswordResetEmail(ui.auth, email);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

/**
 * Sends a sign-in link to the specified email address.
 *
 * The email address is stored in localStorage for later use during the sign-in process.
 *
 * @param ui - The FirebaseUI instance.
 * @param email - The email address to send the sign-in link to.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
export async function sendSignInLinkToEmail(ui: FirebaseUI, email: string): Promise<void> {
  try {
    setPendingState(ui);
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

/**
 * Signs in a user using an email link.
 *
 * @param ui - The FirebaseUI instance.
 * @param email - The email address associated with the sign-in link.
 * @param link - The sign-in link from the email.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function signInWithEmailLink(ui: FirebaseUI, email: string, link: string): Promise<UserCredential> {
  const credential = EmailAuthProvider.credentialWithLink(email, link);
  return signInWithCredential(ui, credential);
}

/**
 * Signs in a user with an authentication credential.
 *
 * If the `autoUpgradeAnonymousUsers` behavior is enabled, it will attempt to upgrade an anonymous user to a regular user.
 *
 * @param ui - The FirebaseUI instance.
 * @param credential - The authentication credential to sign in with.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function signInWithCredential(ui: FirebaseUI, credential: AuthCredential): Promise<UserCredential> {
  try {
    setPendingState(ui);
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

/**
 * Signs in a user with a custom token.
 *
 * @param ui - The FirebaseUI instance.
 * @param customToken - The custom token to sign in with.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function signInWithCustomToken(ui: FirebaseUI, customToken: string): Promise<UserCredential> {
  try {
    setPendingState(ui);
    const result = await _signInWithCustomToken(ui.auth, customToken);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

/**
 * Signs in a user anonymously.
 *
 * @param ui - The FirebaseUI instance.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function signInAnonymously(ui: FirebaseUI): Promise<UserCredential> {
  try {
    setPendingState(ui);
    const result = await _signInAnonymously(ui.auth);
    return handlePendingCredential(ui, result);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

/**
 * Signs in a user with an authentication provider (e.g., Google, Facebook, etc.).
 *
 * If the `autoUpgradeAnonymousProvider` behavior is enabled, it will attempt to upgrade an anonymous user to a regular user.
 * The sign-in strategy (popup or redirect) is determined by the `providerSignInStrategy` behavior.
 *
 * @param ui - The FirebaseUI instance.
 * @param provider - The authentication provider to sign in with.
 * @returns {Promise<UserCredential | never>} A promise containing the user credential, or never if using redirect strategy.
 */
export async function signInWithProvider(ui: FirebaseUI, provider: AuthProvider): Promise<UserCredential | never> {
  try {
    setPendingState(ui);
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

/**
 * Completes the email link sign-in process using the current URL.
 *
 * Checks if the current URL is a valid email link sign-in URL and retrieves the email from localStorage.
 * Returns null if the URL is not a valid email link or if no email is found in localStorage.
 *
 * @param ui - The FirebaseUI instance.
 * @param currentUrl - The current URL to check for email link sign-in.
 * @returns {Promise<UserCredential | null>} A promise containing the user credential, or null if the sign-in cannot be completed.
 */
export async function completeEmailLinkSignIn(ui: FirebaseUI, currentUrl: string): Promise<UserCredential | null> {
  try {
    if (!_isSignInWithEmailLink(ui.auth, currentUrl)) {
      return null;
    }

    const email = window.localStorage.getItem("emailForSignIn");
    if (!email) return null;

    // signInWithEmailLink handles behavior checks, credential creation, and error handling
    const result = await signInWithEmailLink(ui, email, currentUrl);
    return handlePendingCredential(ui, result);
  } finally {
    window.localStorage.removeItem("emailForSignIn");
  }
}

/**
 * Generates a QR code data URL for TOTP (Time-based One-Time Password) multi-factor authentication.
 *
 * The QR code can be scanned by an authenticator app to set up TOTP MFA for the user.
 *
 * @param ui - The FirebaseUI instance.
 * @param secret - The TOTP secret to generate the QR code for.
 * @param accountName - Optional account name for the QR code. Defaults to the user's email if not provided.
 * @param issuer - Optional issuer name for the QR code.
 * @returns {string} A data URL containing the QR code image.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export function generateTotpQrCode(ui: FirebaseUI, secret: TotpSecret, accountName?: string, issuer?: string): string {
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

/**
 * Signs in a user using a multi-factor assertion.
 *
 * Resolves the multi-factor challenge using the provided assertion and clears the multi-factor resolver from the UI state.
 *
 * @param ui - The FirebaseUI instance.
 * @param assertion - The multi-factor assertion to use for sign-in.
 * @returns {Promise<UserCredential>} A promise containing the user credential.
 */
export async function signInWithMultiFactorAssertion(ui: FirebaseUI, assertion: MultiFactorAssertion) {
  try {
    setPendingState(ui);
    const result = await ui.multiFactorResolver!.resolveSignIn(assertion);
    ui.setMultiFactorResolver(undefined);
    return result;
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

/**
 * Enrolls a multi-factor authentication method for the current user.
 *
 * @param ui - The FirebaseUI instance.
 * @param assertion - The multi-factor assertion to enroll.
 * @param displayName - Optional display name for the enrolled MFA method.
 * @returns {Promise<void>} A promise that resolves when the enrollment is complete.
 */
export async function enrollWithMultiFactorAssertion(
  ui: FirebaseUI,
  assertion: MultiFactorAssertion,
  displayName?: string
): Promise<void> {
  try {
    setPendingState(ui);
    await multiFactor(ui.auth.currentUser!).enroll(assertion, displayName);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}

/**
 * Generates a TOTP (Time-based One-Time Password) secret for multi-factor authentication enrollment.
 *
 * @param ui - The FirebaseUI instance.
 * @returns {Promise<TotpSecret>} A promise containing the TOTP secret.
 */
export async function generateTotpSecret(ui: FirebaseUI): Promise<TotpSecret> {
  try {
    setPendingState(ui);
    const mfaUser = multiFactor(ui.auth.currentUser!);
    const session = await mfaUser.getSession();
    return await TotpMultiFactorGenerator.generateSecret(session);
  } catch (error) {
    handleFirebaseError(ui, error);
  } finally {
    ui.setState("idle");
  }
}
