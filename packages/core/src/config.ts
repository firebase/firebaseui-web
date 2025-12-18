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

import { enUs, type RegisteredLocale } from "@firebase-oss/ui-translations";
import type { FirebaseApp } from "firebase/app";
import { type Auth, getAuth, getRedirectResult, type MultiFactorResolver } from "firebase/auth";
import { map } from "nanostores";
import { deepMap, type DeepMapStore } from "@nanostores/deepmap";
import { type Behavior, type Behaviors, defaultBehaviors } from "./behaviors";
import type { InitBehavior, RedirectBehavior } from "./behaviors/utils";
import { type FirebaseUIState } from "./state";
import { handleFirebaseError } from "./errors";

/**
 * Configuration options for initializing FirebaseUI.
 */
export type FirebaseUIOptions = {
  /** A required Firebase App instance, e.g. from `initializeApp`. */
  app: FirebaseApp;
  /** An optional Firebase Auth instance, e.g. from `getAuth`. If not provided, it will be created using the app instance. */
  auth?: Auth;
  /** A default locale to use. Defaults to `enUs`. */
  locale?: RegisteredLocale;
  /** An optional array of behaviors, e.g. from `requireDisplayName`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  behaviors?: Behavior<any>[];
};

/**
 * The main FirebaseUI instance that provides access to Firebase Auth and UI state management.
 *
 * This type encapsulates all the necessary components for managing authentication UI state,
 * including Firebase app and auth instances, locale settings, behaviors, and multi-factor
 * authentication state.
 */
export type FirebaseUI = {
  /** The Firebase App instance. */
  app: FirebaseApp;
  /** The Firebase Auth instance. */
  auth: Auth;
  /** Sets the locale for translations. */
  setLocale: (locale: RegisteredLocale) => void;
  /** The current UI state (e.g., "idle", "pending", "loading"). */
  state: FirebaseUIState;
  /** Sets the UI state. */
  setState: (state: FirebaseUIState) => void;
  /** The current locale for translations. */
  locale: RegisteredLocale;
  /** The configured behaviors that customize authentication flows. */
  behaviors: Behaviors;
  /** The multi-factor resolver, if a multi-factor challenge is in progress. */
  multiFactorResolver?: MultiFactorResolver;
  /** Sets the multi-factor resolver. */
  setMultiFactorResolver: (multiFactorResolver?: MultiFactorResolver) => void;
  /** Any error that occurred during a redirect-based authentication flow. */
  redirectError?: Error;
  /** Sets the redirect error. */
  setRedirectError: (error?: Error) => void;
};

export const $config = map<Record<string, DeepMapStore<FirebaseUI>>>({});

/**
 * A reactive store containing a FirebaseUI instance.
 *
 * This store allows for reactive updates to the FirebaseUI state, enabling UI components
 * to automatically update when the authentication state or configuration changes.
 */
export type FirebaseUIStore = DeepMapStore<FirebaseUI>;

/**
 * Initializes a FirebaseUI instance with the provided configuration.
 *
 * Creates a reactive store containing the FirebaseUI instance, sets up behaviors,
 * and handles initialization and redirect flows if running client-side.
 *
 * Example:
 * ```typescript
 * const ui = initializeUI({
 *   app: firebaseApp,
 *   locale: enUs,
 *   behaviors: [requireDisplayName()],
 * });
 * ```
 *
 * @param config - The configuration options for FirebaseUI.
 * @param name - Optional name for the FirebaseUI instance. Defaults to "[DEFAULT]".
 * @returns {FirebaseUIStore} A reactive store containing the initialized FirebaseUI instance.
 */
export function initializeUI(config: FirebaseUIOptions, name: string = "[DEFAULT]"): FirebaseUIStore {
  // Reduce the behaviors to a single object.
  const behaviors = config.behaviors?.reduce<Behavior>((acc, behavior) => {
    return {
      ...acc,
      ...behavior,
    };
  }, defaultBehaviors as Behavior);

  $config.setKey(
    name,
    deepMap<FirebaseUI>({
      app: config.app,
      auth: config.auth || getAuth(config.app),
      locale: config.locale ?? enUs,
      setLocale: (locale: RegisteredLocale) => {
        const current = $config.get()[name]!;
        current.setKey(`locale`, locale);
      },
      state: "idle",
      setState: (state: FirebaseUIState) => {
        const current = $config.get()[name]!;
        current.setKey(`state`, state);
      },
      // Since we've got config.behaviors?.reduce above, we need to default to defaultBehaviors
      // if no behaviors are provided, as they wont be in the reducer.
      behaviors: behaviors ?? (defaultBehaviors as Behavior),
      multiFactorResolver: undefined,
      setMultiFactorResolver: (resolver?: MultiFactorResolver) => {
        const current = $config.get()[name]!;
        current.setKey(`multiFactorResolver`, resolver);
      },
      redirectError: undefined,
      setRedirectError: (error?: Error) => {
        const current = $config.get()[name]!;
        current.setKey(`redirectError`, error);
      },
    })
  );

  const store = $config.get()[name]!;
  const ui = store.get();

  // If we're client-side, execute the init and redirect behaviors.
  if (typeof window !== "undefined") {
    const initBehaviors: InitBehavior[] = [];
    const redirectBehaviors: RedirectBehavior[] = [];

    for (const behavior of Object.values(ui.behaviors)) {
      if (behavior.type === "redirect") {
        redirectBehaviors.push(behavior);
      } else if (behavior.type === "init") {
        initBehaviors.push(behavior);
      }
    }

    if (initBehaviors.length > 0) {
      store.setKey("state", "loading");
      ui.auth.authStateReady().then(() => {
        Promise.all(initBehaviors.map((behavior) => behavior.handler(ui))).then(() => {
          store.setKey("state", "idle");
        });
      });
    }

    getRedirectResult(ui.auth)
      .then((result) => {
        return Promise.all(redirectBehaviors.map((behavior) => behavior.handler(ui, result)));
      })
      .catch((error) => {
        try {
          handleFirebaseError(ui, error);
        } catch (error) {
          ui.setRedirectError(error instanceof Error ? error : new Error(String(error)));
        }
      });
  }

  return store;
}
