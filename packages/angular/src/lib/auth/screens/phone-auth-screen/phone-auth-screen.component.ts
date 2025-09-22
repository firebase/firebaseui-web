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

import { Component, Input, AfterContentInit, ElementRef, ContentChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../../components/card/card.component";
import { injectTranslation } from "../../../provider";
import { PhoneFormComponent } from "../../forms/phone-form/phone-form.component";
import { DividerComponent } from "../../../components/divider/divider.component";

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
    PhoneFormComponent,
    DividerComponent,
  ],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>{{ titleText() }}</fui-card-title>
          <fui-card-subtitle>{{ subtitleText() }}</fui-card-subtitle>
        </fui-card-header>
        <fui-card-content>
          <fui-phone-form [resendDelay]="resendDelay"></fui-phone-form>

          @if (hasChildren) {
            <fui-divider>{{ dividerOrLabel() }}</fui-divider>
            <div class="space-y-4 mt-6">
              <ng-content></ng-content>
            </div>
          }
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
export class PhoneAuthScreenComponent implements AfterContentInit {
  titleText = injectTranslation("labels", "signIn");
  subtitleText = injectTranslation("prompts", "signInToAccount");
  dividerOrLabel = injectTranslation("messages", "dividerOr");

  @Input() resendDelay = 30;

  @ContentChild(ElementRef) children: ElementRef | undefined;

  hasChildren = false;

  ngAfterContentInit(): void {
    this.hasChildren = !!this.children;
  }
}
