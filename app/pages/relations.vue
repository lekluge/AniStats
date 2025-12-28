<script setup lang="ts">
import { api } from "~/composables/useApi";
import type { RelationGroup } from "~/types/animeRelation";

/* -----------------------------
 * State
 * ----------------------------- */
const username = ref("Tiggy");
const loading = ref(false);
const error = ref<string | null>(null);
const groups = ref<RelationGroup[]>([]);

/* -----------------------------
 * Search
 * ----------------------------- */
const search = ref("");

function matchesQuery(
  query: string,
  en?: string | null,
  ro?: string | null
) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (en && en.toLowerCase().includes(q)) ||
    (ro && ro.toLowerCase().includes(q))
  );
}

/* -----------------------------
 * Filter User List
 * ----------------------------- */
function filterGroupsByUserList(
  groups: RelationGroup[],
  statusMap: Record<number, string>
): RelationGroup[] {
  return groups.filter((g) => {
    if (statusMap[g.rootId]) return true;
    if (g.chain.some((c) => statusMap[c.id])) return true;
    if (g.related.some((r) => statusMap[r.id])) return true;
    return false;
  });
}

/* -----------------------------
 * Merge User Status
 * ----------------------------- */
function applyUserStatus(
  groups: RelationGroup[],
  statusMap: Record<number, string>
): RelationGroup[] {
  return groups.map((g) => ({
    ...g,
    rootStatus: statusMap[g.rootId],
    chain: g.chain.map((c) => ({
      ...c,
      status: statusMap[c.id],
    })),
    related: g.related.map((r) => ({
      ...r,
      status: statusMap[r.id],
    })),
  }));
}

/* -----------------------------
 * Load Relations (cached)
 * ----------------------------- */
const relationsCache = ref<RelationGroup[] | null>(null);

async function loadRelations() {
  loading.value = true;
  error.value = null;

  try {
    // 🔥 Relations nur EINMAL laden & cachen
    if (!relationsCache.value) {
      const relRes = await api.get("/api/relations");
      relationsCache.value = relRes.data?.groups ?? [];
    }

    // 👤 Userliste IMMER neu
    const userRes = await api.get("/api/anilist-user-list", {
      params: { user: username.value },
    });

    const statusMap = userRes.data?.statusMap ?? {};

    const filtered = filterGroupsByUserList(
      relationsCache.value,
      statusMap
    );

    const result = applyUserStatus(filtered, statusMap);

    groups.value = result;
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

  return groups.value.filter((g) => {
    if (matchesQuery(search.value, g.rootTitleEn, g.rootTitleRo)) return true;
    if (
      g.chain.some((c) =>
        matchesQuery(search.value, c.titleEn, c.titleRo)
      )
    )
      return true;
    if (
      g.related.some((r) =>
        matchesQuery(search.value, r.titleEn, r.titleRo)
      )
    )
      return true;
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
        <!-- Root -->
        <div class="flex gap-4">
          <img
            v-if="group.rootCover"
            :src="group.rootCover"
            class="h-24 aspect-[2/3] rounded object-cover"
          />

          <div class="flex-1">
            <div class="flex justify-between">
              <div>
                <a
                  :href="anilistUrl(group.rootId)"
                  target="_blank"
                  class="font-semibold hover:text-indigo-400"
                >
                  {{ displayTitle(group.rootTitleEn, group.rootTitleRo) }}
                </a>

                <div
                  v-if="showRomaji(group.rootTitleEn, group.rootTitleRo)"
                  class="text-xs text-zinc-500"
                >
                  {{ group.rootTitleRo }}
                </div>
              </div>

              <div
                class="text-sm font-semibold"
                :class="statusColor(group.rootStatus)"
              >
                {{ group.rootStatus ?? "—" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Chain -->
        <div
          v-if="group.chain.length > 1"
          class="pl-28 space-y-2 text-sm"
        >
          <div
            v-for="item in group.chain.slice(1)"
            :key="item.id"
            class="flex items-center gap-3"
          >
            <img
              v-if="item.cover"
              :src="item.cover"
              class="h-12 aspect-[2/3] rounded object-cover"
            />

            <a
              :href="anilistUrl(item.id)"
              target="_blank"
              class="flex-1 truncate hover:text-indigo-400"
            >
              {{ displayTitle(item.titleEn, item.titleRo) }}
            </a>

            <span
              class="text-xs"
              :class="statusColor(item.status)"
            >
              {{ item.status ?? "—" }}
            </span>
          </div>
        </div>

        <!-- Related -->
        <div
          v-if="group.related.length"
          class="pl-28 space-y-2 text-sm"
        >
          <div
            v-for="r in group.related"
            :key="r.id"
            class="flex items-center gap-3 text-zinc-300"
          >
            <img
              v-if="r.cover"
              :src="r.cover"
              class="h-12 aspect-[2/3] rounded object-cover opacity-80"
            />

            <a
              :href="anilistUrl(r.id)"
              target="_blank"
              class="flex-1 truncate hover:text-indigo-400"
            >
              {{ displayTitle(r.titleEn, r.titleRo) }}
              <span class="text-xs text-zinc-500 ml-1">
                ({{ r.relationLabel }})
              </span>
            </a>

            <span
              class="text-xs"
              :class="statusColor(r.status)"
            >
              {{ r.status ?? "—" }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!filteredGroups.length" class="text-zinc-500">
        Keine Relations gefunden
      </div>
    </div>
  </div>
</template>
