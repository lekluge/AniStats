import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import DefaultLayout from "~/layouts/default.vue";

const loginMock = vi.fn(async () => {});
const logoutMock = vi.fn(async () => {});
const toggleThemeMock = vi.fn(() => {});
const toggleLocaleMock = vi.fn(() => {});

const userRef = ref<{ name: string } | null>({ name: "Leon" });
const themeRef = ref<"light" | "dark">("light");
const localeRef = ref<"de" | "en">("de");

const tMap: Record<string, string> = {
  "nav.appName": "AniList Stats",
  "nav.insightsDashboard": "Insights Dashboard",
  "nav.genres": "Genres",
  "nav.tags": "Tags",
  "nav.combine": "Combine",
  "nav.relations": "Relations",
  "nav.compare": "Compare",
  "nav.recommendation": "Recommendation",
  "nav.history": "History",
  "nav.login": "Login with AniList",
  "nav.logout": "Logout",
  "nav.settings": "Settings",
  "nav.toggleNavigation": "Toggle navigation",
  "nav.darkMode": "Dark Mode",
  "nav.lightMode": "Light Mode",
};

mockNuxtImport("useAuth", () => {
  return () => ({
    user: userRef,
    login: loginMock,
    logout: logoutMock,
  });
});

mockNuxtImport("useTheme", () => {
  return () => ({
    theme: themeRef,
    toggleTheme: toggleThemeMock,
  });
});

mockNuxtImport("useLocale", () => {
  return () => ({
    locale: localeRef,
    toggleLocale: toggleLocaleMock,
    t: (key: string) => tMap[key] ?? key,
  });
});

describe("default layout settings dropdown", () => {
  beforeEach(() => {
    loginMock.mockClear();
    logoutMock.mockClear();
    toggleThemeMock.mockClear();
    toggleLocaleMock.mockClear();
    userRef.value = { name: "Leon" };
    themeRef.value = "light";
    localeRef.value = "de";
  });

  it("opens dropdown and triggers locale/theme/logout actions", async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: {
        default: "<div>content</div>",
      },
    });

    const trigger = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Leon"));
    expect(trigger).toBeTruthy();

    await trigger!.trigger("click");
    expect(wrapper.text()).toContain("Logout");
    expect(wrapper.text()).toContain("Dark Mode");

    const localeButton = wrapper
      .findAll("button")
      .find((b) => b.text().trim().toLowerCase() === "de");
    expect(localeButton).toBeTruthy();
    await localeButton!.trigger("click");
    expect(toggleLocaleMock).toHaveBeenCalledTimes(1);

    await trigger!.trigger("click");
    const themeButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Dark Mode"));
    expect(themeButton).toBeTruthy();
    await themeButton!.trigger("click");
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);

    await trigger!.trigger("click");
    const logoutButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Logout"));
    expect(logoutButton).toBeTruthy();
    await logoutButton!.trigger("click");
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it("closes dropdown on outside click", async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: {
        default: "<div>content</div>",
      },
    });

    const trigger = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Leon"));
    expect(trigger).toBeTruthy();

    await trigger!.trigger("click");
    expect(wrapper.text()).toContain("Logout");

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain("Logout");
  });
});

