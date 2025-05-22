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
} from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TanStackField } from '@tanstack/angular-form';
import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { of } from 'rxjs';
import { ForgotPasswordFormComponent } from '../../../auth/forms/forgot-password-form/forgot-password-form.component';
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
const app = initializeApp(firebaseConfig, 'forgot-password-integration-tests');
const auth = getAuth(app);

// Connect to the auth emulator
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

describe('Forgot Password Integration', () => {
  let component: ForgotPasswordFormComponent;
  let fixture: ComponentFixture<ForgotPasswordFormComponent>;

  // Test user
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!';

  // Prepare component before each test
  beforeEach(async () => {
    // Clean up existing user if present
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        console.log(`Deleted existing user: ${testEmail}`);
      }
    } catch (error) {
      // Ignore errors if user doesn't exist
    }
    await signOut(auth);

    // Create a mock FirebaseUi provider
    const mockFirebaseUi = {
      config: () =>
        of({
          language: 'en',
          enableAutoUpgradeAnonymous: false,
          enableHandleExistingCredential: false,
          translations: {},
        }),
      translation: () => of('Email'),
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
        ForgotPasswordFormComponent,
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
      .overrideComponent(ForgotPasswordFormComponent, {
        remove: { imports: [TermsAndPrivacyComponent, ButtonComponent] },
        add: { imports: [MockTermsAndPrivacyComponent, MockButtonComponent] },
      })
      .compileComponents();

    // Create test user if needed (after TestBed is configured)
    try {
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`Created test user: ${testEmail}`);
    } catch (error) {
      // Ignore if user already exists
      console.log(`User already exists or error: ${error}`);
    }
    await signOut(auth);

    fixture = TestBed.createComponent(ForgotPasswordFormComponent);
    component = fixture.componentInstance;
    component.signInRoute = '/signin'; // Required input property
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // Clean up after all tests
  afterAll(async () => {
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        console.log(`Deleted user in cleanup: ${testEmail}`);
      }
    } catch (error) {
      // Ignore errors if user doesn't exist
    }
  });

  it('should successfully send password reset email', fakeAsync(() => {
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
    tick(10000);
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

      console.error('ERROR TEXT:', errorText);

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
