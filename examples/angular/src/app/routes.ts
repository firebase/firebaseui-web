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

import type { Type } from "@angular/core";

export interface RouteConfig {
  name: string;
  description: string;
  path: string;
  loadComponent: () => Promise<{ default: Type<unknown> } | Type<unknown>>;
}

export const routes: RouteConfig[] = [
  {
    name: "Sign In Screen",
    description: "A sign in screen with email and password.",
    path: "/screens/sign-in-auth-screen",
    loadComponent: () => import("./screens/sign-in-auth-screen").then((m) => m.SignInAuthScreenWrapperComponent),
  },
  {
    name: "Sign In Screen (with handlers)",
    description: "A sign in screen with email and password, with forgot password and register handlers.",
    path: "/screens/sign-in-auth-screen-w-handlers",
    loadComponent: () =>
      import("./screens/sign-in-auth-screen-w-handlers").then((m) => m.SignInAuthScreenWithHandlersComponent),
  },
  {
    name: "Sign In Screen (with OAuth)",
    description: "A sign in screen with email and password, with oAuth buttons.",
    path: "/screens/sign-in-auth-screen-w-oauth",
    loadComponent: () =>
      import("./screens/sign-in-auth-screen-w-oauth").then((m) => m.SignInAuthScreenWithOAuthComponent),
  },
  {
    name: "Sign Up Screen",
    description: "A sign up screen with email and password.",
    path: "/screens/sign-up-auth-screen",
    loadComponent: () => import("./screens/sign-up-auth-screen").then((m) => m.SignUpAuthScreenWrapperComponent),
  },
  {
    name: "Sign Up Screen (with handlers)",
    description: "A sign up screen with email and password, sign in handlers.",
    path: "/screens/sign-up-auth-screen-w-handlers",
    loadComponent: () =>
      import("./screens/sign-up-auth-screen-w-handlers").then((m) => m.SignUpAuthScreenWithHandlersComponent),
  },
  {
    name: "Sign Up Screen (with OAuth)",
    description: "A sign in screen with email and password, with oAuth buttons.",
    path: "/screens/sign-up-auth-screen-w-oauth",
    loadComponent: () =>
      import("./screens/sign-up-auth-screen-w-oauth").then((m) => m.SignUpAuthScreenWithOAuthComponent),
  },
  {
    name: "Email Link Auth Screen",
    description: "A screen allowing a user to send an email link for sign in.",
    path: "/screens/email-link-auth-screen",
    loadComponent: () =>
      import("./screens/email-link-auth-screen").then((m) => m.EmailLinkAuthScreenWrapperComponent),
  },
  {
    name: "Email Link Auth Screen (with OAuth)",
    description: "A screen allowing a user to send an email link for sign in, with oAuth buttons.",
    path: "/screens/email-link-auth-screen-w-oauth",
    loadComponent: () =>
      import("./screens/email-link-auth-screen-w-oauth").then((m) => m.EmailLinkAuthScreenWithOAuthComponent),
  },
  {
    name: "Forgot Password Screen",
    description: "A screen allowing a user to reset their password.",
    path: "/screens/forgot-password-auth-screen",
    loadComponent: () =>
      import("./screens/forgot-password-auth-screen").then((m) => m.ForgotPasswordAuthScreenWrapperComponent),
  },
  {
    name: "Forgot Password Screen (with handlers)",
    description: "A screen allowing a user to reset their password, with forgot password and register handlers.",
    path: "/screens/forgot-password-auth-screen-w-handlers",
    loadComponent: () =>
      import("./screens/forgot-password-auth-screen-w-handlers").then(
        (m) => m.ForgotPasswordAuthScreenWithHandlersComponent
      ),
  },
  {
    name: "OAuth Screen",
    description: "A screen which allows a user to sign in with OAuth only.",
    path: "/screens/oauth-screen",
    loadComponent: () => import("./screens/oauth-screen").then((m) => m.OAuthScreenWrapperComponent),
  },
  {
    name: "Phone Auth Screen",
    description: "A screen allowing a user to sign in with a phone number.",
    path: "/screens/phone-auth-screen",
    loadComponent: () => import("./screens/phone-auth-screen").then((m) => m.PhoneAuthScreenWrapperComponent),
  },
  {
    name: "Phone Auth Screen (with OAuth)",
    description: "A screen allowing a user to sign in with a phone number, with oAuth buttons.",
    path: "/screens/phone-auth-screen-w-oauth",
    loadComponent: () =>
      import("./screens/phone-auth-screen-w-oauth").then((m) => m.PhoneAuthScreenWithOAuthComponent),
  },
] as const;

export const hiddenRoutes: RouteConfig[] = [
  {
    name: "MFA Enrollment Screen",
    description: "A screen allowing a user to enroll in multi-factor authentication.",
    path: "/screens/mfa-enrollment-screen",
    loadComponent: () => import("./screens/mfa-enrollment-screen").then((m) => m.MfaEnrollmentScreenComponent),
  },
] as const;

