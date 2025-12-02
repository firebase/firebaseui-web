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

import { Component, computed, inject, input } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Auth, multiFactor, sendEmailVerification, signOut, type User } from "@angular/fire/auth";
import { routes } from "./routes";
import { ThemeToggleComponent } from "./components/theme-toggle/theme-toggle.component";
import { PirateToggleComponent } from "./components/pirate-toggle/pirate-toggle.component";
import { MultiFactorAuthAssertionScreenComponent } from "@firebase-oss/ui-angular";
import { injectUI } from "@firebase-oss/ui-angular";

@Component({
  selector: "app-unauthenticated",
  standalone: true,
  imports: [CommonModule, RouterModule, MultiFactorAuthAssertionScreenComponent],
  template: `
    @if (mfaResolver()) {
      <fui-multi-factor-auth-assertion-screen />
    } @else {
      <div class="max-w-sm mx-auto pt-36 space-y-6 pb-36">
        <div class="text-center space-y-4">
          <img src="/firebase-logo-inverted.png" alt="Firebase UI" class="hidden dark:block h-36 mx-auto" />
          <img src="/firebase-logo.png" alt="Firebase UI" class="block dark:hidden h-36 mx-auto" />
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Welcome to Firebase UI, choose an example screen below to get started!
          </p>
        </div>
        <div
          class="border border-neutral-200 dark:border-neutral-800 rounded divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden"
        >
          @for (route of routes; track route.path) {
            <a
              [routerLink]="route.path"
              class="flex items-center justify-between hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 p-4"
            >
              <div class="space-y-1">
                <h2 class="font-medium text-sm">{{ route.name }}</h2>
                <p class="text-xs text-gray-400 dark:text-gray-300">{{ route.description }}</p>
              </div>
              <div class="text-neutral-600 dark:text-neutral-400">
                <span class="text-xl">&rarr;</span>
              </div>
            </a>
          }
        </div>
      </div>
    }
  `,
})
export class UnauthenticatedAppComponent {
  ui = injectUI();
  routes = routes;

  mfaResolver = computed(() => this.ui().multiFactorResolver);
}

@Component({
  selector: "app-authenticated",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-sm mx-auto pt-36 space-y-6 pb-36">
      <div class="border border-neutral-200 dark:border-neutral-800 rounded-md p-4 space-y-4">
        <h1 class="text-md font-medium">Welcome, {{ user().displayName || user().email || user().phoneNumber }}</h1>
        @if (user().email) {
          @if (user().emailVerified) {
            <div class="text-green-500">Email verified</div>
          } @else {
            <button class="bg-red-500 text-white px-3 py-1.5 rounded text-sm" (click)="verifyEmail()">
              Verify Email &rarr;
            </button>
          }
        }
        <hr class="opacity-30" />
        <h2 class="text-sm font-medium">Multi-factor Authentication</h2>
        @for (factor of mfaFactors(); track factor.factorId) {
          <div>{{ factor.factorId }} - {{ factor.displayName }}</div>
        }
        <button class="bg-blue-500 text-white px-3 py-1.5 rounded text-sm" (click)="navigateToMfa()">
          Add MFA Factor &rarr;
        </button>
        <hr class="opacity-30" />
        <button class="bg-blue-500 text-white px-3 py-1.5 rounded text-sm" (click)="signOut()">Sign Out &rarr;</button>
      </div>
    </div>
  `,
})
export class AuthenticatedAppComponent {
  user = input.required<User>();
  private auth = inject(Auth);
  private router = inject(Router);

  mfaFactors = computed(() => {
    const mfa = multiFactor(this.user());
    return mfa.enrolledFactors;
  });

  async verifyEmail() {
    try {
      await sendEmailVerification(this.user());
      alert("Email verification sent, please check your email");
    } catch (error) {
      console.error(error);
      alert("Error sending email verification, check console");
    }
  }

  navigateToMfa() {
    this.router.navigate(["/screens/mfa-enrollment-screen"]);
  }

  async signOut() {
    await signOut(this.auth);
  }
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent, PirateToggleComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent {}
