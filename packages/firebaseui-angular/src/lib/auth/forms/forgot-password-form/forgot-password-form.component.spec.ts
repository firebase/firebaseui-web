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
import { ForgotPasswordFormComponent } from './forgot-password-form.component';

// Define window properties for testing
declare global {
  interface Window {
    sendPasswordResetEmail: any;
    createForgotPasswordFormSchema: any;
  }
}

// Mock Button component
@Component({
  selector: 'fui-button',
  template: `<button data-testid="submit-button">
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

describe('ForgotPasswordFormComponent', () => {
  let component: ForgotPasswordFormComponent;
  let fixture: ComponentFixture<ForgotPasswordFormComponent>;
  let mockRouter: any;
  let sendResetEmailSpy: jasmine.Spy;

  // Expected error messages from the actual implementation
  const errorMessages = {
    invalidEmail: 'Please enter a valid email address',
    unknownError: 'An unknown error occurred',
  };

  // Mock schema returned by createForgotPasswordFormSchema
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
      return { success: true };
    },
  };

  beforeEach(async () => {
    // Mock router
    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };

    // Create spies for the global functions
    sendResetEmailSpy = jasmine
      .createSpy('sendPasswordResetEmail')
      .and.returnValue(Promise.resolve());

    // Define the function on the window object
    Object.defineProperty(window, 'sendPasswordResetEmail', {
      value: sendResetEmailSpy,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'createForgotPasswordFormSchema', {
      value: () => mockSchema,
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ForgotPasswordFormComponent,
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

    fixture = TestBed.createComponent(ForgotPasswordFormComponent);
    component = fixture.componentInstance;

    // Set required inputs
    component.signInRoute = '/signin';

    // Replace the resetPassword method with a spy
    spyOn(component, 'resetPassword').and.callFake(async (_email) => {
      return Promise.resolve();
    });

    // Mock the form schema
    component['formSchema'] = mockSchema;

    fixture.detectChanges();
    await fixture.whenStable(); // Wait for async ngOnInit
  });

  it('renders the form correctly', () => {
    expect(component).toBeTruthy();

    // Check essential elements are present
    const emailInput = fixture.debugElement.query(
      By.css('input[type="email"]')
    );
    const termsAndPrivacy = fixture.debugElement.query(
      By.css('fui-terms-and-privacy')
    );
    const submitButton = fixture.debugElement.query(By.css('fui-button'));

    expect(emailInput).toBeTruthy();
    expect(termsAndPrivacy).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

  it('submits the form when handleSubmit is called', fakeAsync(() => {
    // Set values directly on the form state
    component.form.state.values.email = 'test@example.com';

    // Create a submit event
    const event = new Event('submit');
    Object.defineProperties(event, {
      preventDefault: { value: jasmine.createSpy('preventDefault') },
      stopPropagation: { value: jasmine.createSpy('stopPropagation') },
    });

    // Call handleSubmit directly
    component.handleSubmit(event as SubmitEvent);
    tick();

    // Check if resetPassword was called with correct values
    expect(component.resetPassword).toHaveBeenCalledWith('test@example.com');
  }));

  it('displays error message when reset fails', fakeAsync(() => {
    // Manually set the error
    component.formError = 'Invalid email';
    fixture.detectChanges();

    // Check that the error message is displayed in the DOM
    const formErrorEl = fixture.debugElement.query(By.css('.fui-form__error'));
    expect(formErrorEl).toBeTruthy();
    expect(formErrorEl.nativeElement.textContent.trim()).toBe('Invalid email');
  }));

  it('shows success message when email is sent', () => {
    // Set emailSent to true
    component.emailSent = true;
    fixture.detectChanges();

    // Check for success message
    const successMessage = fixture.debugElement.query(
      By.css('.fui-form__success')
    );
    expect(successMessage).toBeTruthy();
    expect(successMessage.nativeElement.textContent.trim()).toContain(
      'Check your email'
    );
  });

  it('navigates to sign in route when back button is clicked', () => {
    // Find the sign in button
    const signInLink = fixture.debugElement.query(By.css('.fui-form__action'));
    expect(signInLink).toBeTruthy();

    // Click the link
    signInLink.nativeElement.click();

    // Check navigation was triggered
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/signin');
  });
});
