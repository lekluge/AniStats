import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "perf",
    include: ["tests/perf/**/*.test.ts"],
    environment: "node",
    globals: true,
  },
});
