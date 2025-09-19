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

import { RenderMode, ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  /** Home page - perfect for SSG as it's a static landing page */
  {
    path: "",
    renderMode: RenderMode.Prerender,
  },
  /** Key auth screen demos - good for SSG as they showcase Firebase UI components */
  {
    path: "screens/sign-in-auth-screen",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "screens/oauth-screen",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "screens/sign-up-auth-screen",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "screens/email-link-auth-screen",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "screens/phone-auth-screen",
    renderMode: RenderMode.Prerender,
  },
  /** Interactive auth routes - better as CSR for user interaction */
  {
    path: "sign-in",
    renderMode: RenderMode.Client,
  },
  {
    path: "register",
    renderMode: RenderMode.Client,
  },
  {
    path: "forgot-password",
    renderMode: RenderMode.Client,
  },
  /** All other routes will be rendered on the server (SSR) */
  {
    path: "**",
    renderMode: RenderMode.Server,
  },
];
