<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";
import GenreCard from "../components/GenreCard.vue";

/* -----------------------------
 * Types
 * ----------------------------- */
type TagCover = {
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
    entries.value = normalizeAnilist(
      res.data.data.MediaListCollection.lists
    );
  } catch (e: any) {
    error.value = e?.message ?? "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

onMounted(loadAnime);

/* -----------------------------
 * Tag Filter
 * ----------------------------- */
const selectedTags = ref<string[]>([]);
const tagSearch = ref("");
const showAllTags = ref(false);

const allTags = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) =>
    e.tags?.forEach((t) => set.add(t.name))
  );
  return [...set].sort();
});

const filteredTags = computed(() => {
  if (!tagSearch.value.trim()) return [];
  const q = tagSearch.value.toLowerCase();
  return allTags.value.filter((t) =>
    t.toLowerCase().includes(q)
  );
});

const visibleTags = computed(() => {
  if (showAllTags.value) return filteredTags.value;
  return filteredTags.value.slice(0, 40);
});

const filteredEntries = computed(() => {
  if (!selectedTags.value.length) return entries.value;

  return entries.value.filter((e) =>
    selectedTags.value.every((t) =>
      e.tags?.some((et) => et.name === t)
    )
  );
});

const isCombinedMode = computed(() => selectedTags.value.length > 1);

/* -----------------------------
 * GRID: Tag Ranking
 * ----------------------------- */
const normalTagStats = computed(() => {
  const map: Record<
    string,
    {
      count: number;
      scoreSum: number;
      scoreCount: number;
      minutes: number;
      covers: TagCover[];
    }
  > = {};

  for (const e of filteredEntries.value) {
    const minutes = (e.progress ?? 0) * (e.duration ?? 0);

    for (const tag of e.tags ?? []) {
      const tagName = tag.name;

      if (!map[tagName]) {
        map[tagName] = {
          count: 0,
          scoreSum: 0,
          scoreCount: 0,
          minutes: 0,
          covers: [],
        };
      }

      map[tagName].count++;
      map[tagName].minutes += minutes;

      if (e.score && e.score > 0) {
        map[tagName].scoreSum += e.score;
        map[tagName].scoreCount++;
      }

      if (e.id && e.coverImage) {
        const cover =
          typeof e.coverImage === "string"
            ? e.coverImage
            : e.coverImage.extraLarge ||
              e.coverImage.large ||
              e.coverImage.medium;

        if (
          cover &&
          !map[tagName].covers.some((c) => c.id === e.id)
        ) {
          map[tagName].covers.push({
            id: e.id,
            title:
              e.title?.english ??
              e.title?.romaji ??
              "Unknown title",
            cover,
          });
        }
      }
    }
  }

  return Object.entries(map).map(([tag, t]) => ({
    genre: tag,
    count: t.count,
    meanScore: t.scoreCount
      ? Math.round(t.scoreSum / t.scoreCount)
      : 0,
    minutesWatched: t.minutes,
    covers: t.covers,
  }));
});

/* -----------------------------
 * COMBINED
 * ----------------------------- */
const combinedStats = computed(() => {
  if (!isCombinedMode.value) return null;

  let minutes = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  const covers: TagCover[] = [];

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

      if (
        cover &&
        !covers.some((c) => c.id === e.id)
      ) {
        covers.push({
          id: e.id,
          title:
            e.title?.english ??
            e.title?.romaji ??
            "Unknown title",
          cover,
        });
      }
    }
  }

  return {
    genre: selectedTags.value.join(" + "),
    count: filteredEntries.value.length,
    meanScore: scoreCount
      ? Math.round(scoreSum / scoreCount)
      : 0,
    minutesWatched: minutes,
    covers,
  };
});

/* -----------------------------
 * displayedTags
 * ✅ FEATURED COVER FIX
 * ----------------------------- */
const displayedTags = computed(() => {
  if (combinedStats.value) return [combinedStats.value];

  const used = new Set<number>();

  return normalTagStats.value.map((g) => {
    if (!g.covers?.length) return g;

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
function toggleTag(tag: string) {
  const i = selectedTags.value.indexOf(tag);
  i === -1
    ? selectedTags.value.push(tag)
    : selectedTags.value.splice(i, 1);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-3xl font-bold">Tags</h1>

      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded w-full sm:w-44"
          placeholder="AniList Username"
        />
        <button
          @click="loadAnime"
          class="bg-indigo-600 px-4 py-2 rounded w-full sm:w-auto"
        >
          Laden
        </button>
      </div>
    </div>

    <!-- Layout Switch -->
    <div class="flex flex-col sm:flex-row sm:justify-end gap-2">
      <button
        @click="layoutMode = 'grid'"
        class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto"
        :class="layoutMode === 'grid'
          ? 'bg-indigo-600 text-white'
          : 'bg-zinc-900 text-zinc-300'"
      >
        Grid
      </button>
      <button
        @click="layoutMode = 'list'"
        class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto"
        :class="layoutMode === 'list'
          ? 'bg-indigo-600 text-white'
          : 'bg-zinc-900 text-zinc-300'"
      >
        List
      </button>
    </div>

    <!-- 🔍 TAG SEARCH -->
    <input
      v-model="tagSearch"
      placeholder="Tags suchen…"
      class="w-full bg-zinc-900 border border-zinc-800 px-4 py-2 rounded"
    />

    <!-- TAGS NUR BEI EINGABE -->
    <div
      v-if="tagSearch.trim()"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="t in visibleTags"
        :key="t"
        @click="toggleTag(t)"
        class="px-3 py-2 rounded-full text-xs border"
        :class="selectedTags.includes(t)
          ? 'bg-indigo-600 text-white'
          : 'bg-zinc-900 text-zinc-300'"
      >
        {{ t }}
      </button>

      <button
        v-if="filteredTags.length > 40"
        @click="showAllTags = !showAllTags"
        class="px-3 py-2 rounded-full text-xs bg-zinc-800 text-zinc-200"
      >
        {{ showAllTags ? "Weniger anzeigen" : "Mehr anzeigen" }}
      </button>

      <button
        v-if="selectedTags.length"
        @click="selectedTags = []"
        class="px-3 py-2 rounded-full text-xs bg-zinc-800 text-zinc-100"
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
        v-for="(g, i) in displayedTags"
        :key="g.genre"
        :rank="i + 1"
        :data="g"
      />
    </div>
  </div>
</template>
