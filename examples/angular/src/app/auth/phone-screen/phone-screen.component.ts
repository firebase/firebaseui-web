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
import { PhoneAuthScreenComponent } from '@firebase-ui/angular';

@Component({
  selector: 'app-phone-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, PhoneAuthScreenComponent],
  template: `
    <fui-phone-auth-screen [resendDelay]="2"></fui-phone-auth-screen>
  `,
  styles: []
})
export class PhoneScreenComponent implements OnInit {
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
