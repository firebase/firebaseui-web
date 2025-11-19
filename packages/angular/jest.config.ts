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

import type { Config } from "jest";
import { createCjsPreset } from "jest-preset-angular/presets/index.js";

const config: Config = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ["<rootDir>/setup-test.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@invertase/firebaseui-core$": "<rootDir>/src/lib/tests/test-helpers.ts",
    "^@angular/fire/auth$": "<rootDir>/src/lib/tests/test-helpers.ts",
    "^firebase/auth$": "<rootDir>/src/lib/tests/test-helpers.ts",
    "^../provider$": "<rootDir>/src/lib/tests/test-helpers.ts",
    "^../../provider$": "<rootDir>/src/lib/tests/test-helpers.ts",
    "^../../../provider$": "<rootDir>/src/lib/tests/test-helpers.ts",
    "^../../../../provider$": "<rootDir>/src/lib/tests/test-helpers.ts",
    "^../../../../../provider$": "<rootDir>/src/lib/tests/test-helpers.ts",
  },
};

export default config;
