import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    name: "frontend",
    include: ["tests/frontend/**/*.test.ts"],
    environment: "nuxt",
    globals: true,
  },
});

