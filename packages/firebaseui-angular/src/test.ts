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

// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import "zone.js/testing";
import { getTestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Import all test files explicitly
import "./lib/auth/forms/email-password-form/email-password-form.component.spec";
import "./lib/auth/forms/forgot-password-form/forgot-password-form.component.spec";
import "./lib/auth/forms/phone-form/phone-form.component.spec";
import "./lib/auth/forms/register-form/register-form.component.spec";
import "./lib/auth/oauth/google-sign-in-button.component.spec";
import "./lib/auth/oauth/oauth-button.component.spec";
import "./lib/auth/screens/email-link-auth-screen/email-link-auth-screen.component.spec";
import "./lib/auth/screens/oauth-screen/oauth-screen.component.spec";
import "./lib/auth/screens/password-reset-screen/password-reset-screen.component.spec";
import "./lib/auth/screens/phone-auth-screen/phone-auth-screen.component.spec";
import "./lib/auth/screens/sign-in-auth-screen/sign-in-auth-screen.component.spec";
import "./lib/auth/screens/sign-up-auth-screen/sign-up-auth-screen.component.spec";
import "./lib/components/button/button.component.spec";
import "./lib/components/card/card.component.spec";
import "./lib/components/country-selector/country-selector.component.spec";
import "./lib/components/divider/divider.component.spec";
import "./lib/components/terms-and-privacy/terms-and-privacy.component.spec";
import "./lib/tests/integration/auth/email-link-auth.integration.spec";
import "./lib/tests/integration/auth/email-password-auth.integration.spec";
import "./lib/tests/integration/auth/forgot-password.integration.spec";
