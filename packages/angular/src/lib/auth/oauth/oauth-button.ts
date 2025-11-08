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

import { Component, input, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "../../components/button";
import { injectUI } from "../../provider";
import { AuthProvider } from "@angular/fire/auth";
import { FirebaseUIError, signInWithProvider, getTranslation } from "@invertase/firebaseui-core";

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
        [variant]="buttonVariant()"
        [attr.data-themed]="themed()"
        [disabled]="ui().state !== 'idle'"
        [attr.data-provider]="provider().providerId"
        class="fui-provider__button"
      >
        <ng-content></ng-content>
      </button>

      @if (error()) {
        <div class="fui-error">{{ error() }}</div>
      }
    </div>
  `,
})
export class OAuthButtonComponent {
  ui = injectUI();
  provider = input.required<AuthProvider>();
  themed = input<boolean | string>();
  error = signal<string | null>(null);

  buttonVariant = computed(() => {
    return this.themed() ? "primary" : "secondary";
  });

  async handleOAuthSignIn() {
    this.error.set(null);
    try {
      await signInWithProvider(this.ui(), this.provider());
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.error.set(error.message);
        return;
      }
      console.error(error);
      this.error.set(getTranslation(this.ui(), "errors", "unknownError"));
    }
  }
}
