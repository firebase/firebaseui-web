/// <reference types="vite/client" />
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

import { registerFramework } from "@invertase/firebaseui-core";
import pkgJson from "../package.json";

export * from "./auth";
export * from "./components";
export { PolicyContext } from "./components/policies";
export { FirebaseUIProvider, type FirebaseUIProviderProps } from "./context";
export * from "./hooks";

// Detect production mode across different build systems (Vite, webpack/Next.js, etc.)
const isNodeProduction = typeof process !== "undefined" && process.env.NODE_ENV === "production";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isViteProduction =
  typeof import.meta !== "undefined" && (import.meta as any)?.env && (import.meta as any).env.PROD === true;

// Check if in production mode

// Check if in production mode
const isProduction = isNodeProduction || isViteProduction;

if (isProduction) {
  // Extract framework name from package name (e.g., "@invertase/firebaseui-react" -> "react")
  const frameworkName = pkgJson.name.replace("@invertase/firebaseui-", "");
  registerFramework(frameworkName, pkgJson.version);
}
