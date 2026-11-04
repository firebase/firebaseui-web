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

import { type FirebaseUI, FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import { FirebaseError } from "firebase/app";

/**
 * Creates a FirebaseUIError for an error that is not a Firebase error.
 *
 * The error has the code `ui/unknown-error` and the translated `unknownError` message, and keeps the original error as the `cause` of its own `cause`.
 *
 * @param ui - The FirebaseUI instance.
 * @param error - The original error.
 * @returns A FirebaseUIError for the unknown error.
 */
export function createUnknownFirebaseUIError(ui: FirebaseUI, error: unknown): FirebaseUIError {
  const unknownError = new FirebaseError("ui/unknown-error", getTranslation(ui, "errors", "unknownError"));
  unknownError.cause = error;
  return new FirebaseUIError(ui, unknownError);
}
