<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";
import GameCard from "../components/GameCard.vue";
import { useRoute } from "vue-router";
const route = useRoute();

const pageSize = 50;
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(listAnime.value.length / pageSize))
);
const paginatedListAnime = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return listAnime.value.slice(start, start + pageSize);
});

definePageMeta({ title: "Combine" });

/* -----------------------------
 * Types
 * ----------------------------- */
type Cover = {
  id: number;
  title: string;
  cover: string;
  score: number;
  minutes: number;
};

type LayoutMode = "grid" | "list";
type FilterState = "include" | "exclude";
type CombineSortMode = "count" | "minutes";

/* -----------------------------
 * State
 * ----------------------------- */
const username = ref("Tiggy");
const loading = ref(false);
const entries = ref<AnimeEntry[]>([]);
const layoutMode = ref<LayoutMode>("grid");
const sortMode = ref<CombineSortMode>("count");

/* -----------------------------
 * API
 * ----------------------------- */
async function loadAnime() {
  loading.value = true;
  try {
    const res = await api.post("/api/anilist", null, {
      params: { user: username.value },
    });
    entries.value = normalizeAnilist(res.data.data.MediaListCollection.lists);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadAnime();
  applyQueryFilters();
});

function applyQueryFilters() {
  const qLayout = route.query.layout;
  const qGenre = route.query.genre;
  const qTag = route.query.tag;
  
  genreStates.value = {};
  tagStates.value = {};

  if (qLayout === "list") {
    layoutMode.value = "list";
  }

  if (typeof qGenre === "string") {
    genreStates.value = {
      [qGenre]: "include",
    };
  }

  if (typeof qTag === "string") {
    tagStates.value = {
      [qTag]: "include",
    };
  }
}

watch(
  () => route.query,
  () => applyQueryFilters(),
  { deep: true }
);

/* -----------------------------
 * Filters
 * ----------------------------- */
const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagSearch = ref("");

const allGenres = computed(() => {
  const s = new Set<string>();
  entries.value.forEach((e) => e.genres?.forEach((g) => s.add(g)));
  return [...s].sort();
});

const allTags = computed(() => {
  const s = new Set<string>();
  entries.value.forEach((e) => e.tags?.forEach((t) => s.add(t.name)));
  return [...s].sort();
});

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
 * FILTERED ENTRIES
 * ----------------------------- */
const filteredEntries = computed(() => {
  return entries.value.filter((e) => {
    const genres = e.genres ?? [];
    const tags = e.tags?.map((t) => t.name) ?? [];

    for (const [g, s] of Object.entries(genreStates.value)) {
      if (s === "include" && !genres.includes(g)) return false;
      if (s === "exclude" && genres.includes(g)) return false;
    }

    for (const [t, s] of Object.entries(tagStates.value)) {
      if (s === "include" && !tags.includes(t)) return false;
      if (s === "exclude" && tags.includes(t)) return false;
    }

    return true;
  });
});

const includedFilters = computed(() => [
  ...Object.entries(genreStates.value)
    .filter(([, s]) => s === "include")
    .map(([k]) => k),
  ...Object.entries(tagStates.value)
    .filter(([, s]) => s === "include")
    .map(([k]) => k),
]);

const isCombinedMode = computed(() => includedFilters.value.length > 1);

/* -----------------------------
 * GRID STATS
 * ----------------------------- */
const gridStats = computed(() => {
  const map: Record<
    string,
    {
      type: "genre" | "tag"; // ✅ FIX: speichert, ob Key Genre oder Tag ist
      count: number;
      scoreSum: number;
      scoreCount: number;
      minutesWatched: number;
      covers: any[];
    }
  > = {};

  for (const e of filteredEntries.value) {
    const minutes = (e.progress ?? 0) * (e.duration ?? 0);

    // ✅ FIX: Keys bekommen einen Typ
    const keys = [
      ...(e.genres ?? []).map((g) => ({ key: g, type: "genre" as const })),
      ...(e.tags?.map((t) => ({ key: t.name, type: "tag" as const })) ?? []),
    ];

    for (const { key, type } of keys) {
      if (!map[key]) {
        map[key] = {
          type,
          count: 0,
          scoreSum: 0,
          scoreCount: 0,
          minutesWatched: 0,
          covers: [],
        };
      }

      map[key].count++;
      map[key].minutesWatched += minutes;

      if (e.score) {
        map[key].scoreSum += e.score;
        map[key].scoreCount++;
      }

      const cover =
        typeof e.coverImage === "string"
          ? e.coverImage
          : e.coverImage?.extraLarge ||
            e.coverImage?.large ||
            e.coverImage?.medium;

      if (cover && !map[key].covers.some((c: any) => c.id === e.id)) {
        map[key].covers.push({
          id: e.id,
          title: e.title?.english ?? e.title?.romaji ?? "Unknown",
          cover,
          score: e.score ?? 0,
          minutes,
        });
      }
    }
  }

  return Object.entries(map).map(([k, g]) => ({
    genre: k,
    filterType: g.type, // ✅ FIX: wird an GameCard übergeben
    count: g.count,
    meanScore: g.scoreCount
      ? Math.round((g.scoreSum / g.scoreCount) * 10) / 10
      : 0,
    minutesWatched: g.minutesWatched,
    covers: g.covers.sort(
      (a: any, b: any) => b.score - a.score || b.minutes - a.minutes
    ),
  }));
});

/* -----------------------------
 * COMBINED CARD
 * ----------------------------- */
const combinedGridCard = computed(() => {
  if (!isCombinedMode.value) return null;

  let minutes = 0,
    scoreSum = 0,
    scoreCount = 0;
  const covers: Cover[] = [];

  for (const e of filteredEntries.value) {
    const m = (e.progress ?? 0) * (e.duration ?? 0);
    minutes += m;

    if (e.score) {
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
        title: e.title?.english ?? e.title?.romaji ?? "Unknown",
        cover,
        score: e.score ?? 0,
        minutes: m,
      });
    }
  }

  return {
    genre: includedFilters.value.join(" + "),
    // ✅ FIX: Combined Card hat keinen eindeutigen Typ → kein filterType
    count: filteredEntries.value.length,
    meanScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
    minutesWatched: minutes,
    covers,
  };
});

/* -----------------------------
 * SORTING
 * ----------------------------- */
function sortGrid<T extends { count: number; minutesWatched: number }>(list: T[]) {
  return [...list].sort((a, b) => {
    if (sortMode.value === "count") {
      return b.count - a.count;
    }
    return b.minutesWatched - a.minutesWatched;
  });
}

/* -----------------------------
 * FEATURED COVER FIX + SORT
 * ----------------------------- */
const displayedGrid = computed(() => {
  if (combinedGridCard.value) return [combinedGridCard.value];

  const sorted = sortGrid(gridStats.value);
  const used = new Set<number>();

  return sorted.map((g) => {
    if (!g.covers.length) return g;

    const featured = g.covers.find((c: any) => !used.has(c.id)) ?? g.covers[0];
    used.add(featured.id);

    return {
      ...g,
      covers: [featured, ...g.covers.filter((c: any) => c.id !== featured.id)],
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
function cycleState(map: Record<string, FilterState>, key: string) {
  if (!map[key]) map[key] = "include";
  else if (map[key] === "include") map[key] = "exclude";
  else delete map[key];
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <h1 class="text-3xl font-bold">Combined</h1>

      <div class="flex gap-2">
        <input v-model="username" class="bg-zinc-900 border px-3 py-2 rounded" />
        <button
          @click="loadAnime"
          class="bg-indigo-600 px-4 py-2 rounded"
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
          @click="sortMode = 'count'"
          class="px-3 py-2 text-xs rounded border"
          :class="
            sortMode === 'count'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-300'
          "
        >
          Anzahl
        </button>
        <button
          @click="sortMode = 'minutes'"
          class="px-3 py-2 text-xs rounded border"
          :class="
            sortMode === 'minutes'
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

    <!-- Genres -->
    <div class="flex flex-wrap gap-2">
      <h2 class="w-full font-semibold">Genres</h2>
      <button
        v-for="g in allGenres"
        :key="g"
        @click="cycleState(genreStates, g)"
        class="px-3 py-2 text-xs rounded-full border"
        :class="{
          'bg-indigo-600 text-white': genreStates[g] === 'include',
          'bg-red-600 text-white': genreStates[g] === 'exclude',
          'bg-zinc-900 text-zinc-300': !genreStates[g],
        }"
      >
        {{ g }}
      </button>
    </div>

    <!-- Tag Search -->
    <input
      v-model="tagSearch"
      placeholder="Tags suchen…"
      class="w-full bg-zinc-900 border px-4 py-2 rounded"
    />

    <!-- Tags -->
    <div v-if="tagSearch.trim() || selectedTags.length" class="flex flex-wrap gap-2">
      <button
        v-for="t in visibleTags"
        :key="t"
        @click="cycleState(tagStates, t)"
        class="px-3 py-2 rounded-full text-xs border"
        :class="{
          'bg-indigo-600 text-white': tagStates[t] === 'include',
          'bg-red-600 text-white': tagStates[t] === 'exclude',
          'bg-zinc-900 text-zinc-300': !tagStates[t],
        }"
      >
        {{ t }}
      </button>
    </div>

    <!-- GRID -->
    <div v-if="layoutMode === 'grid'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <GameCard
        v-for="(g, i) in displayedGrid"
        :key="g.genre"
        :rank="i + 1"
        :data="g"
        target="/combine"
        :filter="(g as any).filterType ? { key: (g as any).filterType } : undefined"
      />
    </div>

    <!-- LIST -->
    <div v-else-if="layoutMode === 'list'">
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
            class="h-14 aspect-2/3 rounded object-cover shrink-0"
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
