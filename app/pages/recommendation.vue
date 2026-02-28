<script setup lang="ts">

import { api } from "~/composables/useApi";
/* -----------------------------
 * Types
 * ----------------------------- */
type Recommendation = {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  cover: string | null;
  format: "TV" | "MOVIE";
  score: number;
  genres: string[];
  tags: string[];
  matchedGenres: string[];
  matchedTags: string[];
};

type LayoutMode = "grid" | "list";
type Tab = "TV" | "MOVIE";
type FilterState = "include" | "exclude";
type TitleMode = "EN_FIRST" | "RO_FIRST";

/* -----------------------------
 * State
 * ----------------------------- */
const username = useAnilistUser();
const loading = ref(false);
const error = ref<string | null>(null);
const includeUpcoming = ref(true);

const layoutMode = ref<LayoutMode>("grid");
const activeTab = ref<Tab>("TV");
const titleMode = ref<TitleMode>("EN_FIRST");

const items = ref<{ TV: Recommendation[]; MOVIE: Recommendation[] }>({
  TV: [],
  MOVIE: [],
});

/* -----------------------------
 * BASIC FILTERS
 * ----------------------------- */
const CURRENT_YEAR = new Date().getFullYear();

const filterSeason = ref<string | null>(null);
const seasonYearMin = ref<number | null>(null);
const seasonYearMax = ref<number | null>(CURRENT_YEAR);
const episodesMin = ref<number | null>(null);
const episodesMax = ref<number | null>(null);
const averageScoreMin = ref<number | null>(null);

/* -----------------------------
 * GENRE / TAG FILTER STATE
 * ----------------------------- */
const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagSearch = ref("");

/* -----------------------------
 * FILTER OPTIONS (DB)
 * ----------------------------- */
const allGenres = ref<string[]>([]);
const allTags = ref<string[]>([]);

definePageMeta({ title: "Recommendations", middleware: "auth" });

/* -----------------------------
 * LOAD FILTER OPTIONS
 * ----------------------------- */
async function loadGenreTags() {
  if (!username.value) {
    return;
  }
  const res = await api.get("/api/private/genreTags");
  allGenres.value = res.data.genres;
  allTags.value = res.data.tags.map((t: { name: string }) => t.name);
}

/* -----------------------------
 * TAG SEARCH (UI)
 * ----------------------------- */
const filteredTags = computed(() => {
  if (!tagSearch.value.trim()) return [];
  const q = tagSearch.value.toLowerCase();
  return allTags.value.filter((t) => t.toLowerCase().includes(q));
});

const selectedTags = computed(() => Object.keys(tagStates.value));

const visibleTags = computed(() => {
  const set = new Set<string>();
  selectedTags.value.forEach((t) => set.add(t));
  filteredTags.value.forEach((t) => set.add(t));
  return [...set].sort();
});

/* -----------------------------
 * API
 * ----------------------------- */
async function loadRecommendations() {
  loading.value = true;
  error.value = null;

  try {
    if (!username.value) {
      loading.value = false;
      return;
    }
    const params: any = { user: username.value };
    if (includeUpcoming.value) params.includeUpcoming = "true";
    if (filterSeason.value) params.season = filterSeason.value;
    if (seasonYearMin.value) params.seasonYearMin = seasonYearMin.value;
    if (seasonYearMax.value) params.seasonYearMax = seasonYearMax.value;
    if (episodesMin.value) params.episodesMin = episodesMin.value;
    if (episodesMax.value) params.episodesMax = episodesMax.value;
    if (averageScoreMin.value) params.averageScoreMin = averageScoreMin.value;

    const includeGenres = Object.entries(genreStates.value)
      .filter(([, s]) => s === "include")
      .map(([g]) => g);

    const excludeGenres = Object.entries(genreStates.value)
      .filter(([, s]) => s === "exclude")
      .map(([g]) => g);

    const includeTags = Object.entries(tagStates.value)
      .filter(([, s]) => s === "include")
      .map(([t]) => t);

    const excludeTags = Object.entries(tagStates.value)
      .filter(([, s]) => s === "exclude")
      .map(([t]) => t);

    if (includeGenres.length) params.genres = includeGenres.join(",");
    if (excludeGenres.length) params.excludeGenres = excludeGenres.join(",");
    if (includeTags.length) params.tags = includeTags.join(",");
    if (excludeTags.length) params.excludeTags = excludeTags.join(",");

    const res = await api.get("/api/private/recommendation", { params });
    items.value = res.data.items;
  } catch (e: any) {
    error.value = e?.message ?? "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadGenreTags();
  await loadRecommendations();
});

/* -----------------------------
 * Computed
 * ----------------------------- */
const currentItems = computed(() => items.value[activeTab.value] ?? []);

/* -----------------------------
 * Helpers
 * ----------------------------- */
function cycleState(map: Record<string, FilterState>, key: string) {
  if (!map[key]) map[key] = "include";
  else if (map[key] === "include") map[key] = "exclude";
  else delete map[key];

  loadRecommendations();
}

function toggleTitleMode() {
  titleMode.value = titleMode.value === "EN_FIRST" ? "RO_FIRST" : "EN_FIRST";
}

/**
 * Liefert 1 oder 2 Zeilen Titel (je nach Verfuegbarkeit),
 * und respektiert den globalen titleMode.
 */
function getTitleLines(a: Recommendation): {
  primary: string;
  secondary: string | null;
} {
  const en = a.titleEn?.trim() || null;
  const ro = a.titleRo?.trim() || null;

  // nur einer vorhanden
  if (en && !ro) return { primary: en, secondary: null };
  if (ro && !en) return { primary: ro, secondary: null };

  // beide vorhanden
  if (titleMode.value === "EN_FIRST") {
    return { primary: en as string, secondary: ro as string };
  }
  return { primary: ro as string, secondary: en as string };
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="page-shell">
    <!-- Header -->
    <div class="page-header">
      <h1 class="text-3xl font-bold">Recommendations</h1>

      <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div class="flex gap-2">
          <input
            v-model="username"
            class="ui-input"
            placeholder="AniList Username"
            @keydown.enter.prevent="loadRecommendations"
            @keydown.space.prevent="loadRecommendations"
          />
          <button
            @click="loadRecommendations"
            class="ui-btn ui-btn-primary"
            :disabled="loading"
          >
            Laden
          </button>
        </div>

        <!-- Title toggle -->
        <button
          @click="toggleTitleMode"
          class="ui-btn"
          :disabled="loading"
          title="Titel-Reihenfolge umschalten"
        >
          {{ titleMode === "EN_FIRST" ? "EN -> RO" : "RO -> EN" }}
        </button>
      </div>
    </div>

    <!-- BASIC FILTERS -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select
        v-model="filterSeason"
        class="ui-input"
      >
        <option :value="null">Season (alle)</option>
        <option>SPRING</option>
        <option>SUMMER</option>
        <option>FALL</option>
        <option>WINTER</option>
      </select>

      <input
        v-model.number="seasonYearMin"
        type="number"
        placeholder="Season Year Min"
        class="ui-input"
      />

      <input
        v-model.number="seasonYearMax"
        type="number"
        :placeholder="`Season Year Max (${CURRENT_YEAR})`"
        class="ui-input"
      />

      <input
        v-model.number="episodesMin"
        type="number"
        placeholder="Min Episodes"
        class="ui-input"
      />

      <input
        v-model.number="episodesMax"
        type="number"
        placeholder="Max Episodes"
        class="ui-input"
      />

      <input
        v-model.number="averageScoreMin"
        type="number"
        placeholder="Min Avg Score"
        class="ui-input"
      />
    </div>
    <!-- UPCOMING TOGGLE -->
    <div class="flex items-center gap-2">
      <button
        @click="
          includeUpcoming = !includeUpcoming;
          loadRecommendations();
        "
        class="px-3 py-2 text-xs rounded border transition"
        :class="
          includeUpcoming
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-zinc-900 text-zinc-300 border-zinc-800'
        "
      >
        {{ includeUpcoming ? "Upcoming einbeziehen" : "Upcoming ausblenden" }}
      </button>

      <span class="text-xs text-zinc-500">
        Noch nicht erschienene Anime anzeigen
      </span>
    </div>
    <!-- GENRES -->
    <div class="flex flex-wrap gap-2">
      <h2 class="w-full font-semibold">Genres</h2>
      <button
        v-for="g in allGenres"
        :key="g"
        @click="cycleState(genreStates, g)"
        class="px-3 py-1.5 text-xs rounded-full border"
        :class="{
          'bg-indigo-600 text-white': genreStates[g] === 'include',
          'bg-red-600 text-white': genreStates[g] === 'exclude',
          'bg-zinc-900 text-zinc-300': !genreStates[g],
        }"
      >
        {{ g }}
      </button>
    </div>

    <!-- TAG SEARCH -->
    <input
      v-model="tagSearch"
      placeholder="Tags suchen..."
      class="ui-input w-full px-4"
    />

    <!-- TAGS -->
    <div
      v-if="tagSearch.trim() || selectedTags.length"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="t in visibleTags"
        :key="t"
        @click="cycleState(tagStates, t)"
        class="px-3 py-1.5 text-xs rounded-full border"
        :class="{
          'bg-indigo-600 text-white': tagStates[t] === 'include',
          'bg-red-600 text-white': tagStates[t] === 'exclude',
          'bg-zinc-900 text-zinc-300': !tagStates[t],
        }"
      >
        {{ t }}
      </button>
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
        class="px-3 py-2 text-xs rounded border"
        :class="
          layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-zinc-900'
        "
      >
        Grid
      </button>
      <button
        @click="layoutMode = 'list'"
        class="px-3 py-2 text-xs rounded border"
        :class="
          layoutMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-zinc-900'
        "
      >
        List
      </button>
    </div>

    <!-- STATES -->
    <div v-if="loading" class="flex justify-center py-12">
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
        class="relative rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
      >
        <img
          v-if="a.cover"
          :src="a.cover"
          class="w-full aspect-2/3 object-cover"
        /><span
          class="absolute top-2 right-2 z-10 text-xs font-medium bg-indigo-800 text-indigo-300 px-2 py-1 rounded-full backdrop-blur-sm"
        >
          #{{ i + 1 }}
        </span>
        <div class="p-4 space-y-2">
          <a
            :href="anilistUrl(a.id)"
            target="_blank"
            class="block hover:underline hover:text-indigo-400"
          >
            <div class="font-semibold leading-snug">
              {{ getTitleLines(a).primary }}
            </div>
            <div
              v-if="getTitleLines(a).secondary"
              class="text-sm text-zinc-400 leading-snug"
            >
              {{ getTitleLines(a).secondary }}
            </div>
          </a>

          <div class="flex flex-wrap gap-1">
            <span
              v-for="g in a.genres"
              :key="g"
              class="px-2 py-0.5 text-xs rounded bg-indigo-600/20 text-indigo-300"
            >
              <a :href="`https://anilist.co/search/anime/${encodeURIComponent(g)}`" target="_blank" rel="noopener noreferrer">{{ g }}</a>
            </span>
            <span
              v-for="t in a.tags"
              :key="t"
              class="px-2 py-0.5 text-xs rounded bg-zinc-700/40 text-zinc-300"
            >
              <a :href="`https://anilist.co/search/anime/${encodeURIComponent(t)}`" target="_blank" rel="noopener noreferrer">{{ t }}</a>
            </span>
          </div>

          <div class="text-xs text-zinc-400">Match-Score: {{ a.score }}</div>
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
          class="h-14 aspect-2/3 rounded object-cover shrink-0"
        />

        <div class="flex-1 min-w-0">
          <a
            :href="anilistUrl(a.id)"
            target="_blank"
            class="block hover:underline hover:text-indigo-400"
          >
            <div class="font-medium leading-snug">
              {{ getTitleLines(a).primary }}
            </div>
            <div
              v-if="getTitleLines(a).secondary"
              class="text-xs text-zinc-400 leading-snug"
            >
              {{ getTitleLines(a).secondary }}
            </div>
          </a>

          <div class="flex flex-wrap gap-1 mt-1">
            <span
              v-for="g in a.genres"
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
