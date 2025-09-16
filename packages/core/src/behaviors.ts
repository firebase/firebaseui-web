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
  User,
  UserCredential,
} from "firebase/auth";
import { FirebaseUIConfiguration } from "./config";
import { getAuthImp } from "./imp/auth";

export type BehaviorHandlers = {
  autoAnonymousLogin: (ui: FirebaseUIConfiguration) => Promise<User>;
  autoUpgradeAnonymousCredential: (
    ui: FirebaseUIConfiguration,
    credential: AuthCredential
  ) => Promise<UserCredential | undefined>;
  autoUpgradeAnonymousProvider: (ui: FirebaseUIConfiguration, provider: AuthProvider) => Promise<undefined | never>;
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

      await auth.authStateReady();

      if (!auth.currentUser) {
        ui.setState("loading");
        await getAuthImp(ui).signInAnonymously(auth);
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
      const result = await getAuthImp(ui).linkWithCredential(currentUser, credential);
      ui.setState("idle");
      return result;
    },
    autoUpgradeAnonymousProvider: async (ui, provider) => {
      const currentUser = ui.auth.currentUser;

      if (!currentUser?.isAnonymous) {
        return;
      }

      ui.setState("pending");
      await getAuthImp(ui).linkWithRedirect(currentUser, provider);
      // We don't modify state here since the user is redirected.
      // If we support popups, we'd need to modify state here.
    },
  };
}

// export function autoUpgradeAnonymousCredential(): RegisteredBehavior<'autoUpgradeAnonymousCredential'> {
//   return {
//     key: 'autoUpgradeAnonymousCredential',
//     handler: async (auth, credential) => {
//       const currentUser = auth.currentUser;

//       // Check if the user is anonymous. If not, we can't upgrade them.
//       if (!currentUser?.isAnonymous) {
//         return;
//       }

//       $state.set('linking');
//       const result = await linkWithCredential(currentUser, credential);
//       $state.set('idle');
//       return result;
//     },
//   };
// }

// export function autoUpgradeAnonymousProvider(): RegisteredBehavior<'autoUpgradeAnonymousCredential'> {
//   return {
//     key: 'autoUpgradeAnonymousProvider',
//     handler: async (auth, credential) => {
//       const currentUser = auth.currentUser;

//       // Check if the user is anonymous. If not, we can't upgrade them.
//       if (!currentUser?.isAnonymous) {
//         return;
//       }

//       $state.set('linking');
//       const result = await linkWithRedirect(currentUser, credential);
//       $state.set('idle');
//       return result;
//     },
//   };
// }
