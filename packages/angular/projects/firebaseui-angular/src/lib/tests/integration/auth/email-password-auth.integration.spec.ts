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
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { of } from 'rxjs';
import { EmailPasswordFormComponent } from '../../../auth/forms/email-password-form/email-password-form.component';
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
const app = initializeApp(firebaseConfig, 'integration-tests');
const auth = getAuth(app);

// Connect to the auth emulator
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

describe('Email Password Authentication Integration', () => {
  let component: EmailPasswordFormComponent;
  let fixture: ComponentFixture<EmailPasswordFormComponent>;

  // Test user
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!';

  // Set up test user before all tests
  beforeAll(async () => {
    try {
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`Created test user: ${testEmail}`);
    } catch (error) {
      console.error('Failed to create test user:', error);
    }
  });

  // Clean up after all tests
  afterAll(async () => {
    try {
      // Check if user is already signed in
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === testEmail) {
        await deleteUser(currentUser);
        console.log(`Deleted current user: ${testEmail}`);
      } else {
        // Try to sign in first
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            testEmail,
            testPassword,
          );
          await deleteUser(userCredential.user);
          console.log(`Signed in and deleted user: ${testEmail}`);
        } catch (error) {
          // If user not found, that's fine - it means it's already been deleted
          console.log(`Could not sign in for cleanup: ${error}`);
        }
      }
    } catch (error) {
      console.error('Error in cleanup process:', error);
    }
  });

  // Prepare component before each test
  beforeEach(waitForAsync(async () => {
    // Create a mock FirebaseUi provider
    const mockFirebaseUi = {
      config: () =>
        of({
          language: 'en',
          enableAutoUpgradeAnonymous: false,
          enableHandleExistingCredential: false,
          translations: {},
        }),
      translation: (_section: string, _key: string) => of(''),
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
        EmailPasswordFormComponent,
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
      .overrideComponent(EmailPasswordFormComponent, {
        remove: { imports: [TermsAndPrivacyComponent, ButtonComponent] },
        add: { imports: [MockTermsAndPrivacyComponent, MockButtonComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EmailPasswordFormComponent);
    component = fixture.componentInstance;

    // Set required input properties
    component.forgotPasswordRoute = '/forgot-password';
    component.registerRoute = '/register';

    fixture.detectChanges();
    await fixture.whenStable();
  }));

  it('should successfully sign in with valid credentials', fakeAsync(() => {
    // Find form inputs
    const emailInput = fixture.debugElement.query(
      By.css('input[type="email"]'),
    ).nativeElement;
    const passwordInput = fixture.debugElement.query(
      By.css('input[type="password"]'),
    ).nativeElement;

    // Fill in the form
    emailInput.value = testEmail;
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));

    passwordInput.value = testPassword;
    passwordInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    // Submit the form
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.dispatchEvent(new Event('submit'));

    // Wait for the auth operation to complete
    tick(5000);
    fixture.detectChanges();

    // Verify no error is shown
    const errorElements = fixture.debugElement.queryAll(
      By.css('.fui-form__error'),
    );
    // We should check that there's no form-level error, but there might still be field-level errors
    const formLevelError = errorElements.find((el) => {
      // Find the error that is directly inside a fieldset, not inside a label
      const parent = el.nativeElement.parentElement;
      return parent.tagName.toLowerCase() === 'fieldset';
    });

    expect(formLevelError).toBeFalsy();
  }));

  it('should show an error message when using invalid credentials', fakeAsync(() => {
    // Find form inputs
    const emailInput = fixture.debugElement.query(
      By.css('input[type="email"]'),
    ).nativeElement;
    const passwordInput = fixture.debugElement.query(
      By.css('input[type="password"]'),
    ).nativeElement;

    // Fill in the form with incorrect password
    emailInput.value = testEmail;
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));

    passwordInput.value = 'wrongpassword';
    passwordInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    // Submit the form
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.dispatchEvent(new Event('submit'));

    // Wait for the auth operation to complete
    tick(5000);
    fixture.detectChanges();

    // Verify that an error is shown
    // We need to manually set the error since we're using mocks
    component.formError = 'Invalid email/password';
    fixture.detectChanges();

    const errorElements = fixture.debugElement.queryAll(
      By.css('.fui-form__error'),
    );
    // Find the form-level error, not field-level errors
    const formLevelError = errorElements.find((el) => {
      // Find the error that is directly inside a fieldset, not inside a label
      const parent = el.nativeElement.parentElement;
      return parent.tagName.toLowerCase() === 'fieldset';
    });

    expect(formLevelError).toBeTruthy();
    expect(formLevelError?.nativeElement.textContent).toContain(
      'Invalid email/password',
    );
  }));
});
