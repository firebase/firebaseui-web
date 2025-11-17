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

import type { FirebaseUI } from "~/config";
import type { RecaptchaVerifier, UserCredential } from "firebase/auth";
import * as anonymousUpgradeHandlers from "./anonymous-upgrade";
import * as autoAnonymousLoginHandlers from "./auto-anonymous-login";
import * as recaptchaHandlers from "./recaptcha";
import * as providerStrategyHandlers from "./provider-strategy";
import * as oneTapSignInHandlers from "./one-tap";
import * as requireDisplayNameHandlers from "./require-display-name";
import * as countryCodesHandlers from "./country-codes";
import {
  callableBehavior,
  initBehavior,
  redirectBehavior,
  type CallableBehavior,
  type InitBehavior,
  type RedirectBehavior,
} from "./utils";

type Registry = {
  autoAnonymousLogin: InitBehavior<typeof autoAnonymousLoginHandlers.autoAnonymousLoginHandler>;
  autoUpgradeAnonymousCredential: CallableBehavior<
    typeof anonymousUpgradeHandlers.autoUpgradeAnonymousCredentialHandler
  >;
  autoUpgradeAnonymousProvider: CallableBehavior<typeof anonymousUpgradeHandlers.autoUpgradeAnonymousProviderHandler>;
  autoUpgradeAnonymousUserRedirectHandler: RedirectBehavior<
    (
      ui: FirebaseUI,
      credential: UserCredential | null,
      onUpgrade?: anonymousUpgradeHandlers.OnUpgradeCallback
    ) => ReturnType<typeof anonymousUpgradeHandlers.autoUpgradeAnonymousUserRedirectHandler>
  >;
  recaptchaVerification: CallableBehavior<(ui: FirebaseUI, element: HTMLElement) => RecaptchaVerifier>;
  providerSignInStrategy: CallableBehavior<providerStrategyHandlers.ProviderSignInStrategyHandler>;
  providerLinkStrategy: CallableBehavior<providerStrategyHandlers.ProviderLinkStrategyHandler>;
  oneTapSignIn: InitBehavior<(ui: FirebaseUI) => ReturnType<typeof oneTapSignInHandlers.oneTapSignInHandler>>;
  requireDisplayName: CallableBehavior<typeof requireDisplayNameHandlers.requireDisplayNameHandler>;
  countryCodes: CallableBehavior<typeof countryCodesHandlers.countryCodesHandler>;
};

/** A behavior or set of behaviors from the registry. */
export type Behavior<T extends keyof Registry = keyof Registry> = Pick<Registry, T>;
/** All available behaviors, with each behavior being optional. */
export type Behaviors = Partial<Registry>;

/**
 * Enables automatic anonymous login when the app initializes.
 *
 * @returns A behavior that automatically signs in users anonymously on app initialization.
 */
export function autoAnonymousLogin(): Behavior<"autoAnonymousLogin"> {
  return {
    autoAnonymousLogin: initBehavior(autoAnonymousLoginHandlers.autoAnonymousLoginHandler),
  };
}

/** Options for the auto-upgrade anonymous users behavior. */
export type AutoUpgradeAnonymousUsersOptions = {
  /** Optional callback function that is called when an anonymous user is upgraded. */
  onUpgrade?: anonymousUpgradeHandlers.OnUpgradeCallback;
};

/**
 * Automatically upgrades anonymous users to regular users when they sign in with a credential or provider.
 *
 * This behavior handles upgrading anonymous users for credential-based sign-ins, provider-based sign-ins,
 * and redirect-based authentication flows.
 *
 * @param options - Optional configuration including an upgrade callback.
 * @returns Behaviors for automatically upgrading anonymous users.
 */
export function autoUpgradeAnonymousUsers(
  options?: AutoUpgradeAnonymousUsersOptions
): Behavior<
  "autoUpgradeAnonymousCredential" | "autoUpgradeAnonymousProvider" | "autoUpgradeAnonymousUserRedirectHandler"
> {
  return {
    autoUpgradeAnonymousCredential: callableBehavior((ui, credential) =>
      anonymousUpgradeHandlers.autoUpgradeAnonymousCredentialHandler(ui, credential, options?.onUpgrade)
    ),
    autoUpgradeAnonymousProvider: callableBehavior((ui, provider) =>
      anonymousUpgradeHandlers.autoUpgradeAnonymousProviderHandler(ui, provider, options?.onUpgrade)
    ),
    autoUpgradeAnonymousUserRedirectHandler: redirectBehavior((ui, credential) =>
      anonymousUpgradeHandlers.autoUpgradeAnonymousUserRedirectHandler(ui, credential, options?.onUpgrade)
    ),
  };
}

/** Options for reCAPTCHA verification behavior. */
export type RecaptchaVerificationOptions = recaptchaHandlers.RecaptchaVerificationOptions;

/**
 * Configures reCAPTCHA verification for phone authentication.
 *
 * @param options - Optional reCAPTCHA verification options.
 * @returns A behavior that handles reCAPTCHA verification for phone authentication.
 */
export function recaptchaVerification(options?: RecaptchaVerificationOptions): Behavior<"recaptchaVerification"> {
  return {
    recaptchaVerification: callableBehavior((ui, element) =>
      recaptchaHandlers.recaptchaVerificationHandler(ui, element, options)
    ),
  };
}

/**
 * Configures provider authentication to use redirect strategy instead of popup.
 *
 * @returns Behaviors for provider sign-in and linking using redirect strategy.
 */
export function providerRedirectStrategy(): Behavior<"providerSignInStrategy" | "providerLinkStrategy"> {
  return {
    providerSignInStrategy: callableBehavior(providerStrategyHandlers.signInWithRediectHandler),
    providerLinkStrategy: callableBehavior(providerStrategyHandlers.linkWithRedirectHandler),
  };
}

/**
 * Configures provider authentication to use popup strategy instead of redirect.
 *
 * This is the default strategy for provider authentication.
 *
 * @returns Behaviors for provider sign-in and linking using popup strategy.
 */
export function providerPopupStrategy(): Behavior<"providerSignInStrategy" | "providerLinkStrategy"> {
  return {
    providerSignInStrategy: callableBehavior(providerStrategyHandlers.signInWithPopupHandler),
    providerLinkStrategy: callableBehavior(providerStrategyHandlers.linkWithPopupHandler),
  };
}

/** Options for Google One Tap sign-in behavior. */
export type OneTapSignInOptions = oneTapSignInHandlers.OneTapSignInOptions;

/**
 * Enables Google One Tap sign-in functionality.
 *
 * @param options - Configuration options for Google One Tap sign-in.
 * @returns A behavior that handles Google One Tap sign-in initialization.
 */
export function oneTapSignIn(options: OneTapSignInOptions): Behavior<"oneTapSignIn"> {
  return {
    oneTapSignIn: initBehavior((ui) => oneTapSignInHandlers.oneTapSignInHandler(ui, options)),
  };
}

/**
 * Requires users to provide a display name when creating an account.
 *
 * @returns A behavior that enforces display name requirement during user registration.
 */
export function requireDisplayName(): Behavior<"requireDisplayName"> {
  return {
    requireDisplayName: callableBehavior(requireDisplayNameHandlers.requireDisplayNameHandler),
  };
}

/**
 * Configures country code selection for phone number input.
 *
 * @param options - Optional configuration for country code behavior.
 * @returns A behavior that provides country code functionality for phone authentication.
 */
export function countryCodes(options?: countryCodesHandlers.CountryCodesOptions): Behavior<"countryCodes"> {
  return {
    countryCodes: callableBehavior(() => countryCodesHandlers.countryCodesHandler(options)),
  };
}

/**
 * Checks if a specific behavior is enabled for the given FirebaseUI instance.
 *
 * @param ui - The FirebaseUI instance.
 * @param key - The behavior key to check.
 * @returns True if the behavior is enabled, false otherwise.
 */
export function hasBehavior<T extends keyof Registry>(ui: FirebaseUI, key: T): boolean {
  return !!ui.behaviors[key];
}

/**
 * Gets the handler function for a specific behavior.
 *
 * @param ui - The FirebaseUI instance.
 * @param key - The behavior key to retrieve.
 * @returns The handler function for the specified behavior.
 * @throws {Error} Throws an error if the behavior is not found.
 */
export function getBehavior<T extends keyof Registry>(ui: FirebaseUI, key: T): Registry[T]["handler"] {
  if (!hasBehavior(ui, key)) {
    throw new Error(`Behavior ${key} not found`);
  }

  return (ui.behaviors[key] as Registry[T]).handler;
}

/** Default behaviors that are enabled by default for all FirebaseUI instances. */
export const defaultBehaviors: Behavior<"recaptchaVerification"> = {
  ...recaptchaVerification(),
  ...providerPopupStrategy(),
  ...countryCodes(),
};
