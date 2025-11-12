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

export type Behavior<T extends keyof Registry = keyof Registry> = Pick<Registry, T>;
export type Behaviors = Partial<Registry>;

export function autoAnonymousLogin(): Behavior<"autoAnonymousLogin"> {
  return {
    autoAnonymousLogin: initBehavior(autoAnonymousLoginHandlers.autoAnonymousLoginHandler),
  };
}

export type AutoUpgradeAnonymousUsersOptions = {
  onUpgrade?: anonymousUpgradeHandlers.OnUpgradeCallback;
};

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

export type RecaptchaVerificationOptions = recaptchaHandlers.RecaptchaVerificationOptions;

export function recaptchaVerification(options?: RecaptchaVerificationOptions): Behavior<"recaptchaVerification"> {
  return {
    recaptchaVerification: callableBehavior((ui, element) =>
      recaptchaHandlers.recaptchaVerificationHandler(ui, element, options)
    ),
  };
}

export function providerRedirectStrategy(): Behavior<"providerSignInStrategy" | "providerLinkStrategy"> {
  return {
    providerSignInStrategy: callableBehavior(providerStrategyHandlers.signInWithRediectHandler),
    providerLinkStrategy: callableBehavior(providerStrategyHandlers.linkWithRedirectHandler),
  };
}

export function providerPopupStrategy(): Behavior<"providerSignInStrategy" | "providerLinkStrategy"> {
  return {
    providerSignInStrategy: callableBehavior(providerStrategyHandlers.signInWithPopupHandler),
    providerLinkStrategy: callableBehavior(providerStrategyHandlers.linkWithPopupHandler),
  };
}

export type OneTapSignInOptions = oneTapSignInHandlers.OneTapSignInOptions;

export function oneTapSignIn(options: OneTapSignInOptions): Behavior<"oneTapSignIn"> {
  return {
    oneTapSignIn: initBehavior((ui) => oneTapSignInHandlers.oneTapSignInHandler(ui, options)),
  };
}

export function requireDisplayName(): Behavior<"requireDisplayName"> {
  return {
    requireDisplayName: callableBehavior(requireDisplayNameHandlers.requireDisplayNameHandler),
  };
}

export function countryCodes(options?: countryCodesHandlers.CountryCodesOptions): Behavior<"countryCodes"> {
  return {
    countryCodes: callableBehavior(() => countryCodesHandlers.countryCodesHandler(options)),
  };
}

export function hasBehavior<T extends keyof Registry>(ui: FirebaseUI, key: T): boolean {
  return !!ui.behaviors[key];
}

export function getBehavior<T extends keyof Registry>(ui: FirebaseUI, key: T): Registry[T]["handler"] {
  if (!hasBehavior(ui, key)) {
    throw new Error(`Behavior ${key} not found`);
  }

  return (ui.behaviors[key] as Registry[T]).handler;
}

export const defaultBehaviors: Behavior<"recaptchaVerification"> = {
  ...recaptchaVerification(),
  ...providerPopupStrategy(),
  ...countryCodes(),
};
