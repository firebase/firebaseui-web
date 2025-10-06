/* eslint-disable @typescript-eslint/no-explicit-any */

import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginPrettier from "eslint-plugin-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

const config: any[] = [
  globalIgnores([
    "**/dist/**",
    "**/node_modules/**",
    "**/build/**",
    "**/.next/**",
    "**/.angular/**",
    "**/releases/**",
    "packages/styles/dist.css",
    "packages/angular/**",
  ]),
  ...tseslint.configs.recommended,
  {
    // All TypeScript files
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { js, prettier: pluginPrettier },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "prettier/prettier": "error",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
  {
    // React package specific rules
    files: ["packages/react/src/**/*.{ts,tsx}"],
    plugins: { react: pluginReact, "react-hooks": pluginReactHooks },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
    },
  },
  {
    // Test files - more lenient rules
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/tests/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default config;
