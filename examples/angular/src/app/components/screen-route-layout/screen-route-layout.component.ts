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

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-screen-route-layout",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8">
      <a
        routerLink="/"
        class="border border-gray-300 dark:border-gray-700 border-rounded px-4 py-2 rounded-md text-sm inline-block"
      >
        &larr; Back to overview
      </a>
      <div class="pt-12">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [],
})
export class ScreenRouteLayoutComponent {}

