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

@Component({
  selector: "app-theme-toggle",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="fixed z-10 size-10 top-8 right-8 border border-gray-300 dark:border-gray-700 rounded-md p-2 group/toggle extend-touch-target"
      (click)="toggleTheme()"
      type="button"
      title="Toggle theme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4.5"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
      <span class="sr-only">Toggle theme</span>
    </button>
  `,
  styles: [],
})
export class ThemeToggleComponent {
  toggleTheme() {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains("dark");
    htmlElement.classList.toggle("dark", !isDark);
    localStorage["theme"] = htmlElement.classList.contains("dark") ? "dark" : "light";
  }
}
