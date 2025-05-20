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
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { TanStackField } from '@tanstack/angular-form';
import { getFirebaseUITestProviders } from '../../../testing/test-helpers';
import { EmailPasswordFormComponent } from './email-password-form.component';

// Define window properties for testing
declare global {
  interface Window {
    signInWithEmailAndPassword: any;
    createEmailFormSchema: any;
  }
}

// Mock Button component
@Component({
  selector: 'fui-button',
  template: `<button (click)="click.emit()" data-testid="submit-button">
    <ng-content></ng-content>
  </button>`,
  standalone: true,
})
class MockButtonComponent {
  @Input() type: string = 'button';
}

// Mock TermsAndPrivacy component
@Component({
  selector: 'fui-terms-and-privacy',
  template: `<div data-testid="terms-and-privacy"></div>`,
  standalone: true,
})
class MockTermsAndPrivacyComponent {}

describe('EmailPasswordFormComponent', () => {
  let component: EmailPasswordFormComponent;
  let fixture: ComponentFixture<EmailPasswordFormComponent>;
  let mockRouter: any;
  let signInSpy: jasmine.Spy;

  // Expected error messages from the actual implementation
  const errorMessages = {
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password should be at least 8 characters',
    unknownError: 'An unknown error occurred',
  };

  // Mock schema returned by createEmailFormSchema
  const mockSchema = {
    safeParse: (data: any) => {
      // Test email validation
      if (!data.email.includes('@')) {
        return {
          success: false,
          error: {
            format: () => ({
              email: { _errors: [errorMessages.invalidEmail] },
            }),
          },
        };
      }
      // Test password validation
      if (data.password.length < 8) {
        return {
          success: false,
          error: {
            format: () => ({
              password: { _errors: [errorMessages.passwordTooShort] },
            }),
          },
        };
      }
      return { success: true };
    },
  };

  beforeEach(async () => {
    // Mock router
    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };

    // Create spies for the global functions
    signInSpy = jasmine
      .createSpy('signInWithEmailAndPassword')
      .and.returnValue(Promise.resolve());

    // Define the function on the window object
    Object.defineProperty(window, 'signInWithEmailAndPassword', {
      value: signInSpy,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'createEmailFormSchema', {
      value: () => mockSchema,
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        EmailPasswordFormComponent,
        TanStackField,
        MockButtonComponent,
        MockTermsAndPrivacyComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        ...getFirebaseUITestProviders(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailPasswordFormComponent);
    component = fixture.componentInstance;

    // Set required inputs
    component.forgotPasswordRoute = '/forgot-password';
    component.registerRoute = '/register';

    // Mock the validateAndSignIn method without any TypeScript errors
    component.validateAndSignIn = jasmine.createSpy('validateAndSignIn');

    fixture.detectChanges();
    await fixture.whenStable(); // Wait for async ngOnInit
  });

  it('renders the form correctly', () => {
    expect(component).toBeTruthy();

    // Check essential elements are present
    const emailInput = fixture.debugElement.query(
      By.css('input[type="email"]')
    );
    const passwordInput = fixture.debugElement.query(
      By.css('input[type="password"]')
    );
    const termsAndPrivacy = fixture.debugElement.query(
      By.css('fui-terms-and-privacy')
    );
    const submitButton = fixture.debugElement.query(By.css('fui-button'));

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(termsAndPrivacy).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

  it('submits the form when handleSubmit is called', fakeAsync(() => {
    // Set values directly on the form state
    component.form.state.values.email = 'test@example.com';
    component.form.state.values.password = 'password123';

    // Create a submit event
    const event = new Event('submit');
    Object.defineProperties(event, {
      preventDefault: { value: jasmine.createSpy('preventDefault') },
      stopPropagation: { value: jasmine.createSpy('stopPropagation') },
    });

    // Call handleSubmit directly
    component.handleSubmit(event as SubmitEvent);
    tick();

    // Check if validateAndSignIn was called with correct values
    expect(component.validateAndSignIn).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
  }));

  it('displays error message when sign in fails', fakeAsync(() => {
    // Manually set the error
    component.formError = 'Invalid credentials';
    fixture.detectChanges();

    // Check that the error message is displayed in the DOM
    const formErrorEl = fixture.debugElement.query(By.css('.fui-form__error'));
    expect(formErrorEl).toBeTruthy();
    expect(formErrorEl.nativeElement.textContent.trim()).toBe(
      'Invalid credentials'
    );
  }));

  it('shows an error message for invalid input', () => {
    // Manually set error message for testing
    component.formError = errorMessages.invalidEmail;
    fixture.detectChanges();

    // Check for error display in the DOM
    const formErrorEl = fixture.debugElement.query(By.css('.fui-form__error'));
    expect(formErrorEl).toBeTruthy();
    expect(formErrorEl.nativeElement.textContent.trim()).toBe(
      errorMessages.invalidEmail
    );
  });

  it('navigates to register route when that button is clicked', () => {
    // Find the register button (second action button)
    const registerButton = fixture.debugElement.queryAll(
      By.css('.fui-form__action')
    )[1];
    expect(registerButton).toBeTruthy();

    // Click the button
    registerButton.nativeElement.click();

    // Check navigation was triggered
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/register');
  });

  it('navigates to forgot password route when that button is clicked', () => {
    // Find the forgot password button (first action button)
    const forgotPasswordButton = fixture.debugElement.queryAll(
      By.css('.fui-form__action')
    )[0];
    expect(forgotPasswordButton).toBeTruthy();

    // Click the button
    forgotPasswordButton.nativeElement.click();

    // Check navigation was triggered
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/forgot-password');
  });
});
