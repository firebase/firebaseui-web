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
import { UserCredential } from "@angular/fire/auth";
import { injectTranslation } from "../../provider";
import { MultiFactorAuthAssertionFormComponent } from "../forms/multi-factor-auth-assertion-form";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";

@Component({
  selector: "fui-multi-factor-auth-assertion-screen",
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
    MultiFactorAuthAssertionFormComponent,
  ],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>{{ titleText() }}</fui-card-title>
          <fui-card-subtitle>{{ subtitleText() }}</fui-card-subtitle>
        </fui-card-header>
        <fui-card-content>
          <fui-multi-factor-auth-assertion-form (onSuccess)="onSuccess.emit($event)" />
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
export class MultiFactorAuthAssertionScreenComponent {
  @Output() onSuccess = new EventEmitter<UserCredential>();

  titleText = injectTranslation("labels", "multiFactorAssertion");
  subtitleText = injectTranslation("prompts", "mfaAssertionPrompt");
}
