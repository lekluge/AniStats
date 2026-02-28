import { describe, expect, it } from "vitest";
import { useLocale } from "~/composables/useLocale";

describe("useLocale composable", () => {
  it("switches locale and resolves translation keys", () => {
    const { locale, setLocale, toggleLocale, t } = useLocale();

    setLocale("de");
    expect(locale.value).toBe("de");
    expect(t("common.load")).toBe("Laden");

    toggleLocale();
    expect(locale.value).toBe("en");
    expect(t("common.load")).toBe("Load");
  });

  it("falls back to key for unknown translation", () => {
    const { t } = useLocale();
    expect(t("does.not.exist")).toBe("does.not.exist");
  });
});
