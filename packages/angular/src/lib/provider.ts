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
  inject,
  signal,
  computed,
  effect,
  Signal,
  ElementRef,
} from "@angular/core";
import { FirebaseApps } from "@angular/fire/app";
import {
  createEmailLinkAuthFormSchema,
  createForgotPasswordAuthFormSchema,
  createPhoneAuthNumberFormSchema,
  createPhoneAuthVerifyFormSchema,
  createSignInAuthFormSchema,
  createSignUpAuthFormSchema,
  createMultiFactorPhoneAuthNumberFormSchema,
  createMultiFactorPhoneAuthAssertionFormSchema,
  createMultiFactorPhoneAuthVerifyFormSchema,
  createMultiFactorTotpAuthNumberFormSchema,
  createMultiFactorTotpAuthVerifyFormSchema,
  FirebaseUIStore,
  type FirebaseUI as FirebaseUIType,
  getTranslation,
  getBehavior,
  type CountryData,
} from "@firebase-ui/core";

const FIREBASE_UI_STORE = new InjectionToken<FirebaseUIStore>("firebaseui.store");
const FIREBASE_UI_POLICIES = new InjectionToken<PolicyConfig>("firebaseui.policies");

type PolicyConfig = {
  termsOfServiceUrl: string;
  privacyPolicyUrl: string;
};

export function provideFirebaseUI(uiFactory: (apps: FirebaseApps) => FirebaseUIStore): EnvironmentProviders {
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
  ];

  return makeEnvironmentProviders(providers);
}

export function provideFirebaseUIPolicies(factory: () => PolicyConfig) {
  const providers: Provider[] = [{ provide: FIREBASE_UI_POLICIES, useFactory: factory }];

  return makeEnvironmentProviders(providers);
}

export function injectUI() {
  const store = inject(FIREBASE_UI_STORE);
  const ui = signal<FirebaseUIType>(store.get());

  effect(() => {
    return store.subscribe(ui.set);
  });

  return ui.asReadonly();
}

export function injectRecaptchaVerifier(element: () => ElementRef<HTMLDivElement>) {
  const ui = injectUI();
  const verifier = computed(() => {
    const elementRef = element();
    if (!elementRef) {
      return null;
    }
    return getBehavior(ui(), "recaptchaVerification")(ui(), elementRef.nativeElement);
  });

  effect(() => {
    const verifierInstance = verifier();
    if (verifierInstance) {
      verifierInstance.render();
    }
  });

  return verifier;
}

export function injectTranslation(category: string, key: string) {
  const ui = injectUI();
  return computed(() => getTranslation(ui(), category as any, key as any));
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

export function injectPhoneAuthFormSchema(): Signal<ReturnType<typeof createPhoneAuthNumberFormSchema>> {
  const ui = injectUI();
  return computed(() => createPhoneAuthNumberFormSchema(ui()));
}

export function injectPhoneAuthVerifyFormSchema(): Signal<ReturnType<typeof createPhoneAuthVerifyFormSchema>> {
  const ui = injectUI();
  return computed(() => createPhoneAuthVerifyFormSchema(ui()));
}

export function injectMultiFactorPhoneAuthNumberFormSchema(): Signal<
  ReturnType<typeof createMultiFactorPhoneAuthNumberFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorPhoneAuthNumberFormSchema(ui()));
}

export function injectMultiFactorPhoneAuthAssertionFormSchema(): Signal<
  ReturnType<typeof createMultiFactorPhoneAuthAssertionFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorPhoneAuthAssertionFormSchema(ui()));
}

export function injectMultiFactorPhoneAuthVerifyFormSchema(): Signal<
  ReturnType<typeof createMultiFactorPhoneAuthVerifyFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorPhoneAuthVerifyFormSchema(ui()));
}

export function injectMultiFactorTotpAuthNumberFormSchema(): Signal<
  ReturnType<typeof createMultiFactorTotpAuthNumberFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorTotpAuthNumberFormSchema(ui()));
}

export function injectMultiFactorTotpAuthVerifyFormSchema(): Signal<
  ReturnType<typeof createMultiFactorTotpAuthVerifyFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorTotpAuthVerifyFormSchema(ui()));
}

export function injectPolicies(): PolicyConfig | null {
  return inject<PolicyConfig | null>(FIREBASE_UI_POLICIES, { optional: true });
}

export function injectCountries(): Signal<CountryData[]> {
  const ui = injectUI();
  return computed(() => getBehavior(ui(), "countryCodes")().allowedCountries);
}

export function injectDefaultCountry(): Signal<CountryData> {
  const ui = injectUI();
  return computed(() => getBehavior(ui(), "countryCodes")().defaultCountry);
}

export function injectRedirectError(): Signal<string | undefined> {
  const ui = injectUI();
  return computed(() => {
    const redirectError = ui().redirectError;
    if (!redirectError) {
      return undefined;
    }
    return redirectError instanceof Error ? redirectError.message : String(redirectError);
  });
}
