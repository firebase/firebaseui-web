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

import type { UserCredential } from "firebase/auth";
import type { FirebaseUI } from "~/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CallableHandler<T extends (...args: any[]) => any = (...args: any[]) => any> = T;
export type InitHandler = (ui: FirebaseUI) => Promise<void> | void;
export type RedirectHandler = (ui: FirebaseUI, result: UserCredential | null) => Promise<void> | void;

export type CallableBehavior<T extends CallableHandler = CallableHandler> = {
  type: "callable";
  handler: T;
};

export type RedirectBehavior<T extends RedirectHandler = RedirectHandler> = {
  type: "redirect";
  handler: T;
};

export type InitBehavior<T extends InitHandler = InitHandler> = {
  type: "init";
  handler: T;
};

export function callableBehavior<T extends CallableHandler>(handler: T): CallableBehavior<T> {
  return { type: "callable" as const, handler };
}

export function redirectBehavior<T extends RedirectHandler = RedirectHandler>(handler: T): RedirectBehavior<T> {
  return { type: "redirect" as const, handler };
}

export function initBehavior<T extends InitHandler = InitHandler>(handler: T): InitBehavior<T> {
  return { type: "init" as const, handler };
}
