<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";
import GameCard from "../components/GameCard.vue";
import { useRoute } from "vue-router";

const { t } = useLocale();
const route = useRoute();

const pageSize = 50;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(listAnime.value.length / pageSize)));
const paginatedListAnime = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return listAnime.value.slice(start, start + pageSize);
});

type Cover = {
  id: number;
  title: string;
  cover: string;
  score: number;
  minutes: number;
};

type LayoutMode = "grid" | "list";
type FilterState = "include" | "exclude";
type CombineSortMode = "count" | "minutes" | "score";

const username = useAnilistUser();
const loading = ref(false);
const entries = ref<AnimeEntry[]>([]);
const layoutMode = ref<LayoutMode>("grid");
const sortMode = ref<CombineSortMode>("count");

definePageMeta({ title: "Combine", middleware: "auth" });

async function loadAnime() {
  loading.value = true;
  try {
    if (!username.value) {
      loading.value = false;
      return;
    }

    const res = await api.post("/api/private/anilist", null, {
      params: { user: username.value },
    });
    entries.value = normalizeAnilist(res.data.data.MediaListCollection.lists);
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
    genreStates.value = { [qGenre]: "include" };
  }

  if (typeof qTag === "string") {
    tagStates.value = { [qTag]: "include" };
  }
}

watch(
  () => route.query,
  () => applyQueryFilters(),
  { deep: true }
);

const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagSearch = ref("");

const allGenres = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) => e.genres?.forEach((g) => set.add(g)));
  return [...set].sort();
});

const allTags = computed(() => {
  const set = new Set<string>();
  entries.value.forEach((e) => e.tags?.forEach((tag) => set.add(tag.name)));
  return [...set].sort();
});

const filteredTags = computed(() => {
  if (!tagSearch.value.trim()) return [];
  const q = tagSearch.value.toLowerCase();
  return allTags.value.filter((tag) => tag.toLowerCase().includes(q));
});

const selectedTags = computed(() => Object.keys(tagStates.value));

const visibleTags = computed(() => {
  const set = new Set<string>();
  selectedTags.value.forEach((tag) => set.add(tag));
  filteredTags.value.forEach((tag) => set.add(tag));
  return [...set].sort();
});

const filteredEntries = computed(() => {
  return entries.value.filter((e) => {
    const genres = e.genres ?? [];
    const tags = e.tags?.map((tag) => tag.name) ?? [];

    for (const [g, s] of Object.entries(genreStates.value)) {
      if (s === "include" && !genres.includes(g)) return false;
      if (s === "exclude" && genres.includes(g)) return false;
    }

    for (const [tag, s] of Object.entries(tagStates.value)) {
      if (s === "include" && !tags.includes(tag)) return false;
      if (s === "exclude" && tags.includes(tag)) return false;
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

const gridStats = computed(() => {
  const map: Record<
    string,
    {
      type: "genre" | "tag";
      count: number;
      scoreSum: number;
      scoreCount: number;
      minutesWatched: number;
      covers: Cover[];
    }
  > = {};

  for (const e of filteredEntries.value) {
    const minutes = (e.progress ?? 0) * (e.duration ?? 0);

    const keys = [
      ...(e.genres ?? []).map((g) => ({ key: g, type: "genre" as const })),
      ...(e.tags?.map((tag) => ({ key: tag.name, type: "tag" as const })) ?? []),
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
          : e.coverImage?.extraLarge || e.coverImage?.large || e.coverImage?.medium;

      if (cover && !map[key].covers.some((c) => c.id === e.id)) {
        map[key].covers.push({
          id: e.id,
          title: e.title?.english ?? e.title?.romaji ?? t("common.unknown"),
          cover,
          score: e.score ?? 0,
          minutes,
        });
      }
    }
  }

  return Object.entries(map).map(([key, g]) => ({
    genre: key,
    filterType: g.type,
    count: g.count,
    meanScore: g.scoreCount ? Math.round((g.scoreSum / g.scoreCount) * 10) / 10 : 0,
    minutesWatched: g.minutesWatched,
    covers: g.covers.sort((a, b) => b.score - a.score || b.minutes - a.minutes),
  }));
});

const combinedGridCard = computed(() => {
  if (!isCombinedMode.value) return null;

  let minutes = 0;
  let scoreSum = 0;
  let scoreCount = 0;
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
        : e.coverImage?.extraLarge || e.coverImage?.large || e.coverImage?.medium;

    if (cover && !covers.some((c) => c.id === e.id)) {
      covers.push({
        id: e.id,
        title: e.title?.english ?? e.title?.romaji ?? t("common.unknown"),
        cover,
        score: e.score ?? 0,
        minutes: m,
      });
    }
  }

  return {
    genre: includedFilters.value.join(" + "),
    count: filteredEntries.value.length,
    meanScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
    minutesWatched: minutes,
    covers,
  };
});

function sortGrid<T extends { count: number; minutesWatched: number }>(list: T[]) {
  return [...list].sort((a, b) => {
    if (sortMode.value === "count") return b.count - a.count;
    if (sortMode.value === "score") {
      const aScore = (a as any).meanScore ?? 0;
      const bScore = (b as any).meanScore ?? 0;
      return bScore - aScore;
    }
    return b.minutesWatched - a.minutesWatched;
  });
}

const displayedGrid = computed(() => {
  if (combinedGridCard.value) return [combinedGridCard.value];

  const sorted = sortGrid(gridStats.value);
  const used = new Set<number>();

  return sorted.map((entry) => {
    if (!entry.covers.length) return entry;

    const featured = entry.covers.find((c) => !used.has(c.id)) ?? entry.covers[0];
    used.add(featured.id);

    return {
      ...entry,
      covers: [featured, ...entry.covers.filter((c) => c.id !== featured.id)],
    };
  });
});

const listAnime = computed(() =>
  filteredEntries.value.map((e) => ({
    id: e.id,
    title: e.title?.english ?? e.title?.romaji ?? t("common.unknown"),
    cover: typeof e.coverImage === "string" ? e.coverImage : e.coverImage?.medium,
    score: e.score,
  }))
);

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
  <div class="page-shell">
    <div class="page-header">
      <h1 class="text-3xl font-bold">{{ t("combine.title") }}</h1>

      <div class="flex gap-2">
        <input
          v-model="username"
          class="ui-input"
          :placeholder="t('common.usernamePlaceholder')"
          @keydown.enter.prevent="loadAnime"
          @keydown.space.prevent="loadAnime"
        />
        <button @click="loadAnime" class="ui-btn ui-btn-primary" :disabled="loading">
          {{ t("common.load") }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <button
          @click="sortMode = 'count'"
          class="px-3 py-2 text-xs rounded border"
          :class="sortMode === 'count' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
        >
          {{ t("common.count") }}
        </button>
        <button
          @click="sortMode = 'score'"
          class="px-3 py-2 text-xs rounded border"
          :class="sortMode === 'score' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
        >
          {{ t("common.score") }}
        </button>
        <button
          @click="sortMode = 'minutes'"
          class="px-3 py-2 text-xs rounded border"
          :class="sortMode === 'minutes' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
        >
          {{ t("common.hours") }}
        </button>
      </div>

      <div class="flex gap-2">
        <button
          @click="layoutMode = 'grid'"
          class="px-3 py-2 text-xs rounded border"
          :class="layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
        >
          {{ t("common.grid") }}
        </button>
        <button
          @click="layoutMode = 'list'"
          class="px-3 py-2 text-xs rounded border"
          :class="layoutMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
        >
          {{ t("common.list") }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <h2 class="w-full font-semibold">{{ t("nav.genres") }}</h2>
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

    <input v-model="tagSearch" :placeholder="t('common.searchTags')" class="ui-input w-full px-4" />

    <div v-if="tagSearch.trim() || selectedTags.length" class="flex flex-wrap gap-2">
      <button
        v-for="tag in visibleTags"
        :key="tag"
        @click="cycleState(tagStates, tag)"
        class="px-3 py-2 rounded-full text-xs border"
        :class="{
          'bg-indigo-600 text-white': tagStates[tag] === 'include',
          'bg-red-600 text-white': tagStates[tag] === 'exclude',
          'bg-zinc-900 text-zinc-300': !tagStates[tag],
        }"
      >
        {{ tag }}
      </button>
    </div>

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

    <div v-else-if="layoutMode === 'list'">
      <div class="flex items-center justify-between text-sm mb-2">
        <button class="px-3 py-1 rounded border" :disabled="currentPage === 1" @click="currentPage--">
          &larr; {{ t("common.back") }}
        </button>

        <span>{{ t("common.page") }} {{ currentPage }} / {{ totalPages }}</span>

        <button class="px-3 py-1 rounded border" :disabled="currentPage === totalPages" @click="currentPage++">
          {{ t("common.next") }} &rarr;
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="a in paginatedListAnime"
          :key="a.id"
          class="flex gap-3 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/30"
        >
          <img v-if="a.cover" :src="a.cover" class="h-14 aspect-2/3 rounded object-cover shrink-0" />
          <a :href="anilistUrl(a.id)" target="_blank" class="flex-1 hover:underline hover:text-indigo-400">
            {{ a.title }}
          </a>
          <span class="text-xs text-zinc-400">{{ a.score || "-" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>