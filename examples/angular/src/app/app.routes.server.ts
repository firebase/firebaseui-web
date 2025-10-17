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

import { RenderMode, type ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  /** Home page - perfect for SSG as it's a static landing page */
  {
    path: "",
    renderMode: RenderMode.Prerender,
  },
  /** Static auth demos - good for SSG as they showcase Firebase UI components */
  {
    path: "sign-in",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "oauth",
    renderMode: RenderMode.Prerender,
  },
  /** Interactive auth routes - better as CSR for user interaction */
  {
    path: "sign-up",
    renderMode: RenderMode.Client,
  },
  {
    path: "forgot-password",
    renderMode: RenderMode.Client,
  },
  /** Dynamic auth routes - good for SSR as they may need server-side data */
  {
    path: "email-link",
    renderMode: RenderMode.Server,
  },
  {
    path: "email-link-oauth",
    renderMode: RenderMode.Server,
  },
  {
    path: "phone",
    renderMode: RenderMode.Server,
  },
  {
    path: "phone-oauth",
    renderMode: RenderMode.Server,
  },
  {
    path: "sign-in-oauth",
    renderMode: RenderMode.Server,
  },
  {
    path: "sign-up-oauth",
    renderMode: RenderMode.Server,
  },
  /** All other routes will be rendered on the server (SSR) */
  {
    path: "**",
    renderMode: RenderMode.Server,
  },
];
