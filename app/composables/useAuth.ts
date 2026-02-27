type AuthUser = { name: string } | null;

export function useAuth() {
  const user = useState<AuthUser>("auth:user", () => null);
  const loaded = useState<boolean>("auth:loaded", () => false);
  const loading = useState<boolean>("auth:loading", () => false);
  const usernameCookie = useCookie<string>("anilist-user", {
    default: () => "",
  });
  async function loadUser() {
    // schon geladen oder gerade am laden? => nicht nochmal
    if (loaded.value || loading.value) return;
    loading.value = true;

    try {
      // Server prüft Cookie (httpOnly) und gibt user oder null zurück
      const res = await $fetch<{ user: AuthUser }>("/api/auth/me");
      if (res.user) {
        user.value = res.user;
        usernameCookie.value = res.user?.name ?? "";
      }
    } catch {
      user.value = null;
    } finally {
      loaded.value = true;
      loading.value = false;
    }
  }

  function login() {
    window.location.href = "/api/auth/login"; // oder wie dein Login-Start heißt
  }

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    loaded.value = true;
    await navigateTo("/");
  }

  return { user, loaded, loading, loadUser, login, logout };
}
