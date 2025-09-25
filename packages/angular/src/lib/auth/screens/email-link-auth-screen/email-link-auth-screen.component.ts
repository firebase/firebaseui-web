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

import { Component, ElementRef, output, contentChildren, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../../components/card/card.component";
import { injectTranslation } from "../../../provider";
import { EmailLinkAuthFormComponent } from "../../forms/email-link-auth-form/email-link-auth-form.component";
import { DividerComponent } from "../../../components/divider/divider.component";
import { UserCredential } from "@angular/fire/auth";

@Component({
  selector: "fui-email-link-auth-screen",
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    CardContentComponent,
    EmailLinkAuthFormComponent,
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
          <fui-email-link-auth-form (emailSent)="emailSent.emit()" (signIn)="signIn.emit($event)"></fui-email-link-auth-form>

          @if (hasChildren()) {
            <fui-divider>{{ dividerOrLabel() }}</fui-divider>
            <div>
              <ng-content></ng-content>
            </div>
          }
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
export class EmailLinkAuthScreenComponent {
  titleText = injectTranslation("labels", "signIn");
  subtitleText = injectTranslation("prompts", "signInToAccount");
  dividerOrLabel = injectTranslation("messages", "dividerOr");

  emailSent = output<void>();
  signIn = output<UserCredential>();

  children = contentChildren<ElementRef>(ElementRef);
  hasChildren = computed(() => this.children().length > 0);
}
