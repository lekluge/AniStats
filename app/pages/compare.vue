<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";

/* -----------------------------
 * Types
 * ----------------------------- */
type SeenFilter = "all" | "allUsers" | "noneUsers";
type FilterState = "include" | "exclude";

/* -----------------------------
 * State
 * ----------------------------- */
const userInput = ref("");
const users = ref<string[]>(["Tiggy", "Lichtgott"]);

const loading = ref(false);
const error = ref<string | null>(null);

const entriesByUser = ref<Record<string, AnimeEntry[]>>({});
const search = ref("");
const seenFilter = ref<SeenFilter>("all");

/* -----------------------------
 * Genre / Tag Filters
 * ----------------------------- */
const genreStates = ref<Record<string, FilterState>>({});
const tagStates = ref<Record<string, FilterState>>({});
const tagSearch = ref("");

/* -----------------------------
 * User Input
 * ----------------------------- */
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
    const res = await api.post("/api/anilist", null, {
      params: { user: username },
    });

    entriesByUser.value[username] = normalizeAnilist(
      res.data.data.MediaListCollection.lists
    );
  } catch {
    error.value = `Fehler beim Laden von ${username}`;
  } finally {
    loading.value = false;
  }
}

/* -----------------------------
 * API
 * ----------------------------- */
async function loadUsers() {
  loading.value = true;
  error.value = null;

  try {
    const results = await Promise.all(
      users.value.map((u) =>
        api.post("/api/anilist", null, { params: { user: u } })
      )
    );

    const map: Record<string, AnimeEntry[]> = {};
    users.value.forEach((u, i) => {
      map[u] = normalizeAnilist(
        results[i].data.data.MediaListCollection.lists
      );
    });

    entriesByUser.value = map;
  } finally {
    loading.value = false;
  }
}

/* -----------------------------
 * Build combined list
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

/* -----------------------------
 * Available Genres & Tags
 * ----------------------------- */
const allGenres = computed(() => {
  const s = new Set<string>();
  comparedAnime.value.forEach((a) =>
    Object.values(a.users).forEach((e: any) =>
      e.genres?.forEach((g: string) => s.add(g))
    )
  );
  return [...s].sort();
});

const allTags = computed(() => {
  const s = new Set<string>();
  comparedAnime.value.forEach((a) =>
    Object.values(a.users).forEach((e: any) =>
      e.tags?.forEach((t: any) => s.add(t.name))
    )
  );
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
  return [...set].sort((a, b) => a.localeCompare(b));
});

/* -----------------------------
 * Filter (Search + Seen + Genres + Tags)
 * ----------------------------- */
const filteredAnime = computed(() => {
  const q = search.value.toLowerCase();

  return comparedAnime.value.filter((a) => {
    const matchesSearch =
      !q ||
      a.titleEn.toLowerCase().includes(q) ||
      a.titleRo.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (seenFilter.value === "allUsers") {
      if (
        !users.value.every(
          (u) => a.users[u] && a.users[u].status === "COMPLETED"
        )
      )
        return false;
    }

    if (seenFilter.value === "noneUsers") {
      if (
        !users.value.every(
          (u) => !a.users[u] || a.users[u].status !== "COMPLETED"
        )
      )
        return false;
    }

    const genres = new Set<string>();
    const tags = new Set<string>();

    Object.values(a.users).forEach((e: any) => {
      e.genres?.forEach((g: string) => genres.add(g));
      e.tags?.forEach((t: any) => tags.add(t.name));
    });

    for (const [g, s] of Object.entries(genreStates.value)) {
      if (s === "include" && !genres.has(g)) return false;
      if (s === "exclude" && genres.has(g)) return false;
    }

    for (const [t, s] of Object.entries(tagStates.value)) {
      if (s === "include" && !tags.has(t)) return false;
      if (s === "exclude" && tags.has(t)) return false;
    }

    return true;
  });
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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-3xl font-bold">Compare Users</h1>

      <button
        @click="loadUsers"
        class="bg-indigo-600 px-4 py-2 rounded text-sm w-full sm:w-auto"
      >
        Compare
      </button>
    </div>

    <!-- User Input -->
    <div class="space-y-2">
      <input
        v-model="userInput"
        @keydown.space.prevent="addUser"
        @keydown.enter.prevent="addUser"
        placeholder="User eingeben + Leertaste"
        class="w-full bg-zinc-900 border border-zinc-800 px-4 py-2 rounded"
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
      class="w-full bg-zinc-900 border border-zinc-800 px-4 py-2 rounded"
    />

    <!-- Seen Filter -->
    <div class="flex flex-col sm:flex-row gap-2">
      <button
        v-for="f in ['all', 'allUsers', 'noneUsers']"
        :key="f"
        @click="seenFilter = f as any"
        class="px-3 py-2 sm:py-1 text-xs rounded border w-full sm:w-auto transition"
        :class="
          seenFilter === f
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-zinc-900 text-zinc-300 border-zinc-700'
        "
      >
        {{
          f === 'all'
            ? 'Alle Anime'
            : f === 'allUsers'
            ? 'Alle gesehen'
            : 'Keiner gesehen'
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
      class="w-full bg-zinc-900 border border-zinc-800 px-4 py-2 rounded"
    />

    <!-- Tags -->
    <div
      v-if="tagSearch.trim() || selectedTags.length"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="t in visibleTags"
        :key="t"
        @click="cycleState(tagStates, t)"
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

    <!-- Summary -->
    <div class="text-sm text-zinc-400">
      {{ animeCount }} Anime gefunden
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
        v-for="a in filteredAnime"
        :key="a.id"
        class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-3"
      >
        <!-- Header -->
        <div class="flex gap-3 items-start">
          <img
            v-if="a.cover"
            :src="a.cover"
            class="h-16 aspect-[2/3] rounded object-cover flex-shrink-0"
          />

          <div class="flex-1 min-w-0">
            <a
              :href="anilistUrl(a.id)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium break-words hover:underline hover:text-indigo-400"
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

      <div v-if="!filteredAnime.length" class="text-zinc-500">
        Keine Anime gefunden
      </div>
    </div>
  </div>
</template>
