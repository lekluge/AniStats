<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";

const { t } = useLocale();

const anilistUser = useCookie<string>("anilist-user", { default: () => "" });

type SeenFilter = "all" | "allUsers" | "noneUsers";
type FilterState = "include" | "exclude";

definePageMeta({ title: "Compare", middleware: "auth" });

const userInput = ref("");
const compareUsersCookie = useCookie<string[]>("compare-users", { default: () => [] });

const users = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const entriesByUser = ref<Record<string, AnimeEntry[]>>({});
const allAnime = ref<any[]>([]);

const search = ref("");
const seenFilter = ref<SeenFilter>("allUsers");

const pageSize = 50;
const currentPage = ref(1);

const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagMinRank = ref<Record<string, number>>({});
const tagSearch = ref("");

async function loadAllAnime() {
  const res = await api.get("/api/private/relations");

  allAnime.value = res.data.groups.flatMap((g: any) =>
    g.chain.map((c: any) => ({
      id: c.id,
      titleEn: c.titleEn ?? "",
      titleRo: c.titleRo ?? "",
      title: c.titleEn ?? c.titleRo ?? t("common.unknown"),
      cover: c.cover,
      genres: c.genres ?? [],
      tags: c.tags ?? [],
      related: c.related ?? [],
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
  try {
    const res = await api.post("/api/private/anilist", null, {
      params: { user: username },
    });

    entriesByUser.value[username] = normalizeAnilist(res.data.data.MediaListCollection.lists);
  } finally {
    loading.value = false;
  }
}

function tagBackground(tag: string) {
  if (tagStates.value[tag] !== "include") return "";

  const percent = tagMinRank.value[tag] ?? 0;
  return `linear-gradient(90deg, rgb(99 102 241) ${percent}%, rgb(24 24 27) ${percent}%)`;
}

const comparedAnime = computed(() => {
  const map = new Map<number, any>();

  for (const user of users.value) {
    for (const e of entriesByUser.value[user] ?? []) {
      if (!map.has(e.id)) {
        map.set(e.id, {
          id: e.id,
          titleEn: e.title?.english ?? "",
          titleRo: e.title?.romaji ?? "",
          title: e.title?.english ?? e.title?.romaji ?? t("common.unknown"),
          cover: typeof e.coverImage === "string" ? e.coverImage : e.coverImage?.medium,
          users: {},
        });
      }
      map.get(e.id).users[user] = e;
    }
  }

  return [...map.values()];
});

const allComparedAnime = computed(() => {
  const map = new Map<number, any>();

  for (const a of allAnime.value) {
    map.set(a.id, { ...a, users: {} });
  }

  for (const user of users.value) {
    for (const e of entriesByUser.value[user] ?? []) {
      const entry = map.get(e.id);
      if (entry) entry.users[user] = e;
    }
  }

  return [...map.values()];
});

const activeBase = computed(() =>
  seenFilter.value === "noneUsers" ? allComparedAnime.value : comparedAnime.value
);

const allGenres = computed(() => {
  const s = new Set<string>();
  allAnime.value.forEach((a: any) => {
    a.genres?.forEach((g: string) => s.add(g));
    a.related?.forEach((r: any) => r.genres?.forEach((g: string) => s.add(g)));
  });
  return [...s].sort();
});

const allTags = computed(() => {
  const s = new Set<string>();
  allAnime.value.forEach((a: any) => {
    a.tags?.forEach((tag: any) => s.add(tag.name));
    a.related?.forEach((r: any) => r.tags?.forEach((tag: any) => s.add(tag.name)));
  });
  return [...s].sort();
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

const filteredAnime = computed(() => {
  const q = search.value.toLowerCase();

  return activeBase.value.filter((a: any) => {
    if (q && !a.titleEn.toLowerCase().includes(q) && !a.titleRo.toLowerCase().includes(q)) return false;

    if (seenFilter.value === "allUsers") {
      if (!users.value.every((u) => a.users[u]?.status === "COMPLETED")) return false;
    }

    if (seenFilter.value === "noneUsers") {
      if (users.value.some((u) => a.users[u]?.status === "COMPLETED")) return false;
    }

    const genres = new Set<string>();
    const tagObjects: { name: string; rank?: number }[] = [];

    if (seenFilter.value === "noneUsers") {
      a.genres?.forEach((g: string) => genres.add(g));
      a.tags?.forEach((tag: any) => tagObjects.push(tag));

      a.related?.forEach((r: any) => {
        r.genres?.forEach((g: string) => genres.add(g));
        r.tags?.forEach((tag: any) => tagObjects.push(tag));
      });
    } else {
      Object.values(a.users).forEach((e: any) => {
        e.genres?.forEach((g: string) => genres.add(g));
        e.tags?.forEach((tag: any) => tagObjects.push(tag));
      });
    }

    for (const [g, s] of Object.entries(genreStates.value)) {
      if (s === "include" && !genres.has(g)) return false;
      if (s === "exclude" && genres.has(g)) return false;
    }

    for (const [tag, s] of Object.entries(tagStates.value)) {
      const minRank = tagMinRank.value[tag] ?? 0;

      const matching = tagObjects.find((entry) => entry.name === tag && (entry.rank ?? 0) >= minRank);

      if (s === "include" && !matching) return false;
      if (s === "exclude" && matching) return false;
    }

    return true;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAnime.value.length / pageSize)));

const paginatedAnime = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAnime.value.slice(start, start + pageSize);
});

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

    <div class="space-y-2">
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
          class="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700"
        >
          {{ u }}
          <button @click="removeUser(u)" class="text-zinc-400 hover:text-red-400">x</button>
        </div>
      </div>
    </div>

    <input v-model="search" :placeholder="t('common.animeSearchPlaceholder')" class="ui-input w-full px-4" />

    <div class="flex flex-col sm:flex-row gap-2">
      <button
        v-for="f in ['allUsers', 'all', 'noneUsers']"
        :key="f"
        @click="setSeenFilter(f as SeenFilter)"
        class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto transition"
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

    <div class="flex flex-wrap gap-2">
      <h2 class="w-full font-semibold">{{ t("nav.genres") }}</h2>
      <button
        v-for="g in allGenres"
        :key="g"
        @click="cycleState(genreStates, g)"
        class="px-3 py-2 sm:py-1.5 text-xs rounded-full border"
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
      <div v-for="tag in visibleTags" :key="tag" class="relative">
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

    <div class="text-sm text-zinc-400">{{ animeCount }} {{ t("compare.animeFound") }}</div>

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

    <div v-else class="space-y-3">
      <div
        v-for="a in paginatedAnime"
        :key="a.id"
        class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-3"
      >
        <div class="flex gap-3 items-start">
          <img v-if="a.cover" :src="a.cover" class="h-16 aspect-2/3 rounded object-cover shrink-0" />

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
          </div>
        </div>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="u in users"
            :key="u"
            class="rounded-lg border border-zinc-800 bg-zinc-900/30 p-2 text-sm"
          >
            <div class="text-xs text-zinc-400 mb-1">{{ u }}</div>

            <template v-if="a.users[u]">
              <div v-if="a.users[u].status === 'COMPLETED'" class="text-green-400">
                {{ t("compare.seen") }}
              </div>
              <div
                v-else
                :class="{
                  'text-blue-400': a.users[u].status === 'CURRENT',
                  'text-yellow-400': a.users[u].status === 'PLANNING',
                  'text-orange-400': a.users[u].status === 'PAUSED',
                  'text-red-400': a.users[u].status === 'DROPPED',
                }"
              >
                {{ a.users[u].status }}
              </div>
              <div class="text-xs text-zinc-400">{{ t("common.score") }}: {{ a.users[u].score || "-" }}</div>
            </template>

            <template v-else>
              <div class="text-zinc-500">{{ t("compare.notSeen") }}</div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!paginatedAnime.length" class="text-zinc-500">{{ t("common.noAnimeFound") }}</div>
    </div>
  </div>
</template>