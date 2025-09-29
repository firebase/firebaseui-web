import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use jsdom environment for Angular component testing
    environment: "jsdom",
    // Include Angular test files
    include: ["src/**/*.{test,spec}.{js,ts}"],
    // Exclude build output and node_modules
    exclude: ["node_modules/**/*", "dist/**/*"],
    // Enable globals for Angular testing utilities
    globals: true,
    // Use the setup file for Angular testing environment
    setupFiles: ["./src/test-setup.ts"],
    // Mock modules
    mockReset: false,
    // Use tsconfig.spec.json for TypeScript
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.spec.json",
      include: ["src/**/*.{ts}"],
    },
    // Increase test timeout for Angular operations
    testTimeout: 15000,
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: ["**/*.spec.ts", "**/*.test.ts"],
    },
    // Pool options for better Zone.js compatibility
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Better isolation for Angular tests
    isolate: true,
    // Reset modules between tests
    clearMocks: true,
    restoreMocks: true,
  },
});
