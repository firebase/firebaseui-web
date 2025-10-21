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

export {
  EmailLinkAuthForm,
  type EmailLinkAuthFormProps,
  useEmailLinkAuthFormAction,
  useEmailLinkAuthForm,
} from "./forms/email-link-auth-form";
export {
  ForgotPasswordAuthForm,
  type ForgotPasswordAuthFormProps,
  useForgotPasswordAuthFormAction,
  useForgotPasswordAuthForm,
} from "./forms/forgot-password-auth-form";
export {
  PhoneAuthForm,
  type PhoneAuthFormProps,
  usePhoneNumberForm,
  usePhoneNumberFormAction,
  useVerifyPhoneNumberForm,
  useVerifyPhoneNumberFormAction,
} from "./forms/phone-auth-form";
export {
  SignInAuthForm,
  type SignInAuthFormProps,
  useSignInAuthForm,
  useSignInAuthFormAction,
} from "./forms/sign-in-auth-form";
export {
  SignUpAuthForm,
  type SignUpAuthFormProps,
  useSignUpAuthForm,
  useSignUpAuthFormAction,
} from "./forms/sign-up-auth-form";

export { EmailLinkAuthScreen, type EmailLinkAuthScreenProps } from "./screens/email-link-auth-screen";
export { ForgotPasswordAuthScreen, type ForgotPasswordAuthScreenProps } from "./screens/forgot-password-auth-screen";
export { OAuthScreen, type OAuthScreenProps } from "./screens/oauth-screen";
export { PhoneAuthScreen, type PhoneAuthScreenProps } from "./screens/phone-auth-screen";
export { SignInAuthScreen, type SignInAuthScreenProps } from "./screens/sign-in-auth-screen";
export { SignUpAuthScreen, type SignUpAuthScreenProps } from "./screens/sign-up-auth-screen";

export { AppleSignInButton, AppleLogo, type AppleSignInButtonProps } from "./oauth/apple-sign-in-button";
export { FacebookSignInButton, FacebookLogo, type FacebookSignInButtonProps } from "./oauth/facebook-sign-in-button";
export { GitHubSignInButton, GitHubLogo, type GitHubSignInButtonProps } from "./oauth/github-sign-in-button";
export { GoogleSignInButton, GoogleLogo, type GoogleSignInButtonProps } from "./oauth/google-sign-in-button";
export {
  MicrosoftSignInButton,
  MicrosoftLogo,
  type MicrosoftSignInButtonProps,
} from "./oauth/microsoft-sign-in-button";
export { TwitterSignInButton, TwitterLogo, type TwitterSignInButtonProps } from "./oauth/twitter-sign-in-button";
export { OAuthButton, useSignInWithProvider, type OAuthButtonProps } from "./oauth/oauth-button";
