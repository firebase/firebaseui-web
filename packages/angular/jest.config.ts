import type { Config } from "jest";
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

const config: Config = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ["<rootDir>/setup-test.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  testEnvironment: "jsdom",
};

export default config;
