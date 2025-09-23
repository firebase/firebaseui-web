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

import { Component, AfterContentInit, ElementRef, ContentChild, output, contentChildren, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserCredential } from "@angular/fire/auth";

import { injectTranslation } from "../../../provider";
import { SignUpAuthFormComponent } from "../../forms/sign-up-auth-form/sign-up-auth-form.component";
import { DividerComponent } from "../../../components/divider/divider.component";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../../components/card/card.component";


@Component({
  selector: "fui-sign-up-auth-screen",
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    CardContentComponent,
    SignUpAuthFormComponent,
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
          <fui-sign-up-auth-form (signIn)="(signIn)" (signUp)="(signUp)"></fui-sign-up-auth-form>

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
export class SignUpAuthScreenComponent {
  titleText = injectTranslation("labels", "register");
  subtitleText = injectTranslation("prompts", "enterDetailsToCreate");
  dividerOrLabel = injectTranslation("messages", "dividerOr");

  signUp = output<UserCredential>();
  signIn = output<void>();

  children = contentChildren<ElementRef>(ElementRef);
  hasChildren = computed(() => this.children().length > 0);
}
