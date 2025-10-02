import type { FirebaseUIConfiguration } from "~/config";
import type { RecaptchaVerifier } from "firebase/auth";
import * as anonymousUpgradeHandlers from "./anonymous-upgrade";
import * as autoAnonymousLoginHandlers from "./auto-anonymous-login";
import * as recaptchaHandlers from "./recaptcha";
import * as providerStrategyHandlers from "./provider-strategy";
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
    typeof anonymousUpgradeHandlers.autoUpgradeAnonymousUserRedirectHandler
  >;
  recaptchaVerification: CallableBehavior<(ui: FirebaseUIConfiguration, element: HTMLElement) => RecaptchaVerifier>;
  providerSignInStrategy: CallableBehavior<providerStrategyHandlers.ProviderSignInStrategyHandler>;
  providerLinkStrategy: CallableBehavior<providerStrategyHandlers.ProviderLinkStrategyHandler>;
};

export type Behavior<T extends keyof Registry = keyof Registry> = Pick<Registry, T>;
export type Behaviors = Partial<Registry>;

export function autoAnonymousLogin(): Behavior<"autoAnonymousLogin"> {
  return {
    autoAnonymousLogin: initBehavior(autoAnonymousLoginHandlers.autoAnonymousLoginHandler),
  };
}

export function autoUpgradeAnonymousUsers(): Behavior<
  "autoUpgradeAnonymousCredential" | "autoUpgradeAnonymousProvider" | "autoUpgradeAnonymousUserRedirectHandler"
> {
  return {
    autoUpgradeAnonymousCredential: callableBehavior(anonymousUpgradeHandlers.autoUpgradeAnonymousCredentialHandler),
    autoUpgradeAnonymousProvider: callableBehavior(anonymousUpgradeHandlers.autoUpgradeAnonymousProviderHandler),
    autoUpgradeAnonymousUserRedirectHandler: redirectBehavior(
      anonymousUpgradeHandlers.autoUpgradeAnonymousUserRedirectHandler
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

export function hasBehavior<T extends keyof Registry>(ui: FirebaseUIConfiguration, key: T): boolean {
  return !!ui.behaviors[key];
}

export function getBehavior<T extends keyof Registry>(ui: FirebaseUIConfiguration, key: T): Registry[T]["handler"] {
  if (!hasBehavior(ui, key)) {
    throw new Error(`Behavior ${key} not found`);
  }

  return (ui.behaviors[key] as Registry[T]).handler;
}

export const defaultBehaviors: Behavior<"recaptchaVerification"> = {
  ...recaptchaVerification(),
  ...providerRedirectStrategy(),
};
