<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";

/* -----------------------------
 * State
 * ----------------------------- */
const userInput = ref("");
const users = ref<string[]>(["Tiggy", "Lichtgott"]);

const loading = ref(false);
const error = ref<string | null>(null);

const entriesByUser = ref<Record<string, AnimeEntry[]>>({});

const search = ref("");

type SeenFilter = "all" | "allUsers";
const seenFilter = ref<SeenFilter>("all");

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
      map[u] = normalizeAnilist(results[i].data.data.MediaListCollection.lists);
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
 * Filter (Search + Seen)
 * ----------------------------- */
const filteredAnime = computed(() => {
  const q = search.value.toLowerCase();

  return comparedAnime.value.filter((a) => {
    // 🔍 Suche
    const matchesSearch =
      !q ||
      a.titleEn.toLowerCase().includes(q) ||
      a.titleRo.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const seenCount = users.value.filter((u) => a.users[u]).length;

    if (seenFilter.value === "all") return true;


    // ✅ NEU: Alle User müssen COMPLETED haben
    if (seenFilter.value === "allUsers") {
      return users.value.every(
        (u) => a.users[u] && a.users[u].status === "COMPLETED"
      );
    }

    return true;
  });
});

const animeCount = computed(() => filteredAnime.value.length);
function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Compare Users</h1>

      <button
        @click="loadUsers"
        class="bg-indigo-600 px-4 py-2 rounded text-sm"
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
    <div class="flex gap-2">
      <button
        v-for="f in ['all', 'allUsers']"
        :key="f"
        @click="seenFilter = f as any"
        class="px-3 py-1 text-xs rounded border transition"
        :class="
          seenFilter === f
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-900 text-zinc-300 border-zinc-700'
        "
      >
        {{
          f === "all" ? "Alle Anime" : "Alle gesehen"
        }}
      </button>
    </div>

    <!-- Summary -->
    <div class="text-sm text-zinc-400">{{ animeCount }} Anime gefunden</div>

    <!-- States -->
    <div v-if="loading" class="text-zinc-400">Lade Daten…</div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- Compare Table -->
    <div v-else class="space-y-2">
      <!-- Header -->
      <div
        class="grid gap-4 px-3 text-xs text-zinc-400"
        :style="{
          gridTemplateColumns: `48px 1fr repeat(${users.length}, 1fr)`,
        }"
      >
        <div></div>
        <div>Anime</div>
        <div v-for="u in users" :key="u">{{ u }}</div>
      </div>

      <!-- Rows -->
      <div
        v-for="a in filteredAnime"
        :key="a.id"
        class="grid gap-4 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/40"
        :style="{
          gridTemplateColumns: `48px 1fr repeat(${users.length}, 1fr)`,
        }"
      >
        <!-- Cover -->
        <img
          v-if="a.cover"
          :src="a.cover"
          class="h-14 aspect-2/3 rounded object-cover"
        />

        <!-- Title -->
        <div class="truncate font-medium">
          <a
          :href="anilistUrl(a.id)"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 truncate hover:underline hover:text-indigo-400 cursor-pointer"
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

        <!-- User Columns -->
        <div v-for="u in users" :key="u" class="text-sm">
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
  </div>
</template>
