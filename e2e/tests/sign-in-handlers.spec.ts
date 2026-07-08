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

import { enUs } from "@firebase-oss/ui-translations";
import { signInWithHandlersUrl, uiExampleEntries } from "../fixtures/example-meta";
import { expect, test } from "../fixtures/test-harness";

const { labels, errors } = enUs.translations;

async function waitForSignInForm(page: import("@playwright/test").Page): Promise<void> {
  await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 30_000 });
}

for (const [projectName, meta] of uiExampleEntries) {
  test.describe(`sign-in with handlers smoke (${projectName})`, () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== projectName, `runs only on the ${projectName} project`);
    });

    test("S1: sign-in form shows email, password, and submit", async ({ page }) => {
      await page.goto(signInWithHandlersUrl(meta));
      await waitForSignInForm(page);

      await expect(page.getByLabel(labels.emailAddress)).toBeVisible();
      await expect(page.getByLabel(labels.password)).toBeVisible();
      await expect(page.getByRole("button", { name: labels.signIn, exact: true })).toBeVisible();
    });

    test("S2: empty submit shows email validation feedback", async ({ page }) => {
      await page.goto(signInWithHandlersUrl(meta));
      await waitForSignInForm(page);

      await page.getByRole("button", { name: labels.signIn, exact: true }).click();

      // React uses role="alert"; shadcn FormMessage renders as <p> — assert visible copy, not role.
      await expect(page.getByText(errors.invalidEmail)).toBeVisible();
    });

    test("S3: forgot-password navigates to reset screen", async ({ page }) => {
      await page.goto(signInWithHandlersUrl(meta));
      await waitForSignInForm(page);

      await page.getByRole("button", { name: labels.forgotPassword }).click();

      // React CardTitle is <h2>; shadcn CardTitle is a styled <div> — assert screen chrome + email field.
      await expect(page.getByText(labels.resetPassword).first()).toBeVisible();
      await expect(page.getByLabel(labels.emailAddress)).toBeVisible();
      await expect(page.getByRole("button", { name: labels.resetPassword })).toBeVisible();
    });
  });
}
