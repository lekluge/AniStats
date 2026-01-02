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
/* -----------------------------
 * Types
 * ----------------------------- */
type TagCover = {
  id: number;
  title: string;
  cover: string;
};

type LayoutMode = "grid" | "list";
type TagState = "include" | "exclude";
type TagSortMode = "count" | "minutes" | "score";

/* -----------------------------
 * State
 * ----------------------------- */
const username = useAnilistUser();
const loading = ref(false);
const error = ref<string | null>(null);
const entries = ref<AnimeEntry[]>([]);
const layoutMode = ref<LayoutMode>("grid");
const tagSortMode = ref<TagSortMode>("count");

definePageMeta({ title: "Tags" });

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
 * TAG STATE
 * ----------------------------- */
function applyQueryFilters() {
  const qLayout = route.query.layout;
  const qFilter = route.query.filter;
  const qType = route.query.filterType;
  const qMode = route.query.filterMode as TagState | undefined;

  if (qLayout === "list") {
    layoutMode.value = "list";
  }

  // Nur reagieren, wenn es wirklich ein Tag-Filter ist
  if (qType === "tag" && typeof qFilter === "string") {
    tagStates.value = {
      [qFilter]: qMode ?? "include",
    };
  }
}

const tagStates = ref<Record<string, TagState>>({});
const tagSearch = ref("");
const showAllTags = ref(false);

/* -----------------------------
 * TAG LIST
 * ----------------------------- */
const allTags = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) => e.tags?.forEach((t) => set.add(t.name)));
  return [...set].sort();
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

  const all = [...set].sort();
  if (showAllTags.value) return all;

  const pinned = selectedTags.value;
  const rest = all.filter((t) => !pinned.includes(t));

  return [...pinned, ...rest.slice(0, 40)];
});

/* -----------------------------
 * FILTERED ENTRIES
 * ----------------------------- */
const filteredEntries = computed(() => {
  return entries.value.filter((e) => {
    const tags = e.tags?.map((t) => t.name) ?? [];

    for (const [tag, state] of Object.entries(tagStates.value)) {
      if (state === "include" && !tags.includes(tag)) return false;
      if (state === "exclude" && tags.includes(tag)) return false;
    }

    return true;
  });
});

const includedTags = computed(() =>
  Object.entries(tagStates.value)
    .filter(([, s]) => s === "include")
    .map(([t]) => t)
);

const isCombinedMode = computed(() => includedTags.value.length > 1);

/* -----------------------------
 * GRID STATS
 * ----------------------------- */
const normalTagStats = computed(() => {
  const map: Record<
    string,
    {
      count: number;
      scoreSum: number;
      scoreCount: number;
      minutesWatched: number;
      covers: TagCover[];
    }
  > = {};

  for (const e of filteredEntries.value) {
    const minutes = (e.progress ?? 0) * (e.duration ?? 0);

    for (const tag of e.tags ?? []) {
      const name = tag.name;

      if (!map[name]) {
        map[name] = {
          count: 0,
          scoreSum: 0,
          scoreCount: 0,
          minutesWatched: 0,
          covers: [],
        };
      }

      map[name].count++;
      map[name].minutesWatched += minutes;

      if (e.score && e.score > 0) {
        map[name].scoreSum += e.score;
        map[name].scoreCount++;
      }

      const cover =
        typeof e.coverImage === "string"
          ? e.coverImage
          : e.coverImage?.extraLarge ||
            e.coverImage?.large ||
            e.coverImage?.medium;

      if (cover && !map[name].covers.some((c) => c.id === e.id)) {
        map[name].covers.push({
          id: e.id,
          title: e.title?.english ?? e.title?.romaji ?? "Unknown title",
          cover,
        });
      }
    }
  }

  return Object.entries(map).map(([tag, t]) => ({
    genre: tag,
    count: t.count,
    meanScore: t.scoreCount
      ? Math.round((t.scoreSum / t.scoreCount) * 10) / 10
      : 0,
    minutesWatched: t.minutesWatched,
    covers: t.covers,
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
  const covers: TagCover[] = [];

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
    genre: includedTags.value.join(" + "),
    count: filteredEntries.value.length,
    meanScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
    minutesWatched: minutes,
    covers,
  };
});

/* -----------------------------
 * SORTING
 * ----------------------------- */
function sortTags<T extends { count: number; minutesWatched: number }>(
  list: T[]
) {
  return [...list].sort((a, b) => {
    if (tagSortMode.value === "count") {
      return b.count - a.count;
    }
    if (tagSortMode.value === "score") {
      const aScore = (a as any).meanScore ?? 0;
      const bScore = (b as any).meanScore ?? 0;
      return bScore - aScore;
    }
    return b.minutesWatched - a.minutesWatched;
  });
}

/* -----------------------------
 * FEATURED COVER FIX + SORT
 * ----------------------------- */
const displayedTags = computed(() => {
  if (combinedStats.value) return [combinedStats.value];

  const sorted = sortTags(normalTagStats.value);
  const used = new Set<number>();

  return sorted.map((g) => {
    if (!g.covers?.length) return g;

    const featured = g.covers.find((c) => !used.has(c.id)) ?? g.covers[0];
    used.add(featured.id);

    return {
      ...g,
      covers: [featured, ...g.covers.filter((c) => c.id !== featured.id)],
    };
  });
});

/* -----------------------------
 * LIST MODE
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
function toggleTag(tag: string) {
  const current = tagStates.value[tag];

  if (!current) tagStates.value[tag] = "include";
  else if (current === "include") tagStates.value[tag] = "exclude";
  else delete tagStates.value[tag];
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <h1 class="text-3xl font-bold">Tags</h1>

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
        >
          Laden
        </button>
      </div>
    </div>

    <!-- Sort + Layout -->
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <button
          @click="tagSortMode = 'count'"
          class="px-3 py-2 text-xs rounded border"
          :class="
            tagSortMode === 'count'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-300'
          "
        >
          Anzahl
        </button>
        <button
          @click="tagSortMode = 'score'"
          class="px-3 py-2 text-xs rounded border"
          :class="
            tagSortMode === 'score'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-900 text-zinc-300'
          "
        >
          Score
        </button>
        <button
          @click="tagSortMode = 'minutes'"
          class="px-3 py-2 text-xs rounded border"
          :class="
            tagSortMode === 'minutes'
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

    <!-- Tag Search -->
    <input
      v-if="!loading"
      v-model="tagSearch"
      placeholder="Tags suchen…"
      class="w-full bg-zinc-900 border border-zinc-800 px-4 py-2 rounded"
    />

    <!-- Loading / Error -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500"
      />
    </div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- Tag Filter -->
    <div
      v-else-if="tagSearch.trim() || selectedTags.length"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="t in visibleTags"
        :key="t"
        @click="toggleTag(t)"
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
    <div
      v-if="!loading && !error && layoutMode === 'grid'"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <GameCard
        v-for="(g, i) in displayedTags"
        :key="g.genre"
        :rank="i + 1"
        :data="g"
        target="/tags"
        :filter="{
          key: 'filter',
          typeKey: 'filterType',
          typeValue: 'tag',
          modeKey: 'filterMode',
          modeValue: 'include',
        }"
      />
    </div>

    <!-- LIST -->
    <div v-else-if="!loading && !error">
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
