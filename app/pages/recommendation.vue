<script setup lang="ts">
import { api } from "~/composables/useApi";

/* -----------------------------
 * Types
 * ----------------------------- */
type Recommendation = {
  id: number;
  title: string;
  cover: string | null;
  format: "TV" | "MOVIE";
  score: number;
  matchedGenres: string[];
  matchedTags: string[];
};

type LayoutMode = "grid" | "list";
type Tab = "TV" | "MOVIE";

/* -----------------------------
 * State
 * ----------------------------- */
const username = ref("Tiggy");
const loading = ref(false);
const error = ref<string | null>(null);

const layoutMode = ref<LayoutMode>("grid");
const activeTab = ref<Tab>("TV");

const items = ref<{
  TV: Recommendation[];
  MOVIE: Recommendation[];
}>({
  TV: [],
  MOVIE: [],
});

definePageMeta({ title: "Recommendations" });

/* -----------------------------
 * API
 * ----------------------------- */
async function loadRecommendations() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("/api/recommendation", {
      params: { user: username.value },
    });

    items.value = res.data.items;
  } catch (e: any) {
    error.value = e?.message ?? "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

onMounted(loadRecommendations);

/* -----------------------------
 * Computed
 * ----------------------------- */
const currentItems = computed(() => items.value[activeTab.value] ?? []);

/* -----------------------------
 * Helpers
 * ----------------------------- */
function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <h1 class="text-3xl font-bold">Recommendations</h1>

      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded w-full sm:w-48"
        />
        <button
          @click="loadRecommendations"
          class="bg-indigo-600 px-4 py-2 rounded w-full sm:w-auto"
          :disabled="loading"
        >
          Laden
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        v-for="t in ['TV', 'MOVIE']"
        :key="t"
        @click="activeTab = t as Tab"
        class="px-4 py-2 rounded text-sm border"
        :class="
          activeTab === t
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-zinc-900 text-zinc-300 border-zinc-800'
        "
      >
        {{ t }}
      </button>
    </div>

    <!-- Layout Switch -->
    <div class="flex gap-2 justify-end">
      <button
        @click="layoutMode = 'grid'"
        class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto"
        :class="
          layoutMode === 'grid'
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-900 text-zinc-300'
        "
      >
        Grid
      </button>
      <button
        @click="layoutMode = 'list'"
        class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto"
        :class="
          layoutMode === 'list'
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-900 text-zinc-300'
        "
      >
        List
      </button>
    </div>

    <!-- States -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500"
      />
    </div>

    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- GRID -->
    <div
      v-else-if="layoutMode === 'grid'"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="(a, i) in currentItems"
        :key="a.id"
        class="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
      >
        <img
          v-if="a.cover"
          :src="a.cover"
          class="w-full aspect-[2/3] object-cover"
        />

        <div class="p-4 space-y-2">
          <a
            :href="anilistUrl(a.id)"
            target="_blank"
            class="font-semibold hover:underline hover:text-indigo-400"
          >
            {{ a.title }}
          </a>

          <div class="flex flex-wrap gap-1">
            <span
              v-for="g in a.matchedGenres"
              :key="g"
              class="px-2 py-0.5 text-xs rounded bg-indigo-600/20 text-indigo-300"
            >
              {{ g }}
            </span>
            <span
              v-for="t in a.matchedTags"
              :key="t"
              class="px-2 py-0.5 text-xs rounded bg-zinc-700/40 text-zinc-300"
            >
              {{ t }}
            </span>
          </div>

          <div class="text-xs text-zinc-400">
            Match-Score: {{ a.score }}
          </div>
        </div>
      </div>
    </div>

    <!-- LIST -->
    <div v-else class="space-y-2">
      <div
        v-for="a in currentItems"
        :key="a.id"
        class="flex gap-3 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/30"
      >
        <img
          v-if="a.cover"
          :src="a.cover"
          class="h-14 aspect-[2/3] rounded object-cover flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <a
            :href="anilistUrl(a.id)"
            target="_blank"
            class="font-medium hover:underline hover:text-indigo-400"
          >
            {{ a.title }}
          </a>
          <div class="flex flex-wrap gap-1 mt-1">
            <span
              v-for="g in a.matchedGenres"
              :key="g"
              class="text-xs text-indigo-400"
            >
              {{ g }}
            </span>
          </div>
        </div>
        <span class="text-xs text-zinc-400 whitespace-nowrap">
          {{ a.score }}
        </span>
      </div>
    </div>
  </div>
</template>
