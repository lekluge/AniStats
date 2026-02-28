<template>
  <div class="min-h-screen text-slate-900">
    <header class="sticky top-0 z-50 border-b border-zinc-800/70 bg-zinc-950/95 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink :to="user ? '/dashboard' : '/'" class="flex items-center gap-3" @click="closeMenu">
          <img src="/logo.png" :alt="t('nav.appName')" class="h-8 w-auto" />
          <div class="hidden sm:block leading-tight">
            <div class="text-sm font-semibold text-slate-800">{{ t("nav.appName") }}</div>
            <div class="text-xs text-zinc-500">{{ t("nav.insightsDashboard") }}</div>
          </div>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1 text-sm">
          <template v-if="user">
            <NuxtLink to="/genres" class="nav-link">{{ t("nav.genres") }}</NuxtLink>
            <NuxtLink to="/tags" class="nav-link">{{ t("nav.tags") }}</NuxtLink>
            <NuxtLink to="/combine" class="nav-link">{{ t("nav.combine") }}</NuxtLink>
            <NuxtLink to="/relations" class="nav-link">{{ t("nav.relations") }}</NuxtLink>
            <NuxtLink to="/compare" class="nav-link">{{ t("nav.compare") }}</NuxtLink>
            <NuxtLink to="/recommendation" class="nav-link">{{ t("nav.recommendation") }}</NuxtLink>
            <NuxtLink to="/history" class="nav-link">{{ t("nav.history") }}</NuxtLink>
          </template>
        </nav>

        <div ref="profileMenuRef" class="relative">
          <button
            class="ui-btn inline-flex items-center gap-2"
            :aria-expanded="profileMenuOpen ? 'true' : 'false'"
            aria-haspopup="menu"
            @click="profileMenuOpen = !profileMenuOpen"
          >
            <span v-if="user" class="max-w-[140px] truncate">{{ user.name }}</span>
            <span v-else>{{ t("nav.settings") }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-zinc-400 transition-transform"
              :class="profileMenuOpen ? 'rotate-180' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <div
            v-if="profileMenuOpen"
            class="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-xl backdrop-blur"
            role="menu"
          >
            <button class="ui-btn w-full justify-start uppercase mb-1" @click="handleToggleLocale">
              {{ locale }}
            </button>
            <button class="ui-btn w-full justify-start mb-1" @click="handleToggleTheme">
              {{ themeLabel }}
            </button>
            <button v-if="!user" class="ui-btn ui-btn-primary w-full justify-start" @click="handleLogin">
              {{ t("nav.login") }}
            </button>
            <button v-else class="ui-btn w-full justify-start" @click="handleLogout">
              {{ t("nav.logout") }}
            </button>
          </div>
        </div>

        <button
          class="md:hidden rounded-lg p-2 transition hover:bg-zinc-800/70"
          @click="menuOpen = !menuOpen"
          :aria-label="t('nav.toggleNavigation')"
        >
          <svg
            v-if="!menuOpen"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="menuOpen" class="border-t border-zinc-800/70 bg-zinc-950/95 px-4 py-4 md:hidden">
        <nav class="space-y-2 text-sm">
          <template v-if="user">
            <NuxtLink to="/genres" class="nav-link" @click="closeMenu">{{ t("nav.genres") }}</NuxtLink>
            <NuxtLink to="/tags" class="nav-link" @click="closeMenu">{{ t("nav.tags") }}</NuxtLink>
            <NuxtLink to="/combine" class="nav-link" @click="closeMenu">{{ t("nav.combine") }}</NuxtLink>
            <NuxtLink to="/relations" class="nav-link" @click="closeMenu">{{ t("nav.relations") }}</NuxtLink>
            <NuxtLink to="/compare" class="nav-link" @click="closeMenu">{{ t("nav.compare") }}</NuxtLink>
            <NuxtLink to="/recommendation" class="nav-link" @click="closeMenu">{{ t("nav.recommendation") }}</NuxtLink>
            <NuxtLink to="/history" class="nav-link" @click="closeMenu">{{ t("nav.history") }}</NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const menuOpen = ref(false);
const closeMenu = () => {
  menuOpen.value = false;
};

const { user, login, logout } = useAuth();
const { theme, toggleTheme } = useTheme();
const { locale, toggleLocale, t } = useLocale();
const profileMenuOpen = ref(false);
const profileMenuRef = ref<HTMLElement | null>(null);

const closeProfileMenu = () => {
  profileMenuOpen.value = false;
};

function handleDocumentClick(event: MouseEvent) {
  const root = profileMenuRef.value;
  if (!root) return;
  if (!root.contains(event.target as Node)) {
    closeProfileMenu();
  }
}

async function handleLogin() {
  closeProfileMenu();
  await login();
}

async function handleLogout() {
  closeProfileMenu();
  await logout();
}

function handleToggleLocale() {
  toggleLocale();
  closeProfileMenu();
}

function handleToggleTheme() {
  toggleTheme();
  closeProfileMenu();
}

const themeLabel = computed(() =>
  theme.value === "dark" ? t("nav.lightMode") : t("nav.darkMode")
);

onMounted(() => {
  document.addEventListener("mousedown", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleDocumentClick);
});
</script>
