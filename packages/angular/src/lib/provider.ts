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
  Optional,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FirebaseApps } from "@angular/fire/app";
import { Auth, authState, User } from "@angular/fire/auth";
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
} from "@firebase-oss/ui-core";

const FIREBASE_UI_STORE = new InjectionToken<FirebaseUIStore>("firebaseui.store");
const FIREBASE_UI_POLICIES = new InjectionToken<PolicyConfig>("firebaseui.policies");

/** Configuration for terms of service and privacy policy links. */
type PolicyConfig = {
  /** The URL to the terms of service page. */
  termsOfServiceUrl: string;
  /** The URL to the privacy policy page. */
  privacyPolicyUrl: string;
};

/**
 * Provides FirebaseUI configuration for the Angular application.
 *
 * This function must be called in your application's providers array to enable FirebaseUI functionality.
 *
 * @param uiFactory - Factory function that creates a FirebaseUIStore from Firebase apps.
 * @returns Environment providers for FirebaseUI.
 */
export function provideFirebaseUI(uiFactory: (apps: FirebaseApps) => FirebaseUIStore): EnvironmentProviders {
  const providers: Provider[] = [
    // TODO: This should depend on the FirebaseAuth provider via deps,
    // see https://github.com/angular/angularfire/blob/35e0a9859299010488852b1826e4083abe56528f/src/firestore/firestore.module.ts#L76
    {
      provide: FIREBASE_UI_STORE,
      deps: [FirebaseApps, [new Optional(), Auth]],
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

/**
 * Provides policy configuration (terms of service and privacy policy URLs) for FirebaseUI components.
 *
 * @param factory - Factory function that returns the policy configuration.
 * @returns Environment providers for FirebaseUI policies.
 */
export function provideFirebaseUIPolicies(factory: () => PolicyConfig) {
  const providers: Provider[] = [{ provide: FIREBASE_UI_POLICIES, useFactory: factory }];

  return makeEnvironmentProviders(providers);
}

/**
 * Injects the FirebaseUI store as a reactive signal.
 *
 * Returns a readonly signal that updates when the UI state changes.
 *
 * @returns A readonly signal containing the current FirebaseUI state.
 */
export function injectUI() {
  const store = inject(FIREBASE_UI_STORE);
  const ui = signal<FirebaseUIType>(store.get());

  effect(() => {
    return store.subscribe(ui.set);
  });

  return ui.asReadonly();
}

/**
 * Injects a callback that is called when a user is authenticated.
 *
 * The callback is only triggered for non-anonymous users.
 *
 * @param onAuthenticated - Callback function called when a user is authenticated.
 */
export function injectUserAuthenticated(onAuthenticated: (user: User) => void) {
  const auth = inject(Auth);
  const state = authState(auth);

  effect((onCleanup) => {
    const subscription = state.subscribe((user) => {
      if (user && !user.isAnonymous) {
        onAuthenticated(user);
      }
    });

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });
}

/**
 * Injects a reCAPTCHA verifier for phone authentication.
 *
 * Automatically renders the reCAPTCHA widget in the provided element when available.
 *
 * @param element - Function that returns the element reference where reCAPTCHA should be rendered.
 * @returns A computed signal containing the reCAPTCHA verifier instance, or null if not available.
 */
export function injectRecaptchaVerifier(element: () => ElementRef<HTMLDivElement>) {
  const ui = injectUI();
  const platformId = inject(PLATFORM_ID);

  const verifier = computed(() => {
    if (!isPlatformBrowser(platformId)) {
      return null;
    }
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

/**
 * Injects a translation string as a reactive signal.
 *
 * The signal updates when the UI locale changes.
 *
 * @param category - The translation category (e.g., "labels", "errors", "prompts").
 * @param key - The translation key within the category.
 * @returns A computed signal containing the translated string.
 */
export function injectTranslation(category: string, key: string) {
  const ui = injectUI();
  return computed(() => getTranslation(ui(), category as any, key as any));
}

/**
 * Injects the sign-in authentication form schema as a reactive signal.
 *
 * @returns A computed signal containing the sign-in form schema.
 */
export function injectSignInAuthFormSchema(): Signal<ReturnType<typeof createSignInAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createSignInAuthFormSchema(ui()));
}

/**
 * Injects the sign-up authentication form schema as a reactive signal.
 *
 * @returns A computed signal containing the sign-up form schema.
 */
export function injectSignUpAuthFormSchema(): Signal<ReturnType<typeof createSignUpAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createSignUpAuthFormSchema(ui()));
}

/**
 * Injects the forgot password authentication form schema as a reactive signal.
 *
 * @returns A computed signal containing the forgot password form schema.
 */
export function injectForgotPasswordAuthFormSchema(): Signal<ReturnType<typeof createForgotPasswordAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createForgotPasswordAuthFormSchema(ui()));
}

/**
 * Injects the email link authentication form schema as a reactive signal.
 *
 * @returns A computed signal containing the email link auth form schema.
 */
export function injectEmailLinkAuthFormSchema(): Signal<ReturnType<typeof createEmailLinkAuthFormSchema>> {
  const ui = injectUI();
  return computed(() => createEmailLinkAuthFormSchema(ui()));
}

/**
 * Injects the phone authentication number form schema as a reactive signal.
 *
 * @returns A computed signal containing the phone auth number form schema.
 */
export function injectPhoneAuthFormSchema(): Signal<ReturnType<typeof createPhoneAuthNumberFormSchema>> {
  const ui = injectUI();
  return computed(() => createPhoneAuthNumberFormSchema(ui()));
}

/**
 * Injects the phone authentication verification form schema as a reactive signal.
 *
 * @returns A computed signal containing the phone auth verification form schema.
 */
export function injectPhoneAuthVerifyFormSchema(): Signal<ReturnType<typeof createPhoneAuthVerifyFormSchema>> {
  const ui = injectUI();
  return computed(() => createPhoneAuthVerifyFormSchema(ui()));
}

/**
 * Injects the multi-factor phone authentication number form schema as a reactive signal.
 *
 * @returns A computed signal containing the MFA phone auth number form schema.
 */
export function injectMultiFactorPhoneAuthNumberFormSchema(): Signal<
  ReturnType<typeof createMultiFactorPhoneAuthNumberFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorPhoneAuthNumberFormSchema(ui()));
}

/**
 * Injects the multi-factor phone authentication assertion form schema as a reactive signal.
 *
 * @returns A computed signal containing the MFA phone auth assertion form schema.
 */
export function injectMultiFactorPhoneAuthAssertionFormSchema(): Signal<
  ReturnType<typeof createMultiFactorPhoneAuthAssertionFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorPhoneAuthAssertionFormSchema(ui()));
}

/**
 * Injects the multi-factor phone authentication verification form schema as a reactive signal.
 *
 * @returns A computed signal containing the MFA phone auth verification form schema.
 */
export function injectMultiFactorPhoneAuthVerifyFormSchema(): Signal<
  ReturnType<typeof createMultiFactorPhoneAuthVerifyFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorPhoneAuthVerifyFormSchema(ui()));
}

/**
 * Injects the multi-factor TOTP authentication number form schema as a reactive signal.
 *
 * @returns A computed signal containing the MFA TOTP auth number form schema.
 */
export function injectMultiFactorTotpAuthNumberFormSchema(): Signal<
  ReturnType<typeof createMultiFactorTotpAuthNumberFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorTotpAuthNumberFormSchema(ui()));
}

/**
 * Injects the multi-factor TOTP authentication verification form schema as a reactive signal.
 *
 * @returns A computed signal containing the MFA TOTP auth verification form schema.
 */
export function injectMultiFactorTotpAuthVerifyFormSchema(): Signal<
  ReturnType<typeof createMultiFactorTotpAuthVerifyFormSchema>
> {
  const ui = injectUI();
  return computed(() => createMultiFactorTotpAuthVerifyFormSchema(ui()));
}

/**
 * Injects the policy configuration (terms of service and privacy policy URLs).
 *
 * @returns The policy configuration, or null if not provided.
 */
export function injectPolicies(): PolicyConfig | null {
  return inject<PolicyConfig | null>(FIREBASE_UI_POLICIES, { optional: true });
}

/**
 * Injects the list of allowed countries for phone authentication as a reactive signal.
 *
 * @returns A computed signal containing the array of allowed country data.
 */
export function injectCountries(): Signal<CountryData[]> {
  const ui = injectUI();
  return computed(() => getBehavior(ui(), "countryCodes")().allowedCountries);
}

/**
 * Injects the default country for phone authentication as a reactive signal.
 *
 * @returns A computed signal containing the default country data.
 */
export function injectDefaultCountry(): Signal<CountryData> {
  const ui = injectUI();
  return computed(() => getBehavior(ui(), "countryCodes")().defaultCountry);
}

/**
 * Injects the redirect error message as a reactive signal.
 *
 * Returns the error message if a redirect error occurred, undefined otherwise.
 *
 * @returns A computed signal containing the redirect error message, or undefined if no error.
 */
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
