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

import { Component, Output, EventEmitter, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { User } from "@angular/fire/auth";

import { injectTranslation, injectUI, injectUserAuthenticated } from "../../provider";
import { SignUpAuthFormComponent } from "../forms/sign-up-auth-form";
import { MultiFactorAuthAssertionScreenComponent } from "../screens/multi-factor-auth-assertion-screen";
import { RedirectErrorComponent } from "../../components/redirect-error";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";

@Component({
  selector: "fui-sign-up-auth-screen",
  standalone: true,
  host: {
    style: "display: block;",
  },
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    CardContentComponent,
    SignUpAuthFormComponent,
    MultiFactorAuthAssertionScreenComponent,
    RedirectErrorComponent,
  ],
  template: `
    @if (mfaResolver()) {
      <fui-multi-factor-auth-assertion-screen />
    } @else {
      <div class="fui-screen">
        <fui-card>
          <fui-card-header>
            <fui-card-title>{{ titleText() }}</fui-card-title>
            <fui-card-subtitle>{{ subtitleText() }}</fui-card-subtitle>
          </fui-card-header>
          <fui-card-content>
            <fui-sign-up-auth-form [signIn]="signIn" (signUp)="signUp.emit($event.user)" />
            <ng-content />
            <fui-redirect-error />
          </fui-card-content>
        </fui-card>
      </div>
    }
  `,
})
/**
 * A screen component for email/password sign-up.
 *
 * Automatically displays the MFA assertion screen if a multi-factor resolver is present.
 */
export class SignUpAuthScreenComponent {
  private ui = injectUI();

  mfaResolver = computed(() => this.ui().multiFactorResolver);

  titleText = injectTranslation("labels", "signUp");
  subtitleText = injectTranslation("prompts", "enterDetailsToCreate");

  constructor() {
    injectUserAuthenticated((user) => {
      this.signUp.emit(user);
    });
  }

  /** Event emitter for successful sign-up. */
  @Output() signUp = new EventEmitter<User>();
  /** Event emitter for sign in action. */
  @Output() signIn = new EventEmitter<void>();
}
