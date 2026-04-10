export type RewatchMode = "exclude" | "include";

const STORAGE_KEY = "anistats-rewatch-mode";

function isRewatchMode(value: string | null): value is RewatchMode {
  return value === "exclude" || value === "include";
}

export function useRewatchMode() {
  const mode = useState<RewatchMode>("rewatch-mode", () => "exclude");
  const initialized = useState<boolean>("rewatch-mode-initialized", () => false);

  function setMode(next: RewatchMode) {
    mode.value = next;
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  function initMode() {
    if (!process.client || initialized.value) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isRewatchMode(stored)) {
      mode.value = stored;
    }
    initialized.value = true;
  }

  return { mode, setMode, initMode };
}
