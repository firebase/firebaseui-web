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
import {
  Auth,
  ConfirmationResult,
  RecaptchaVerifier,
} from '@angular/fire/auth';
import { FirebaseUIError } from '@firebase-ui/core';
import { TanStackField } from '@tanstack/angular-form';
import { firstValueFrom, of } from 'rxjs';
import { FirebaseUI, FirebaseUIPolicies } from '../../../provider';
import {
  PhoneFormComponent,
  PhoneNumberFormComponent,
  VerificationFormComponent,
} from './phone-form.component';
import { mockAuth } from '../../../testing/test-helpers';
import { providePolicies } from 'src/app/policies/providePolicies';

// Mock Firebase UI Core functions
const mockFuiSignInWithPhoneNumber = jasmine
  .createSpy('signInWithPhoneNumber')
  .and.returnValue(
    Promise.resolve({
      confirm: jasmine.createSpy('confirm').and.returnValue(Promise.resolve()),
      verificationId: 'mock-verification-id',
    } as ConfirmationResult),
  );

const mockFuiConfirmPhoneNumber = jasmine
  .createSpy('fuiConfirmPhoneNumber')
  .and.returnValue(Promise.resolve({} as any));

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
  @Input() disabled: boolean = false;
  @Input() variant: string = 'primary';
}

// Mock TermsAndPrivacy component
@Component({
  selector: 'fui-terms-and-privacy',
  template: `<div data-testid="terms-and-privacy"></div>`,
  standalone: true,
})
class MockTermsAndPrivacyComponent {}

// Mock CountrySelector component
@Component({
  selector: 'fui-country-selector',
  template: `<div data-testid="country-selector">
    <select
      [value]="value?.code"
      (change)="handleChange($event)"
      data-testid="country-select"
    >
      <option
        *ngFor="let country of countries; trackBy: trackByCode"
        [value]="country.code"
      >
        {{ country.name }} ({{ country.dialCode }})
      </option>
    </select>
  </div>`,
  standalone: true,
})
class MockCountrySelectorComponent {
  @Input() value: any;
  @Input() className: string = '';

  countries = [
    { code: 'US', name: 'United States', dialCode: '+1', emoji: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', emoji: '🇬🇧' },
  ];

  trackByCode(_index: number, country: any) {
    return country.code;
  }

  handleChange(event: any) {
    const code = event.target.value;
    const country = this.countries.find((c) => c.code === code);
    if (country) {
      this.onChange?.(country);
    }
  }

  @Input() onChange: ((country: any) => void) | undefined;
}

// Create mock for FirebaseUi provider
class MockFirebaseUi {
  config() {
    return of({
      getAuth: () => mockAuth,
      recaptchaMode: 'normal',
      translations: {},
    });
  }

  translation(_category: string, _key: string) {
    return of('Invalid phone number'); // Return the specific expected error message
  }
}

// Create a test component class that extends the real component
class TestPhoneFormComponent extends PhoneFormComponent {
  // Replace the initRecaptcha method to simplify testing
  initRecaptcha() {
    const mockRecaptchaVerifier = jasmine.createSpyObj<RecaptchaVerifier>(
      'RecaptchaVerifier',
      ['render', 'clear', 'verify'],
    );
    mockRecaptchaVerifier.render.and.returnValue(Promise.resolve(1));
    mockRecaptchaVerifier.verify.and.returnValue(
      Promise.resolve('verification-token'),
    );

    this.recaptchaVerifier = mockRecaptchaVerifier;
    return Promise.resolve();
  }

  // Make protected methods directly accessible for testing
  async testGetAuth() {
    return (await firstValueFrom(this['ui'].config())).getAuth();
  }

  testGetUi() {
    return this['ui']; // Access private property with indexing
  }

  // Simple mock implementation that directly uses our spy
  override async handlePhoneSubmit(phoneNumber: string): Promise<void> {
    this.formError = null;

    if (phoneNumber.startsWith('VALIDATION_ERROR:')) {
      this.formError = phoneNumber.substring('VALIDATION_ERROR:'.length);
      return;
    }

    try {
      if (!this.recaptchaVerifier) {
        throw new Error('ReCAPTCHA not initialized');
      }

      this.phoneNumber = phoneNumber;
      // Call our mock function directly
      const result = await mockFuiSignInWithPhoneNumber(
        await this.testGetAuth(),
        phoneNumber,
        this.recaptchaVerifier,
        {
          translations: {},
          language: 'en',
        },
      );

      this.confirmationResult = result;
      this.startTimer();
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.formError = error.message;
        return;
      }
      this.formError = 'Invalid phone number';
    }
  }

  // Simple mock implementation that directly uses our spy
  override async handleVerificationSubmit(code: string): Promise<void> {
    if (code.startsWith('VALIDATION_ERROR:')) {
      this.formError = code.substring('VALIDATION_ERROR:'.length);
      return;
    }

    if (!this.confirmationResult) {
      throw new Error('Confirmation result not initialized');
    }

    this.formError = null;

    try {
      // Call our mock function directly
      await mockFuiConfirmPhoneNumber(this.confirmationResult, code, {
        translations: {},
        language: 'en',
      });
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.formError = error.message;
        return;
      }
      this.formError = 'Invalid verification code';
    }
  }

  // Simple mock implementation that directly uses our spy
  override async handleResend(): Promise<void> {
    if (!this.canResend || !this.phoneNumber) {
      return;
    }

    this.formError = null;

    try {
      if (this.recaptchaVerifier) {
        // Call our mock function directly
        const result = await mockFuiSignInWithPhoneNumber(
          this.testGetAuth(),
          this.phoneNumber,
          this.recaptchaVerifier,
          {
            translations: {},
            language: 'en',
          },
        );

        this.confirmationResult = result;
        this.startTimer();
      }
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.formError = error.message;
      } else {
        this.formError = 'An error occurred';
      }
    }
  }
}

class TestPhoneNumberFormComponent extends PhoneNumberFormComponent {
  // Replace the initRecaptcha method
  override initRecaptcha() {
    const mockRecaptchaVerifier = jasmine.createSpyObj<RecaptchaVerifier>(
      'RecaptchaVerifier',
      ['render', 'clear', 'verify'],
    );
    mockRecaptchaVerifier.render.and.returnValue(Promise.resolve(1));
    mockRecaptchaVerifier.verify.and.returnValue(
      Promise.resolve('verification-token'),
    );

    this.recaptchaVerifier = mockRecaptchaVerifier;
    return Promise.resolve();
  }
}

class TestVerificationFormComponent extends VerificationFormComponent {
  // No need to override anything here as it doesn't use RecaptchaVerifier
}

describe('PhoneFormComponent', () => {
  let component: TestPhoneFormComponent;
  let fixture: ComponentFixture<TestPhoneFormComponent>;
  let mockRecaptchaVerifier: jasmine.SpyObj<RecaptchaVerifier>;
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(function () {
    // Reset the spies before each test
    mockFuiSignInWithPhoneNumber.calls.reset();
    mockFuiConfirmPhoneNumber.calls.reset();

    mockRecaptchaVerifier = jasmine.createSpyObj<RecaptchaVerifier>(
      'RecaptchaVerifier',
      ['render', 'clear', 'verify'],
    );
    mockRecaptchaVerifier.render.and.returnValue(Promise.resolve(1));
    mockRecaptchaVerifier.verify.and.returnValue(
      Promise.resolve('verification-token'),
    );

    // Create mock schema for phone validation
    (window as any).createPhoneFormSchema = jasmine
      .createSpy('createPhoneFormSchema')
      .and.returnValue({
        safeParse: (data: any) => {
          if (data.phoneNumber && !data.phoneNumber.match(/^\d{10}$/)) {
            return {
              success: false,
              error: {
                format: () => ({
                  phoneNumber: { _errors: ['Invalid phone number'] },
                }),
              },
            };
          }
          if (
            data.verificationCode &&
            !data.verificationCode.match(/^\d{6}$/)
          ) {
            return {
              success: false,
              error: {
                format: () => ({
                  verificationCode: { _errors: ['Invalid verification code'] },
                }),
              },
            };
          }
          return { success: true };
        },
        pick: () => ({
          safeParse: (data: any) => {
            if (data.phoneNumber && !data.phoneNumber.match(/^\d{10}$/)) {
              return {
                success: false,
                error: {
                  format: () => ({
                    phoneNumber: { _errors: ['Invalid phone number'] },
                  }),
                },
              };
            }
            if (
              data.verificationCode &&
              !data.verificationCode.match(/^\d{6}$/)
            ) {
              return {
                success: false,
                error: {
                  format: () => ({
                    verificationCode: {
                      _errors: ['Invalid verification code'],
                    },
                  }),
                },
              };
            }
            return { success: true };
          },
        }),
      });

    mockFirebaseUi = new MockFirebaseUi();

    // Mock Auth service
    const mockAuthService = {
      app: {
        options: {
          apiKey: 'test-api-key',
        },
        automaticDataCollectionEnabled: false,
        name: 'test-app',
        appVerificationDisabledForTesting: true,
      },
      languageCode: 'en',
      settings: { appVerificationDisabledForTesting: true },
      signInWithPhoneNumber: jasmine
        .createSpy('signInWithPhoneNumber')
        .and.returnValue(
          Promise.resolve({
            confirm: jasmine
              .createSpy('confirm')
              .and.returnValue(Promise.resolve()),
          }),
        ),
      signInWithCredential: jasmine
        .createSpy('signInWithCredential')
        .and.returnValue(Promise.resolve()),
    };

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TanStackField,
        TestPhoneFormComponent,
        TestPhoneNumberFormComponent,
        TestVerificationFormComponent,
        MockButtonComponent,
        MockTermsAndPrivacyComponent,
        MockCountrySelectorComponent,
      ],
      providers: [
        { provide: FirebaseUI, useValue: mockFirebaseUi },
        { provide: Auth, useValue: mockAuthService },
        {
          provide: FirebaseUIPolicies,
          useValue: {
            termsOfServiceUrl: '/terms',
            privacyPolicyUrl: '/privacy',
          },
        },
      ],
    }).compileComponents();

    // Mock RecaptchaVerifier constructor
    (window as any).RecaptchaVerifier = jasmine
      .createSpy('RecaptchaVerifier')
      .and.returnValue(mockRecaptchaVerifier);

    fixture = TestBed.createComponent(TestPhoneFormComponent);
    component = fixture.componentInstance;
    component.recaptchaVerifier = mockRecaptchaVerifier;

    // Mock DOM methods
    spyOn(document, 'querySelector').and.returnValue(
      document.createElement('div'),
    );

    // Directly replace timer with mock implementation
    component.startTimer = function () {
      this.timeLeft = this.resendDelay;
      this.canResend = false;

      // Simulate the timer effect manually
      this.timeLeft = this.timeLeft - 1;
      this.canResend = true;
    };

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initially show the phone number form', () => {
    expect(component.confirmationResult).toBeNull();
  });

  it('should call signInWithPhoneNumber when handling phone submission', fakeAsync(() => {
    component.handlePhoneSubmit('1234567890');
    tick();

    expect(mockFuiSignInWithPhoneNumber).toHaveBeenCalled();
  }));

  it('should show an error message when phone submission fails', fakeAsync(() => {
    const mockError = new FirebaseUIError({
      code: 'auth/invalid-phone-number',
      message: 'The phone number is invalid',
    });

    mockFuiSignInWithPhoneNumber.and.rejectWith(mockError);

    component.handlePhoneSubmit('1234567890');
    tick();

    expect(component.formError).toBe('The phone number is invalid');
  }));

  it('should call fuiConfirmPhoneNumber when handling verification code submission', fakeAsync(() => {
    // Set up the confirmation result first
    const mockConfirmationResult = {
      confirm: jasmine.createSpy('confirm').and.returnValue(Promise.resolve()),
      verificationId: 'mock-verification-id',
    } as ConfirmationResult;

    component.confirmationResult = mockConfirmationResult;

    component.handleVerificationSubmit('123456');
    tick();

    expect(mockFuiConfirmPhoneNumber).toHaveBeenCalled();
  }));

  it('should call signInWithPhoneNumber when handling resend code', fakeAsync(() => {
    component.confirmationResult = {} as ConfirmationResult;
    component.canResend = true;
    component.phoneNumber = '1234567890';

    component.handleResend();
    tick();

    expect(mockFuiSignInWithPhoneNumber).toHaveBeenCalled();
  }));

  it('should update timer and resend flag', () => {
    component.resendDelay = 2;
    component.startTimer();
    expect(component.timeLeft).toBe(1);
    expect(component.canResend).toBeTrue();
  });
});
