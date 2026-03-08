<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";
import type {
  ApiAnilistResponse,
  ApiRelationGroup,
  ApiRelationItem,
  ApiRelationsResponse,
  CompareAnimeItem,
} from "~/types/api";

const { t } = useLocale();
const { theme } = useTheme();

const anilistUser = useCookie<string>("anilist-user", { default: () => "" });

type SeenFilter = "all" | "allUsers" | "noneUsers";
type FilterState = "include" | "exclude";
type CompareSortKey = "title" | "score" | "popularity" | "completedAt";
type SortDirection = "asc" | "desc";

definePageMeta({ title: "Compare", middleware: "auth" });

const userInput = ref("");
const compareUsersCookie = useCookie<string[]>("compare-users", { default: () => [] });

const users = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const entriesByUser = ref<Record<string, AnimeEntry[]>>({});
const allAnime = ref<CompareAnimeItem[]>([]);

const search = ref("");
const seenFilter = ref<SeenFilter>("allUsers");

const pageSize = 24;
const currentPage = ref(1);
const sortKey = ref<CompareSortKey>("popularity");
const sortDirection = ref<SortDirection>("desc");

const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagMinRank = ref<Record<string, number>>({});
const tagSearch = ref("");
const genrePageSize = 32;
const genreCurrentPage = ref(1);
const tagPageSize = 40;
const tagCurrentPage = ref(1);

function getEntryTitle(entry: AnimeEntry): { en: string; ro: string; display: string } {
  const en = entry.title.english ?? "";
  const ro = entry.title.romaji ?? "";
  return {
    en,
    ro,
    display: en || ro || t("common.unknown"),
  };
}

async function loadAllAnime() {
  const res = await api.get<ApiRelationsResponse>("/api/private/relations");

  allAnime.value = res.data.groups.flatMap((group: ApiRelationGroup) =>
    group.chain.map((chainItem) => ({
      id: chainItem.id,
      titleEn: chainItem.titleEn ?? "",
      titleRo: chainItem.titleRo ?? "",
      title: chainItem.titleEn ?? chainItem.titleRo ?? t("common.unknown"),
      cover: chainItem.cover,
      genres: chainItem.genres ?? [],
      tags: chainItem.tags ?? [],
      related: chainItem.related ?? [],
      users: {},
    }))
  );
}

async function addUser() {
  const name = userInput.value.trim();
  if (!name || users.value.includes(name)) return;

  users.value.push(name);
  userInput.value = "";

  await loadSingleUser(name);
}

function removeUser(name: string) {
  users.value = users.value.filter((u) => u !== name);
  delete entriesByUser.value[name];
}

async function loadSingleUser(username: string) {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.post<ApiAnilistResponse>("/api/private/anilist", null, {
      params: { user: username },
    });

    entriesByUser.value[username] = normalizeAnilist(res.data.data.MediaListCollection.lists);
  } catch {
    error.value = `${t("common.errorPrefix")}: ${t("compare.loadError")}`;
  } finally {
    loading.value = false;
  }
}

function tagBackground(tag: string) {
  if (tagStates.value[tag] !== "include") return "";

  const percent = tagMinRank.value[tag] ?? 0;
  return `linear-gradient(90deg, var(--primary) ${percent}%, var(--surface-muted) ${percent}%)`;
}

const comparedAnime = computed<CompareAnimeItem[]>(() => {
  const map = new Map<number, CompareAnimeItem>();

  for (const user of users.value) {
    for (const entry of entriesByUser.value[user] ?? []) {
      if (!map.has(entry.id)) {
        const title = getEntryTitle(entry);
        map.set(entry.id, {
          id: entry.id,
          titleEn: title.en,
          titleRo: title.ro,
          title: title.display,
          cover: entry.coverImage,
          genres: [],
          tags: [],
          related: [],
          users: {},
        });
      }
      map.get(entry.id)!.users[user] = entry;
    }
  }

  return [...map.values()];
});

const allComparedAnime = computed<CompareAnimeItem[]>(() => {
  const map = new Map<number, CompareAnimeItem>();

  for (const anime of allAnime.value) {
    map.set(anime.id, { ...anime, users: {} });
  }

  for (const user of users.value) {
    for (const entry of entriesByUser.value[user] ?? []) {
      const item = map.get(entry.id);
      if (item) item.users[user] = entry;
    }
  }

  return [...map.values()];
});

const activeBase = computed(() =>
  seenFilter.value === "noneUsers" ? allComparedAnime.value : comparedAnime.value
);

const allGenres = computed(() => {
  const set = new Set<string>();
  allAnime.value.forEach((anime) => {
    anime.genres.forEach((genre) => set.add(genre));
    anime.related.forEach((related) => related.genres.forEach((genre) => set.add(genre)));
  });
  return [...set].sort();
});

const allTags = computed(() => {
  const set = new Set<string>();
  allAnime.value.forEach((anime) => {
    anime.tags.forEach((tag) => set.add(tag.name));
    anime.related.forEach((related) => related.tags.forEach((tag) => set.add(tag.name)));
  });
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
const totalGenrePages = computed(() =>
  Math.max(1, Math.ceil(allGenres.value.length / genrePageSize))
);
const paginatedGenres = computed(() => {
  const start = (genreCurrentPage.value - 1) * genrePageSize;
  return allGenres.value.slice(start, start + genrePageSize);
});
const totalTagPages = computed(() =>
  Math.max(1, Math.ceil(visibleTags.value.length / tagPageSize))
);
const paginatedTags = computed(() => {
  const start = (tagCurrentPage.value - 1) * tagPageSize;
  return visibleTags.value.slice(start, start + tagPageSize);
});

const filteredAnime = computed(() => {
  const q = search.value.toLowerCase();

  return activeBase.value.filter((anime) => {
    if (
      q &&
      !anime.titleEn.toLowerCase().includes(q) &&
      !anime.titleRo.toLowerCase().includes(q)
    ) {
      return false;
    }

    if (seenFilter.value === "allUsers") {
      if (!users.value.every((user) => anime.users[user]?.status === "COMPLETED")) return false;
    }

    if (seenFilter.value === "noneUsers") {
      if (users.value.some((user) => anime.users[user]?.status === "COMPLETED")) return false;
    }

    const genres = new Set<string>();
    const tagObjects: Array<{ name: string; rank?: number }> = [];

    if (seenFilter.value === "noneUsers") {
      anime.genres.forEach((genre) => genres.add(genre));
      anime.tags.forEach((tag) => tagObjects.push(tag));

      anime.related.forEach((related: ApiRelationItem) => {
        related.genres.forEach((genre) => genres.add(genre));
        related.tags.forEach((tag) => tagObjects.push(tag));
      });
    } else {
      Object.values(anime.users).forEach((entry) => {
        entry.genres.forEach((genre) => genres.add(genre));
        entry.tags.forEach((tag) => tagObjects.push(tag));
      });
    }

    for (const [genre, state] of Object.entries(genreStates.value)) {
      if (state === "include" && !genres.has(genre)) return false;
      if (state === "exclude" && genres.has(genre)) return false;
    }

    for (const [tag, state] of Object.entries(tagStates.value)) {
      const minRank = tagMinRank.value[tag] ?? 0;
      const matching = tagObjects.find(
        (entry) => entry.name === tag && (entry.rank ?? 0) >= minRank
      );

      if (state === "include" && !matching) return false;
      if (state === "exclude" && matching) return false;
    }

    return true;
  });
});

function fuzzyDateToTs(date?: AnimeEntry["completedAt"]) {
  if (!date?.year) return 0;
  const month = Math.max((date.month ?? 1) - 1, 0);
  const day = Math.max(date.day ?? 1, 1);
  return Date.UTC(date.year, month, day);
}

function compareValues(a: number | string, b: number | string, direction: SortDirection) {
  if (typeof a === "string" && typeof b === "string") {
    const cmp = a.localeCompare(b, undefined, { sensitivity: "base" });
    return direction === "asc" ? cmp : -cmp;
  }

  const cmp = Number(a) - Number(b);
  return direction === "asc" ? cmp : -cmp;
}

function averageScore(anime: CompareAnimeItem) {
  const values = Object.values(anime.users)
    .map((entry) => Number(entry.score ?? 0))
    .filter((value) => value > 0);

  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function popularityCount(anime: CompareAnimeItem) {
  return Object.keys(anime.users).length;
}

function latestCompletedAt(anime: CompareAnimeItem) {
  return Object.values(anime.users).reduce((max, entry) => {
    const ts = fuzzyDateToTs(entry.completedAt);
    return Math.max(max, ts);
  }, 0);
}

const sortedAnime = computed(() => {
  return [...filteredAnime.value].sort((a, b) => {
    if (sortKey.value === "title") {
      return compareValues(a.title, b.title, sortDirection.value);
    }

    if (sortKey.value === "score") {
      return compareValues(averageScore(a), averageScore(b), sortDirection.value);
    }

    if (sortKey.value === "popularity") {
      return compareValues(popularityCount(a), popularityCount(b), sortDirection.value);
    }

    return compareValues(latestCompletedAt(a), latestCompletedAt(b), sortDirection.value);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedAnime.value.length / pageSize)));

const paginatedAnime = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedAnime.value.slice(start, start + pageSize);
});

watch(totalPages, (next) => {
  if (currentPage.value > next) currentPage.value = next;
});
watch(totalGenrePages, (next) => {
  if (genreCurrentPage.value > next) genreCurrentPage.value = next;
});
watch(totalTagPages, (next) => {
  if (tagCurrentPage.value > next) tagCurrentPage.value = next;
});
watch([search, seenFilter, sortKey, sortDirection], () => {
  currentPage.value = 1;
});
watch([tagSearch, selectedTags], () => {
  tagCurrentPage.value = 1;
});
watch([genreStates, tagStates], () => {
  currentPage.value = 1;
  genreCurrentPage.value = 1;
}, { deep: true });

const animeCount = computed(() => filteredAnime.value.length);

function cycleState(map: Record<string, FilterState>, key: string) {
  if (!map[key]) map[key] = "include";
  else if (map[key] === "include") map[key] = "exclude";
  else delete map[key];
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}

function setSeenFilter(value: SeenFilter) {
  seenFilter.value = value;
}

function statusLabel(status?: string) {
  if (!status) return t("compare.notSeen");
  if (status === "COMPLETED") return t("compare.seen");
  if (status === "CURRENT") return t("dashboard.watching");
  if (status === "PLANNING") return t("dashboard.planning");
  if (status === "PAUSED") return t("dashboard.paused");
  if (status === "DROPPED") return t("dashboard.dropped");
  if (status === "REPEATING") return t("dashboard.repeating");
  return status;
}

function statusBadgeClass(status?: string) {
  const isLight = theme.value === "light";
  if (!status) return isLight ? "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300" : "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20";
  if (status === "COMPLETED") return isLight ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300" : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
  if (status === "CURRENT") return isLight ? "bg-sky-100 text-sky-800 ring-1 ring-sky-300" : "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30";
  if (status === "PLANNING") return isLight ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300" : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
  if (status === "PAUSED") return isLight ? "bg-orange-100 text-orange-800 ring-1 ring-orange-300" : "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30";
  if (status === "DROPPED") return isLight ? "bg-rose-100 text-rose-800 ring-1 ring-rose-300" : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30";
  if (status === "REPEATING") return isLight ? "bg-violet-100 text-violet-800 ring-1 ring-violet-300" : "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30";
  return isLight ? "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300" : "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20";
}

function formattedAverageScore(anime: CompareAnimeItem) {
  const value = averageScore(anime);
  return value > 0 ? value.toFixed(1) : "-";
}

const userChipStyle = computed(() => ({
  background: "var(--surface-muted)",
  borderColor: "var(--border-strong)",
  color: "var(--text)",
}));

onMounted(async () => {
  await loadAllAnime();

  if (compareUsersCookie.value.length) {
    users.value = [...compareUsersCookie.value];
  } else if (anilistUser.value) {
    users.value = [anilistUser.value];
  }
});

watch(
  users,
  async (list) => {
    for (const user of list) {
      if (!entriesByUser.value[user]) {
        await loadSingleUser(user);
      }
    }
  },
  { immediate: true }
);

watch(
  users,
  (list) => {
    compareUsersCookie.value = list;
  },
  { deep: true }
);
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <h1 class="text-3xl font-bold">{{ t("compare.title") }}</h1>
    </div>

    <section class="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-3">
      <input
        v-model="userInput"
        @keydown.space.prevent="addUser"
        @keydown.enter.prevent="addUser"
        :placeholder="t('compare.userInputPlaceholder')"
        class="ui-input w-full px-4"
      />

      <div class="flex flex-wrap gap-2">
        <div
          v-for="u in users"
          :key="u"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
          :style="userChipStyle"
        >
          <span>{{ u }}</span>
          <button @click="removeUser(u)" class="text-zinc-500 hover:text-rose-500">x</button>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-3">
      <input v-model="search" :placeholder="t('common.animeSearchPlaceholder')" class="ui-input w-full px-4" />

      <div class="flex flex-col sm:flex-row gap-2">
        <button
          v-for="f in ['allUsers', 'all', 'noneUsers']"
          :key="f"
          @click="setSeenFilter(f as SeenFilter)"
          class="px-3 py-2 sm:py-1.5 text-xs rounded-md border w-full sm:w-auto transition"
          :class="
            seenFilter === f
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-zinc-900 text-zinc-300 border-zinc-700'
          "
        >
          {{
            f === "allUsers"
              ? t("compare.seenAllUsers")
              : f === "all"
                ? t("compare.seenAnyUser")
                : t("compare.seenNone")
          }}
        </button>
      </div>

      <div class="space-y-2">
        <h2 class="text-sm font-semibold text-zinc-300">{{ t("nav.genres") }}</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="g in paginatedGenres"
            :key="g"
            @click="cycleState(genreStates, g)"
            class="px-3 py-1.5 text-xs rounded-full border"
            :class="{
              'bg-indigo-600 text-white border-indigo-500': genreStates[g] === 'include',
              'bg-red-600 text-white border-red-500': genreStates[g] === 'exclude',
              'bg-zinc-900 text-zinc-300 border-zinc-700': !genreStates[g],
            }"
          >
            {{ g }}
          </button>
        </div>
        <div class="flex items-center justify-between text-xs" v-if="totalGenrePages > 1">
          <button class="px-2 py-1 rounded border" :disabled="genreCurrentPage === 1" @click="genreCurrentPage--">
            &larr; {{ t("common.back") }}
          </button>
          <span>{{ t("common.page") }} {{ genreCurrentPage }} / {{ totalGenrePages }}</span>
          <button class="px-2 py-1 rounded border" :disabled="genreCurrentPage === totalGenrePages" @click="genreCurrentPage++">
            {{ t("common.next") }} &rarr;
          </button>
        </div>
      </div>

      <input v-model="tagSearch" :placeholder="t('common.searchTags')" class="ui-input w-full px-4" />

      <div v-if="tagSearch.trim() || selectedTags.length" class="flex flex-wrap gap-2">
        <div v-for="tag in paginatedTags" :key="tag" class="relative">
          <input
            v-if="tagStates[tag] === 'include'"
            type="range"
            min="0"
            max="100"
            step="5"
            :value="tagMinRank[tag] ?? 0"
            @input="tagMinRank[tag] = Number(($event.target as HTMLInputElement).value)"
            @mousedown.stop
            @pointerdown.stop
            @click.stop
            class="absolute inset-0 opacity-0 cursor-ew-resize"
          />

          <button
            @click="cycleState(tagStates, tag)"
            class="px-3 py-2 text-xs rounded-full border transition select-none"
            :style="{ background: tagBackground(tag) }"
            :class="{
              'text-white border-indigo-500': tagStates[tag] === 'include',
              'bg-red-600 text-white border-red-600': tagStates[tag] === 'exclude',
              'bg-zinc-900 text-zinc-300 border-zinc-700': !tagStates[tag],
            }"
          >
            {{ tag }}
            <span v-if="tagStates[tag] === 'include'" class="ml-1 text-[10px] opacity-80">
              {{ tagMinRank[tag] ?? 0 }}%
            </span>
          </button>
        </div>
      </div>
      <div v-if="(tagSearch.trim() || selectedTags.length) && totalTagPages > 1" class="flex items-center justify-between text-xs">
        <button class="px-2 py-1 rounded border" :disabled="tagCurrentPage === 1" @click="tagCurrentPage--">
          &larr; {{ t("common.back") }}
        </button>
        <span>{{ t("common.page") }} {{ tagCurrentPage }} / {{ totalTagPages }}</span>
        <button class="px-2 py-1 rounded border" :disabled="tagCurrentPage === totalTagPages" @click="tagCurrentPage++">
          {{ t("common.next") }} &rarr;
        </button>
      </div>
    </section>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="text-sm text-zinc-400">{{ animeCount }} {{ t("compare.animeFound") }}</div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select v-model="sortKey" class="ui-input text-sm">
          <option value="popularity">{{ t("common.popularity") }}</option>
          <option value="score">{{ t("common.score") }}</option>
          <option value="completedAt">{{ t("common.completedDate") }}</option>
          <option value="title">{{ t("common.title") }}</option>
        </select>
        <button
          class="ui-btn text-xs"
          @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
        >
          {{ sortDirection === "asc" ? t("common.sortAsc") : t("common.sortDesc") }}
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between text-sm">
      <button class="px-3 py-1 rounded border" :disabled="currentPage === 1" @click="currentPage--">
        &larr; {{ t("common.back") }}
      </button>

      <span>{{ t("common.page") }} {{ currentPage }} / {{ totalPages }}</span>

      <button class="px-3 py-1 rounded border" :disabled="currentPage === totalPages" @click="currentPage++">
        {{ t("common.next") }} &rarr;
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <div v-else class="space-y-4">
      <div
        v-for="a in paginatedAnime"
        :key="a.id"
        class="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)] space-y-3"
      >
        <div class="flex gap-3 items-start justify-between">
          <div class="flex gap-3 min-w-0">
            <ImageWithLoader v-if="a.cover" :src="a.cover" :alt="a.title" class="h-20 aspect-2/3 rounded-lg shrink-0" />

            <div class="flex-1 min-w-0">
              <a
                :href="anilistUrl(a.id)"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium wrap-break-word hover:underline hover:text-indigo-400"
              >
                {{ a.title }}
              </a>

              <div v-if="a.titleEn && a.titleRo && a.titleEn !== a.titleRo" class="text-xs text-zinc-500">
                {{ a.titleRo }}
              </div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span class="inline-flex rounded-md px-2 py-0.5 text-[11px] bg-zinc-800/70 text-zinc-300">
                  {{ t("common.popularity") }}: {{ popularityCount(a) }}
                </span>
                <span class="inline-flex rounded-md px-2 py-0.5 text-[11px] bg-zinc-800/70 text-zinc-300">
                  {{ t("common.score") }}: {{ formattedAverageScore(a) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="u in users"
            :key="u"
            class="rounded-xl border border-zinc-800 bg-zinc-950/35 p-2.5 text-sm"
          >
            <div class="mb-1 flex items-center justify-between gap-2">
              <div class="text-xs text-zinc-400 truncate">{{ u }}</div>
              <span class="inline-flex rounded-md px-2 py-0.5 text-[11px]" :class="statusBadgeClass(a.users[u]?.status)">
                {{ statusLabel(a.users[u]?.status) }}
              </span>
            </div>

            <template v-if="a.users[u]">
              <div class="text-xs text-zinc-400">{{ t("common.score") }}: {{ a.users[u].score || "-" }}</div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!paginatedAnime.length" class="text-zinc-500">{{ t("common.noAnimeFound") }}</div>
    </div>
  </div>
</template>
