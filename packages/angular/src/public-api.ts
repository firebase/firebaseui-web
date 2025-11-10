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

import { isDevMode } from "@angular/core";
import { registerFramework } from "@invertase/firebaseui-core";

export { EmailLinkAuthFormComponent } from "./lib/auth/forms/email-link-auth-form";
export { ForgotPasswordAuthFormComponent } from "./lib/auth/forms/forgot-password-auth-form";
export { MultiFactorAuthAssertionFormComponent } from "./lib/auth/forms/multi-factor-auth-assertion-form";
export { MultiFactorAuthEnrollmentFormComponent } from "./lib/auth/forms/multi-factor-auth-enrollment-form";
export { PhoneAuthFormComponent } from "./lib/auth/forms/phone-auth-form";
export { SignInAuthFormComponent } from "./lib/auth/forms/sign-in-auth-form";
export { SignUpAuthFormComponent } from "./lib/auth/forms/sign-up-auth-form";

export {
  SmsMultiFactorAssertionFormComponent,
  SmsMultiFactorAssertionPhoneFormComponent,
  SmsMultiFactorAssertionVerifyFormComponent,
} from "./lib/auth/forms/mfa/sms-multi-factor-assertion-form";
export { SmsMultiFactorEnrollmentFormComponent } from "./lib/auth/forms/mfa/sms-multi-factor-enrollment-form";
export { TotpMultiFactorAssertionFormComponent } from "./lib/auth/forms/mfa/totp-multi-factor-assertion-form";
export { TotpMultiFactorEnrollmentFormComponent } from "./lib/auth/forms/mfa/totp-multi-factor-enrollment-form";

export { GoogleSignInButtonComponent } from "./lib/auth/oauth/google-sign-in-button";
export { FacebookSignInButtonComponent } from "./lib/auth/oauth/facebook-sign-in-button";
export { AppleSignInButtonComponent } from "./lib/auth/oauth/apple-sign-in-button";
export { MicrosoftSignInButtonComponent } from "./lib/auth/oauth/microsoft-sign-in-button";
export { TwitterSignInButtonComponent } from "./lib/auth/oauth/twitter-sign-in-button";
export { GitHubSignInButtonComponent } from "./lib/auth/oauth/github-sign-in-button";
export { OAuthButtonComponent } from "./lib/auth/oauth/oauth-button";

export { EmailLinkAuthScreenComponent } from "./lib/auth/screens/email-link-auth-screen";
export { ForgotPasswordAuthScreenComponent } from "./lib/auth/screens/forgot-password-auth-screen";
export { MultiFactorAuthAssertionScreenComponent } from "./lib/auth/screens/multi-factor-auth-assertion-screen";
export { MultiFactorAuthEnrollmentScreenComponent } from "./lib/auth/screens/multi-factor-auth-enrollment-screen";
export { OAuthScreenComponent } from "./lib/auth/screens/oauth-screen";
export { PhoneAuthScreenComponent } from "./lib/auth/screens/phone-auth-screen";
export { SignInAuthScreenComponent } from "./lib/auth/screens/sign-in-auth-screen";
export { SignUpAuthScreenComponent } from "./lib/auth/screens/sign-up-auth-screen";

export { ButtonComponent } from "./lib/components/button";
export {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "./lib/components/card";
export { CountrySelectorComponent } from "./lib/components/country-selector";
export { DividerComponent } from "./lib/components/divider";
export { PoliciesComponent } from "./lib/components/policies";
export { ContentComponent } from "./lib/components/content";
export { RedirectErrorComponent } from "./lib/components/redirect-error";

// Provider
export * from "./lib/provider";

if (!isDevMode()) {
  const pkgJson = require("../package.json");
  registerFramework("angular", pkgJson.version);
}
