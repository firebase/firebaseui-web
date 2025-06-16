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

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, User, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-6">Firebase UI Demo</h1>
      <div class="mb-6">
        <div *ngIf="user$ | async as user">Welcome: {{user.email || user.phoneNumber}}</div>
      </div>
      <div>
        <h2 class="text-2xl font-bold mb-4">Auth Screens</h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <li>
            <a
              routerLink="/screens/sign-in-auth-screen"
              class="text-blue-500 hover:underline"
            >
              Sign In Auth Screen
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/sign-in-auth-screen-w-handlers"
              class="text-blue-500 hover:underline"
            >
              Sign In Auth Screen with Handlers
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/sign-in-auth-screen-w-oauth"
              class="text-blue-500 hover:underline"
            >
              Sign In Auth Screen with OAuth
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/email-link-auth-screen"
              class="text-blue-500 hover:underline"
            >
              Email Link Auth Screen
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/email-link-auth-screen-w-oauth"
              class="text-blue-500 hover:underline"
            >
              Email Link Auth Screen with OAuth
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/phone-auth-screen"
              class="text-blue-500 hover:underline"
            >
              Phone Auth Screen
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/phone-auth-screen-w-oauth"
              class="text-blue-500 hover:underline"
            >
              Phone Auth Screen with OAuth
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/sign-up-auth-screen"
              class="text-blue-500 hover:underline"
            >
              Sign Up Auth Screen
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/sign-up-auth-screen-w-oauth"
              class="text-blue-500 hover:underline"
            >
              Sign Up Auth Screen with OAuth
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/oauth-screen"
              class="text-blue-500 hover:underline"
            >
              OAuth Screen
            </a>
          </li>
          <li>
            <a
              routerLink="/screens/password-reset-screen"
              class="text-blue-500 hover:underline"
            >
              Password Reset Screen
            </a>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  private auth = inject(Auth);
  user$: Observable<User | null> = authState(this.auth);
  
  signOut() {
    this.auth.signOut();
  }
}
