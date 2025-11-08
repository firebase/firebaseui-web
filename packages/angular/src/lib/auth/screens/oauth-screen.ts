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

import { Component, computed, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";
import { injectTranslation, injectUI } from "../../provider";
import { PoliciesComponent } from "../../components/policies";
import { MultiFactorAuthAssertionScreenComponent } from "../screens/multi-factor-auth-assertion-screen";
import { RedirectErrorComponent } from "../../components/redirect-error";
import { type UserCredential } from "firebase/auth";

@Component({
  selector: "fui-oauth-screen",
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
    PoliciesComponent,
    MultiFactorAuthAssertionScreenComponent,
    RedirectErrorComponent,
  ],
  template: `
    @if (mfaResolver()) {
      <fui-multi-factor-auth-assertion-screen (onSuccess)="onSignIn.emit($event)" />
    } @else {
      <div class="fui-screen">
        <fui-card>
          <fui-card-header>
            <fui-card-title>{{ titleText() }}</fui-card-title>
            <fui-card-subtitle>{{ subtitleText() }}</fui-card-subtitle>
          </fui-card-header>
          <fui-card-content>
            <div class="fui-screen__children">
              <ng-content></ng-content>
              <fui-redirect-error />
              <fui-policies />
            </div>
          </fui-card-content>
        </fui-card>
      </div>
    }
  `,
})
export class OAuthScreenComponent {
  private ui = injectUI();

  mfaResolver = computed(() => this.ui().multiFactorResolver);

  titleText = injectTranslation("labels", "signIn");
  subtitleText = injectTranslation("prompts", "signInToAccount");

  @Output() onSignIn = new EventEmitter<UserCredential>();
}
