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

import { ERROR_CODE_MAP, type ErrorCode } from "@firebase-ui/translations";
import { FirebaseError } from "firebase/app";
import { type AuthCredential, getMultiFactorResolver, type MultiFactorError } from "firebase/auth";
import { type FirebaseUI } from "./config";
import { getTranslation } from "./translations";
export class FirebaseUIError extends FirebaseError {
  constructor(ui: FirebaseUI, error: FirebaseError) {
    const message = getTranslation(ui, "errors", ERROR_CODE_MAP[error.code as ErrorCode]);
    super(error.code, message || error.message);

    // Ensures that `instanceof FirebaseUIError` works, alongside `instanceof FirebaseError`
    Object.setPrototypeOf(this, FirebaseUIError.prototype);
  }
}

export function handleFirebaseError(ui: FirebaseUI, error: unknown): never {
  // If it's not a Firebase error, then we just throw it and preserve the original error.
  if (!isFirebaseError(error)) {
    throw error;
  }

  // TODO(ehesp): Type error as unknown, check instance of FirebaseError
  // TODO(ehesp): Support via behavior
  if (error.code === "auth/account-exists-with-different-credential" && errorContainsCredential(error)) {
    window.sessionStorage.setItem("pendingCred", JSON.stringify(error.credential.toJSON()));
  }

  // Update the UI with the multi-factor resolver if the error is thrown.
  if (error.code === "auth/multi-factor-auth-required") {
    const resolver = getMultiFactorResolver(ui.auth, error as MultiFactorError);
    ui.setMultiFactorResolver(resolver);
  }

  throw new FirebaseUIError(ui, error);
}

// Utility to obtain whether something is a FirebaseError
function isFirebaseError(error: unknown): error is FirebaseError {
  // Calling instanceof FirebaseError is not working - not sure why yet.
  return !!error && typeof error === "object" && "code" in error && "message" in error;
}

// Utility to obtain whether something is a FirebaseError that contains a credential - doesn't seemed to be typed?
function errorContainsCredential(error: FirebaseError): error is FirebaseError & { credential: AuthCredential } {
  return "credential" in error;
}
