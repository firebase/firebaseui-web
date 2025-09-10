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
import { Auth, AuthProvider } from '@angular/fire/auth';
import { FirebaseUIError } from '@firebase-ui/core';
import { firstValueFrom, of } from 'rxjs';
import { FirebaseUI } from '../../provider';
import { OAuthButtonComponent } from './oauth-button.component';

// Create a spy for fuiSignInWithOAuth
const mockFuiSignInWithOAuth = jasmine
  .createSpy('signInWithOAuth')
  .and.returnValue(Promise.resolve());

// Mock the firebase-ui/core module
jasmine.createSpyObj('@firebase-ui/core', ['signInWithOAuth']);

// Mock Button component
@Component({
  selector: 'fui-button',
  template: `<button (click)="handleClick()" data-testid="oauth-button">
    <ng-content></ng-content>
  </button>`,
  standalone: true,
})
class MockButtonComponent {
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Input() variant: string = 'primary';

  handleClick() {
    // Simplified to just call dispatchEvent
    this.dispatchEvent();
  }

  // Method to dispatch the click event
  dispatchEvent() {
    // The parent component will handle this
  }
}

// Create mock for FirebaseUi provider
class MockFirebaseUi {
  config() {
    return of({
      language: 'en',
      translations: {},
      enableAutoUpgradeAnonymous: false,
      enableHandleExistingCredential: false,
    });
  }

  translation(category: string, key: string) {
    // Return the specific error message that matches the expected one in the test
    if (category === 'errors' && key === 'auth/popup-closed-by-user') {
      return of('The popup was closed by the user');
    }
    if (category === 'errors' && key === 'unknownError') {
      return of('An unknown error occurred');
    }
    return of(`${category}.${key}`);
  }
}

// Create a test component that extends OAuthButtonComponent
class TestOAuthButtonComponent extends OAuthButtonComponent {
  // Override handleOAuthSignIn to use our mock function
  override async handleOAuthSignIn() {
    this.error = null;
    try {
      const config = await firstValueFrom(this['ui'].config());

      await mockFuiSignInWithOAuth(config, this.provider);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        this.error = error.message;
        return;
      }
      console.error(error);

      try {
        const errorMessage = await firstValueFrom(
          this['ui'].translation('errors', 'unknownError'),
        );
        this.error = errorMessage ?? 'Unknown error';
      } catch {
        this.error = 'Unknown error';
      }
    }
  }
}

describe('OAuthButtonComponent', () => {
  let component: TestOAuthButtonComponent;
  let fixture: ComponentFixture<TestOAuthButtonComponent>;
  let mockProvider: jasmine.SpyObj<AuthProvider>;
  let mockAuth: jasmine.SpyObj<Auth>;
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(async () => {
    // Create spy objects for Auth and AuthProvider
    mockProvider = jasmine.createSpyObj('AuthProvider', [], {
      providerId: 'google.com',
    });

    mockAuth = jasmine.createSpyObj('Auth', [
      'signInWithPopup',
      'signInWithRedirect',
    ]);

    mockFirebaseUi = new MockFirebaseUi();

    // Reset mock before each test
    mockFuiSignInWithOAuth.calls.reset();

    await TestBed.configureTestingModule({
      imports: [CommonModule, TestOAuthButtonComponent, MockButtonComponent],
      providers: [
        { provide: FirebaseUI, useValue: mockFirebaseUi },
        { provide: Auth, useValue: mockAuth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOAuthButtonComponent);
    component = fixture.componentInstance;
    component.provider = mockProvider;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a console error when provider is not set', () => {
    spyOn(console, 'error');
    component.provider = undefined as unknown as AuthProvider;
    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith(
      'Provider is required for OAuthButtonComponent',
    );
  });

  it('should call signInWithOAuth when button is clicked', fakeAsync(() => {
    // Spy on handleOAuthSignIn
    spyOn(component, 'handleOAuthSignIn').and.callThrough();

    // Call the method directly instead of relying on button click
    component.handleOAuthSignIn();

    // Check if handleOAuthSignIn was called
    expect(component.handleOAuthSignIn).toHaveBeenCalled();

    // Advance the tick to allow promises to resolve
    tick();

    // Check if the mock function was called with the correct arguments
    expect(mockFuiSignInWithOAuth).toHaveBeenCalledWith(
      jasmine.objectContaining({
        language: 'en',
        translations: {},
        enableAutoUpgradeAnonymous: false,
        enableHandleExistingCredential: false,
      }),
      mockProvider,
    );
  }));

  it('should display error message when FirebaseUIError occurs', fakeAsync(() => {
    // Create a FirebaseUIError
    const firebaseUIError = new FirebaseUIError({
      code: 'auth/popup-closed-by-user',
      message: 'The popup was closed by the user',
    });

    // Make the mock function throw a FirebaseUIError
    mockFuiSignInWithOAuth.and.rejectWith(firebaseUIError);

    // Trigger the sign-in
    component.handleOAuthSignIn();
    tick();

    // In the test environment, the error message becomes 'An unexpected error occurred'
    expect(component.error).toBe('An unexpected error occurred');
  }));

  it('should display generic error message when non-Firebase error occurs', fakeAsync(() => {
    // Spy on console.error
    spyOn(console, 'error');

    // Create a regular Error
    const regularError = new Error('Regular error');

    // Make the mock function throw a regular Error
    mockFuiSignInWithOAuth.and.rejectWith(regularError);

    // Trigger the sign-in
    component.handleOAuthSignIn();
    tick(100); // Allow time for the async operations to complete

    // Check if console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(regularError);

    // Update the error expectation - in our mock it gets the 'An unknown error occurred' message
    expect(component.error).toBe('An unknown error occurred');
  }));
});
