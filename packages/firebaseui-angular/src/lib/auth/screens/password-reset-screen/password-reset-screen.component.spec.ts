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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FirebaseUI } from '../../../provider';
import { PasswordResetScreenComponent } from './password-reset-screen.component';

// Mock Card components
@Component({
  selector: 'fui-card',
  template: '<div class="fui-card"><ng-content></ng-content></div>',
  standalone: true,
})
class MockCardComponent {}

@Component({
  selector: 'fui-card-header',
  template: '<div class="fui-card-header"><ng-content></ng-content></div>',
  standalone: true,
})
class MockCardHeaderComponent {}

@Component({
  selector: 'fui-card-title',
  template: '<h2 class="fui-card-title"><ng-content></ng-content></h2>',
  standalone: true,
})
class MockCardTitleComponent {}

@Component({
  selector: 'fui-card-subtitle',
  template: '<p class="fui-card-subtitle"><ng-content></ng-content></p>',
  standalone: true,
})
class MockCardSubtitleComponent {}

// Mock ForgotPasswordForm component
@Component({
  selector: 'fui-forgot-password-form',
  template: `
    <div data-testid="forgot-password-form">
      Forgot Password Form
      <p>Sign In Route: {{ signInRoute }}</p>
    </div>
  `,
  standalone: true,
})
class MockForgotPasswordFormComponent {
  @Input() signInRoute: string = '';
}

// Create mock for FirebaseUi provider
class MockFirebaseUi {
  translation(category: string, key: string) {
    if (category === 'labels' && key === 'resetPassword') {
      return of('Reset Password');
    }
    if (category === 'prompts' && key === 'enterEmailToReset') {
      return of('Enter your email to reset your password');
    }
    return of(`${category}.${key}`);
  }
}

describe('PasswordResetScreenComponent', () => {
  let component: PasswordResetScreenComponent;
  let fixture: ComponentFixture<PasswordResetScreenComponent>;
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(async () => {
    mockFirebaseUi = new MockFirebaseUi();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PasswordResetScreenComponent,
        MockCardComponent,
        MockCardHeaderComponent,
        MockCardTitleComponent,
        MockCardSubtitleComponent,
        MockForgotPasswordFormComponent,
      ],
      providers: [{ provide: FirebaseUI, useValue: mockFirebaseUi }],
    }).compileComponents();

    TestBed.overrideComponent(PasswordResetScreenComponent, {
      set: {
        imports: [
          CommonModule,
          MockCardComponent,
          MockCardHeaderComponent,
          MockCardTitleComponent,
          MockCardSubtitleComponent,
          MockForgotPasswordFormComponent,
        ],
      },
    });

    fixture = TestBed.createComponent(PasswordResetScreenComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders with correct title and subtitle', () => {
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('.fui-card-title'));
    const subtitleEl = fixture.debugElement.query(By.css('.fui-card-subtitle'));

    expect(titleEl.nativeElement.textContent).toBe('Reset Password');
    expect(subtitleEl.nativeElement.textContent).toBe(
      'Enter your email to reset your password'
    );
  });

  it('includes the ForgotPasswordForm component', () => {
    fixture.detectChanges();

    const formEl = fixture.debugElement.query(
      By.css('[data-testid="forgot-password-form"]')
    );
    expect(formEl).toBeTruthy();
    expect(formEl.nativeElement.textContent).toContain('Forgot Password Form');
  });

  it('passes signInRoute to ForgotPasswordForm', () => {
    component.signInRoute = '/custom-sign-in-route';
    fixture.detectChanges();

    const formEl = fixture.debugElement.query(
      By.css('[data-testid="forgot-password-form"]')
    );
    expect(formEl.nativeElement.textContent).toContain(
      'Sign In Route: /custom-sign-in-route'
    );
  });
});
