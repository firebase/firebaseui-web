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

export { EmailLinkAuthForm, type EmailLinkAuthFormProps } from "./forms/email-link-auth-form";
export { ForgotPasswordAuthForm, type ForgotPasswordAuthFormProps } from "./forms/forgot-password-auth-form";
export { PhoneAuthForm, type PhoneAuthFormProps } from "./forms/phone-auth-form";
export {
  SignInAuthForm,
  useSignInAuthForm,
  useSignInAuthFormAction,
  type SignInAuthFormProps,
} from "./forms/sign-in-auth-form";
export { SignUpAuthForm, type SignUpAuthFormProps } from "./forms/sign-up-auth-form";

export { EmailLinkAuthScreen, type EmailLinkAuthScreenProps } from "./screens/email-link-auth-screen";
export { ForgotPasswordAuthScreen, type ForgotPasswordAuthScreenProps } from "./screens/forgot-password-auth-screen";
export { OAuthScreen, type OAuthScreenProps } from "./screens/oauth-screen";
export { PhoneAuthScreen, type PhoneAuthScreenProps } from "./screens/phone-auth-screen";
export { SignInAuthScreen, type SignInAuthScreenProps } from "./screens/sign-in-auth-screen";
export { SignUpAuthScreen, type SignUpAuthScreenProps } from "./screens/sign-up-auth-screen";

export { GoogleSignInButton, GoogleIcon, type GoogleSignInButtonProps } from "./oauth/google-sign-in-button";
export { OAuthButton, type OAuthButtonProps } from "./oauth/oauth-button";
