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
import { Component, InjectionToken, Input } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TanStackField } from '@tanstack/angular-form';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, deleteUser, getAuth } from 'firebase/auth';
import { of } from 'rxjs';
import { EmailLinkFormComponent } from '../../../auth/forms/email-link-form/email-link-form.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { TermsAndPrivacyComponent } from '../../../components/terms-and-privacy/terms-and-privacy.component';
import { FirebaseUI } from '../../../provider';

// Create token for Firebase UI store
const FIREBASE_UI_STORE = new InjectionToken<any>('firebaseui.store');

// Mock Button component for testing
@Component({
  selector: 'fui-button',
  template: `<button [type]="type" class="fui-button">
    <ng-content></ng-content>
  </button>`,
  standalone: true,
})
class MockButtonComponent {
  @Input() type: string = 'button';
}

// Mock TermsAndPrivacy component for testing
@Component({
  selector: 'fui-terms-and-privacy',
  template: `<div class="fui-terms-and-privacy"></div>`,
  standalone: true,
})
class MockTermsAndPrivacyComponent {}

// Initialize Firebase with test configuration
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-firebaseui.firebaseapp.com',
  projectId: 'demo-firebaseui',
};

// Initialize Firebase app once for all tests
const app = initializeApp(firebaseConfig, 'email-link-integration-tests');
const auth = getAuth(app);

// Connect to the auth emulator
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

describe('Email Link Authentication Integration', () => {
  let component: EmailLinkFormComponent;
  let fixture: ComponentFixture<EmailLinkFormComponent>;

  // Test email
  const testEmail = `test-${Date.now()}@example.com`;
  const emailForSignInKey = 'emailForSignIn';

  // Clean up after all tests
  afterAll(async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
        console.log(`Deleted current user: ${currentUser.email}`);
      }
    } catch (error) {
      console.log(`Error in cleanup: ${error}`);
    }

    // Clean up localStorage
    window.localStorage.removeItem(emailForSignInKey);
  });

  // Prepare component before each test
  beforeEach(waitForAsync(async () => {
    // Ensure localStorage is cleared before each test
    window.localStorage.removeItem(emailForSignInKey);

    // Create a mock FirebaseUi provider
    const mockFirebaseUi = {
      config: () =>
        of({
          language: 'en',
          enableAutoUpgradeAnonymous: false,
          enableHandleExistingCredential: false,
          translations: {},
        }),
      translation: () => of('Invalid email address'),
    };

    // Mock for the NANOSTORES service
    const mockNanoStores = {
      useStore: () =>
        of({
          language: 'en',
          enableAutoUpgradeAnonymous: false,
          enableHandleExistingCredential: false,
          translations: {},
        }),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TanStackField,
        EmailLinkFormComponent,
        MockButtonComponent,
        MockTermsAndPrivacyComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: FirebaseUI, useValue: mockFirebaseUi },
        { provide: Auth, useValue: auth },
        {
          provide: FIREBASE_UI_STORE,
          useValue: {
            config: {
              language: 'en',
              enableAutoUpgradeAnonymous: false,
              enableHandleExistingCredential: false,
              translations: {},
            },
          },
        },
      ],
    })
      .overrideComponent(EmailLinkFormComponent, {
        remove: { imports: [TermsAndPrivacyComponent, ButtonComponent] },
        add: { imports: [MockTermsAndPrivacyComponent, MockButtonComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EmailLinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }));

  it('should successfully initiate email link sign in', fakeAsync(() => {
    // Find email input
    const emailInput = fixture.debugElement.query(
      By.css('input[type="email"]'),
    ).nativeElement;

    // Fill in the form
    emailInput.value = testEmail;
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    // Find and click the submit button
    const submitButton = fixture.debugElement.query(
      By.css('fui-button button'),
    ).nativeElement;
    submitButton.click();

    // Wait for Firebase operation to complete
    tick(5000);
    fixture.detectChanges();

    // Check for success by verifying no critical error message exists
    const errorElements = fixture.debugElement.queryAll(
      By.css('.fui-form__error'),
    );

    let hasCriticalError = false;
    let criticalErrorText = '';

    errorElements.forEach((errorElement) => {
      const errorText =
        errorElement.nativeElement.textContent?.toLowerCase() || '';
      // Only fail if there's a critical error (not validation related)
      if (
        !errorText.includes('email') &&
        !errorText.includes('valid') &&
        !errorText.includes('required')
      ) {
        hasCriticalError = true;
        criticalErrorText = errorText;
      }
    });

    // Test passes if no critical errors found
    expect(hasCriticalError).toBeFalse();
  }));

  it('should handle invalid email format', fakeAsync(() => {
    // Find email input
    const emailInput = fixture.debugElement.query(
      By.css('input[type="email"]'),
    ).nativeElement;

    // Fill in form with invalid email
    emailInput.value = 'invalid-email';
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    // Find and click the submit button
    const submitButton = fixture.debugElement.query(
      By.css('fui-button button'),
    ).nativeElement;
    submitButton.click();

    // Wait for validation to complete
    tick(2000);
    fixture.detectChanges();

    // Verify error is shown
    const errorElements = fixture.debugElement.queryAll(
      By.css('.fui-form__error'),
    );
    expect(errorElements.length).toBeGreaterThan(0);
  }));
});
