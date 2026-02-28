<template>
  <div class="min-h-screen text-slate-900">
    <header class="sticky top-0 z-50 border-b border-zinc-800/70 bg-zinc-950/95 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink :to="user ? '/dashboard' : '/'" class="flex items-center gap-3" @click="closeMenu">
          <img src="/logo.png" alt="AniList Stats" class="h-8 w-auto" />
          <div class="hidden sm:block leading-tight">
            <div class="text-sm font-semibold text-slate-800">AniList Stats</div>
            <div class="text-xs text-zinc-500">Insights Dashboard</div>
          </div>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1 text-sm">
          <template v-if="user">
            <NuxtLink to="/genres" class="nav-link">Genres</NuxtLink>
            <NuxtLink to="/tags" class="nav-link">Tags</NuxtLink>
            <NuxtLink to="/combine" class="nav-link">Combine</NuxtLink>
            <NuxtLink to="/relations" class="nav-link">Relations</NuxtLink>
            <NuxtLink to="/compare" class="nav-link">Compare</NuxtLink>
            <NuxtLink to="/recommendation" class="nav-link">Recommendation</NuxtLink>
            <NuxtLink to="/history" class="nav-link">History</NuxtLink>
          </template>
        </nav>

        <div class="hidden md:flex items-center gap-3">
          <button @click="toggleTheme" class="ui-btn">
            {{ themeLabel }}
          </button>
          <button v-if="!user" @click="login" class="ui-btn ui-btn-primary">Login with AniList</button>
          <template v-else>
            <span class="rounded-full border border-zinc-800 px-3 py-1 text-sm text-zinc-400">{{ user.name }}</span>
            <button @click="logout" class="ui-btn">Logout</button>
          </template>
        </div>

        <button
          class="md:hidden rounded-lg p-2 transition hover:bg-zinc-800/70"
          @click="menuOpen = !menuOpen"
          aria-label="Toggle navigation"
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
            <NuxtLink to="/genres" class="nav-link" @click="closeMenu">Genres</NuxtLink>
            <NuxtLink to="/tags" class="nav-link" @click="closeMenu">Tags</NuxtLink>
            <NuxtLink to="/combine" class="nav-link" @click="closeMenu">Combine</NuxtLink>
            <NuxtLink to="/relations" class="nav-link" @click="closeMenu">Relations</NuxtLink>
            <NuxtLink to="/compare" class="nav-link" @click="closeMenu">Compare</NuxtLink>
            <NuxtLink to="/recommendation" class="nav-link" @click="closeMenu">Recommendation</NuxtLink>
            <NuxtLink to="/history" class="nav-link" @click="closeMenu">History</NuxtLink>
          </template>

          <div class="pt-4 border-t border-zinc-800/70">
            <button @click="toggleTheme" class="ui-btn w-full mb-2">
              {{ themeLabel }}
            </button>
            <button v-if="!user" @click="login" class="ui-btn ui-btn-primary w-full">Login with AniList</button>
            <div v-else class="space-y-2">
              <div class="rounded-lg bg-zinc-900/40 px-3 py-2 text-sm text-zinc-400">{{ user.name }}</div>
              <button @click="logout" class="ui-btn w-full">Logout</button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const menuOpen = ref(false);
const closeMenu = () => {
  menuOpen.value = false;
};

const { user, login, logout } = useAuth();
const { theme, toggleTheme } = useTheme();
const themeLabel = computed(() =>
  theme.value === "dark" ? "Light Mode" : "Dark Mode"
);
</script>
