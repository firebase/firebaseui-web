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
import { GithubAuthProvider, UserCredential } from "@angular/fire/auth";
import { GithubLogoComponent } from "../../components/logos/github";

@Component({
  selector: "fui-github-sign-in-button",
  standalone: true,
  imports: [CommonModule, OAuthButtonComponent, GithubLogoComponent],
  host: {
    style: "display: block;",
  },
  template: `
    <fui-oauth-button [provider]="githubProvider" [themed]="themed()" (signIn)="signIn.emit($event)">
      <fui-github-logo />
      <span>{{ signInWithGitHubLabel() }}</span>
    </fui-oauth-button>
  `,
})
/**
 * A button component for signing in with GitHub.
 */
export class GitHubSignInButtonComponent {
  signInWithGitHubLabel = injectTranslation("labels", "signInWithGitHub");
  /** Whether to use themed styling. */
  themed = input<boolean>(false);
  /** Event emitter for successful sign-in. */
  signIn = output<UserCredential>();

  private defaultProvider = new GithubAuthProvider();

  /** Optional custom OAuth provider configuration. */
  provider = input<GithubAuthProvider>();

  get githubProvider() {
    return this.provider() || this.defaultProvider;
  }
}
