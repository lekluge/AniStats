<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import { useRoute } from "vue-router";
const route = useRoute();
// Pagination für Listenansicht
const pageSize = 50;
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(listAnime.value.length / pageSize))
);
const paginatedListAnime = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return listAnime.value.slice(start, start + pageSize);
});
import type { AnimeEntry } from "~/types/anime";
import GameCard from "../components/GameCard.vue";

/* -----------------------------
 * Types
 * ----------------------------- */
type GenreCover = {
  id: number;
  title: string;
  cover: string;
};

type LayoutMode = "grid" | "list";
type GenreState = "include" | "exclude";
type GenreSortMode = "count" | "minutes";

/* -----------------------------
 * State
 * ----------------------------- */
const username = useAnilistUser();

const loading = ref(false);
const error = ref<string | null>(null);
const entries = ref<AnimeEntry[]>([]);
const layoutMode = ref<LayoutMode>("grid");
const genreSortMode = ref<GenreSortMode>("count");

definePageMeta({ title: "Genres" });

/* -----------------------------
 * API
 * ----------------------------- */
async function loadAnime() {
  loading.value = true;
  error.value = null;

  try {
    if (!username.value) {
      loading.value = false;
      return;
    }

    const res = await api.post("/api/anilist", null, {
      params: { user: username.value },
    });
    entries.value = normalizeAnilist(res.data.data.MediaListCollection.lists);
  } catch (e: any) {
    error.value = e?.message ?? "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (username.value) {
    await loadAnime();
  }
  applyQueryFilters();
});

watch(
  () => route.query,
  () => applyQueryFilters(),
  { deep: true }
);

/* -----------------------------
 * GENRE STATE (3-WAY)
 * ----------------------------- */

function applyQueryFilters() {
  const qGenre = route.query.genre;
  const qLayout = route.query.layout;
  const qMode = route.query.genreMode as GenreState | undefined;

  if (qLayout === "list") {
    layoutMode.value = "list";
  }

  if (typeof qGenre === "string") {
    genreStates.value = {
      [qGenre]: qMode ?? "include",
    };
  }
}
const genreStates = ref<Record<string, GenreState>>({});

const allGenres = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) => e.genres?.forEach((g) => set.add(g)));
  return [...set].sort();
});

/* -----------------------------
 * FILTERED ENTRIES
 * ----------------------------- */
const filteredEntries = computed(() => {
  return entries.value.filter((e) => {
    const genres = e.genres ?? [];

    for (const [g, state] of Object.entries(genreStates.value)) {
      if (state === "include" && !genres.includes(g)) return false;
      if (state === "exclude" && genres.includes(g)) return false;
    }
    return true;
  });
});

const includedGenres = computed(() =>
  Object.entries(genreStates.value)
    .filter(([, s]) => s === "include")
    .map(([g]) => g)
);

const isCombinedMode = computed(() => includedGenres.value.length > 1);

/* -----------------------------
 * GRID: GENRE STATS
 * ----------------------------- */
const normalGenreStats = computed(() => {
  const map: Record<
    string,
    {
      count: number;
      scoreSum: number;
      scoreCount: number;
      minutesWatched: number;
      covers: GenreCover[];
    }
  > = {};

  for (const e of filteredEntries.value) {
    const minutes = (e.progress ?? 0) * (e.duration ?? 0);

    for (const genre of e.genres ?? []) {
      if (!map[genre]) {
        map[genre] = {
          count: 0,
          scoreSum: 0,
          scoreCount: 0,
          minutesWatched: 0,
          covers: [],
        };
      }

      map[genre].count++;
      map[genre].minutesWatched += minutes;

      if (e.score && e.score > 0) {
        map[genre].scoreSum += e.score;
        map[genre].scoreCount++;
      }

      const cover =
        typeof e.coverImage === "string"
          ? e.coverImage
          : e.coverImage?.extraLarge ||
            e.coverImage?.large ||
            e.coverImage?.medium;

      if (cover && !map[genre].covers.some((c) => c.id === e.id)) {
        map[genre].covers.push({
          id: e.id,
          title: e.title?.english ?? e.title?.romaji ?? "Unknown title",
          cover,
        });
      }
    }
  }

  return Object.entries(map).map(([genre, g]) => ({
    genre,
    count: g.count,
    // Math round soll 1 nachkommastelle haben
    meanScore: g.scoreCount
      ? Math.round((g.scoreSum / g.scoreCount) * 10) / 10
      : 0,
    minutesWatched: g.minutesWatched,
    covers: g.covers,
  }));
});

/* -----------------------------
 * COMBINED CARD
 * ----------------------------- */
const combinedStats = computed(() => {
  if (!isCombinedMode.value) return null;

  let minutes = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  const covers: GenreCover[] = [];

  for (const e of filteredEntries.value) {
    minutes += (e.progress ?? 0) * (e.duration ?? 0);

    if (e.score && e.score > 0) {
      scoreSum += e.score;
      scoreCount++;
    }

    const cover =
      typeof e.coverImage === "string"
        ? e.coverImage
        : e.coverImage?.extraLarge ||
          e.coverImage?.large ||
          e.coverImage?.medium;

    if (cover && !covers.some((c) => c.id === e.id)) {
      covers.push({
        id: e.id,
        title: e.title?.english ?? e.title?.romaji ?? "Unknown title",
        cover,
      });
    }
  }

  return {
    genre: includedGenres.value.join(" + "),
    count: filteredEntries.value.length,
    meanScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
    minutesWatched: minutes,
    covers,
  };
});

/* -----------------------------
 * SORTING
 * ----------------------------- */
function sortGenres<T extends { count: number; minutesWatched: number }>(
  list: T[]
) {
  return [...list].sort((a, b) => {
    if (genreSortMode.value === "count") {
      return b.count - a.count;
    }
    return b.minutesWatched - a.minutesWatched;
  });
}

/* -----------------------------
 * FEATURED COVER FIX + SORT
 * ----------------------------- */
const displayedGenres = computed(() => {
  if (combinedStats.value) return [combinedStats.value];

  const sorted = sortGenres(normalGenreStats.value);
  const used = new Set<number>();

  return sorted.map((g) => {
    if (!g.covers.length) return g;

    const featured = g.covers.find((c) => !used.has(c.id)) ?? g.covers[0];
    used.add(featured.id);

    return {
      ...g,
      covers: [featured, ...g.covers.filter((c) => c.id !== featured.id)],
    };
  });
});

/* -----------------------------
 * LIST VIEW
 * ----------------------------- */
const listAnime = computed(() =>
  filteredEntries.value.map((e) => ({
    id: e.id,
    title: e.title?.english ?? e.title?.romaji ?? "Unknown",
    cover:
      typeof e.coverImage === "string" ? e.coverImage : e.coverImage?.medium,
    score: e.score,
  }))
);

/* -----------------------------
 * Helpers
 * ----------------------------- */
function toggleGenre(genre: string) {
  const current = genreStates.value[genre];
  if (!current) genreStates.value[genre] = "include";
  else if (current === "include") genreStates.value[genre] = "exclude";
  else delete genreStates.value[genre];
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <h1 class="text-3xl font-bold">Genres</h1>

      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded w-full sm:w-48"
          placeholder="AniList Username"
          @keydown.enter.prevent="loadAnime"
          @keydown.space.prevent="loadAnime"
        />
        <button
          @click="loadAnime"
          class="bg-indigo-600 px-4 py-2 rounded w-full sm:w-auto"
          :disabled="loading"
        >
          Laden
        </button>
      </div>
    </div>

    <!-- Sort + Layout -->
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <button
          @click="genreSortMode = 'count'"
          class="px-3 py-2 text-xs rounded border"
          :class="
            genreSortMode === 'count'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-300'
          "
        >
          Anzahl
        </button>
        <button
          @click="genreSortMode = 'minutes'"
          class="px-3 py-2 text-xs rounded border"
          :class="
            genreSortMode === 'minutes'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-300'
          "
        >
          Stunden
        </button>
      </div>

      <div class="flex gap-2">
        <button
          @click="layoutMode = 'grid'"
          class="px-3 py-2 text-xs rounded border"
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
          class="px-3 py-2 text-xs rounded border"
          :class="
            layoutMode === 'list'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-300'
          "
        >
          List
        </button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500"
      />
    </div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- Genre Filter -->
    <div v-else class="flex flex-wrap gap-2">
      <button
        v-for="g in allGenres"
        :key="g"
        @click="toggleGenre(g)"
        class="px-3 py-2 rounded-full text-xs border"
        :class="{
          'bg-indigo-600 text-white': genreStates[g] === 'include',
          'bg-red-600 text-white': genreStates[g] === 'exclude',
          'bg-zinc-900 text-zinc-300': !genreStates[g],
        }"
      >
        {{ g }}
      </button>
    </div>

    <!-- GRID -->
    <div
      v-if="layoutMode === 'grid'"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <GameCard
        v-for="(g, i) in displayedGenres"
        :key="g.genre"
        :rank="i + 1"
        :data="g"
        target="/genres"
        :filter="{
          key: 'genre',
          modeKey: 'genreMode',
          modeValue: 'include',
        }"
      />
    </div>

    <!-- LIST -->
    <div v-else>
      <!-- Pagination -->
      <div class="flex items-center justify-between text-sm mb-2">
        <button
          class="px-3 py-1 rounded border"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ← Zurück
        </button>

        <span>Seite {{ currentPage }} / {{ totalPages }}</span>

        <button
          class="px-3 py-1 rounded border"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Weiter →
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="a in paginatedListAnime"
          :key="a.id"
          class="flex gap-3 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/30"
        >
          <img
            v-if="a.cover"
            :src="a.cover"
            class="h-14 aspect-2/3 rounded object-cover"
          />
          <a
            :href="anilistUrl(a.id)"
            target="_blank"
            class="flex-1 hover:underline hover:text-indigo-400"
          >
            {{ a.title }}
          </a>
          <span class="text-xs text-zinc-400">
            {{ a.score || "—" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
