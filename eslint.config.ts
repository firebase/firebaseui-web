/* eslint-disable @typescript-eslint/no-explicit-any */

import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginPrettier from "eslint-plugin-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginAngular from "angular-eslint";

const config: any[] = [
  globalIgnores([
    "**/dist/**",
    "**/node_modules/**",
    "**/build/**",
    "**/.next/**",
    "**/.angular/**",
    "**/releases/**",
    "**/shadcn/public-dev/**",
    "packages/styles/dist.css",
    "packages/angular/**",
    "packages/shadcn/public",
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
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: false,
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },
  {
    // Angular package specific rules
    files: ["packages/angular/src/**/*.{ts,tsx}"],
    processor: pluginAngular.processInlineTemplates,
  },
  {
    // React package specific rules
    files: ["packages/react/src/**/*.{ts,tsx}", "packages/shadcn/src/**/*.{ts,tsx}"],
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
    files: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/tests/**/*.{ts,tsx}",
      // These are generated from shadcn, so we don't need to lint them
      "examples/shadcn/src/components/**/*.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];

export default config;
