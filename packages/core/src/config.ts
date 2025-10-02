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

import { enUs, RegisteredLocale } from "@firebase-ui/translations";
import type { FirebaseApp } from "firebase/app";
import { Auth, getAuth, getRedirectResult } from "firebase/auth";
import { deepMap, DeepMapStore, map } from "nanostores";
import { Behavior, defaultBehaviors } from "./behaviors";
import type { InitBehavior, RedirectBehavior } from "./behaviors/utils";
import { FirebaseUIState } from "./state";

export type FirebaseUIConfigurationOptions = {
  app: FirebaseApp;
  auth?: Auth;
  locale?: RegisteredLocale;
  behaviors?: Behavior<any>[];
};

export type FirebaseUIConfiguration = {
  app: FirebaseApp;
  auth: Auth;
  setLocale: (locale: RegisteredLocale) => void;
  state: FirebaseUIState;
  setState: (state: FirebaseUIState) => void;
  locale: RegisteredLocale;
  behaviors: Behavior;
};

export const $config = map<Record<string, DeepMapStore<FirebaseUIConfiguration>>>({});

export type FirebaseUI = DeepMapStore<FirebaseUIConfiguration>;

export function initializeUI(config: FirebaseUIConfigurationOptions, name: string = "[DEFAULT]"): FirebaseUI {
  // Reduce the behaviors to a single object.
  const behaviors = config.behaviors?.reduce<Behavior>((acc, behavior) => {
    return {
      ...acc,
      ...behavior,
    };
  }, defaultBehaviors as Behavior);

  $config.setKey(
    name,
    deepMap<FirebaseUIConfiguration>({
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

    if (redirectBehaviors.length > 0) {
      getRedirectResult(ui.auth).then((result) => {
        Promise.all(redirectBehaviors.map((behavior) => behavior.handler(ui, result)));
      });
    }
  }

  return store;
}
