/**
 * Copyright 2026 Google LLC
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

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  SignInAuthScreenComponent,
  ContentComponent,
  GoogleSignInButtonComponent,
  FacebookSignInButtonComponent,
  AppleSignInButtonComponent,
  GitHubSignInButtonComponent,
  MicrosoftSignInButtonComponent,
  TwitterSignInButtonComponent,
  YahooSignInButtonComponent,
  injectLegacySignInRecovery,
  injectClearLegacySignInRecovery,
} from "@firebase-oss/ui-angular";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-legacy-recovery-demo",
  standalone: true,
  imports: [
    CommonModule,
    SignInAuthScreenComponent,
    ContentComponent,
    GoogleSignInButtonComponent,
    FacebookSignInButtonComponent,
    AppleSignInButtonComponent,
    GitHubSignInButtonComponent,
    MicrosoftSignInButtonComponent,
    TwitterSignInButtonComponent,
    YahooSignInButtonComponent,
  ],
  template: `
    <div class="max-w-sm mx-auto pt-10 text-sm text-gray-700 dark:text-gray-300 space-y-3">
      <p class="font-medium text-base text-black dark:text-white">Legacy recovery demo</p>
      <p>Use this screen to test wrong-provider recovery with both email/password and OAuth attempts.</p>
      <p>
        Suggested flow: create an account with Google first, sign out, then come back here and try the same email with
        email/password or another provider like GitHub.
      </p>
    </div>

    <fui-sign-in-auth-screen (signIn)="onSignIn()" [showLegacySignInRecovery]="!handled">
      <fui-content>
        <fui-google-sign-in-button />
        <fui-facebook-sign-in-button />
        <fui-apple-sign-in-button />
        <fui-github-sign-in-button />
        <fui-microsoft-sign-in-button />
        <fui-twitter-sign-in-button />
        <fui-yahoo-sign-in-button />
      </fui-content>
    </fui-sign-in-auth-screen>

    @if (handled && recovery()) {
      <div data-testid="custom-legacy-recovery" class="max-w-sm mx-auto mt-4 text-sm border rounded-md p-4 space-y-2">
        <p class="font-medium">Custom recovery UI</p>
        <p>
          Previous sign-in methods for
          <span data-testid="custom-legacy-recovery-email">{{ recovery()!.email }}</span
          >:
          <span data-testid="custom-legacy-recovery-methods">{{ recovery()!.signInMethods.join(", ") }}</span>
        </p>
        <button type="button" (click)="clearRecovery()" class="underline">Custom dismiss</button>
      </div>
    }
  `,
  styles: [],
})
/**
 * Demo screen combining email/password and OAuth sign-in, used to exercise the
 * `legacyFetchSignInWithEmail` recovery flow in e2e tests.
 */
export class LegacyRecoveryDemoComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  recovery = injectLegacySignInRecovery();
  private clearLegacyRecovery = injectClearLegacySignInRecovery();

  // e2e scenario switch: "handled" suppresses the default recovery modal in favor of the custom
  // UI above, proving apps can opt out of the built-in flow.
  handled = this.route.snapshot.queryParamMap.get("legacyRecovery") === "handled";

  onSignIn() {
    this.router.navigate(["/"]);
  }

  clearRecovery() {
    this.clearLegacyRecovery();
  }
}
