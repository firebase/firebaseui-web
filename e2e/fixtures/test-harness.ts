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

import { test as base, expect } from "@playwright/test";
import { startV8Coverage, stopV8Coverage } from "./v8-coverage";

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Block Google One Tap (accounts.google.com): external script is flaky in e2e and
    // unnecessary for sign-in form smoke tests (AD-5). Prefer route blocking over app flags.
    await page.route("**/*accounts.google.com/**", (route) => route.abort());

    const coverageSession = testInfo.project.name !== "custom-auth-server" ? await startV8Coverage(page) : null;

    await use(page);

    if (coverageSession) {
      await stopV8Coverage(coverageSession, testInfo.title, testInfo.project.name);
    }
  },
});

export { expect };
