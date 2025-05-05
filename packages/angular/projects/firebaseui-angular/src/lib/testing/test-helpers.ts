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

import { Provider } from '@angular/core';
import { FirebaseUI, FirebaseUIPolicies } from '../provider';
import { Auth } from '@angular/fire/auth';
import { InjectionToken } from '@angular/core';
import { of } from 'rxjs';

// Mock for the Auth service
export const mockAuth = {
  appVerificationDisabledForTesting: true,
  languageCode: 'en',
  settings: {
    appVerificationDisabledForTesting: true,
  },
  app: {
    options: {
      apiKey: 'fake-api-key',
    },
    name: 'test',
    automaticDataCollectionEnabled: false,
    appVerificationDisabledForTesting: true,
  },
  signInWithPopup: jasmine.createSpy('signInWithPopup'),
  signInWithRedirect: jasmine.createSpy('signInWithRedirect'),
  signInWithPhoneNumber: jasmine.createSpy('signInWithPhoneNumber'),
};

// Mock for FirebaseUi provider
export const mockFirebaseUi = {
  config: () =>
    of({
      language: 'en',
      enableAutoUpgradeAnonymous: false,
      enableHandleExistingCredential: false,
      translations: {},
    }),
  translation: (category: string, key: string) => {
    const translations: Record<string, Record<string, string>> = {
      labels: {
        emailAddress: 'Email Address',
        password: 'Password',
        forgotPassword: 'Forgot Password',
        signIn: 'Sign In',
        register: 'Register',
        displayName: 'Display Name',
        confirmPassword: 'Confirm Password',
        resetPassword: 'Reset Password',
        backToSignIn: 'Back to Sign In',
      },
      prompts: {
        noAccount: "Don't have an account?",
        alreadyAccount: 'Already have an account?',
      },
      messages: {
        checkEmailForReset: 'Check your email for reset instructions',
      },
      errors: {
        unknownError: 'An unknown error occurred',
        invalidEmail: 'Please enter a valid email address',
        passwordTooShort: 'Password should be at least 8 characters',
        passwordsDoNotMatch: 'Passwords do not match',
      },
    };
    return of(translations[category]?.[key] || `${category}.${key}`);
  },
};

// Mock for the NANOSTORES service
export const mockNanoStores = {
  useStore: () =>
    of({
      language: 'en',
      enableAutoUpgradeAnonymous: false,
      enableHandleExistingCredential: false,
      translations: {},
    }),
};

// Mock for the FirebaseUI store token
export const FIREBASE_UI_STORE = new InjectionToken<any>('firebaseui.store');

// Helper function to get all Firebase UI related providers for testing
export function getFirebaseUITestProviders(): Provider[] {
  return [
    { provide: Auth, useValue: mockAuth },
    { provide: FirebaseUI, useValue: mockFirebaseUi },
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
    {
      provide: FirebaseUIPolicies,
      useValue: {
        termsOfServiceUrl: '/terms',
        privacyPolicyUrl: '/privacy',
      },
    },
  ];
}
