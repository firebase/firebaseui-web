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

import { Component, Input, ElementRef, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fui-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fui-divider my-6">
      <div class="fui-divider__line"></div>
      <div class="fui-divider__text" *ngIf="hasContent">
        <ng-content></ng-content>
      </div>
      <div class="fui-divider__line" *ngIf="hasContent"></div>
    </div>
  `,
})
export class DividerComponent implements AfterContentInit {
  hasContent = false;

  @Input() text: string = '';

  get textContent(): string {
    return this.text;
  }

  constructor(private elementRef: ElementRef) {}

  ngAfterContentInit() {
    // Check if text input is provided
    if (this.text) {
      this.hasContent = true;
      return;
    }

    // Otherwise check for projected content
    const directContent = this.elementRef.nativeElement.textContent?.trim();
    if (directContent) {
      this.hasContent = true;
    }
  }
}
