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

import { Component, output, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FactorId } from "firebase/auth";
import { injectTranslation } from "../../provider";
import { MultiFactorAuthEnrollmentFormComponent } from "../forms/multi-factor-auth-enrollment-form";
import { RedirectErrorComponent } from "../../components/redirect-error";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";

type Hint = (typeof FactorId)[keyof typeof FactorId];

@Component({
  selector: "fui-multi-factor-auth-enrollment-screen",
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    CardContentComponent,
    MultiFactorAuthEnrollmentFormComponent,
    RedirectErrorComponent,
  ],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>{{ titleText() }}</fui-card-title>
          <fui-card-subtitle>{{ subtitleText() }}</fui-card-subtitle>
        </fui-card-header>
        <fui-card-content>
          <fui-multi-factor-auth-enrollment-form [hints]="hints()" (onEnrollment)="onEnrollment.emit()" />
          <fui-redirect-error />
          <ng-content />
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
export class MultiFactorAuthEnrollmentScreenComponent {
  hints = input<Hint[]>([FactorId.TOTP, FactorId.PHONE]);
  onEnrollment = output<void>();

  titleText = injectTranslation("labels", "multiFactorEnrollment");
  subtitleText = injectTranslation("prompts", "mfaEnrollmentPrompt");
}
