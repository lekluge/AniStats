<script setup lang="ts">
import { api } from "~/composables/useApi";

/* -----------------------------
 * State
 * ----------------------------- */
const username = ref("Lichtgott");
const loading = ref(false);
const error = ref<string | null>(null);
const groups = ref<any[]>([]);

/* -----------------------------
 * Search
 * ----------------------------- */
const search = ref("");

function matchesQuery(query: string, en?: string | null, ro?: string | null) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (en && en.toLowerCase().includes(q)) || (ro && ro.toLowerCase().includes(q))
  );
}

/* -----------------------------
 * Load Relations + User List
 * ----------------------------- */
async function loadRelations() {
  loading.value = true;
  error.value = null;

  try {
    // 1) Userliste
    const userRes = await api.get("/api/anilist-user-list", {
      params: { user: username.value },
    });
    const statusMap: Record<number, string> = userRes.data?.statusMap ?? {};

    // 2) Alle Franchises
    const relRes = await api.get("/api/relations");
    const allGroups = relRes.data?.groups ?? [];

    // 3) Filtern: irgendeine ID bekannt?
    const visibleGroups = allGroups.filter((g: any) => {
      // Root
      if (statusMap[g.rootId]) return true;

      // Chain
      for (const c of g.chain) {
        if (statusMap[c.id]) return true;

        // Related unter Chain
        for (const r of c.related ?? []) {
          if (statusMap[r.id]) return true;
        }
      }

      return false;
    });

    // 4) Status nur ANREICHERN (Anzeige!)
    groups.value = visibleGroups.map((g: any) => ({
      ...g,
      rootStatus: statusMap[g.rootId],
      chain: g.chain.map((c: any) => ({
        ...c,
        status: statusMap[c.id],
        related: (c.related ?? []).map((r: any) => ({
          ...r,
          status: statusMap[r.id],
        })),
      })),
    }));
  } catch (e: any) {
    error.value = e?.message ?? "Fehler beim Laden";
  } finally {
    loading.value = false;
  }
}

onMounted(loadRelations);

/* -----------------------------
 * Search-filtered Groups
 * ----------------------------- */
const filteredGroups = computed(() => {
  if (!search.value) return groups.value;

  return groups.value.filter((g: any) => {
    if (matchesQuery(search.value, g.chain[0]?.titleEn, g.chain[0]?.titleRo))
      return true;

    for (const c of g.chain) {
      if (matchesQuery(search.value, c.titleEn, c.titleRo)) return true;

      for (const r of c.related ?? []) {
        if (matchesQuery(search.value, r.titleEn, r.titleRo)) return true;
      }
    }

    return false;
  });
});

const groupCount = computed(() => filteredGroups.value.length);

/* -----------------------------
 * UI Helpers
 * ----------------------------- */
function statusColor(status?: string) {
  switch (status) {
    case "COMPLETED":
      return "text-green-400";
    case "CURRENT":
      return "text-blue-400";
    case "PLANNING":
      return "text-yellow-400";
    case "PAUSED":
      return "text-orange-400";
    case "DROPPED":
      return "text-red-400";
    default:
      return "text-zinc-500";
  }
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}

function displayTitle(en?: string | null, ro?: string | null) {
  return en || ro || "—";
}

function showRomaji(en?: string | null, ro?: string | null) {
  return !!en && !!ro && en !== ro;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4">
      <h1 class="text-3xl font-bold">Anime Relations</h1>

      <div class="flex gap-2 items-center">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded text-sm w-40"
          placeholder="AniList User"
        />

        <button
          @click="loadRelations"
          class="bg-indigo-600 px-4 py-2 rounded text-sm"
        >
          Laden
        </button>
      </div>
    </div>

    <!-- Search -->
    <input
      v-model="search"
      placeholder="Anime suchen (English / Romaji)…"
      class="w-full bg-zinc-900 border border-zinc-800 px-4 py-2 rounded"
    />

    <!-- Summary -->
    <div class="text-sm text-zinc-400">
      {{ groupCount }} Franchises gefunden
    </div>

    <!-- States -->
    <div v-if="loading" class="text-zinc-400">Lade…</div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- Groups -->
    <div v-else class="space-y-4">
      <div
        v-for="group in filteredGroups"
        :key="group.rootId"
        class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4"
      >
        <!-- Chain -->
        <div class="pl-4 space-y-4 text-sm">
          <div v-for="item in group.chain" :key="item.id" class="space-y-2">
            <div class="flex items-center gap-3">
              <img
                v-if="item.cover"
                :src="item.cover"
                class="h-24 aspect-[2/3] rounded object-cover"
              />

              <a
                :href="anilistUrl(item.id)"
                target="_blank"
                class="flex-1 truncate hover:text-indigo-400"
              >
                {{ displayTitle(item.titleEn, item.titleRo) }}
              </a>

              <span class="text-xs" :class="statusColor(item.status)">
                {{ item.status ?? "—" }}
              </span>
            </div>

            <!-- Related -->
            <div
              v-if="item.related?.length"
              class="pl-8 space-y-1 text-xs text-zinc-400"
            >
              <div
                v-for="r in item.related"
                :key="r.id"
                class="flex items-center gap-2"
              >
                <img
                  v-if="r.cover"
                  :src="r.cover"
                  class="h-12 aspect-[2/3] rounded object-cover opacity-80"
                />

                <a
                  :href="anilistUrl(r.id)"
                  target="_blank"
                  class="truncate hover:text-indigo-400"
                >
                  {{ displayTitle(r.titleEn, r.titleRo) }}
                  <span class="ml-1 text-zinc-500">
                    ({{ r.relationType }})
                  </span>
                </a>

                <span class="ml-auto text-xs" :class="statusColor(item.status)">
                  {{ item.status ?? "—" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filteredGroups.length" class="text-zinc-500">
        Keine Relations gefunden
      </div>
    </div>
  </div>
</template>
