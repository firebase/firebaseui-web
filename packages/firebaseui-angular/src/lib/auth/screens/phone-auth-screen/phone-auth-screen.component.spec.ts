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

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FirebaseUI } from '../../../provider';
import { PhoneAuthScreenComponent } from './phone-auth-screen.component';

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

// Mock PhoneForm component
@Component({
  selector: 'fui-phone-form',
  template: `
    <div data-testid="phone-form">
      Phone Form
      <p>Resend Delay: {{ resendDelay }}</p>
    </div>
  `,
  standalone: true,
})
class MockPhoneFormComponent {
  @Input() resendDelay: number = 30;
}

// Mock Divider component
@Component({
  selector: 'fui-divider',
  template: '<div class="fui-divider"><ng-content></ng-content></div>',
  standalone: true,
})
class MockDividerComponent {}

// Create mock for FirebaseUi provider
class MockFirebaseUi {
  translation(category: string, key: string) {
    if (category === 'labels' && key === 'signIn') {
      return of('Sign in');
    }
    if (category === 'prompts' && key === 'signInToAccount') {
      return of('Sign in to your account');
    }
    if (category === 'messages' && key === 'dividerOr') {
      return of('OR');
    }
    return of(`${category}.${key}`);
  }
}

// Test component with content projection
@Component({
  template: `
    <fui-phone-auth-screen>
      <button data-testid="test-button">Test Button</button>
    </fui-phone-auth-screen>
  `,
  standalone: true,
  imports: [PhoneAuthScreenComponent],
})
class TestHostWithChildrenComponent {}

// Test component without content projection
@Component({
  template: ` <fui-phone-auth-screen></fui-phone-auth-screen> `,
  standalone: true,
  imports: [PhoneAuthScreenComponent],
})
class TestHostWithoutChildrenComponent {}

describe('PhoneAuthScreenComponent', () => {
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(async () => {
    mockFirebaseUi = new MockFirebaseUi();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PhoneAuthScreenComponent,
        TestHostWithChildrenComponent,
        TestHostWithoutChildrenComponent,
        MockCardComponent,
        MockCardHeaderComponent,
        MockCardTitleComponent,
        MockCardSubtitleComponent,
        MockPhoneFormComponent,
        MockDividerComponent,
      ],
      providers: [{ provide: FirebaseUI, useValue: mockFirebaseUi }],
    }).compileComponents();

    TestBed.overrideComponent(PhoneAuthScreenComponent, {
      set: {
        imports: [
          CommonModule,
          MockCardComponent,
          MockCardHeaderComponent,
          MockCardTitleComponent,
          MockCardSubtitleComponent,
          MockPhoneFormComponent,
          MockDividerComponent,
        ],
      },
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PhoneAuthScreenComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('displays the correct title and subtitle', () => {
    const fixture = TestBed.createComponent(PhoneAuthScreenComponent);
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('.fui-card-title'));
    const subtitleEl = fixture.debugElement.query(By.css('.fui-card-subtitle'));

    expect(titleEl.nativeElement.textContent).toBe('Sign in');
    expect(subtitleEl.nativeElement.textContent).toBe(
      'Sign in to your account'
    );
  });

  it('includes the PhoneForm with the correct resendDelay prop', () => {
    const fixture = TestBed.createComponent(PhoneAuthScreenComponent);
    const component = fixture.componentInstance;
    component.resendDelay = 60;
    fixture.detectChanges();

    const phoneFormEl = fixture.debugElement.query(
      By.css('[data-testid="phone-form"]')
    );
    expect(phoneFormEl).toBeTruthy();
    expect(phoneFormEl.nativeElement.textContent).toContain('Resend Delay: 60');
  });

  it('renders children when provided', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostWithChildrenComponent);
    fixture.detectChanges();

    // Wait for the setTimeout in ngAfterContentInit
    tick(0);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(
      By.css('[data-testid="test-button"]')
    );
    const dividerEl = fixture.debugElement.query(By.css('.fui-divider'));

    expect(buttonEl).toBeTruthy();
    expect(buttonEl.nativeElement.textContent).toBe('Test Button');
    expect(dividerEl).toBeTruthy();
    expect(dividerEl.nativeElement.textContent).toBe('OR');
  }));

  it('does not render children or divider when not provided', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostWithoutChildrenComponent);
    fixture.detectChanges();

    // Wait for the setTimeout in ngAfterContentInit
    tick(0);
    fixture.detectChanges();

    const dividerEl = fixture.debugElement.query(By.css('.fui-divider'));
    expect(dividerEl).toBeFalsy();
  }));
});
