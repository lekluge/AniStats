<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";
import GenreCard from "../components/GenreCard.vue";

/* -----------------------------
 * Types
 * ----------------------------- */
type GenreCover = {
  id: number;
  title: string;
  cover: string;
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
 * Genre Filter
 * ----------------------------- */
const selectedGenres = ref<string[]>([]);

const allGenres = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) => e.genres?.forEach((g) => set.add(g)));
  return [...set].sort();
});

const filteredEntries = computed(() => {
  if (!selectedGenres.value.length) return entries.value;
  return entries.value.filter((e) =>
    selectedGenres.value.every((g) => e.genres?.includes(g))
  );
});

const isCombinedMode = computed(() => selectedGenres.value.length > 1);

/* -----------------------------
 * GRID: Genre Ranking
 * ----------------------------- */
const normalGenreStats = computed(() => {
  const map: Record<
    string,
    {
      count: number;
      scoreSum: number;
      scoreCount: number;
      minutes: number;
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
          minutes: 0,
          covers: [],
        };
      }

      map[genre].count++;
      map[genre].minutes += minutes;

      if (e.score && e.score > 0) {
        map[genre].scoreSum += e.score;
        map[genre].scoreCount++;
      }

      if (e.id && e.coverImage) {
        const cover =
          typeof e.coverImage === "string"
            ? e.coverImage
            : e.coverImage.extraLarge ||
              e.coverImage.large ||
              e.coverImage.medium;

        if (cover && !map[genre].covers.find((c) => c.id === e.id)) {
          map[genre].covers.push({
            id: e.id,
            title: e.title?.english ?? e.title?.romaji ?? "Unknown title",
            cover,
          });
        }
      }
    }
  }

  return Object.entries(map).map(([genre, g]) => ({
    genre,
    count: g.count,
    meanScore: g.scoreCount ? Math.round(g.scoreSum / g.scoreCount) : 0,
    minutesWatched: g.minutes,
    covers: g.covers,
  }));
});

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
        });
      }
    }
  }

  return {
    genre: selectedGenres.value.join(" + "),
    count: filteredEntries.value.length,
    meanScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
    minutesWatched: minutes,
    covers,
  };
});

/* -----------------------------
 * displayedGenres
 * ✅ FIX: unique featured cover per card
 * ----------------------------- */
const displayedGenres = computed(() => {
  if (combinedStats.value) return [combinedStats.value];

  const used = new Set<number>();

  return normalGenreStats.value.map((g) => {
    if (!g.covers.length) return g;

    const featured =
      g.covers.find((c) => !used.has(c.id)) ?? g.covers[0];

    used.add(featured.id);

    const rest = g.covers.filter((c) => c.id !== featured.id);

    return {
      ...g,
      covers: [featured, ...rest],
    };
  });
});

/* -----------------------------
 * Helpers
 * ----------------------------- */
function toggleGenre(genre: string) {
  const i = selectedGenres.value.indexOf(genre);
  i === -1 ? selectedGenres.value.push(genre) : selectedGenres.value.splice(i, 1);
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-3xl font-bold">Genres</h1>

      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded w-full sm:w-44"
          placeholder="AniList Username"
        />
        <button
          @click="loadAnime"
          class="bg-indigo-600 px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50"
          :disabled="loading"
        >
          Laden
        </button>
      </div>
    </div>

    <!-- States -->
    <div v-if="loading" class="text-zinc-400">Lade AniList Daten…</div>
    <div v-else-if="error" class="text-red-400">Fehler: {{ error }}</div>

    <template v-else>
      <!-- Layout Switch -->
      <div class="flex flex-col sm:flex-row sm:justify-end gap-2">
        <button
          @click="layoutMode = 'grid'"
          class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto"
          :class="
            layoutMode === 'grid'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800'
          "
        >
          Grid
        </button>
        <button
          @click="layoutMode = 'list'"
          class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto"
          :class="
            layoutMode === 'list'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800'
          "
        >
          List
        </button>
      </div>

      <!-- Genre Filter -->
      <div class="flex flex-wrap gap-2">
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

        <button
          v-if="selectedGenres.length"
          @click="selectedGenres = []"
          class="px-3 py-1.5 rounded-full text-xs bg-zinc-800 text-zinc-100"
        >
          Reset
        </button>
      </div>

      <!-- GRID -->
      <div
        v-if="layoutMode === 'grid'"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <GenreCard
          v-for="(g, i) in displayedGenres"
          :key="g.genre"
          :rank="i + 1"
          :data="g"
        />
      </div>
    </template>
  </div>
</template>
