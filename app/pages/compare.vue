<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";

const anilistUser = useCookie<string>("anilist-user", {
  default: () => "",
});
/* -----------------------------
 * Types
 * ----------------------------- */
type SeenFilter = "all" | "allUsers" | "noneUsers";
type FilterState = "include" | "exclude";

/* -----------------------------
 * State
 * ----------------------------- */
definePageMeta({ title: 'Compare', middleware: "auth" })
const userInput = ref("");
const compareUsersCookie = useCookie<string[]>("compare-users", {
  default: () => [],
});

const users = ref<string[]>([]);

const loading = ref(false);
const error = ref<string | null>(null);

const entriesByUser = ref<Record<string, AnimeEntry[]>>({});
const allAnime = ref<any[]>([]);

const search = ref("");
const seenFilter = ref<SeenFilter>("allUsers");

/* -----------------------------
 * Pagination
 * ----------------------------- */
const pageSize = 50;
const currentPage = ref(1);

/* -----------------------------
 * Genre / Tag Filters
 * ----------------------------- */
const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagMinRank = ref<Record<string, number>>({});
const tagSearch = ref("");

/* -----------------------------
 * API
 * ----------------------------- */
async function loadAllAnime() {
  const res = await api.get("/api/private/relations");

  allAnime.value = res.data.groups.flatMap((g: any) =>
    g.chain.map((c: any) => ({
      id: c.id,
      titleEn: c.titleEn ?? "",
      titleRo: c.titleRo ?? "",
      title: c.titleEn ?? c.titleRo ?? "Unknown",
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

    entriesByUser.value[username] = normalizeAnilist(
      res.data.data.MediaListCollection.lists
    );
  } finally {
    loading.value = false;
  }
}

async function loadUsers() {
  loading.value = true;
  error.value = null;

  try {
    await loadAllAnime();

    const results = await Promise.all(
      users.value.map((u) =>
        api.post("/api/private/anilist", null, { params: { user: u } })
      )
    );

    const map: Record<string, AnimeEntry[]> = {};
    users.value.forEach((u, i) => {
      map[u] = normalizeAnilist(results[i].data.data.MediaListCollection.lists);
    });

    entriesByUser.value = map;
    currentPage.value = 1;
  } finally {
    loading.value = false;
  }
}
function tagBackground(tag: string) {
  if (tagStates.value[tag] !== "include") return "";

  const percent = tagMinRank.value[tag] ?? 0;
  return `linear-gradient(90deg, rgb(99 102 241) ${percent}%, rgb(24 24 27) ${percent}%)`;
}

/* -----------------------------
 * Build compared lists
 * ----------------------------- */
const comparedAnime = computed(() => {
  const map = new Map<number, any>();

  for (const user of users.value) {
    for (const e of entriesByUser.value[user] ?? []) {
      if (!map.has(e.id)) {
        map.set(e.id, {
          id: e.id,
          titleEn: e.title?.english ?? "",
          titleRo: e.title?.romaji ?? "",
          title: e.title?.english ?? e.title?.romaji ?? "Unknown",
          cover:
            typeof e.coverImage === "string"
              ? e.coverImage
              : e.coverImage?.medium,
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

/* -----------------------------
 * ACTIVE BASE
 * ----------------------------- */
const activeBase = computed(() =>
  seenFilter.value === "noneUsers"
    ? allComparedAnime.value
    : comparedAnime.value
);

/* -----------------------------
 * Genres & Tags (relations-based)
 * ----------------------------- */
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
    a.tags?.forEach((t: any) => s.add(t.name));
    a.related?.forEach((r: any) => r.tags?.forEach((t: any) => s.add(t.name)));
  });
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
 * Filtered Anime (inkl. Rank)
 * ----------------------------- */
const filteredAnime = computed(() => {
  const q = search.value.toLowerCase();

  return activeBase.value.filter((a: any) => {
    // 🔍 Suche
    if (
      q &&
      !a.titleEn.toLowerCase().includes(q) &&
      !a.titleRo.toLowerCase().includes(q)
    )
      return false;

    // 👀 Seen Filter
    if (seenFilter.value === "allUsers") {
      if (!users.value.every((u) => a.users[u]?.status === "COMPLETED"))
        return false;
    }

    if (seenFilter.value === "noneUsers") {
      if (users.value.some((u) => a.users[u]?.status === "COMPLETED"))
        return false;
    }

    // 🎭 Genres
    const genres = new Set<string>();

    // 🏷 Tags mit Rank
    const tagObjects: { name: string; rank?: number }[] = [];

    if (seenFilter.value === "noneUsers") {
      // 🌍 Basis: /api/relations
      a.genres?.forEach((g: string) => genres.add(g));
      a.tags?.forEach((t: any) => tagObjects.push(t));

      a.related?.forEach((r: any) => {
        r.genres?.forEach((g: string) => genres.add(g));
        r.tags?.forEach((t: any) => tagObjects.push(t));
      });
    } else {
      // 👤 Basis: Userliste
      Object.values(a.users).forEach((e: any) => {
        e.genres?.forEach((g: string) => genres.add(g));
        e.tags?.forEach((t: any) => tagObjects.push(t));
      });
    }

    // 🎭 Genre Filter
    for (const [g, s] of Object.entries(genreStates.value)) {
      if (s === "include" && !genres.has(g)) return false;
      if (s === "exclude" && genres.has(g)) return false;
    }

    // 🏷 Tag + Rank Filter
    for (const [t, s] of Object.entries(tagStates.value)) {
      const minRank = tagMinRank.value[t] ?? 0;

      const matching = tagObjects.find(
        (tag) => tag.name === t && (tag.rank ?? 0) >= minRank
      );

      if (s === "include" && !matching) return false;
      if (s === "exclude" && matching) return false;
    }

    return true;
  });
});

/* -----------------------------
 * Pagination
 * ----------------------------- */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAnime.value.length / pageSize))
);

const paginatedAnime = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAnime.value.slice(start, start + pageSize);
});

const animeCount = computed(() => filteredAnime.value.length);

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

function setSeenFilter(value: SeenFilter) {
  seenFilter.value = value
}

onMounted(async() => {
  await loadAllAnime();
  // 1️⃣ bestehende Compare-Users laden
  if (compareUsersCookie.value.length) {
    users.value = [...compareUsersCookie.value];
  }
  // 2️⃣ Fallback: globaler User
  else if (anilistUser.value) {
    users.value = [anilistUser.value];
  }
});
watch(
  users,
  async (list) => {
    for (const u of list) {
      if (!entriesByUser.value[u]) {
        await loadSingleUser(u);
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

<!-- TEMPLATE BLEIBT 1:1 UNVERÄNDERT -->

<!-- TEMPLATE BLEIBT 1:1 UNVERÄNDERT -->

<template>
  <div class="page-shell">
    <!-- Header -->
    <div class="page-header">
      <h1 class="text-3xl font-bold">Compare Users</h1>

      <!-- <button
        @click="loadUsers"
        class="bg-indigo-600 px-4 py-2 rounded text-sm w-full sm:w-auto"
      >
        Compare
      </button> -->
    </div>

    <!-- User Input -->
    <div class="space-y-2">
      <input
        v-model="userInput"
        @keydown.space.prevent="addUser"
        @keydown.enter.prevent="addUser"
        placeholder="User eingeben + Leertaste"
        class="ui-input w-full px-4"
      />

      <div class="flex flex-wrap gap-2">
        <div
          v-for="u in users"
          :key="u"
          class="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700"
        >
          {{ u }}
          <button
            @click="removeUser(u)"
            class="text-zinc-400 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Search -->
    <input
      v-model="search"
      placeholder="Anime suchen (English / Romaji)…"
      class="ui-input w-full px-4"
    />

    <!-- Seen Filter -->
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
            ? "Alle gesehen"
            : f === "all"
            ? "mind. einer gesehen"
            : "Keiner gesehen"
        }}
      </button>
    </div>

    <!-- Genres -->
    <div class="flex flex-wrap gap-2">
      <h2 class="w-full font-semibold">Genres</h2>
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

    <!-- Tag Search -->
    <input
      v-model="tagSearch"
      placeholder="Tags suchen…"
      class="ui-input w-full px-4"
    />

    <!-- Tags -->
    <div
      v-if="tagSearch.trim() || selectedTags.length"
      class="flex flex-wrap gap-2"
    >
      <div v-for="t in visibleTags" :key="t" class="relative">
        <!-- SLIDER BUTTON -->
        <input
          v-if="tagStates[t] === 'include'"
          type="range"
          min="0"
          max="100"
          step="5"
          :value="tagMinRank[t] ?? 0"
          @input="
            tagMinRank[t] = Number(($event.target as HTMLInputElement).value)
          "
          @mousedown.stop
          @pointerdown.stop
          @click.stop
          class="absolute inset-0 opacity-0 cursor-ew-resize"
        />

        <button
          @click="cycleState(tagStates, t)"
          class="px-3 py-2 text-xs rounded-full border transition select-none"
          :style="{ background: tagBackground(t) }"
          :class="{
            'text-white border-indigo-500': tagStates[t] === 'include',
            'bg-red-600 text-white border-red-600': tagStates[t] === 'exclude',
            'bg-zinc-900 text-zinc-300 border-zinc-700': !tagStates[t],
          }"
        >
          {{ t }}
          <span
            v-if="tagStates[t] === 'include'"
            class="ml-1 text-[10px] opacity-80"
          >
            {{ tagMinRank[t] ?? 0 }}%
          </span>
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div class="text-sm text-zinc-400">{{ animeCount }} Anime gefunden</div>

    <!-- Pagination -->
    <div class="flex items-center justify-between text-sm">
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

    <!-- States -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500"
      />
    </div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- Compare -->
    <div v-else class="space-y-3">
      <div
        v-for="a in paginatedAnime"
        :key="a.id"
        class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-3"
      >
        <!-- Header -->
        <div class="flex gap-3 items-start">
          <img
            v-if="a.cover"
            :src="a.cover"
            class="h-16 aspect-2/3 rounded object-cover shrink-0"
          />

          <div class="flex-1 min-w-0">
            <a
              :href="anilistUrl(a.id)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium wrap-break-word hover:underline hover:text-indigo-400"
            >
              {{ a.title }}
            </a>

            <div
              v-if="a.titleEn && a.titleRo && a.titleEn !== a.titleRo"
              class="text-xs text-zinc-500"
            >
              {{ a.titleRo }}
            </div>
          </div>
        </div>

        <!-- Users -->
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="u in users"
            :key="u"
            class="rounded-lg border border-zinc-800 bg-zinc-900/30 p-2 text-sm"
          >
            <div class="text-xs text-zinc-400 mb-1">{{ u }}</div>

            <template v-if="a.users[u]">
              <div
                v-if="a.users[u].status === 'COMPLETED'"
                class="text-green-400"
              >
                ✔ Gesehen
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
              <div class="text-xs text-zinc-400">
                Score: {{ a.users[u].score || "—" }}
              </div>
            </template>

            <template v-else>
              <div class="text-zinc-500">✖ Nicht gesehen</div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!paginatedAnime.length" class="text-zinc-500">
        Keine Anime gefunden
      </div>
    </div>
  </div>
</template>
