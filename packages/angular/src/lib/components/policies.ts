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

import { Component, computed, Signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectPolicies, injectTranslation } from "../provider";

type PolicyPart =
  | { type: "tos"; url: string; text: string }
  | { type: "privacy"; url: string; text: string }
  | { type: "text"; content: string };

@Component({
  selector: "fui-policies",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShow()) {
      <div class="fui-policies">
        @for (part of policyParts(); track $index) {
          @if (part.type === "tos") {
            <a [attr.href]="part.url" target="_blank" rel="noopener noreferrer">
              {{ part.text }}
            </a>
          } @else if (part.type === "privacy") {
            <a [attr.href]="part.url" target="_blank" rel="noopener noreferrer">
              {{ part.text }}
            </a>
          } @else {
            <span>{{ part.content }}</span>
          }
        }
      </div>
    }
  `,
})
export class PoliciesComponent {
  private readonly policies = injectPolicies();

  private readonly termsText = injectTranslation("labels", "termsOfService");
  private readonly privacyText = injectTranslation("labels", "privacyPolicy");
  private readonly templateText = injectTranslation("messages", "termsAndPrivacy");

  private readonly tosUrl = this.policies?.termsOfServiceUrl;
  private readonly privacyPolicyUrl = this.policies?.privacyPolicyUrl;

  readonly shouldShow = computed(() => this.policies !== null);

  readonly policyParts: Signal<PolicyPart[]> = computed(() => {
    if (!this.shouldShow()) {
      return [];
    }

    const template = this.templateText();
    const parts = template.split(/({tos}|{privacy})/);

    return parts
      .filter((part) => part.length > 0)
      .map((part) => {
        if (part === "{tos}" && this.tosUrl) {
          return {
            type: "tos" as const,
            url: this.tosUrl,
            text: this.termsText(),
          };
        }
        if (part === "{privacy}" && this.privacyPolicyUrl) {
          return {
            type: "privacy" as const,
            url: this.privacyPolicyUrl,
            text: this.privacyText(),
          };
        }
        return {
          type: "text" as const,
          content: part,
        };
      });
  });
}
