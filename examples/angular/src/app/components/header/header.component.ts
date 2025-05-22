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
import { Auth, User, authState, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="border-b border-gray-200">
      <div class="max-w-6xl mx-auto h-12 flex items-center px-4">
        <div class="font-bold">
          <a routerLink="/">FirebaseUI</a>
        </div>
        <div class="flex-grow flex items-center justify-end">
          <ul class="text-sm flex items-center gap-6 *:hover:opacity-75">
            <li *ngIf="(user$ | async); else signInLink">
              <button (click)="onSignOut()">Sign Out</button>
            </li>
            <ng-template #signInLink>
              <li><a routerLink="/sign-in">Sign In</a></li>
            </ng-template>
          </ul>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .border-b {
      border-bottom-width: 1px;
    }
    .border-gray-200 {
      border-color: #e5e7eb;
    }
    .max-w-6xl {
      max-width: 72rem;
    }
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    .h-12 {
      height: 3rem;
    }
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    .flex {
      display: flex;
    }
    .items-center {
      align-items: center;
    }
    .font-bold {
      font-weight: 700;
    }
    .flex-grow {
      flex-grow: 1;
    }
    .justify-end {
      justify-content: flex-end;
    }
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    .gap-6 {
      gap: 1.5rem;
    }
    button {
      background: none;
      border: none;
      cursor: pointer;
      font: inherit;
      color: inherit;
    }
    a {
      text-decoration: none;
      color: inherit;
    }
    *:hover {
      opacity: 0.75;
    }
  `]
})
export class HeaderComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  user$: Observable<User | null> = authState(this.auth);

  async onSignOut() {
    await signOut(this.auth);
    this.router.navigate(['/auth/sign-in']);
  }
}
