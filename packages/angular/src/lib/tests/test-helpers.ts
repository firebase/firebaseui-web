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

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { Behavior, FirebaseUIConfigurationOptions } from "@firebase-ui/core";
import { provideFirebaseUI, provideFirebaseUIPolicies } from "../provider";
import { FirebaseApps } from "@angular/fire/app";

// Mock locale for testing
const mockLocale = {
  locale: "en-US",
  translations: {
    labels: {},
    messages: {},
    errors: {},
  },
  fallback: undefined,
};

// Mock FirebaseUI store
const mockFirebaseUI = {
  get: () => ({
    app: {} as FirebaseApp,
    auth: {} as Auth,
    locale: mockLocale as any,
    behaviors: [] as Behavior[],
    setLocale: jest.fn(),
    setState: jest.fn(),
    state: { isLoading: false, error: null },
  }),
  set: jest.fn(),
  subscribe: jest.fn(),
};

// Mock core functions - simplified approach
const mockGetTranslation = jest.fn((ui, category, key) => {
  return ui.locale.translations[category]?.[key] || `${category}.${key}`;
});

const mockCreateForgotPasswordAuthFormSchema = jest.fn(() => ({
  safeParse: jest.fn((data) => {
    if (!data.email || !data.email.includes("@")) {
      return {
        success: false,
        error: {
          format: () => ({
            email: { _errors: ["Please enter a valid email address"] },
          }),
        },
      };
    }
    return { success: true };
  }),
}));

const mockSendPasswordResetEmail = jest.fn();

class MockFirebaseUIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseUIError";
  }
}

// Mock the module
jest.mock("@firebase-ui/core", () => ({
  getTranslation: mockGetTranslation,
  createForgotPasswordAuthFormSchema: mockCreateForgotPasswordAuthFormSchema,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  FirebaseUIError: MockFirebaseUIError,
}));

export function createMockUI(overrides?: Partial<FirebaseUIConfigurationOptions>) {
  return mockFirebaseUI as any;
}

export function getFirebaseUITestProviders(uiOverrides?: Partial<FirebaseUIConfigurationOptions>) {
  const mockUI = createMockUI(uiOverrides);
  
  return [
    // Mock FirebaseApps
    {
      provide: FirebaseApps,
      useValue: [{} as FirebaseApp],
    },
    // Provide FirebaseUI
    provideFirebaseUI(() => mockUI),
    provideFirebaseUIPolicies(() => ({ termsOfServiceUrl: "", privacyPolicyUrl: "" })),
  ];
}
