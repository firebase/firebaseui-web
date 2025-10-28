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

import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";
import { injectTranslation } from "../../provider";
import { PhoneAuthFormComponent } from "../forms/phone-auth-form";
import { RedirectErrorComponent } from "../../components/redirect-error";
import { UserCredential } from "@angular/fire/auth";

@Component({
  selector: "fui-phone-auth-screen",
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    CardContentComponent,
    PhoneAuthFormComponent,
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
          <fui-phone-auth-form (signIn)="signIn.emit($event)" />
          <fui-redirect-error />
          <ng-content />
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
export class PhoneAuthScreenComponent {
  titleText = injectTranslation("labels", "signIn");
  subtitleText = injectTranslation("prompts", "signInToAccount");

  resendDelay = input<number>(30);
  signIn = output<UserCredential>();
}
