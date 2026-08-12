/**
 * Copyright 2026 Google LLC
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

import type { APIRequestContext, Locator, Page } from "@playwright/test";
import { enUs } from "@firebase-oss/ui-translations";
import { expect, test } from "../fixtures/test-harness";

const AUTH_EMULATOR_BASE_URL = "http://127.0.0.1:9099";
const FIREBASE_PROJECT_ID = "demo-test";
const RECOVERY_PATH = "/screens/legacy-recovery-demo";

const projectsUnderTest = ["react", "angular-example"] as const;

type EmulatorUser = {
  localId: string;
  providerUserInfo?: Array<{ providerId: string }>;
};

function uniqueEmail(projectName: string, label: string): string {
  return `${projectName}-${label}-${crypto.randomUUID()}@example.test`;
}

async function clearEmulatorUsers(request: APIRequestContext): Promise<void> {
  const response = await request.delete(
    `${AUTH_EMULATOR_BASE_URL}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`
  );
  expect(response.ok(), await response.text()).toBe(true);
}

async function createGoogleAccount(request: APIRequestContext, email: string): Promise<void> {
  const claims = {
    sub: crypto.randomUUID(),
    name: "Playwright Recovery User",
    email,
    email_verified: true,
  };
  const requestUri =
    `${AUTH_EMULATOR_BASE_URL}/emulator/auth/handler?providerId=google.com&id_token=` +
    encodeURIComponent(JSON.stringify(claims));
  const response = await request.post(
    `${AUTH_EMULATOR_BASE_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=fake-api-key`,
    {
      data: {
        requestUri,
        sessionId: "ValueNotUsedByAuthEmulator",
        returnSecureToken: true,
        returnIdpCredential: true,
      },
    }
  );

  expect(response.ok(), await response.text()).toBe(true);
}

/**
 * The Auth emulator widget marks every OAuth email as verified. Its backend then silently merges
 * providers with matching emails instead of returning account-exists-with-different-credential.
 * Production providers can return an unverified email, so rewrite only the attempted provider's
 * emulator assertion to exercise Firebase Auth's real conflict response and credential payload.
 */
async function forceUnverifiedProviderEmail(page: Page, providerId: string): Promise<void> {
  await page.route("**/accounts:signInWithIdp?*", async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as { requestUri: string };
    const requestUri = new URL(body.requestUri);

    if (requestUri.searchParams.get("providerId") === providerId) {
      const idToken = requestUri.searchParams.get("id_token");
      if (idToken) {
        const claims = JSON.parse(idToken) as { email_verified?: boolean };
        claims.email_verified = false;
        requestUri.searchParams.set("id_token", JSON.stringify(claims));
        body.requestUri = requestUri.toString();
      }
    }

    await route.continue({ postData: JSON.stringify(body) });
  });
}

async function completeNewProviderSignIn(
  page: Page,
  buttonName: string,
  emulatorProviderName: string,
  email: string
): Promise<void> {
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: buttonName, exact: true }).click();
  const popup = await popupPromise;

  const addAccountButton = popup.getByRole("button", { name: "Add new account" });
  await expect(addAccountButton).toBeVisible();
  const emailInput = popup.locator("#email-input");
  await expect(async () => {
    await addAccountButton.click();
    await expect(emailInput).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  await emailInput.fill(email);
  await popup.locator("#display-name-input").fill("Playwright Recovery User");
  await Promise.all([
    popup.waitForEvent("close"),
    popup.getByRole("button", { name: new RegExp(`Sign in with ${emulatorProviderName}`, "i") }).click(),
  ]);
}

async function completeExistingGoogleSignIn(page: Page, dialog: Locator, email: string): Promise<void> {
  const popupPromise = page.waitForEvent("popup");
  await dialog.getByRole("button", { name: enUs.translations.labels.signInWithGoogle }).click();
  const popup = await popupPromise;

  const existingAccount = popup.getByText(email, { exact: true });
  await expect(existingAccount).toBeVisible();
  await Promise.all([popup.waitForEvent("close"), existingAccount.click()]);
}

async function getUsersByEmail(request: APIRequestContext, email: string): Promise<EmulatorUser[]> {
  const response = await request.post(
    `${AUTH_EMULATOR_BASE_URL}/identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/accounts:lookup`,
    {
      headers: { authorization: "Bearer owner" },
      data: { email: [email] },
    }
  );
  expect(response.ok(), await response.text()).toBe(true);

  const body = (await response.json()) as { users?: EmulatorUser[] };
  return body.users ?? [];
}

for (const projectName of projectsUnderTest) {
  test.describe(`legacy sign-in recovery (${projectName})`, () => {
    test.describe.configure({ timeout: 90_000 });

    test.beforeEach(async ({ request }, testInfo) => {
      test.skip(testInfo.project.name !== projectName, `runs only on the ${projectName} project`);
      await clearEmulatorUsers(request);
    });

    test("shows previous methods and links the pending OAuth credential", async ({ page, request }) => {
      const email = uniqueEmail(projectName, "default");
      await createGoogleAccount(request, email);
      await forceUnverifiedProviderEmail(page, "github.com");

      await page.goto(RECOVERY_PATH);
      await completeNewProviderSignIn(page, enUs.translations.labels.signInWithGitHub, "GitHub.com", email);

      const dialog = page.getByRole("dialog", {
        name: enUs.translations.messages.legacySignInRecoverySelectMethod,
      });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(email);
      await expect(dialog.getByRole("button", { name: enUs.translations.labels.signInWithGoogle })).toBeVisible();
      await expect(page.getByText(enUs.translations.errors.accountExistsWithDifferentCredential)).toBeVisible();
      // "pendingCred" mirrors PENDING_CREDENTIAL_STORAGE_KEY in packages/core/src/behaviors/legacy-fetch-sign-in-with-email.ts.
      // Left as a literal here since page.evaluate runs in the browser context and can't import from the package.
      expect(await page.evaluate(() => window.sessionStorage.getItem("pendingCred"))).not.toBeNull();

      await completeExistingGoogleSignIn(page, dialog, email);

      await expect(dialog).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => window.sessionStorage.getItem("pendingCred"))).toBeNull();

      await expect
        .poll(async () => {
          const users = await getUsersByEmail(request, email);
          return {
            count: users.length,
            providers: users[0]?.providerUserInfo?.map(({ providerId }) => providerId).sort(),
          };
        })
        .toEqual({ count: 1, providers: ["github.com", "google.com"] });
    });

    test("supports custom recovery UI and clears it when dismissed", async ({ page, request }) => {
      const email = uniqueEmail(projectName, "handled");
      await createGoogleAccount(request, email);
      await forceUnverifiedProviderEmail(page, "github.com");

      await page.goto(`${RECOVERY_PATH}?legacyRecovery=handled`);
      await completeNewProviderSignIn(page, enUs.translations.labels.signInWithGitHub, "GitHub.com", email);

      await expect(page.getByRole("dialog")).toHaveCount(0);
      const customRecovery = page.getByTestId("custom-legacy-recovery");
      await expect(customRecovery).toBeVisible();
      await expect(page.getByTestId("custom-legacy-recovery-email")).toHaveText(email);
      await expect(page.getByTestId("custom-legacy-recovery-methods")).toContainText("google.com");
      // "pendingCred" mirrors PENDING_CREDENTIAL_STORAGE_KEY in packages/core/src/behaviors/legacy-fetch-sign-in-with-email.ts.
      // Left as a literal here since page.evaluate runs in the browser context and can't import from the package.
      expect(await page.evaluate(() => window.sessionStorage.getItem("pendingCred"))).not.toBeNull();

      await page.getByRole("button", { name: "Custom dismiss" }).click();
      await expect(customRecovery).toHaveCount(0);
      // clearLegacySignInRecovery() removes the pending credential synchronously, so no polling
      // is needed here (contrast with the completeExistingGoogleSignIn case above, which clears
      // it via an async sign-in flow).
      expect(await page.evaluate(() => window.sessionStorage.getItem("pendingCred"))).toBeNull();
    });
  });
}
