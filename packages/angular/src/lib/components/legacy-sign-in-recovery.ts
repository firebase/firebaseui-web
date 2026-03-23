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

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ButtonComponent } from "./button";
import { injectClearLegacySignInRecovery, injectLegacySignInRecovery, injectTranslation } from "../provider";
import { AppleSignInButtonComponent } from "../auth/oauth/apple-sign-in-button";
import { FacebookSignInButtonComponent } from "../auth/oauth/facebook-sign-in-button";
import { GitHubSignInButtonComponent } from "../auth/oauth/github-sign-in-button";
import { GoogleSignInButtonComponent } from "../auth/oauth/google-sign-in-button";
import { MicrosoftSignInButtonComponent } from "../auth/oauth/microsoft-sign-in-button";
import { TwitterSignInButtonComponent } from "../auth/oauth/twitter-sign-in-button";
import { YahooSignInButtonComponent } from "../auth/oauth/yahoo-sign-in-button";

@Component({
  selector: "fui-legacy-sign-in-recovery",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    AppleSignInButtonComponent,
    FacebookSignInButtonComponent,
    GitHubSignInButtonComponent,
    GoogleSignInButtonComponent,
    MicrosoftSignInButtonComponent,
    TwitterSignInButtonComponent,
    YahooSignInButtonComponent,
  ],
  host: {
    style: "display: block;",
  },
  template: `
    @if (recovery()) {
      <div class="fui-legacy-sign-in-recovery">
        <p>{{ recoveryPromptLabel() }}</p>
        <p>{{ selectMethodLabel() }}</p>
        <div class="fui-screen__children">
          @if (hasMethod("google.com")) {
            <fui-google-sign-in-button (signIn)="clearRecovery()" />
          }
          @if (hasMethod("github.com")) {
            <fui-github-sign-in-button (signIn)="clearRecovery()" />
          }
          @if (hasMethod("facebook.com")) {
            <fui-facebook-sign-in-button (signIn)="clearRecovery()" />
          }
          @if (hasMethod("apple.com")) {
            <fui-apple-sign-in-button (signIn)="clearRecovery()" />
          }
          @if (hasMethod("microsoft.com")) {
            <fui-microsoft-sign-in-button (signIn)="clearRecovery()" />
          }
          @if (hasMethod("twitter.com")) {
            <fui-twitter-sign-in-button (signIn)="clearRecovery()" />
          }
          @if (hasMethod("yahoo.com")) {
            <fui-yahoo-sign-in-button (signIn)="clearRecovery()" />
          }
        </div>
        @if (hasMethod("password")) {
          <p>{{ emailPasswordLabel() }}</p>
        }
        @if (hasMethod("emailLink")) {
          <p>{{ emailLinkLabel() }}</p>
        }
        <button fui-button type="button" variant="secondary" (click)="clearRecovery()">
          {{ dismissLabel() }}
        </button>
      </div>
    }
  `,
})
/**
 * Displays default recovery UI for legacy sign-in method suggestions.
 */
export class LegacySignInRecoveryComponent {
  recovery = injectLegacySignInRecovery();
  private clearLegacyRecovery = injectClearLegacySignInRecovery();
  recoveryPromptTemplate = injectTranslation("messages", "legacySignInRecoveryPrompt" as never);
  selectMethodText = injectTranslation("messages", "legacySignInRecoverySelectMethod" as never);
  emailPasswordText = injectTranslation("messages", "legacySignInRecoveryEmailPassword" as never);
  emailLinkText = injectTranslation("messages", "legacySignInRecoveryEmailLink" as never);
  dismissText = injectTranslation("labels", "dismiss" as never);

  recoveryPromptLabel() {
    const recovery = this.recovery();
    if (!recovery) {
      return "";
    }

    return this.recoveryPromptTemplate().replace("{email}", recovery.email);
  }

  selectMethodLabel() {
    return this.selectMethodText();
  }

  emailPasswordLabel() {
    return this.emailPasswordText();
  }

  emailLinkLabel() {
    return this.emailLinkText();
  }

  dismissLabel() {
    return this.dismissText();
  }

  hasMethod(method: string) {
    return this.recovery()?.signInMethods.includes(method) ?? false;
  }

  clearRecovery() {
    this.clearLegacyRecovery();
  }
}
