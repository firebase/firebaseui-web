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
  afterNextRender,
  Signal,
  ElementRef,
  Injector,
  Optional,
  PLATFORM_ID,
  NgZone,
  untracked,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FirebaseApps } from "@angular/fire/app";
import { Auth, authState, RecaptchaVerifier, User } from "@angular/fire/auth";
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
  type TranslationCategory,
  type TranslationKey,
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
/**
 * Type for the return value of injectRecaptchaVerifier that doesn't expose SIGNAL types
 */
type RecaptchaVerifierSignal = {
  (): RecaptchaVerifier | null;
  renderCompleted: () => boolean;
  renderPromise: () => Promise<unknown> | null;
};

export function injectRecaptchaVerifier(element: () => ElementRef<HTMLDivElement>): RecaptchaVerifierSignal {
  const ui = injectUI();
  const platformId = inject(PLATFORM_ID);
  const ngZone = inject(NgZone);
  const injector = inject(Injector);
  const renderPromise = signal<Promise<unknown> | null>(null);
  const renderCompleted = signal<boolean>(false);
  // Track which element we've rendered to prevent duplicate renders
  let renderedElement: HTMLElement | null = null;
  // Cache the rendered verifier instance to ensure we always return the same one
  let renderedVerifierInstance: RecaptchaVerifier | null = null;
  // Track in-flight render target to prevent duplicate render() calls
  let renderingElement: HTMLElement | null = null;

  const verifier = computed(() => {
    if (!isPlatformBrowser(platformId)) {
      return null;
    }
    const elementRef = element();
    if (!elementRef) {
      return null;
    }
    // If we have a cached rendered verifier for this element, return it
    if (renderedVerifierInstance && renderedElement === elementRef.nativeElement) {
      return renderedVerifierInstance;
    }
    // Avoid subscribing this computed to transient ui state updates (e.g. pending/idle)
    // which would otherwise retrigger cleanup while a phone verification is in-flight.
    const uiValue = untracked(ui);
    return getBehavior(uiValue, "recaptchaVerification")(uiValue, elementRef.nativeElement);
  });

  effect((onCleanup) => {
    // Early return for SSR - don't run any reCAPTCHA logic on the server
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    const verifierInstance = verifier();
    const elementRef = element();
    const domElement = elementRef?.nativeElement;
    if (verifierInstance && domElement) {
      if (renderingElement === domElement) {
        return;
      }

      // If we've already started or completed rendering for this element, do nothing.
      // don't mark renderCompleted true here. That has to happen when render() resolves.
      // Shouldn't replace renderPromise as it should always reflect the real render() promise.
      if (renderedElement === domElement && renderedVerifierInstance) {
        return;
      }

      // Not rendered yet, proceed with render after the next Angular render pass.
      renderCompleted.set(false);
      const afterRenderRef = afterNextRender(
        () => {
          ngZone.runOutsideAngular(() => {
            try {
              // Check if element has already been rendered to, or is currently rendering.
              if (renderedElement === domElement || renderingElement === domElement) {
                return;
              }

              renderedElement = domElement; // Mark as rendered before calling render()
              renderedVerifierInstance = verifierInstance; // Cache the instance before rendering
              renderingElement = domElement;
              const promise = verifierInstance.render();
              renderPromise.set(promise);
              promise
                .then(() => {
                  // Update signal inside zone so change detection works
                  ngZone.run(() => {
                    renderCompleted.set(true);
                  });
                })
                .catch(() => {
                  // If render failed, reset renderedElement and cached instance so we can try again
                  if (renderedElement === domElement) {
                    renderedElement = null;
                    renderedVerifierInstance = null;
                  }
                  ngZone.run(() => {
                    renderCompleted.set(false);
                  });
                  renderPromise.set(null);
                })
                .finally(() => {
                  if (renderingElement === domElement) {
                    renderingElement = null;
                  }
                });
            } catch {
              // If render failed, reset renderedElement and cached instance so we can try again
              if (renderedElement === domElement) {
                renderedElement = null;
                renderedVerifierInstance = null;
              }
              if (renderingElement === domElement) {
                renderingElement = null;
              }
              ngZone.run(() => {
                renderCompleted.set(false);
              });
              renderPromise.set(null);
            }
          });
        },
        { injector, manualCleanup: true }
      );

      onCleanup(() => {
        afterRenderRef.destroy();
      });
    } else {
      // Element or verifier is null, reset tracking and cache
      if (!domElement) {
        renderedElement = null;
        renderedVerifierInstance = null;
        renderingElement = null;
      }
      renderPromise.set(null);
      renderCompleted.set(false);
    }
  });

  // Return an object that acts like the computed signal but also exposes renderCompleted and renderPromise
  return Object.assign(
    computed(() => verifier()),
    {
      renderCompleted: () => renderCompleted(),
      renderPromise: () => renderPromise(),
    }
  ) as RecaptchaVerifierSignal;
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
export function injectTranslation<T extends TranslationCategory>(category: T, key: TranslationKey<T>) {
  const ui = injectUI();
  return computed(() => getTranslation(ui(), category, key));
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
