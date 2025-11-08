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

import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GoogleAuthProvider } from "@angular/fire/auth";
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
    <fui-oauth-button [provider]="googleProvider" [themed]="themed()">
      <fui-google-logo />
      <span>{{ signInWithGoogleLabel() }}</span>
    </fui-oauth-button>
  `,
})
export class GoogleSignInButtonComponent {
  ui = injectUI();
  signInWithGoogleLabel = injectTranslation("labels", "signInWithGoogle");
  themed = input<boolean | 'neutral'>(false);
  
  private defaultProvider = new GoogleAuthProvider();

  provider = input<GoogleAuthProvider>();

  get googleProvider() {
    return this.provider() || this.defaultProvider;
  }
}
