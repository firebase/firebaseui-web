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

import type { APIRequestContext, Browser, Page } from "@playwright/test";
import { enUs } from "@firebase-oss/ui-translations";
import { exampleMeta, type UiExampleMeta } from "../fixtures/example-meta";
import { expect, test } from "../fixtures/test-harness";

const AUTH_EMULATOR_BASE_URL = "http://127.0.0.1:9099";
const FIREBASE_PROJECT_ID = "fir-ui-rework";
const E2E_SCENARIO_PARAM = "e2eAnonymousUpgrade";
const ANONYMOUS_USER_ID_KEY = "firebaseui:e2e:anonymous-user-id";
const UPGRADE_RESULT_KEY = "firebaseui:e2e:upgrade-result";
const UPGRADE_FAILURE_KEY = "firebaseui:e2e:upgrade-failure";
const REDIRECT_USER_ID_KEY = "fbui:upgrade:oldUserId";
const PASSWORD = "e2e-password-123";

type UpgradeResult = {
  oldUserId: string;
  newUserId: string;
};

type UpgradeFailure = {
  oldUserId: string;
  code: string;
  kind: "credential" | "provider";
};

const projectsUnderTest = ["react", "angular-example"] as const;

function scenarioUrl(scenario: "default" | "handled" | "redirect" | "redirect-handled"): string {
  return `/screens/sign-in-auth-screen-w-oauth?${E2E_SCENARIO_PARAM}=${scenario}`;
}

function uniqueEmail(projectName: string, label: string): string {
  return `${projectName}-${label}-${crypto.randomUUID()}@example.test`;
}

async function createEmailUser(request: APIRequestContext, email: string): Promise<void> {
  const response = await request.post(
    `${AUTH_EMULATOR_BASE_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      data: { email, password: PASSWORD, returnSecureToken: true },
    }
  );

  expect(response.ok(), await response.text()).toBe(true);
}

async function clearEmulatorUsers(request: APIRequestContext): Promise<void> {
  const response = await request.delete(
    `${AUTH_EMULATOR_BASE_URL}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`
  );
  expect(response.ok(), await response.text()).toBe(true);
}

async function waitForAnonymousUser(page: Page): Promise<string> {
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), ANONYMOUS_USER_ID_KEY))
    .not.toBeNull();

  return page.evaluate((key) => window.localStorage.getItem(key) as string, ANONYMOUS_USER_ID_KEY);
}

async function submitCredentials(page: Page, email: string): Promise<void> {
  await page.getByLabel(enUs.translations.labels.emailAddress).fill(email);
  await page.getByLabel(enUs.translations.labels.password).fill(PASSWORD);
  await page.getByRole("button", { name: enUs.translations.labels.signIn, exact: true }).click();
}

async function readStorage<T>(page: Page, key: string): Promise<T | null> {
  return page.evaluate((storageKey) => {
    const value = window.localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  }, key);
}

async function expectUpgradePreservedUser(page: Page, anonymousUserId: string): Promise<void> {
  await expect.poll(() => readStorage<UpgradeResult>(page, UPGRADE_RESULT_KEY)).not.toBeNull();

  const result = await readStorage<UpgradeResult>(page, UPGRADE_RESULT_KEY);
  expect(result).toEqual({ oldUserId: anonymousUserId, newUserId: anonymousUserId });
}

async function completeGoogleRedirect(page: Page, email: string): Promise<void> {
  await page.getByRole("button", { name: enUs.translations.labels.signInWithGoogle }).click();

  // The emulator widget paints its account chooser before Angular Material attaches handlers.
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Add new account" }).click();
  await expect(page.locator("#email-input")).toBeVisible();
  await page.locator("#email-input").fill(email);
  await page.locator("#display-name-input").fill("Playwright User");
  await page.getByRole("button", { name: /sign in with google/i }).click();
}

// A fresh browser context gives us an independent, unauthenticated Firebase Auth persistence
// store, so `autoAnonymousLogin` creates a brand new anonymous user instead of reusing whatever
// session the default `page` fixture already has (e.g. one already upgraded by a prior step).
async function openFreshAnonymousSession(
  browser: Browser,
  scenario: "default" | "handled" | "redirect" | "redirect-handled"
): Promise<{ page: Page; anonymousUserId: string }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route("**/*accounts.google.com/**", (route) => route.abort());

  await page.goto(scenarioUrl(scenario));
  const anonymousUserId = await waitForAnonymousUser(page);

  return { page, anonymousUserId };
}

for (const projectName of projectsUnderTest) {
  const meta = exampleMeta[projectName] as UiExampleMeta;

  test.describe(`anonymous upgrade (${projectName})`, () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== projectName, `runs only on the ${projectName} project`);
    });

    test("credential upgrade preserves uid and fires onUpgrade", async ({ page }) => {
      await page.goto(scenarioUrl("default"));
      const anonymousUserId = await waitForAnonymousUser(page);

      await submitCredentials(page, uniqueEmail(meta.name, "success"));

      await expectUpgradePreservedUser(page, anonymousUserId);
    });

    test("credential conflict fires onUpgradeFailure and shows the default error", async ({ page, request }) => {
      const email = uniqueEmail(meta.name, "default-conflict");
      await createEmailUser(request, email);
      await page.goto(scenarioUrl("default"));
      const anonymousUserId = await waitForAnonymousUser(page);

      await submitCredentials(page, email);

      await expect(page.getByText(enUs.translations.errors.emailAlreadyInUse)).toBeVisible();
      await expect.poll(() => readStorage<UpgradeFailure>(page, UPGRADE_FAILURE_KEY)).not.toBeNull();
      expect(await readStorage<UpgradeFailure>(page, UPGRADE_FAILURE_KEY)).toEqual({
        oldUserId: anonymousUserId,
        code: "auth/email-already-in-use",
        kind: "credential",
      });
    });

    test("handled credential conflict suppresses the default error", async ({ page, request }) => {
      const email = uniqueEmail(meta.name, "handled-conflict");
      await createEmailUser(request, email);
      await page.goto(scenarioUrl("handled"));
      const anonymousUserId = await waitForAnonymousUser(page);

      await submitCredentials(page, email);

      await expect.poll(() => readStorage<UpgradeFailure>(page, UPGRADE_FAILURE_KEY)).not.toBeNull();
      expect(await readStorage<UpgradeFailure>(page, UPGRADE_FAILURE_KEY)).toEqual({
        oldUserId: anonymousUserId,
        code: "auth/email-already-in-use",
        kind: "credential",
      });
      await expect(page.getByText(enUs.translations.errors.emailAlreadyInUse)).toHaveCount(0);
    });

    test("provider redirect preserves anonymous upgrade state across the round trip", async ({ page, request }) => {
      // Keep the emulator IdP chooser deterministic even when a developer reuses an existing emulator.
      await clearEmulatorUsers(request);
      await page.goto(scenarioUrl("redirect"));
      const anonymousUserId = await waitForAnonymousUser(page);

      await completeGoogleRedirect(page, uniqueEmail(meta.name, "redirect"));

      await expectUpgradePreservedUser(page, anonymousUserId);
      await expect
        .poll(() => page.evaluate((key) => window.localStorage.getItem(key), REDIRECT_USER_ID_KEY))
        .toBeNull();
    });

    test("provider redirect conflict fires onUpgradeFailure and shows the default error", async ({
      page,
      request,
      browser,
    }) => {
      // Keep the emulator IdP chooser deterministic even when a developer reuses an existing emulator.
      await clearEmulatorUsers(request);
      const conflictEmail = uniqueEmail(meta.name, "redirect-conflict");

      // The first anonymous user links via redirect and becomes the permanent owner of this
      // Google identity.
      await page.goto(scenarioUrl("redirect"));
      await waitForAnonymousUser(page);
      await completeGoogleRedirect(page, conflictEmail);
      await expect.poll(() => readStorage<UpgradeResult>(page, UPGRADE_RESULT_KEY)).not.toBeNull();

      // A second, independent anonymous user attempts to link the same Google identity via
      // redirect. `getRedirectResult()` rejects, so this only passes if `onUpgradeFailure` is
      // wired into the redirect path in `config.ts` (not just the popup/credential paths).
      const { page: conflictPage, anonymousUserId: secondAnonymousUserId } = await openFreshAnonymousSession(
        browser,
        "redirect"
      );

      await completeGoogleRedirect(conflictPage, conflictEmail);

      // The emulator's fake Google identity doesn't reuse the same provider UID for a repeated
      // email, so linking fails on the email conflict rather than an already-linked credential.
      await expect(conflictPage.getByText(enUs.translations.errors.emailAlreadyInUse)).toBeVisible();
      await expect.poll(() => readStorage<UpgradeFailure>(conflictPage, UPGRADE_FAILURE_KEY)).not.toBeNull();
      expect(await readStorage<UpgradeFailure>(conflictPage, UPGRADE_FAILURE_KEY)).toEqual({
        oldUserId: secondAnonymousUserId,
        code: "auth/email-already-in-use",
        kind: "provider",
      });

      await conflictPage.context().close();
    });

    test("handled provider redirect conflict suppresses the default error", async ({ page, request, browser }) => {
      await clearEmulatorUsers(request);
      const conflictEmail = uniqueEmail(meta.name, "redirect-handled-conflict");

      await page.goto(scenarioUrl("redirect-handled"));
      await waitForAnonymousUser(page);
      await completeGoogleRedirect(page, conflictEmail);
      await expect.poll(() => readStorage<UpgradeResult>(page, UPGRADE_RESULT_KEY)).not.toBeNull();

      const { page: conflictPage, anonymousUserId: secondAnonymousUserId } = await openFreshAnonymousSession(
        browser,
        "redirect-handled"
      );

      await completeGoogleRedirect(conflictPage, conflictEmail);

      await expect.poll(() => readStorage<UpgradeFailure>(conflictPage, UPGRADE_FAILURE_KEY)).not.toBeNull();
      expect(await readStorage<UpgradeFailure>(conflictPage, UPGRADE_FAILURE_KEY)).toEqual({
        oldUserId: secondAnonymousUserId,
        code: "auth/email-already-in-use",
        kind: "provider",
      });
      await expect(conflictPage.getByText(enUs.translations.errors.emailAlreadyInUse)).toHaveCount(0);

      await conflictPage.context().close();
    });
  });
}
