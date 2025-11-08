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
import { ForgotPasswordAuthScreenComponent } from "@invertase/firebaseui-angular";

@Component({
  selector: "app-forgot-password-auth-screen-w-handlers",
  standalone: true,
  imports: [CommonModule, ForgotPasswordAuthScreenComponent],
  template: `
    <fui-forgot-password-auth-screen
      (backToSignIn)="goToSignIn()"
      (forgotPassword)="goToForgotPassword()"
      (signUp)="goToSignUp()"
    ></fui-forgot-password-auth-screen>
  `,
  styles: [],
})
export class ForgotPasswordAuthScreenWithHandlersComponent {
  private router = inject(Router);

  goToSignIn() {
    this.router.navigate(["/screens/sign-in-auth-screen"]);
  }

  goToForgotPassword() {
    this.router.navigate(["/screens/forgot-password-auth-screen"]);
  }

  goToSignUp() {
    this.router.navigate(["/screens/sign-up-auth-screen"]);
  }
}

