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

import pkgJson from "../package.json";
import { registerFramework } from "./register-framework";

export * from "./auth";
export * from "./behaviors";
export * from "./config";
export * from "./country-data";
export * from "./errors";
export * from "./register-framework";
export * from "./schemas";
export * from "./translations";

if (import.meta.env.PROD) {
  registerFramework("core", pkgJson.version);
}
