import { translations, type AppLocale } from "~/i18n/translations";

const STORAGE_KEY = "anistats-locale";

function isAppLocale(value: string | null): value is AppLocale {
  return value === "de" || value === "en";
}

export function useLocale() {
  const localeCookie = useCookie<AppLocale>("anistats-locale", {
    default: () => "de",
  });
  const locale = useState<AppLocale>("app-locale", () => localeCookie.value ?? "de");
  const initialized = useState<boolean>("app-locale-initialized", () => false);

  function initLocale() {
    if (!process.client || initialized.value) return;
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (isAppLocale(fromStorage)) {
      locale.value = fromStorage;
      localeCookie.value = fromStorage;
    } else {
      locale.value = localeCookie.value ?? "de";
    }
    initialized.value = true;
  }

  function setLocale(next: AppLocale) {
    locale.value = next;
    localeCookie.value = next;
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  function toggleLocale() {
    setLocale(locale.value === "de" ? "en" : "de");
  }

  function t(key: string): string {
    const langTable = translations[locale.value] as Record<string, any>;
    const fallbackTable = translations.de as Record<string, any>;
    const segments = key.split(".");

    let current: any = langTable;
    for (const segment of segments) current = current?.[segment];
    if (typeof current === "string") return current;

    current = fallbackTable;
    for (const segment of segments) current = current?.[segment];
    if (typeof current === "string") return current;

    return key;
  }

  return { locale, initLocale, setLocale, toggleLocale, t };
}
