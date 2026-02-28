<script setup lang="ts">
import { api } from "~/composables/useApi";
import type {
  ApiGenreTagsResponse,
  ApiRecommendationItem,
  ApiRecommendationResponse,
} from "~/types/api";

const { t } = useLocale();

type LayoutMode = "grid" | "list";
type Tab = "TV" | "MOVIE";
type FilterState = "include" | "exclude";
type TitleMode = "EN_FIRST" | "RO_FIRST";

const username = useAnilistUser();
const loading = ref(false);
const error = ref<string | null>(null);
const includeUpcoming = ref(true);

const layoutMode = ref<LayoutMode>("grid");
const activeTab = ref<Tab>("TV");
const titleMode = ref<TitleMode>("EN_FIRST");

const items = ref<{ TV: ApiRecommendationItem[]; MOVIE: ApiRecommendationItem[] }>({
  TV: [],
  MOVIE: [],
});

const CURRENT_YEAR = new Date().getFullYear();
const filterSeason = ref<string | null>(null);
const seasonYearMin = ref<number | null>(null);
const seasonYearMax = ref<number | null>(CURRENT_YEAR);
const episodesMin = ref<number | null>(null);
const episodesMax = ref<number | null>(null);
const averageScoreMin = ref<number | null>(null);

const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagSearch = ref("");

const allGenres = ref<string[]>([]);
const allTags = ref<string[]>([]);

definePageMeta({ title: "Recommendations", middleware: "auth" });

async function loadGenreTags() {
  if (!username.value) return;
  const res = await api.get<ApiGenreTagsResponse>("/api/private/genreTags");
  allGenres.value = res.data.genres;
  allTags.value = res.data.tags.map((tag) => tag.name);
}

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

async function loadRecommendations() {
  loading.value = true;
  error.value = null;

  try {
    if (!username.value) {
      loading.value = false;
      return;
    }

    const params: Record<string, string | number> = { user: username.value };
    if (includeUpcoming.value) params.includeUpcoming = "true";
    if (filterSeason.value) params.season = filterSeason.value;
    if (seasonYearMin.value) params.seasonYearMin = seasonYearMin.value;
    if (seasonYearMax.value) params.seasonYearMax = seasonYearMax.value;
    if (episodesMin.value) params.episodesMin = episodesMin.value;
    if (episodesMax.value) params.episodesMax = episodesMax.value;
    if (averageScoreMin.value) params.averageScoreMin = averageScoreMin.value;

    const includeGenres = Object.entries(genreStates.value)
      .filter(([, state]) => state === "include")
      .map(([genre]) => genre);
    const excludeGenres = Object.entries(genreStates.value)
      .filter(([, state]) => state === "exclude")
      .map(([genre]) => genre);
    const includeTags = Object.entries(tagStates.value)
      .filter(([, state]) => state === "include")
      .map(([tag]) => tag);
    const excludeTags = Object.entries(tagStates.value)
      .filter(([, state]) => state === "exclude")
      .map(([tag]) => tag);

    if (includeGenres.length) params.genres = includeGenres.join(",");
    if (excludeGenres.length) params.excludeGenres = excludeGenres.join(",");
    if (includeTags.length) params.tags = includeTags.join(",");
    if (excludeTags.length) params.excludeTags = excludeTags.join(",");

    const res = await api.get<ApiRecommendationResponse>("/api/private/recommendation", { params });
    items.value = res.data.items;
  } catch {
    error.value = `${t("common.errorPrefix")}: ${t("recommendation.loadError")}`;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadGenreTags();
  await loadRecommendations();
});

const currentItems = computed(() => items.value[activeTab.value] ?? []);

function cycleState(map: Record<string, FilterState>, key: string) {
  if (!map[key]) map[key] = "include";
  else if (map[key] === "include") map[key] = "exclude";
  else delete map[key];

  loadRecommendations();
}

function toggleTitleMode() {
  titleMode.value = titleMode.value === "EN_FIRST" ? "RO_FIRST" : "EN_FIRST";
}

function getTitleLines(item: ApiRecommendationItem): { primary: string; secondary: string | null } {
  const en = item.titleEn?.trim() || null;
  const ro = item.titleRo?.trim() || null;

  if (en && !ro) return { primary: en, secondary: null };
  if (ro && !en) return { primary: ro, secondary: null };

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
    <div class="page-header">
      <h1 class="text-3xl font-bold">{{ t("recommendation.title") }}</h1>

      <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div class="flex gap-2">
          <input
            v-model="username"
            class="ui-input"
            :placeholder="t('common.usernamePlaceholder')"
            @keydown.enter.prevent="loadRecommendations"
            @keydown.space.prevent="loadRecommendations"
          />
          <button @click="loadRecommendations" class="ui-btn ui-btn-primary" :disabled="loading">
            {{ t("common.load") }}
          </button>
        </div>

        <button
          @click="toggleTitleMode"
          class="ui-btn"
          :disabled="loading"
          :title="t('recommendation.toggleTitleMode')"
        >
          {{ titleMode === "EN_FIRST" ? "EN -> RO" : "RO -> EN" }}
        </button>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select v-model="filterSeason" class="ui-input">
        <option :value="null">{{ t("common.seasonAll") }}</option>
        <option value="SPRING">{{ t("common.spring") }}</option>
        <option value="SUMMER">{{ t("common.summer") }}</option>
        <option value="FALL">{{ t("common.fall") }}</option>
        <option value="WINTER">{{ t("common.winter") }}</option>
      </select>

      <input v-model.number="seasonYearMin" type="number" :placeholder="t('common.seasonYearMin')" class="ui-input" />

      <input
        v-model.number="seasonYearMax"
        type="number"
        :placeholder="`${t('common.seasonYearMax')} (${CURRENT_YEAR})`"
        class="ui-input"
      />

      <input v-model.number="episodesMin" type="number" :placeholder="t('common.minEpisodes')" class="ui-input" />

      <input v-model.number="episodesMax" type="number" :placeholder="t('common.maxEpisodes')" class="ui-input" />

      <input v-model.number="averageScoreMin" type="number" :placeholder="t('common.minAvgScore')" class="ui-input" />
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="includeUpcoming = !includeUpcoming; loadRecommendations();"
        class="px-3 py-2 text-xs rounded border transition"
        :class="
          includeUpcoming
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-zinc-900 text-zinc-300 border-zinc-800'
        "
      >
        {{ includeUpcoming ? t("common.includeUpcoming") : t("common.hideUpcoming") }}
      </button>

      <span class="text-xs text-zinc-500">{{ t("recommendation.upcomingHint") }}</span>
    </div>

    <div class="flex flex-wrap gap-2">
      <h2 class="w-full font-semibold">{{ t("nav.genres") }}</h2>
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

    <input v-model="tagSearch" :placeholder="t('common.searchTags')" class="ui-input w-full px-4" />

    <div v-if="tagSearch.trim() || selectedTags.length" class="flex flex-wrap gap-2">
      <button
        v-for="tag in visibleTags"
        :key="tag"
        @click="cycleState(tagStates, tag)"
        class="px-3 py-1.5 text-xs rounded-full border"
        :class="{
          'bg-indigo-600 text-white': tagStates[tag] === 'include',
          'bg-red-600 text-white': tagStates[tag] === 'exclude',
          'bg-zinc-900 text-zinc-300': !tagStates[tag],
        }"
      >
        {{ tag }}
      </button>
    </div>

    <div class="flex gap-2">
      <button
        v-for="tab in ['TV', 'MOVIE']"
        :key="tab"
        @click="activeTab = tab as Tab"
        class="px-4 py-2 rounded text-sm border"
        :class="activeTab === tab ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-900 text-zinc-300 border-zinc-800'"
      >
        {{ tab }}
      </button>
    </div>

    <div class="flex gap-2 justify-end">
      <button
        @click="layoutMode = 'grid'"
        class="px-3 py-2 text-xs rounded border"
        :class="layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-zinc-900'"
      >
        {{ t("common.grid") }}
      </button>
      <button
        @click="layoutMode = 'list'"
        class="px-3 py-2 text-xs rounded border"
        :class="layoutMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-zinc-900'"
      >
        {{ t("common.list") }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>

    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <div v-else-if="layoutMode === 'grid'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(a, i) in currentItems"
        :key="a.id"
        class="relative rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
      >
        <img v-if="a.cover" :src="a.cover" class="w-full aspect-2/3 object-cover" />
        <span
          class="absolute top-2 right-2 z-10 text-xs font-medium bg-indigo-800 text-indigo-100 px-2 py-1 rounded-full backdrop-blur-sm"
        >
          #{{ i + 1 }}
        </span>
        <div class="p-4 space-y-2">
          <a :href="anilistUrl(a.id)" target="_blank" class="block hover:underline hover:text-indigo-400">
            <div class="font-semibold leading-snug">{{ getTitleLines(a).primary }}</div>
            <div v-if="getTitleLines(a).secondary" class="text-sm text-zinc-400 leading-snug">
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
              v-for="tag in a.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs rounded bg-zinc-700/40 text-zinc-300"
            >
              <a :href="`https://anilist.co/search/anime/${encodeURIComponent(tag)}`" target="_blank" rel="noopener noreferrer">{{ tag }}</a>
            </span>
          </div>

          <div class="text-xs text-zinc-400">{{ t("recommendation.matchScore") }}: {{ a.score }}</div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="a in currentItems"
        :key="a.id"
        class="flex gap-3 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/30"
      >
        <img v-if="a.cover" :src="a.cover" class="h-14 aspect-2/3 rounded object-cover shrink-0" />

        <div class="flex-1 min-w-0">
          <a :href="anilistUrl(a.id)" target="_blank" class="block hover:underline hover:text-indigo-400">
            <div class="font-medium leading-snug">{{ getTitleLines(a).primary }}</div>
            <div v-if="getTitleLines(a).secondary" class="text-xs text-zinc-400 leading-snug">
              {{ getTitleLines(a).secondary }}
            </div>
          </a>

          <div class="flex flex-wrap gap-1 mt-1">
            <span v-for="g in a.genres" :key="g" class="text-xs text-indigo-400">{{ g }}</span>
          </div>
        </div>

        <span class="text-xs text-zinc-400 whitespace-nowrap">{{ a.score }}</span>
      </div>
    </div>
  </div>
</template>
