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

import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home").then((m) => m.HomeComponent),
  },
  {
    path: "email-link",
    loadComponent: () => import("./auth/email-link").then((m) => m.EmailLinkComponent),
  },
  {
    path: "email-link-oauth",
    loadComponent: () => import("./auth/email-link-oauth").then((m) => m.EmailLinkOAuthComponent),
  },
  {
    path: "forgot-password",
    loadComponent: () => import("./auth/forgot-password").then((m) => m.ForgotPasswordComponent),
  },
  {
    path: "oauth",
    loadComponent: () => import("./auth/oauth").then((m) => m.OAuthComponent),
  },
  {
    path: "phone",
    loadComponent: () => import("./auth/phone").then((m) => m.PhoneComponent),
  },
  {
    path: "phone-oauth",
    loadComponent: () => import("./auth/phone-oauth").then((m) => m.PhoneOAuthComponent),
  },
  {
    path: "sign-in",
    loadComponent: () => import("./auth/sign-in").then((m) => m.SignInComponent),
  },
  {
    path: "sign-in-oauth",
    loadComponent: () => import("./auth/sign-in-oauth").then((m) => m.SignInOAuthComponent),
  },
  {
    path: "sign-up",
    loadComponent: () => import("./auth/sign-up").then((m) => m.SignUpComponent),
  },
  {
    path: "sign-up-oauth",
    loadComponent: () => import("./auth/sign-up-oauth").then((m) => m.SignUpOAuthComponent),
  },
  {
    path: "**",
    redirectTo: "",
  },
];
