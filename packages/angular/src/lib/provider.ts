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

import {
  Provider,
  EnvironmentProviders,
  makeEnvironmentProviders,
  InjectionToken,
  Injectable,
  inject,
  signal,
  computed,
  effect,
  Signal,
} from "@angular/core";
import { FirebaseApps } from "@angular/fire/app";
import {
  type FirebaseUI as FirebaseUIType,
  getTranslation,
  createEmailLinkAuthFormSchema,
  createForgotPasswordAuthFormSchema,
  createPhoneAuthFormSchema,
  createSignInAuthFormSchema,
  createSignUpAuthFormSchema,
  FirebaseUIConfiguration,
  type FirebaseUI as FirebaseUIType,
  getTranslation,
} from "@firebase-ui/core";
import {} from "@firebase-ui/core";
import { Tail } from "../types";
import { distinctUntilChanged, map, takeUntil } from "rxjs/operators";
import { Observable, ReplaySubject } from "rxjs";
import { Store } from "nanostores";

const FIREBASE_UI_STORE = new InjectionToken<FirebaseUIType>("firebaseui.store");
const FIREBASE_UI_POLICIES = new InjectionToken<PolicyConfig>("firebaseui.policies");

type PolicyConfig = {
  termsOfServiceUrl: string;
  privacyPolicyUrl: string;
};

export function provideFirebaseUI(uiFactory: (apps: FirebaseApps) => FirebaseUIType): EnvironmentProviders {
  const providers: Provider[] = [
    // TODO: This should depend on the FirebaseAuth provider via deps,
    // see https://github.com/angular/angularfire/blob/35e0a9859299010488852b1826e4083abe56528f/src/firestore/firestore.module.ts#L76
    {
      provide: FIREBASE_UI_STORE,
      useFactory: () => {
        const apps = inject(FirebaseApps);
        if (!apps || apps.length === 0) {
          throw new Error("No Firebase apps found");
        }
        return uiFactory(apps);
      },
    },
    FirebaseUI,
  ];

  return makeEnvironmentProviders(providers);
}

export function provideFirebaseUIPolicies(factory: () => PolicyConfig) {
  const providers: Provider[] = [{ provide: FIREBASE_UI_POLICIES, useFactory: factory }];

  return makeEnvironmentProviders(providers);
}

// Provides a signal with a subscription to the FirebaseUIConfiguration
export function injectUI() {
  const store = inject(FIREBASE_UI_STORE);
  const ui = signal<FirebaseUIConfiguration>(store.get());

  effect(() => {
    return store.subscribe(ui.set);
  });

  return ui.asReadonly();
}

export function injectTranslation<T extends TranslationCategory>(category: T, key: TranslationKey<T>) {
  const ui = injectUI();
  return computed(() => getTranslation(ui(), category, key));
}

export function injectSignInAuthFormSchema(): Signal<ReturnType<typeof createSignInAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createSignInAuthFormSchema(ui()));
}

export function injectSignUpAuthFormSchema(): Signal<ReturnType<typeof createSignUpAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createSignUpAuthFormSchema(ui()));
}

export function injectForgotPasswordAuthFormSchema(): Signal<ReturnType<typeof createForgotPasswordAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createForgotPasswordAuthFormSchema(ui()));
}

export function injectEmailLinkAuthFormSchema(): Signal<ReturnType<typeof createEmailLinkAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createEmailLinkAuthFormSchema(ui()));
}

export function injectPhoneAuthFormSchema(): Signal<ReturnType<typeof createPhoneAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createPhoneAuthFormSchema(ui()));
}

@Injectable({
  providedIn: "root",
})
export class FirebaseUI {
  private store = inject(FIREBASE_UI_STORE);
  private destroyed$: ReplaySubject<void> = new ReplaySubject(1);

  config() {
    return this.useStore(this.store);
  }

  //TODO: This should be typed more specifically from the translations package
  translation(...args: Tail) {
    return this.config().pipe(map((config) => getTranslation(config, ...args)));
  }

  useStore<T>(store: Store<T> | null): Observable<T> {
    if (!store) {
      // Return an observable that emits a default value for SSR when store is not available
      return new Observable<T>((subscriber) => {
        subscriber.next({} as T);
        subscriber.complete();
      });
    }
    return new Observable<T>((sub) => {
      sub.next(store.get());
      return store.subscribe((value) => sub.next(value));
    }).pipe(distinctUntilChanged(), takeUntil(this.destroyed$));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

@Injectable({
  providedIn: "root",
})
export class FirebaseUIPolicies {
  private policies = inject(FIREBASE_UI_POLICIES);

  get termsOfServiceUrl() {
    return this.policies.termsOfServiceUrl;
  }

  get privacyPolicyUrl() {
    return this.policies.privacyPolicyUrl;
  }
}
