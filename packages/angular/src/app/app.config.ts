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

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import {
  provideFirebaseUI,
  provideFirebaseUIPolicies,
} from '@firebase-ui/angular';
import { initializeUI } from '@firebase-ui/core';

const firebaseConfig = {
  apiKey: 'AIzaSyAotbJXqnZxg9aAsULFn8MLwp_twtMUl2k',
  authDomain: 'ff-test-74aeb.firebaseapp.com',
  databaseURL:
    'https://ff-test-74aeb-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'ff-test-74aeb',
  storageBucket: 'ff-test-74aeb.appspot.com',
  messagingSenderId: '950537677105',
  appId: '1:950537677105:web:da72ccc1718279f3cde810',
  measurementId: 'G-B5Y2YD83TJ',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      connectAuthEmulator(auth, 'http://localhost:9099');
      return auth;
    }),
    provideFirebaseUI((apps) => initializeUI({ app: apps[0] })),
    provideFirebaseUIPolicies(() => ({
      termsOfServiceUrl: 'https://www.google.com',
      privacyPolicyUrl: 'https://www.google.com',
    })),
  ],
};
