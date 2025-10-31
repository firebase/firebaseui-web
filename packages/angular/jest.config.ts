import type { Config } from "jest";
import { createCjsPreset } from "jest-preset-angular/presets/index.js";

const config: Config = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ["<rootDir>/setup-test.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@firebase-oss/ui-core$": "<rootDir>/src/lib/tests/test-helpers.ts",
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
