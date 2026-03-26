import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["__tests__/**/*.test.ts"],
    globals: true,
    coverage: {
      include: ["src/**/([a-zA-Z_]*).{js,ts}"],
      exclude: ["**/*.test.{js,ts}"],
    },
  },
});
