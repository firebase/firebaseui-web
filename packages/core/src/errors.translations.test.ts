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

/**
 * `errors.test.ts` mocks `./translations`, so this file runs `FirebaseUIError`
 * against real registered locales.
 */
import { describe, expect, it } from "vitest";
import { FirebaseError } from "firebase/app";
import { enUs, registerLocale } from "@firebase-oss/ui-translations";
import { FirebaseUIError } from "./errors";
import { createMockUI } from "~/tests/utils";

const apiKeyExpired = new FirebaseError("auth/api-key-expired", "Firebase: Error (auth/api-key-expired).");
const userNotFound = new FirebaseError("auth/user-not-found", "Firebase: Error (auth/user-not-found).");

describe("FirebaseUIError with real locales", () => {
  it("shows the Firebase message for an unmapped code by default", () => {
    const error = new FirebaseUIError(createMockUI({ locale: enUs }), apiKeyExpired);

    expect(error.message).toBe("Firebase: Error (auth/api-key-expired).");
  });

  it("shows a custom translation keyed by an unmapped code", () => {
    const locale = registerLocale("en-US", { errors: { "auth/api-key-expired": "Configuration issue" } });

    const error = new FirebaseUIError(createMockUI({ locale }), apiKeyExpired);

    expect(error.message).toBe("Configuration issue");
  });

  it("shows a custom translation keyed by a mapped code over the named key", () => {
    const locale = registerLocale("en-US", {
      errors: { userNotFound: "Keyed by name", "auth/user-not-found": "Keyed by code" },
    });

    const error = new FirebaseUIError(createMockUI({ locale }), userNotFound);

    expect(error.message).toBe("Keyed by code");
  });

  it("resolves a code key through the fallback locale", () => {
    const base = registerLocale("en-US", { errors: { "auth/api-key-expired": "Configuration issue" } });
    const locale = registerLocale("en-GB", {}, base);

    const error = new FirebaseUIError(createMockUI({ locale }), apiKeyExpired);

    expect(error.message).toBe("Configuration issue");
  });
});
