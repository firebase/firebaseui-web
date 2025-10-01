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
import { Auth, getAuth } from "firebase/auth";
import { deepMap, DeepMapStore, map } from "nanostores";
import {
  Behavior,
  type BehaviorHandlers,
  type BehaviorKey,
  defaultBehaviors,
  getBehavior,
  hasBehavior,
} from "./behaviors";
import { FirebaseUIState } from "./state";

type FirebaseUIConfigurationOptions = {
  app: FirebaseApp;
  auth?: Auth;
  locale?: RegisteredLocale;
  behaviors?: Partial<Behavior<keyof BehaviorHandlers>>[];
};

export type FirebaseUIConfiguration = {
  app: FirebaseApp;
  auth: Auth;
  setLocale: (locale: RegisteredLocale) => void;
  state: FirebaseUIState;
  setState: (state: FirebaseUIState) => void;
  locale: RegisteredLocale;
  behaviors: Partial<Record<BehaviorKey, BehaviorHandlers[BehaviorKey]>>;
};

export const $config = map<Record<string, DeepMapStore<FirebaseUIConfiguration>>>({});

export type FirebaseUI = DeepMapStore<FirebaseUIConfiguration>;

export function initializeUI(config: FirebaseUIConfigurationOptions, name: string = "[DEFAULT]"): FirebaseUI {
  // Reduce the behaviors to a single object.
  const behaviors = config.behaviors?.reduce<Partial<Record<BehaviorKey, BehaviorHandlers[BehaviorKey]>>>(
    (acc, behavior) => {
      return {
        ...acc,
        ...behavior,
      };
    },
    defaultBehaviors
  );

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
      state: behaviors?.autoAnonymousLogin ? "loading" : "idle",
      setState: (state: FirebaseUIState) => {
        const current = $config.get()[name]!;
        current.setKey(`state`, state);
      },
      behaviors: behaviors ?? defaultBehaviors,
    })
  );

  const ui = $config.get()[name]!;

  // TODO(ehesp): Should this belong here - if not, where should it be?
  if (hasBehavior(ui.get(), "autoAnonymousLogin")) {
    getBehavior(ui.get(), "autoAnonymousLogin")(ui.get());
  } else {
    ui.setKey("state", "idle");
  }

  return ui;
}
