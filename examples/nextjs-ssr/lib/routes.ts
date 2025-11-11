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

export const routes = [
  {
    name: "Sign In Screen",
    description: "A sign in screen with email and password.",
    path: "/screens/sign-in-auth-screen",
  },
  {
    name: "Sign In Screen (with handlers)",
    description: "A sign in screen with email and password, with forgot password and register handlers.",
    path: "/screens/sign-in-auth-screen-w-handlers",
  },
  {
    name: "Sign In Screen (with OAuth)",
    description: "A sign in screen with email and password, with oAuth buttons.",
    path: "/screens/sign-in-auth-screen-w-oauth",
  },
  {
    name: "Sign Up Screen",
    description: "A sign up screen with email and password.",
    path: "/screens/sign-up-auth-screen",
  },
  {
    name: "Sign Up Screen (with handlers)",
    description: "A sign up screen with email and password, sign in handlers.",
    path: "/screens/sign-up-auth-screen-w-handlers",
  },
  {
    name: "Sign Up Screen (with OAuth)",
    description: "A sign in screen with email and password, with oAuth buttons.",
    path: "/screens/sign-up-auth-screen-w-oauth",
  },
  {
    name: "Email Link Auth Screen",
    description: "A screen allowing a user to send an email link for sign in.",
    path: "/screens/email-link-auth-screen",
  },
  {
    name: "Email Link Auth Screen (with OAuth)",
    description: "A screen allowing a user to send an email link for sign in, with oAuth buttons.",
    path: "/screens/email-link-auth-screen-w-oauth",
  },
  {
    name: "Forgot Password Screen",
    description: "A screen allowing a user to reset their password.",
    path: "/screens/forgot-password-auth-screen",
  },
  {
    name: "OAuth Screen",
    description: "A screen which allows a user to sign in with OAuth only.",
    path: "/screens/oauth-screen",
  },
  {
    name: "Phone Auth Screen",
    description: "A screen allowing a user to sign in with a phone number.",
    path: "/screens/phone-auth-screen",
  },
  {
    name: "Phone Auth Screen (with OAuth)",
    description: "A screen allowing a user to sign in with a phone number, with oAuth buttons.",
    path: "/screens/phone-auth-screen-w-oauth",
  },
] as const;

export const hiddenRoutes = [
  {
    name: "MFA Enrollment Screen",
    description: "A screen allowing a user to enroll in multi-factor authentication.",
    path: "/screens/mfa-enrollment-screen",
  },
] as const;

