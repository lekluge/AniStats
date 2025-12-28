<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";
import GenreCard from "../components/GenreCard.vue";

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

/* -----------------------------
 * State
 * ----------------------------- */
const username = ref("Tiggy");
const loading = ref(false);
const error = ref<string | null>(null);
const entries = ref<AnimeEntry[]>([]);
const layoutMode = ref<LayoutMode>("grid");

/* -----------------------------
 * API
 * ----------------------------- */
async function loadAnime() {
  loading.value = true;
  error.value = null;

  try {
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

onMounted(loadAnime);

/* -----------------------------
 * Filters
 * ----------------------------- */
const selectedGenres = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const tagSearch = ref("");

const allGenres = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) => e.genres?.forEach((g) => set.add(g)));
  return [...set].sort();
});

const allTags = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) => e.tags?.forEach((t) => set.add(t.name)));
  return [...set].sort();
});

/* 🔍 TAG SEARCH FILTER */
const filteredTags = computed(() => {
  if (!tagSearch.value.trim()) return [];
  const q = tagSearch.value.toLowerCase();
  return allTags.value.filter((t) => t.toLowerCase().includes(q));
});

/* -----------------------------
 * FILTERED ENTRIES
 * ----------------------------- */
const filteredEntries = computed(() => {
  return entries.value.filter((e) => {
    const genreOk =
      !selectedGenres.value.length ||
      selectedGenres.value.every((g) => e.genres?.includes(g));

    const tagOk =
      !selectedTags.value.length ||
      selectedTags.value.every((t) => e.tags?.some((et) => et.name === t));

    return genreOk && tagOk;
  });
});

const isCombinedMode = computed(
  () => selectedGenres.value.length + selectedTags.value.length > 1
);

/* -----------------------------
 * GRID STATS (UNCHANGED)
 * ----------------------------- */
const gridStats = computed(() => {
  const map: Record<
    string,
    {
      count: number;
      scoreSum: number;
      scoreCount: number;
      minutes: number;
      covers: Cover[];
    }
  > = {};

  for (const e of filteredEntries.value) {
    const minutes = (e.progress ?? 0) * (e.duration ?? 0);
    const keys = [...(e.genres ?? []), ...(e.tags?.map((t) => t.name) ?? [])];

    for (const key of keys) {
      if (!map[key]) {
        map[key] = {
          count: 0,
          scoreSum: 0,
          scoreCount: 0,
          minutes: 0,
          covers: [],
        };
      }

      map[key].count++;
      map[key].minutes += minutes;

      if (e.score && e.score > 0) {
        map[key].scoreSum += e.score;
        map[key].scoreCount++;
      }

      if (e.id && e.coverImage) {
        const cover =
          typeof e.coverImage === "string"
            ? e.coverImage
            : e.coverImage.extraLarge ||
              e.coverImage.large ||
              e.coverImage.medium;

        if (cover && !map[key].covers.find((c) => c.id === e.id)) {
          map[key].covers.push({
            id: e.id,
            title: e.title?.english ?? e.title?.romaji ?? "Unknown title",
            cover,
            score: e.score ?? 0,
            minutes,
          });
        }
      }
    }
  }

  return Object.entries(map).map(([key, g]) => {
    const sortedCovers = [...g.covers].sort(
      (a, b) => b.score - a.score || b.minutes - a.minutes
    );

    return {
      genre: key,
      count: g.count,
      meanScore: g.scoreCount ? Math.round(g.scoreSum / g.scoreCount) : 0,
      minutesWatched: g.minutes,
      covers: sortedCovers,
    };
  });
});

/* -----------------------------
 * COMBINED GRID CARD (UNCHANGED)
 * ----------------------------- */
const combinedGridCard = computed(() => {
  if (!isCombinedMode.value) return null;

  let minutes = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  const covers: Cover[] = [];

  for (const e of filteredEntries.value) {
    const m = (e.progress ?? 0) * (e.duration ?? 0);
    minutes += m;

    if (e.score && e.score > 0) {
      scoreSum += e.score;
      scoreCount++;
    }

    if (e.id && e.coverImage) {
      const cover =
        typeof e.coverImage === "string"
          ? e.coverImage
          : e.coverImage.extraLarge ||
            e.coverImage.large ||
            e.coverImage.medium;

      if (cover && !covers.find((c) => c.id === e.id)) {
        covers.push({
          id: e.id,
          title: e.title?.english ?? e.title?.romaji ?? "Unknown title",
          cover,
          score: e.score ?? 0,
          minutes: m,
        });
      }
    }
  }

  covers.sort((a, b) => b.score - a.score || b.minutes - a.minutes);

  return {
    genre: [...selectedGenres.value, ...selectedTags.value].join(" + "),
    count: filteredEntries.value.length,
    meanScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
    minutesWatched: minutes,
    covers,
  };
});

/* -----------------------------
 * displayedGrid (UNCHANGED)
 * ----------------------------- */
const displayedGrid = computed(() => {
  if (combinedGridCard.value) return [combinedGridCard.value];

  const used = new Set<number>();

  return gridStats.value.map((g) => {
    if (!g.covers?.length) return g;

    const featured = g.covers.find((c) => !used.has(c.id)) ?? g.covers[0];
    used.add(featured.id);

    const rest = g.covers.filter((c) => c.id !== featured.id);

    return { ...g, covers: [featured, ...rest] };
  });
});

/* -----------------------------
 * Helpers
 * ----------------------------- */
function toggleGenre(g: string) {
  const i = selectedGenres.value.indexOf(g);
  i === -1 ? selectedGenres.value.push(g) : selectedGenres.value.splice(i, 1);
}

function toggleTag(t: string) {
  const i = selectedTags.value.indexOf(t);
  i === -1 ? selectedTags.value.push(t) : selectedTags.value.splice(i, 1);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-3xl font-bold">Combined</h1>

      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded w-full sm:w-44"
          placeholder="AniList Username"
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

    <!-- Genre Filter -->
    <div class="flex flex-wrap gap-2">
      <h2 class="w-full font-semibold">Genres</h2>
      <button
        v-for="g in allGenres"
        :key="g"
        @click="toggleGenre(g)"
        class="px-3 py-1.5 rounded-full text-xs border"
        :class="
          selectedGenres.includes(g)
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-zinc-900 text-zinc-300 border-zinc-800'
        "
      >
        {{ g }}
      </button>
    </div>

    <!-- TAG SEARCH -->
    <div class="space-y-2">
      <h2 class="font-semibold">Tags</h2>

      <input
        v-model="tagSearch"
        placeholder="Tag suchen…"
        class="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded"
      />

      <!-- Tags only visible when searching -->
      <div v-if="tagSearch.length" class="flex flex-wrap gap-2">
        <button
          v-for="t in filteredTags"
          :key="t"
          @click="toggleTag(t)"
          class="px-3 py-1.5 rounded-full text-xs border"
          :class="
            selectedTags.includes(t)
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800'
          "
        >
          {{ t }}
        </button>
      </div>
    </div>

    <!-- GRID -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <GenreCard
        v-for="(g, i) in displayedGrid"
        :key="g.genre"
        :rank="i + 1"
        :data="g"
      />
    </div>
  </div>
</template>
