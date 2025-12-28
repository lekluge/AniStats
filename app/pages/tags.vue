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
type TagState = "include" | "exclude";

/* -----------------------------
 * State
 * ----------------------------- */
const username = ref("Tiggy");
const loading = ref(false);
const error = ref<string | null>(null);
const entries = ref<AnimeEntry[]>([]);
const layoutMode = ref<LayoutMode>("grid");
definePageMeta({ title: 'Tags' })
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
 * TAG STATE (3-STATE)
 * ----------------------------- */
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

/* 🔑 ausgewählte Tags */
const selectedTags = computed(() => Object.keys(tagStates.value));

/* 🔑 sichtbare Tags */
const visibleTags = computed(() => {
  const set = new Set<string>();

  selectedTags.value.forEach((t) => set.add(t));
  filteredTags.value.forEach((t) => set.add(t));

  const all = [...set].sort((a, b) => a.localeCompare(b));

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
      minutes: number;
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
          minutes: 0,
          covers: [],
        };
      }

      map[name].count++;
      map[name].minutes += minutes;

      if (e.score && e.score > 0) {
        map[name].scoreSum += e.score;
        map[name].scoreCount++;
      }

      const cover =
        typeof e.coverImage === "string"
          ? e.coverImage
          : e.coverImage.extraLarge ||
            e.coverImage.large ||
            e.coverImage.medium;

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
    meanScore: t.scoreCount ? Math.round(t.scoreSum / t.scoreCount) : 0,
    minutesWatched: t.minutes,
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
        : e.coverImage.extraLarge || e.coverImage.large || e.coverImage.medium;

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
 * FEATURED COVER FIX
 * ----------------------------- */
const displayedTags = computed(() => {
  if (combinedStats.value) return [combinedStats.value];

  const used = new Set<number>();

  return normalTagStats.value.map((g) => {
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

    <!-- Tag Search -->
    <input
      v-if="!loading"
      v-model="tagSearch"
      placeholder="Tags suchen…"
      class="w-full bg-zinc-900 border border-zinc-800 px-4 py-2 rounded"
    />

    <!-- 🔑 States -->
    <!-- 🔑 Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500"
      />
    </div>

    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- Tags -->
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
      <GenreCard
        v-for="(g, i) in displayedTags"
        :key="g.genre"
        :rank="i + 1"
        :data="g"
      />
    </div>

    <!-- LIST -->
    <div v-else-if="!loading && !error" class="space-y-2">
      <div
        v-for="a in listAnime"
        :key="a.id"
        class="flex gap-3 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/30"
      >
        <img
          v-if="a.cover"
          :src="a.cover"
          class="h-14 aspect-[2/3] rounded object-cover flex-shrink-0"
        />
        <a
          :href="anilistUrl(a.id)"
          target="_blank"
          class="flex-1 min-w-0 break-words hover:underline"
        >
          {{ a.title }}
        </a>
        <span class="text-xs text-zinc-400 whitespace-nowrap">
          {{ a.score || "—" }}
        </span>
      </div>
    </div>
  </div>
</template>
