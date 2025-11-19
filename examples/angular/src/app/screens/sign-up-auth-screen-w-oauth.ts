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

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  SignUpAuthScreenComponent,
  ContentComponent,
  GoogleSignInButtonComponent,
  FacebookSignInButtonComponent,
  AppleSignInButtonComponent,
  GitHubSignInButtonComponent,
  MicrosoftSignInButtonComponent,
  TwitterSignInButtonComponent,
} from "@firebase-oss/ui-angular";
import { Router } from "@angular/router";

@Component({
  selector: "app-sign-up-auth-screen-w-oauth",
  standalone: true,
  imports: [
    CommonModule,
    SignUpAuthScreenComponent,
    ContentComponent,
    GoogleSignInButtonComponent,
    FacebookSignInButtonComponent,
    AppleSignInButtonComponent,
    GitHubSignInButtonComponent,
    MicrosoftSignInButtonComponent,
    TwitterSignInButtonComponent,
  ],
  template: `
    <fui-sign-up-auth-screen (signUp)="onSignUp()">
      <fui-content>
        <fui-google-sign-in-button />
        <fui-facebook-sign-in-button />
        <fui-apple-sign-in-button />
        <fui-github-sign-in-button />
        <fui-microsoft-sign-in-button />
        <fui-twitter-sign-in-button />
      </fui-content>
    </fui-sign-up-auth-screen>
  `,
  styles: [],
})
export class SignUpAuthScreenWithOAuthComponent {
  private router = inject(Router);

  onSignUp() {
    this.router.navigate(["/"]);
  }
}
