type ThemeMode = "light" | "dark";

const STORAGE_KEY = "anistats-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function useTheme() {
  const theme = useState<ThemeMode>("theme-mode", () => "light");
  const initialized = useState<boolean>("theme-initialized", () => false);

  function applyTheme(next: ThemeMode) {
    if (!process.client) return;
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  function setTheme(next: ThemeMode) {
    theme.value = next;
    applyTheme(next);
  }

  function toggleTheme() {
    setTheme(theme.value === "light" ? "dark" : "light");
  }

  function initTheme() {
    if (!process.client || initialized.value) return;

    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (isThemeMode(fromStorage)) {
      theme.value = fromStorage;
    } else {
      theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    applyTheme(theme.value);
    initialized.value = true;
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme,
  };
}
