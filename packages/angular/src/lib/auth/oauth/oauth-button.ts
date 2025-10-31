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

import { Component, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "../../components/button";
import { injectTranslation, injectUI } from "../../provider";
import { AuthProvider } from "@angular/fire/auth";
import { FirebaseUIError, signInWithProvider } from "@firebase-oss/ui-core";

@Component({
  selector: "fui-oauth-button",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div>
      <button
        fui-button
        type="button"
        (click)="handleOAuthSignIn()"
        [disabled]="ui().state !== 'idle'"
        [attr.data-provider]="provider().providerId"
        class="fui-provider__button"
      >
        <ng-content></ng-content>
      </button>

      @if (error()) {
        <div class="fui-form__error">{{ error() }}</div>
      }
    </div>
  `,
})
export class OAuthButtonComponent {
  ui = injectUI();
  unknownErrorLabel = injectTranslation("errors", "unknownError");
  provider = input.required<AuthProvider>();
  error = signal<string | undefined>(undefined);

  async handleOAuthSignIn() {
    this.error.set(undefined);
    try {
      await signInWithProvider(this.ui(), this.provider());
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.error.set(error.message);
        return;
      }

      console.error(error);
      this.error.set(this.unknownErrorLabel());
    }
  }
}
