import { translations, type AppLocale } from "~/i18n/translations";

const STORAGE_KEY = "anistats-locale";

function isAppLocale(value: string | null): value is AppLocale {
  return value === "de" || value === "en";
}

function resolvePath(
  table: Record<string, unknown>,
  segments: string[]
): string | null {
  let current: unknown = table;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null) return null;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === "string" ? current : null;
}

function getStorage(): Storage | null {
  if (!process.client) return null;
  if (typeof localStorage === "undefined") return null;
  if (typeof localStorage.getItem !== "function") return null;
  if (typeof localStorage.setItem !== "function") return null;
  return localStorage;
}

export function useLocale() {
  const localeCookie = useCookie<AppLocale>("anistats-locale", {
    default: () => "en",
  });
  const locale = useState<AppLocale>("app-locale", () => localeCookie.value ?? "en");
  const initialized = useState<boolean>("app-locale-initialized", () => false);

  function initLocale() {
    if (!process.client || initialized.value) return;
    const storage = getStorage();
    if (!storage) {
      locale.value = localeCookie.value ?? "en";
      initialized.value = true;
      return;
    }
    const fromStorage = storage.getItem(STORAGE_KEY);
    if (isAppLocale(fromStorage)) {
      locale.value = fromStorage;
      localeCookie.value = fromStorage;
    } else {
      locale.value = localeCookie.value ?? "en";
    }
    initialized.value = true;
  }

  function setLocale(next: AppLocale) {
    locale.value = next;
    localeCookie.value = next;
    const storage = getStorage();
    if (storage) storage.setItem(STORAGE_KEY, next);
  }

  function toggleLocale() {
    setLocale(locale.value === "de" ? "en" : "de");
  }

  function t(key: string): string {
    const langTable = translations[locale.value] as Record<string, unknown>;
    const fallbackTable = translations.en as Record<string, unknown>;
    const segments = key.split(".");
    const localized = resolvePath(langTable, segments);
    if (localized) return localized;

    const fallback = resolvePath(fallbackTable, segments);
    if (fallback) return fallback;

    return key;
  }

  return { locale, initLocale, setLocale, toggleLocale, t };
}
