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

import { Component, computed, contentChild, contentChildren, ElementRef, input, TemplateRef, viewChild } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "fui-divider",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fui-divider my-6">
      <div class="fui-divider__line"></div>
      has-specific-content: {{ hasProjected() }}
      <ng-container *ngIf="hasProjected();">
        <div class="wrapper">
          <ng-content></ng-content>
        </div>
      </ng-container>
      <ng-content #projectedContent></ng-content>
    </div>
  `,
})
export class DividerComponent {
  // Check for projected content using template reference
  projectedContent = contentChild<any>('projectedContent');

  hasProjected = computed(() => {
    const content = this.projectedContent();
    return content && content.nativeElement.children.length > 0;
  });
}
