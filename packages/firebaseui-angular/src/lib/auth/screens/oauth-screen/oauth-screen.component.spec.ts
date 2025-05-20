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
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FirebaseUI } from '../../../provider';
import { OAuthScreenComponent } from './oauth-screen.component';

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

// Mock TermsAndPrivacy component
@Component({
  selector: 'fui-terms-and-privacy',
  template: '<div data-testid="terms-and-privacy">Terms and Privacy</div>',
  standalone: true,
})
class MockTermsAndPrivacyComponent {}

// Create mock for FirebaseUi provider
class MockFirebaseUi {
  translation(category: string, key: string) {
    if (category === 'labels' && key === 'signIn') {
      return of('Sign In');
    }
    if (category === 'prompts' && key === 'signInToAccount') {
      return of('Sign in to your account');
    }
    return of(`${category}.${key}`);
  }
}

// Test component with content projection
@Component({
  template: `
    <fui-oauth-screen>
      <div class="test-provider">OAuth Provider</div>
    </fui-oauth-screen>
  `,
  standalone: true,
  imports: [OAuthScreenComponent],
})
class TestHostWithSingleChildComponent {}

// Test component with multiple providers
@Component({
  template: `
    <fui-oauth-screen>
      <div class="test-provider-1">Provider 1</div>
      <div class="test-provider-2">Provider 2</div>
    </fui-oauth-screen>
  `,
  standalone: true,
  imports: [OAuthScreenComponent],
})
class TestHostWithMultipleChildrenComponent {}

describe('OAuthScreenComponent', () => {
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(async () => {
    mockFirebaseUi = new MockFirebaseUi();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        OAuthScreenComponent,
        TestHostWithSingleChildComponent,
        TestHostWithMultipleChildrenComponent,
        MockCardComponent,
        MockCardHeaderComponent,
        MockCardTitleComponent,
        MockCardSubtitleComponent,
        MockTermsAndPrivacyComponent,
      ],
      providers: [{ provide: FirebaseUI, useValue: mockFirebaseUi }],
    }).compileComponents();

    TestBed.overrideComponent(OAuthScreenComponent, {
      set: {
        imports: [
          CommonModule,
          MockCardComponent,
          MockCardHeaderComponent,
          MockCardTitleComponent,
          MockCardSubtitleComponent,
          MockTermsAndPrivacyComponent,
        ],
      },
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OAuthScreenComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('renders with correct title and subtitle', () => {
    const fixture = TestBed.createComponent(OAuthScreenComponent);
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('.fui-card-title'));
    const subtitleEl = fixture.debugElement.query(By.css('.fui-card-subtitle'));

    expect(titleEl.nativeElement.textContent).toBe('Sign In');
    expect(subtitleEl.nativeElement.textContent).toBe(
      'Sign in to your account'
    );
  });

  it('renders children when provided', () => {
    const fixture = TestBed.createComponent(TestHostWithSingleChildComponent);
    fixture.detectChanges();

    const providerEl = fixture.debugElement.query(By.css('.test-provider'));
    expect(providerEl).toBeTruthy();
    expect(providerEl.nativeElement.textContent).toBe('OAuth Provider');
  });

  it('renders multiple children when provided', () => {
    const fixture = TestBed.createComponent(
      TestHostWithMultipleChildrenComponent
    );
    fixture.detectChanges();

    const provider1El = fixture.debugElement.query(By.css('.test-provider-1'));
    const provider2El = fixture.debugElement.query(By.css('.test-provider-2'));

    expect(provider1El).toBeTruthy();
    expect(provider1El.nativeElement.textContent).toBe('Provider 1');

    expect(provider2El).toBeTruthy();
    expect(provider2El.nativeElement.textContent).toBe('Provider 2');
  });

  it('includes the TermsAndPrivacy component', () => {
    const fixture = TestBed.createComponent(OAuthScreenComponent);
    fixture.detectChanges();

    const termsEl = fixture.debugElement.query(
      By.css('[data-testid="terms-and-privacy"]')
    );
    expect(termsEl).toBeTruthy();
  });
});
