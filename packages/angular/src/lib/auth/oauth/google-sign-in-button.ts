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

import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GoogleAuthProvider, UserCredential } from "@angular/fire/auth";
import { injectTranslation, injectUI } from "../../provider";
import { OAuthButtonComponent } from "./oauth-button";
import { GoogleLogoComponent } from "../../components/logos/google";

@Component({
  selector: "fui-google-sign-in-button",
  standalone: true,
  imports: [CommonModule, OAuthButtonComponent, GoogleLogoComponent],
  host: {
    style: "display: block;",
  },
  template: `
    <fui-oauth-button [provider]="googleProvider" [themed]="themed()" (signIn)="signIn.emit($event)">
      <fui-google-logo />
      <span>{{ signInWithGoogleLabel() }}</span>
    </fui-oauth-button>
  `,
})
/**
 * A button component for signing in with Google.
 */
export class GoogleSignInButtonComponent {
  ui = injectUI();
  signInWithGoogleLabel = injectTranslation("labels", "signInWithGoogle");
  /** Whether to use themed styling. */
  themed = input<boolean | "neutral">(false);
  /** Event emitter for successful sign-in. */
  signIn = output<UserCredential>();

  private defaultProvider = new GoogleAuthProvider();

  /** Optional custom OAuth provider configuration. */
  provider = input<GoogleAuthProvider>();

  get googleProvider() {
    return this.provider() || this.defaultProvider;
  }
}
