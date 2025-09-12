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
} from "@angular/core";
import { FirebaseApps } from "@angular/fire/app";
import { type FirebaseUI as FirebaseUIType, getTranslation } from "@firebase-ui/core";
import { distinctUntilChanged, map, takeUntil } from "rxjs/operators";
import { Observable, ReplaySubject } from "rxjs";
import { Store } from "nanostores";
import { TranslationCategory, TranslationKey } from "@firebase-ui/translations";

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
        try {
          // Try to get FirebaseApps, but handle the case where it's not available (SSR)
          const apps = inject(FirebaseApps);
          if (!apps || apps.length === 0) {
            return null as any;
          }
          return uiFactory(apps);
        } catch (error) {
          // Return null for SSR when FirebaseApps is not available
          return null as any;
        }
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

@Injectable({
  providedIn: "root",
})
export class FirebaseUI {
  private store = inject(FIREBASE_UI_STORE);
  private destroyed$: ReplaySubject<void> = new ReplaySubject(1);

  config() {
    return this.useStore(this.store);
  }

  translation<T extends TranslationCategory>(category: T, key: TranslationKey<T>) {
    return this.config().pipe(map((config) => getTranslation(config, category, key)));
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
