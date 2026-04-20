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

import { Component, inject, type OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
  AppleSignInButtonComponent,
  FacebookSignInButtonComponent,
  GitHubSignInButtonComponent,
  GoogleSignInButtonComponent,
  MicrosoftSignInButtonComponent,
  TwitterSignInButtonComponent,
  YahooSignInButtonComponent,
} from "@firebase-oss/ui-angular";
import { PROVIDER_HINT_STORAGE_KEY, type StoredProviderHint } from "./sign-in-with-provider-tracking";

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  "google.com": "Google",
  "apple.com": "Apple",
  "facebook.com": "Facebook",
  "github.com": "GitHub",
  "microsoft.com": "Microsoft",
  "twitter.com": "Twitter / X",
  "yahoo.com": "Yahoo",
};

function getStoredHint(): StoredProviderHint | null {
  try {
    const raw = localStorage.getItem(PROVIDER_HINT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProviderHint) : null;
  } catch {
    return null;
  }
}

@Component({
  selector: "app-provider-hint",
  standalone: true,
  imports: [
    CommonModule,
    GoogleSignInButtonComponent,
    AppleSignInButtonComponent,
    FacebookSignInButtonComponent,
    GitHubSignInButtonComponent,
    MicrosoftSignInButtonComponent,
    TwitterSignInButtonComponent,
    YahooSignInButtonComponent,
  ],
  template: `
    @if (hint() && hint()!.providers.length > 0) {
      <div class="max-w-sm mx-auto space-y-6">
        <div
          class="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-4 space-y-2"
        >
          <p class="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Looks like you previously signed in with {{ providerNames() }}.
          </p>
          <p class="text-sm text-amber-700 dark:text-amber-300">
            Use the button below to sign in with the provider you used before.
          </p>
        </div>

        <div class="space-y-2">
          @for (providerId of hint()!.providers; track providerId) {
            @switch (providerId) {
              @case ("google.com") {
                <fui-google-sign-in-button (signIn)="onSignIn()" />
              }
              @case ("apple.com") {
                <fui-apple-sign-in-button (signIn)="onSignIn()" />
              }
              @case ("facebook.com") {
                <fui-facebook-sign-in-button (signIn)="onSignIn()" />
              }
              @case ("github.com") {
                <fui-github-sign-in-button (signIn)="onSignIn()" />
              }
              @case ("microsoft.com") {
                <fui-microsoft-sign-in-button (signIn)="onSignIn()" />
              }
              @case ("twitter.com") {
                <fui-twitter-sign-in-button (signIn)="onSignIn()" />
              }
              @case ("yahoo.com") {
                <fui-yahoo-sign-in-button (signIn)="onSignIn()" />
              }
            }
          }
        </div>

        <button class="text-sm underline w-full text-center text-gray-500 dark:text-gray-400" (click)="goBack()">
          Back to sign in
        </button>
      </div>
    } @else {
      <div class="max-w-sm mx-auto space-y-4 text-center pt-12">
        <p class="text-sm text-gray-500 dark:text-gray-400">No provider hint found. Please sign in normally.</p>
        <button class="text-sm underline text-gray-600 dark:text-gray-300" (click)="goBack()">Back to sign in</button>
      </div>
    }
  `,
  styles: [],
})
export class ProviderHintComponent implements OnInit {
  private router = inject(Router);

  hint = signal<StoredProviderHint | null>(null);
  providerNames = signal<string>("");

  ngOnInit(): void {
    const stored = getStoredHint();
    this.hint.set(stored);
    if (stored) {
      this.providerNames.set(stored.providers.map((id) => PROVIDER_DISPLAY_NAMES[id] ?? id).join(" or "));
    }
  }

  onSignIn(): void {
    this.router.navigate(["/"]);
  }

  goBack(): void {
    this.router.navigate(["/screens/sign-in-with-provider-tracking"]);
  }
}

export default ProviderHintComponent;
