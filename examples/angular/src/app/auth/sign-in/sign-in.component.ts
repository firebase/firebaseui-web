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

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth, User, authState } from '@angular/fire/auth';
import {
  SignInAuthScreenComponent,
  GoogleSignInButtonComponent,
} from '@firebase-ui/angular';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SignInAuthScreenComponent,
    GoogleSignInButtonComponent,
  ],
  template: `
    <fui-sign-in-auth-screen
      forgotPasswordRoute="/forgot-password"
      registerRoute="/register"
    >
      <fui-google-sign-in-button></fui-google-sign-in-button>
      <div>
        <a routerLink="/sign-in/phone">Sign in with phone number</a>
      </div>
      <div>
        <a routerLink="/sign-in/email">Sign in with email link</a>
      </div>
    </fui-sign-in-auth-screen>
  `,
  styles: [],
})
export class SignInComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  
  ngOnInit() {
    // Check if user is already authenticated and redirect to home page
    authState(this.auth).subscribe((user: User | null) => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }
}
