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
import { Router } from "@angular/router";
import { SignInAuthScreenComponent } from "@firebase-oss/ui-angular";

@Component({
  selector: "app-sign-in-auth-screen-w-handlers",
  standalone: true,
  imports: [CommonModule, SignInAuthScreenComponent],
  template: `
    <fui-sign-in-auth-screen (forgotPassword)="goToForgotPassword()" (signUp)="goToSignUp()" (signIn)="onSignIn()" />
  `,
  styles: [],
})
export class SignInAuthScreenWithHandlersComponent {
  private router = inject(Router);

  goToForgotPassword() {
    this.router.navigate(["/screens/forgot-password-auth-screen"]);
  }

  goToSignUp() {
    this.router.navigate(["/screens/sign-up-auth-screen"]);
  }

  onSignIn() {
    this.router.navigate(["/"]);
  }
}
