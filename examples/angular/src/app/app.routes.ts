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

import { type Routes } from "@angular/router";
import { routes as routeConfigs, hiddenRoutes } from "./routes";
import { ScreenRouteLayoutComponent } from "./components/screen-route-layout/screen-route-layout.component";

const allRoutes = [...routeConfigs, ...hiddenRoutes];

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home").then((m) => m.HomeComponent),
  },
  {
    path: "screens",
    component: ScreenRouteLayoutComponent,
    children: allRoutes.map((route) => ({
      path: route.path.replace(/^\/screens\//, ""),
      loadComponent: route.loadComponent,
    })),
  },
  {
    path: "**",
    redirectTo: "",
  },
];
