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
import { OAuthButtonComponent } from "./oauth-button";
import { injectTranslation } from "../../provider";
import { GithubAuthProvider } from "@angular/fire/auth";
import { GithubLogoComponent } from "../../components/logos/github";

@Component({
  selector: "fui-github-sign-in-button",
  standalone: true,
  imports: [CommonModule, OAuthButtonComponent, GithubLogoComponent],
  template: `
    <fui-oauth-button [provider]="githubProvider">
      <fui-github-logo />
      <span>{{ signInWithGithubLabel() }}</span>
    </fui-oauth-button>
  `,
})
export class GithubSignInButtonComponent {
  signInWithGithubLabel = injectTranslation("labels", "signInWithGithub");

  private defaultProvider = new GithubAuthProvider();

  provider = input<GithubAuthProvider>();

  get githubProvider() {
    return this.provider() || this.defaultProvider;
  }
}
