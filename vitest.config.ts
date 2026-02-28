import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "backend",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/frontend/**", "tests/perf/**"],
    environment: "node",
    globals: true,
  },
});
