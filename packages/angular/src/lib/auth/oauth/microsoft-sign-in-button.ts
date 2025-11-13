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
import { OAuthButtonComponent } from "./oauth-button";
import { injectTranslation } from "../../provider";
import { OAuthProvider, UserCredential } from "@angular/fire/auth";
import { MicrosoftLogoComponent } from "../../components/logos/microsoft";

@Component({
  selector: "fui-microsoft-sign-in-button",
  standalone: true,
  imports: [CommonModule, OAuthButtonComponent, MicrosoftLogoComponent],
  host: {
    style: "display: block;",
  },
  template: `
    <fui-oauth-button [provider]="microsoftProvider" [themed]="themed()" (signIn)="signIn.emit($event)">
      <fui-microsoft-logo />
      <span>{{ signInWithMicrosoftLabel() }}</span>
    </fui-oauth-button>
  `,
})
export class MicrosoftSignInButtonComponent {
  signInWithMicrosoftLabel = injectTranslation("labels", "signInWithMicrosoft");
  themed = input<boolean>(false);
  signIn = output<UserCredential>();

  private defaultProvider = new OAuthProvider("microsoft.com");

  provider = input<OAuthProvider>();

  get microsoftProvider() {
    return this.provider() || this.defaultProvider;
  }
}
