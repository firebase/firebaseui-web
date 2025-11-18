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

import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";
import { injectTranslation } from "../../provider";
import { ForgotPasswordAuthFormComponent } from "../forms/forgot-password-auth-form";

@Component({
  selector: "fui-forgot-password-auth-screen",
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
    ForgotPasswordAuthFormComponent,
  ],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>{{ titleText() }}</fui-card-title>
          <fui-card-subtitle>{{ subtitleText() }}</fui-card-subtitle>
        </fui-card-header>
        <fui-card-content>
          <fui-forgot-password-auth-form [backToSignIn]="backToSignIn" (passwordSent)="passwordSent.emit()" />
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
/**
 * A screen component for requesting a password reset.
 */
export class ForgotPasswordAuthScreenComponent {
  titleText = injectTranslation("labels", "resetPassword");
  subtitleText = injectTranslation("prompts", "enterEmailToReset");

  /** Event emitter fired when password reset email is sent. */
  @Output() passwordSent = new EventEmitter<void>();
  /** Event emitter for back to sign in action. */
  @Output() backToSignIn = new EventEmitter<void>();
}
