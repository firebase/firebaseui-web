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
import { FacebookAuthProvider } from "@angular/fire/auth";
import { OAuthButtonComponent } from "./oauth-button";
import { injectTranslation, injectUI } from "../../provider";
import { FacebookLogoComponent } from "../../components/logos/facebook";

@Component({
  selector: "fui-facebook-sign-in-button",
  standalone: true,
  imports: [CommonModule, OAuthButtonComponent, FacebookLogoComponent],
  template: `
    <fui-oauth-button [provider]="facebookProvider">
      <fui-facebook-logo />
      <span>{{ signInWithFacebookLabel() }}</span>
    </fui-oauth-button>
  `,
})
export class FacebookSignInButtonComponent {
  ui = injectUI();
  signInWithFacebookLabel = injectTranslation("labels", "signInWithFacebook");

  private defaultProvider = new FacebookAuthProvider();

  provider = input<FacebookAuthProvider>();

  get facebookProvider() {
    return this.provider() || this.defaultProvider;
  }
}
