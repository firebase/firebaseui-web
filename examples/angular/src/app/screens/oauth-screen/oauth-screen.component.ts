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

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  OAuthScreenComponent,
  GoogleSignInButtonComponent,
  FacebookSignInButtonComponent,
  AppleSignInButtonComponent,
  GitHubSignInButtonComponent,
  MicrosoftSignInButtonComponent,
  TwitterSignInButtonComponent,
} from "@invertase/firebaseui-angular";
import type { UserCredential } from "firebase/auth";
import { Router } from "@angular/router";

@Component({
  selector: "app-oauth-screen",
  standalone: true,
  imports: [
    CommonModule,
    OAuthScreenComponent,
    GoogleSignInButtonComponent,
    FacebookSignInButtonComponent,
    AppleSignInButtonComponent,
    GitHubSignInButtonComponent,
    MicrosoftSignInButtonComponent,
    TwitterSignInButtonComponent,
  ],
  template: `
    <fui-oauth-screen (onSignIn)="onSignIn($event)">
      <fui-google-sign-in-button [themed]="themed() ? 'neutral' : false" />
      <fui-facebook-sign-in-button [themed]="themed()" />
      <fui-apple-sign-in-button [themed]="themed()" />
      <fui-github-sign-in-button [themed]="themed()" />
      <fui-microsoft-sign-in-button [themed]="themed()" />
      <fui-twitter-sign-in-button [themed]="themed()" />
    </fui-oauth-screen>
    <div class="max-w-sm mx-auto mt-12">
      <label for="themed">
        <input type="checkbox" id="themed" [checked]="themed()" (change)="themed.set(!themed())" />
        Themed</label
      >
    </div>
  `,
  styles: [],
})
export class OAuthScreenWrapperComponent {
  themed = signal(false);
  private router = inject(Router);

  onSignIn(credential: UserCredential) {
    console.log("sign in", credential);
    this.router.navigate(["/"]);
  }
}
