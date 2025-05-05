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
import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FirebaseUI } from '../../../provider';
import { EmailLinkAuthScreenComponent } from './email-link-auth-screen.component';

// Mock EmailLinkForm component
@Component({
  selector: 'fui-email-link-form',
  template: '<div data-testid="email-link-form">Email Link Form</div>',
  standalone: true,
})
class MockEmailLinkFormComponent {}

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
      return of('Sign In');
    }
    if (category === 'prompts' && key === 'signInToAccount') {
      return of('Sign in to your account');
    }
    if (category === 'messages' && key === 'dividerOr') {
      return of('or');
    }
    return of(`${category}.${key}`);
  }
}

// Test component with content projection
@Component({
  template: `
    <fui-email-link-auth-screen>
      <div class="test-child">Test Child</div>
    </fui-email-link-auth-screen>
  `,
  standalone: true,
  imports: [EmailLinkAuthScreenComponent],
})
class TestHostWithChildrenComponent {}

// Test component without content projection
@Component({
  template: ` <fui-email-link-auth-screen></fui-email-link-auth-screen> `,
  standalone: true,
  imports: [EmailLinkAuthScreenComponent],
})
class TestHostWithoutChildrenComponent {}

describe('EmailLinkAuthScreenComponent', () => {
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(async () => {
    mockFirebaseUi = new MockFirebaseUi();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        EmailLinkAuthScreenComponent,
        TestHostWithChildrenComponent,
        TestHostWithoutChildrenComponent,
        MockCardComponent,
        MockCardHeaderComponent,
        MockCardTitleComponent,
        MockCardSubtitleComponent,
        MockEmailLinkFormComponent,
        MockDividerComponent,
      ],
      providers: [{ provide: FirebaseUI, useValue: mockFirebaseUi }],
    }).compileComponents();

    TestBed.overrideComponent(EmailLinkAuthScreenComponent, {
      set: {
        imports: [
          CommonModule,
          MockCardComponent,
          MockCardHeaderComponent,
          MockCardTitleComponent,
          MockCardSubtitleComponent,
          MockEmailLinkFormComponent,
          MockDividerComponent,
        ],
      },
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmailLinkAuthScreenComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('renders with correct title and subtitle', () => {
    const fixture = TestBed.createComponent(EmailLinkAuthScreenComponent);
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('.fui-card-title'));
    const subtitleEl = fixture.debugElement.query(By.css('.fui-card-subtitle'));

    expect(titleEl.nativeElement.textContent).toBe('Sign In');
    expect(subtitleEl.nativeElement.textContent).toBe(
      'Sign in to your account'
    );
  });

  it('includes the EmailLinkForm component', () => {
    const fixture = TestBed.createComponent(EmailLinkAuthScreenComponent);
    fixture.detectChanges();

    const formEl = fixture.debugElement.query(
      By.css('[data-testid="email-link-form"]')
    );
    expect(formEl).toBeTruthy();
    expect(formEl.nativeElement.textContent).toBe('Email Link Form');
  });

  it('does not render divider and children when no children are provided', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostWithoutChildrenComponent);
    fixture.detectChanges();

    // Initially hasContent will be true
    // We need to wait for the setTimeout in ngAfterContentInit
    tick(0);
    fixture.detectChanges();

    const dividerEl = fixture.debugElement.query(By.css('.fui-divider'));
    expect(dividerEl).toBeFalsy();
  }));

  it('renders divider and children when children are provided', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostWithChildrenComponent);
    fixture.detectChanges();

    // Wait for the setTimeout in ngAfterContentInit
    tick(0);
    fixture.detectChanges();

    const dividerEl = fixture.debugElement.query(By.css('.fui-divider'));
    expect(dividerEl).toBeTruthy();
    expect(dividerEl.nativeElement.textContent).toBe('or');

    const childEl = fixture.debugElement.query(By.css('.test-child'));
    expect(childEl).toBeTruthy();
    expect(childEl.nativeElement.textContent).toBe('Test Child');
  }));
});
