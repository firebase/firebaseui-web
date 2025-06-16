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

import { Component, inject, Input, AfterContentInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardSubtitleComponent } from '../../../components/card/card.component';
import { FirebaseUI } from '../../../provider';
import { PhoneFormComponent } from '../../forms/phone-form/phone-form.component';
import { DividerComponent } from '../../../components/divider/divider.component';

@Component({
  selector: 'fui-phone-auth-screen',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    PhoneFormComponent,
    DividerComponent,
  ],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>{{ titleText | async }}</fui-card-title>
          <fui-card-subtitle>{{ subtitleText | async }}</fui-card-subtitle>
        </fui-card-header>
        <fui-phone-form
          [resendDelay]="resendDelay"
        ></fui-phone-form>
        
        <ng-container *ngIf="hasContent">
          <fui-divider>{{ dividerOrLabel | async }}</fui-divider>
          <div class="space-y-4 mt-6" #contentContainer>
            <ng-content></ng-content>
          </div>
        </ng-container>
      </fui-card>
    </div>
  `
})
export class PhoneAuthScreenComponent implements AfterContentInit {
  private ui = inject(FirebaseUI);
  
  @Input() resendDelay = 30;

  @ViewChild('contentContainer') contentContainer!: ElementRef;
  private _hasProjectedContent = false;

  get hasContent(): boolean {
    return this._hasProjectedContent;
  }

  get titleText() {
    return this.ui.translation('labels', 'signIn');
  }

  get subtitleText() {
    return this.ui.translation('prompts', 'signInToAccount');
  }

  get dividerOrLabel() {
    return this.ui.translation('messages', 'dividerOr');
  }

  ngAfterContentInit() {
    // Set to true initially to ensure the container is rendered
    this._hasProjectedContent = true;
    
    // We need to use setTimeout to check after the view is rendered
    setTimeout(() => {
      // Check if there's any actual content in the container
      if (this.contentContainer && this.contentContainer.nativeElement) {
        const container = this.contentContainer.nativeElement;
        // Only consider it to have content if there are child nodes that aren't just whitespace
        this._hasProjectedContent = Array.from(container.childNodes as NodeListOf<Node>).some((node: Node) => {
          return node.nodeType === Node.ELEMENT_NODE || 
                (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim() !== '');
        });
      } else {
        this._hasProjectedContent = false;
      }
    });
  }
}
