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

/** Export screens */
export {
  EmailLinkAuthScreen,
  type EmailLinkAuthScreenProps,
} from "./screens/email-link-auth-screen";
export {
  SignInAuthScreen,
  type SignInAuthScreenProps,
} from "./screens/sign-in-auth-screen";

export {
  PhoneAuthScreen,
  type PhoneAuthScreenProps,
} from "./screens/phone-auth-screen";

export {
  SignUpAuthScreen,
  type SignUpAuthScreenProps,
} from "./screens/sign-up-auth-screen";

export { OAuthScreen, type OAuthScreenProps } from "./screens/oauth-screen";

export {
  PasswordResetScreen,
  type PasswordResetScreenProps,
} from "./screens/password-reset-screen";

/** Export forms */
export {
  EmailPasswordForm,
  type EmailPasswordFormProps,
} from "./forms/email-password-form";

export { RegisterForm, type RegisterFormProps } from "./forms/register-form";

/** Export Buttons */
export { GoogleSignInButton } from "./oauth/google-sign-in-button";
