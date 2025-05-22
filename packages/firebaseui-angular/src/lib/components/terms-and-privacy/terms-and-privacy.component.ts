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

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseUI, FirebaseUIPolicies } from '../../provider';
import { map } from 'rxjs';

@Component({
  selector: 'fui-terms-and-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-text-muted text-xs text-start my-6" *ngIf="shouldShow">
      <ng-container *ngFor="let part of parts | async; let i = index">
        <a
          *ngIf="part.type === 'tos' && tosUrl"
          (click)="handleUrl(tosUrl)"
          [attr.href]="tosUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted hover:underline font-semibold cursor-pointer"
        >
          {{ termsText | async }}
        </a>
        <a
          *ngIf="part.type === 'privacy' && privacyPolicyUrl"
          (click)="handleUrl(privacyPolicyUrl)"
          [attr.href]="privacyPolicyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted hover:underline font-semibold cursor-pointer"
        >
          {{ privacyText | async }}
        </a>
        <ng-container *ngIf="part.type === 'text'">
          <span>{{ part.content }}</span>
        </ng-container>
      </ng-container>
    </div>
  `,
})
export class TermsAndPrivacyComponent {
  private ui = inject(FirebaseUI);
  private policies = inject(FirebaseUIPolicies);

  tosUrl = this.policies.termsOfServiceUrl;
  privacyPolicyUrl = this.policies.privacyPolicyUrl;

  get shouldShow(): boolean {
    return !!(this.tosUrl || this.privacyPolicyUrl);
  }

  termsText = this.ui.translation('labels', 'termsOfService');
  privacyText = this.ui.translation('labels', 'privacyPolicy');

  parts = this.ui.translation('messages', 'termsAndPrivacy').pipe(
    map((text) => {
      const parts = text.split(/({tos}|{privacy})/);
      return parts.map((part) => {
        if (part === '{tos}') return { type: 'tos' };
        if (part === '{privacy}') return { type: 'privacy' };
        return { type: 'text', content: part };
      });
    }),
  );

  handleUrl(url: string) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
