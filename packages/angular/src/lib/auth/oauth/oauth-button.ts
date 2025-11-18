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

import { CommonModule } from "@angular/common";
import { Component, computed, input, output, signal } from "@angular/core";
import { AuthProvider, UserCredential } from "@angular/fire/auth";
import { FirebaseUIError, getTranslation, signInWithProvider } from "@firebase-oss/ui-core";
import { ButtonComponent } from "../../components/button";
import { injectUI } from "../../provider";

@Component({
  selector: "fui-oauth-button",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  host: {
    style: "display: block;",
  },
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
/**
 * A generic OAuth button component for signing in with any OAuth provider.
 */
export class OAuthButtonComponent {
  ui = injectUI();
  /** The OAuth provider to use for sign-in. */
  provider = input.required<AuthProvider>();
  /** Whether to use themed styling. */
  themed = input<boolean | string>();
  error = signal<string | null>(null);
  /** Event emitter for successful sign-in. */
  signIn = output<UserCredential>();

  buttonVariant = computed(() => {
    return this.themed() ? "primary" : "secondary";
  });

  async handleOAuthSignIn() {
    this.error.set(null);
    try {
      const credential = await signInWithProvider(this.ui(), this.provider());
      this.signIn.emit(credential);
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
