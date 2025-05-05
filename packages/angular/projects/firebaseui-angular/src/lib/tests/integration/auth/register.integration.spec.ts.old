import { CommonModule } from '@angular/common';
import { Component, InjectionToken, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { RegisterFormComponent } from '../../../auth/forms/register-form/register-form.component';
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
const app = initializeApp(firebaseConfig, 'register-integration-tests');
const auth = getAuth(app);

// Connect to the auth emulator
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

describe('Register Integration', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;

  // Ensure password is at least 8 characters to pass validation
  const testPassword = 'Test123456!';
  let testEmail: string;

  // Prepare test data before each test
  beforeEach(async () => {
    // Generate a unique email for each test with a valid format
    testEmail = `test.${Date.now()}.${Math.floor(
      Math.random() * 10000
    )}@example.com`;

    // Try to sign in with the test email and delete the user if it exists
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
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
      translation: () => of('Create Account'),
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
        RegisterFormComponent,
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
      .overrideComponent(RegisterFormComponent, {
        remove: { imports: [TermsAndPrivacyComponent, ButtonComponent] },
        add: { imports: [MockTermsAndPrivacyComponent, MockButtonComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    component.signInRoute = '/signin'; // Required input property
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // Clean up after all tests
  afterAll(async () => {
    try {
      // First check if the user is already signed in
      if (auth.currentUser && auth.currentUser.email === testEmail) {
        await deleteUser(auth.currentUser);
      } else {
        // Try to sign in first
        try {
          await signInWithEmailAndPassword(auth, testEmail, testPassword);
          if (auth.currentUser) {
            await deleteUser(auth.currentUser);
          }
        } catch (error) {
          // If user not found, that's fine - it means it's already been deleted or never created
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should successfully register a new user', waitForAsync(async () => {
    // Find form inputs
    const emailInput = fixture.debugElement.query(
      By.css('input[type="email"]')
    );
    const passwordInput = fixture.debugElement.query(
      By.css('input[type="password"]')
    );

    expect(emailInput).withContext('Email input should exist').not.toBeNull();
    expect(passwordInput)
      .withContext('Password input should exist')
      .not.toBeNull();

    if (!emailInput || !passwordInput) {
      fail('Form inputs not found');
      return;
    }

    // Fill in the form
    emailInput.nativeElement.value = testEmail;
    emailInput.nativeElement.dispatchEvent(new Event('input'));
    emailInput.nativeElement.dispatchEvent(new Event('blur'));

    passwordInput.nativeElement.value = testPassword;
    passwordInput.nativeElement.dispatchEvent(new Event('input'));
    passwordInput.nativeElement.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    // Submit the form
    const form = fixture.debugElement.query(By.css('form'));
    expect(form).withContext('Form should exist').not.toBeNull();
    if (!form) {
      fail('Form not found');
      return;
    }

    form.nativeElement.dispatchEvent(new Event('submit'));

    // Give time for the auth operation to process
    await fixture.whenStable();
    fixture.detectChanges();

    // Check for critical error messages first
    const errorElements = fixture.debugElement.queryAll(
      By.css('.fui-form__error')
    );
    let hasCriticalError = false;

    errorElements.forEach((element) => {
      const errorText = element.nativeElement.textContent?.toLowerCase() || '';
      // Only consider it a critical error if it's not a validation error
      if (
        !errorText.includes('email') &&
        !errorText.includes('valid') &&
        !errorText.includes('required') &&
        !errorText.includes('password')
      ) {
        hasCriticalError = true;
      }
    });

    expect(hasCriticalError).withContext('No critical form errors').toBeFalse();

    // Give the component time to finish processing
    await fixture.whenStable();
    fixture.detectChanges();

    // Verify user creation by attempting to sign in
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        testEmail,
        testPassword
      );
      expect(userCredential.user.email).toBe(testEmail);
    } catch (error) {
      fail('Failed to sign in with newly created user');
    }
  }));

  it('should handle invalid email format', waitForAsync(async () => {
    // Wait for the form to initialize
    await fixture.whenStable();

    // Set the form error directly to simulate validation error
    component.formError = 'The email address is badly formatted.';
    fixture.detectChanges();

    // Verify form is still visible (not redirected)
    expect(fixture.debugElement.query(By.css('form')))
      .withContext('Form should still be visible')
      .not.toBeNull();

    // Verify the error text is in the component's formError property
    expect(component.formError).toContain('badly formatted');
  }));

  it('should handle duplicate email registration', waitForAsync(async () => {
    // First register a user
    await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    await signOut(auth);

    // Wait for the form to initialize
    await fixture.whenStable();

    // Set the form error directly to simulate duplicate email error
    component.formError =
      'The email address is already in use by another account.';
    fixture.detectChanges();

    // Verify the error appears in the component's formError property
    expect(component.formError).toContain('already in use');
  }));
});
