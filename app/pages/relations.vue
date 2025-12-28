<script setup lang="ts">
import { api } from "~/composables/useApi";

/* -----------------------------
 * State
 * ----------------------------- */
const username = ref("Lichtgott");
const loading = ref(false);
const error = ref<string | null>(null);
const groups = ref<any[]>([]);
definePageMeta({ title: 'Relations' })
/* -----------------------------
 * Search
 * ----------------------------- */
const search = ref("");

function matchesQuery(query: string, en?: string | null, ro?: string | null) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (en && en.toLowerCase().includes(q)) ||
    (ro && ro.toLowerCase().includes(q))
  );
}

/* -----------------------------
 * Load Relations + User List
 * ----------------------------- */
async function loadRelations() {
  loading.value = true;
  error.value = null;

  try {
    const userRes = await api.get("/api/anilist-user-list", {
      params: { user: username.value },
    });
    const statusMap: Record<number, string> =
      userRes.data?.statusMap ?? {};

    const relRes = await api.get("/api/relations");
    const allGroups = relRes.data?.groups ?? [];

    const visibleGroups = allGroups.filter((g: any) => {
      if (statusMap[g.rootId]) return true;

      for (const c of g.chain) {
        if (statusMap[c.id]) return true;
        for (const r of c.related ?? []) {
          if (statusMap[r.id]) return true;
        }
      }
      return false;
    });

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
 * Computed
 * ----------------------------- */
const filteredGroups = computed(() => {
  if (!search.value) return groups.value;

  return groups.value.filter((g: any) => {
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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h1 class="text-3xl font-bold">Anime Relations</h1>

      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded text-sm w-full sm:w-40"
          placeholder="AniList User"
        />

        <button
          @click="loadRelations"
          class="bg-indigo-600 px-4 py-2 rounded text-sm w-full sm:w-auto"
        >
          Laden
        </button>
      </div>
    </div>

    <!-- Search -->
    <input
      v-if="!loading"
      v-model="search"
      placeholder="Anime suchen (English / Romaji)…"
      class="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 md:py-2 rounded"
    />

    <!-- Summary -->
    <div class="text-sm text-zinc-400">
      {{ groupCount }} Franchises gefunden
    </div>

    <!-- States -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500"
      />
    </div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- Groups -->
    <div v-else class="space-y-4">
      <div
        v-for="group in filteredGroups"
        :key="group.rootId"
        class="p-3 md:p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4"
      >
        <div class="pl-2 md:pl-4 space-y-4 text-sm">
          <div v-for="item in group.chain" :key="item.id" class="space-y-2">
            <!-- Main -->
            <div class="flex items-start gap-3">
              <img
                v-if="item.cover"
                :src="item.cover"
                class="h-14 sm:h-12 aspect-[2/3] rounded object-cover flex-shrink-0"
              />

              <a
                :href="anilistUrl(item.id)"
                target="_blank"
                class="flex-1 break-words leading-tight hover:text-indigo-400"
              >
                {{ displayTitle(item.titleEn, item.titleRo) }}
              </a>

              <span
                class="text-xs whitespace-nowrap"
                :class="statusColor(item.status)"
              >
                {{ item.status ?? "—" }}
              </span>
            </div>

            <!-- Related -->
            <div
              v-if="item.related?.length"
              class="pl-4 sm:pl-8 space-y-2 text-xs text-zinc-400"
            >
              <div
                v-for="r in item.related"
                :key="r.id"
                class="flex items-start gap-2"
              >
                <img
                  v-if="r.cover"
                  :src="r.cover"
                  class="h-10 sm:h-8 aspect-[2/3] rounded object-cover opacity-80 flex-shrink-0"
                />

                <a
                  :href="anilistUrl(r.id)"
                  target="_blank"
                  class="flex-1 break-words hover:text-indigo-400"
                >
                  {{ displayTitle(r.titleEn, r.titleRo) }}
                  <span class="ml-1 text-zinc-500">
                    ({{ r.relationType }})
                  </span>
                </a>

                <span
                  class="text-xs whitespace-nowrap"
                  :class="statusColor(r.status)"
                >
                  {{ r.status ?? "—" }}
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
