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
import { MultiFactorAuthEnrollmentScreenComponent } from "@invertase/firebaseui-angular";
import { FactorId } from "firebase/auth";

@Component({
  selector: "app-mfa-enrollment-screen",
  standalone: true,
  imports: [CommonModule, MultiFactorAuthEnrollmentScreenComponent],
  template: `
    <fui-multi-factor-auth-enrollment-screen
      [hints]="[FactorId.TOTP, FactorId.PHONE]"
      (onEnrollment)="onEnrollment()"
    ></fui-multi-factor-auth-enrollment-screen>
  `,
  styles: [],
})
export class MfaEnrollmentScreenComponent {
  FactorId = FactorId;
  private router = inject(Router);

  onEnrollment() {
    this.router.navigate(["/"]);
  }
}

