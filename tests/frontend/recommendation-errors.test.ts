import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const getMock = vi.fn();

vi.mock("~/composables/useApi", () => ({
  api: {
    get: (...args: any[]) => getMock(...args),
  },
}));

mockNuxtImport("useAnilistUser", () => {
  return () => ref("Leon");
});

import RecommendationPage from "~/pages/recommendation.vue";

describe("recommendation page API error handling", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getMock.mockReset();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("shows an error if AniList/API is unreachable", async () => {
    getMock.mockImplementation((url: string) => {
      if (url === "/api/private/genreTags") {
        return Promise.resolve({ data: { genres: [], tags: [] } });
      }
      if (url === "/api/private/recommendation") {
        return Promise.reject(new Error("Network Error"));
      }
      return Promise.resolve({ data: {} });
    });

    const wrapper = await mountSuspended(RecommendationPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Fehler: Empfehlungen konnten nicht geladen werden");
    expect(wrapper.text()).not.toContain("Network Error");
  });

  it("shows HTTP error message for 500/400 style failures", async () => {
    getMock.mockImplementation((url: string) => {
      if (url === "/api/private/genreTags") {
        return Promise.resolve({ data: { genres: [], tags: [] } });
      }
      if (url === "/api/private/recommendation") {
        return Promise.reject(new Error("Request failed with status code 500"));
      }
      return Promise.resolve({ data: {} });
    });

    const wrapper = await mountSuspended(RecommendationPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Fehler: Empfehlungen konnten nicht geladen werden");
    expect(wrapper.text()).not.toContain("500");
  });

  it("does not expose 400 status codes to users", async () => {
    getMock.mockImplementation((url: string) => {
      if (url === "/api/private/genreTags") {
        return Promise.resolve({ data: { genres: [], tags: [] } });
      }
      if (url === "/api/private/recommendation") {
        return Promise.reject(new Error("Request failed with status code 400"));
      }
      return Promise.resolve({ data: {} });
    });

    const wrapper = await mountSuspended(RecommendationPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Fehler: Empfehlungen konnten nicht geladen werden");
    expect(wrapper.text()).not.toContain("400");
  });
});
