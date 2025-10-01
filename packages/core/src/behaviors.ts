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
  AuthCredential,
  AuthProvider,
  linkWithCredential,
  linkWithRedirect,
  signInAnonymously,
  User,
  UserCredential,
  RecaptchaVerifier,
  GoogleAuthProvider,
} from "firebase/auth";
import { FirebaseUIConfiguration } from "./config";
import { IdConfiguration } from "google-one-tap";
import { signInWithCredential } from "./auth";

export type BehaviorHandlers = {
  autoAnonymousLogin: (ui: FirebaseUIConfiguration) => Promise<User>;
  autoUpgradeAnonymousCredential: (
    ui: FirebaseUIConfiguration,
    credential: AuthCredential
  ) => Promise<UserCredential | undefined>;
  autoUpgradeAnonymousProvider: (ui: FirebaseUIConfiguration, provider: AuthProvider) => Promise<undefined | never>;
  recaptchaVerification: (ui: FirebaseUIConfiguration, element: HTMLElement) => RecaptchaVerifier;
  oneTapSignIn: (ui: FirebaseUIConfiguration) => void;
};

export type Behavior<T extends keyof BehaviorHandlers = keyof BehaviorHandlers> = Pick<BehaviorHandlers, T>;

export type BehaviorKey = keyof BehaviorHandlers;

export function hasBehavior(ui: FirebaseUIConfiguration, key: BehaviorKey): boolean {
  return !!ui.behaviors[key];
}

export function getBehavior<T extends BehaviorKey>(ui: FirebaseUIConfiguration, key: T): Behavior[T] {
  if (!hasBehavior(ui, key)) {
    throw new Error(`Behavior ${key} not found`);
  }

  return ui.behaviors[key] as Behavior[T];
}

export function autoAnonymousLogin(): Behavior<"autoAnonymousLogin"> {
  /** No-op on Server render */
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.log("[autoAnonymousLogin] SSR mode — returning noop behavior");
    return {
      autoAnonymousLogin: async (_ui) => {
        /** Return a placeholder user object */
        return { uid: "server-placeholder" } as unknown as User;
      },
    };
  }

  return {
    autoAnonymousLogin: async (ui) => {
      const auth = ui.auth;

      if (!auth.currentUser) {
        ui.setState("loading");
        await signInAnonymously(auth);
      }

      ui.setState("idle");
      return auth.currentUser!;
    },
  };
}

export function autoUpgradeAnonymousUsers(): Behavior<
  "autoUpgradeAnonymousCredential" | "autoUpgradeAnonymousProvider"
> {
  return {
    autoUpgradeAnonymousCredential: async (ui, credential) => {
      const currentUser = ui.auth.currentUser;

      // Check if the user is anonymous. If not, we can't upgrade them.
      if (!currentUser?.isAnonymous) {
        return;
      }

      ui.setState("pending");
      const result = await linkWithCredential(currentUser, credential);
      ui.setState("idle");
      return result;
    },
    autoUpgradeAnonymousProvider: async (ui, provider) => {
      const currentUser = ui.auth.currentUser;

      if (!currentUser?.isAnonymous) {
        return;
      }

      ui.setState("pending");
      await linkWithRedirect(currentUser, provider);
      // We don't modify state here since the user is redirected.
      // If we support popups, we'd need to modify state here.
    },
  };
}

export type RecaptchaVerification = {
  size?: "normal" | "invisible" | "compact";
  theme?: "light" | "dark";
  tabindex?: number;
};

export function recaptchaVerification(options?: RecaptchaVerification): Behavior<"recaptchaVerification"> {
  return {
    recaptchaVerification: (ui, element) => {
      return new RecaptchaVerifier(ui.auth, element, {
        size: options?.size ?? "invisible",
        theme: options?.theme ?? "light",
        tabindex: options?.tabindex ?? 0,
      });
    },
  };
}

export type OneTapSignIn = {
  clientId: IdConfiguration['client_id'];
  autoSelect?: IdConfiguration['auto_select'];
  cancelOnTapOutside?: IdConfiguration['cancel_on_tap_outside'];
  context?: IdConfiguration['context'];
  uxMode?: IdConfiguration['ux_mode'];
  logLevel?: IdConfiguration['log_level'];
};

export function oneTapSignIn(options: OneTapSignIn): Behavior<"oneTapSignIn"> {
  return {
    oneTapSignIn: (ui) => {
      if (typeof window === "undefined") {
        return;
      }

      // Only show one-tap if user is not signed in OR if they are anonymous.
      // Don't show if user is already signed in with a real account.
      if (ui.auth.currentUser && !ui.auth.currentUser.isAnonymous) {
        return;
      }

      // Prevent multiple instances of the script from being loaded, e.g. hot reload.
      if (document.querySelector('script[data-one-tap-sign-in]')) {
        return;
      }

      const script = document.createElement('script');
      script.setAttribute('data-one-tap-sign-in', 'true');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;

      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: options.clientId,
          auto_select: options.autoSelect,
          cancel_on_tap_outside: options.cancelOnTapOutside,
          context: options.context,
          ux_mode: options.uxMode,
          log_level: options.logLevel,
          callback: async (response) => {
            const credential = GoogleAuthProvider.credential(response.credential);
            await signInWithCredential(ui, credential);
          },
        });

        window.google.accounts.id.prompt();
      };

      document.body.appendChild(script);
    },
  }
}

export const defaultBehaviors = {
  ...recaptchaVerification(),
};