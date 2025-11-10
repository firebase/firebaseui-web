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
import { PhoneAuthScreenComponent, GoogleSignInButtonComponent, ContentComponent } from "@invertase/firebaseui-angular";
import type { UserCredential } from "firebase/auth";
import { Router } from "@angular/router";

@Component({
  selector: "app-phone-auth-screen-w-oauth",
  standalone: true,
  imports: [CommonModule, PhoneAuthScreenComponent, GoogleSignInButtonComponent, ContentComponent],
  template: `
    <fui-phone-auth-screen (signIn)="onSignIn($event)">
      <fui-content>
        <fui-google-sign-in-button></fui-google-sign-in-button>
      </fui-content>
    </fui-phone-auth-screen>
  `,
  styles: [],
})
export class PhoneAuthScreenWithOAuthComponent {
  private router = inject(Router);

  onSignIn(credential: UserCredential) {
    console.log("sign in", credential);
    this.router.navigate(["/"]);
  }
}
