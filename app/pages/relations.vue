<script setup lang="ts">
import { api } from "~/composables/useApi"
import type { RelationGroup } from "~/types/animeRelation"

const username = ref("Tiggy")
const loading = ref(false)
const error = ref<string | null>(null)
const groups = ref<RelationGroup[]>([])
function filterGroupsByUserList(
  groups: RelationGroup[],
  statusMap: Record<number, string>
): RelationGroup[] {
  return groups.filter((g) => {
    // Root in Liste?
    if (statusMap[g.rootId]) return true

    // Chain in Liste?
    if (g.chain.some((c) => statusMap[c.id])) return true

    // Related in Liste?
    if (g.related.some((r) => statusMap[r.id])) return true

    return false
  })
}


/* ----------------------------------
 * Merge User Status into Relations
 * ---------------------------------- */
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
  }))
}

/* ----------------------------------
 * Load Relations (DB) + User Status
 * ---------------------------------- */
async function loadRelations() {
  loading.value = true
  error.value = null

  try {
    const [userRes, relRes] = await Promise.all([
      api.get("/api/anilist-user-list", {
        params: { user: username.value },
      }),
      api.get("/api/relations"),
    ])

    const statusMap = userRes.data?.statusMap ?? {}
    const relationGroups = relRes.data?.groups ?? []

    const filtered = filterGroupsByUserList(relationGroups, statusMap)
groups.value = applyUserStatus(filtered, statusMap)
  } catch (e: any) {
    error.value = e?.message ?? "Fehler beim Laden"
  } finally {
    loading.value = false
  }
}

onMounted(loadRelations)

/* ----------------------------------
 * UI Helpers
 * ---------------------------------- */
function statusColor(status?: string) {
  switch (status) {
    case "COMPLETED":
      return "text-green-400"
    case "CURRENT":
      return "text-blue-400"
    case "PLANNING":
      return "text-yellow-400"
    case "PAUSED":
      return "text-orange-400"
    case "DROPPED":
      return "text-red-400"
    default:
      return "text-zinc-500"
  }
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Anime Relations</h1>
      <div class="flex gap-2">
        <input
          v-model="username"
          class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded"
        />
        <button
          @click="loadRelations"
          class="bg-indigo-600 px-4 py-2 rounded"
        >
          Laden
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-zinc-400">Lade…</div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <!-- GROUPS -->
    <div v-else class="space-y-0">
      <div
        v-for="group in groups"
        :key="group.rootId"
        class="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 space-y-6"
        style="margin-bottom: 20px"
      >
        <!-- ROOT -->
        <div class="flex items-start gap-6 pt-6 pl-6">
          <img
            v-if="group.rootCover"
            :src="group.rootCover"
            class="h-36 aspect-[2/3] rounded-xl object-cover flex-shrink-0"
          />

          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-xl font-semibold">
                  <a
                    :href="anilistUrl(group.rootId)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ group.rootTitleEn }}
                  </a>
                </div>
                <div
                  v-if="group.rootTitleRo !== group.rootTitleEn"
                  class="text-sm text-zinc-500"
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

        <!-- CHAIN -->
        <div
          v-if="group.chain.length > 1"
          class="ml-28 mt-6 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3"
        >
          <div
            v-for="item in group.chain.slice(1)"
            :key="item.id"
            class="flex items-start gap-4"
          >
            <img
              v-if="item.cover"
              :src="item.cover"
              class="h-20 aspect-[2/3] rounded-md object-cover flex-shrink-0"
            />

            <div class="flex-1">
              <div class="text-sm font-medium">
                <a
                  :href="anilistUrl(item.id)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ item.titleEn }}
                </a>
              </div>
              <div
                v-if="item.titleRo !== item.titleEn"
                class="text-xs text-zinc-500"
              >
                {{ item.titleRo }}
              </div>
            </div>

            <div
              class="text-xs font-medium"
              :class="statusColor(item.status)"
            >
              {{ item.status ?? "—" }}
            </div>
          </div>
        </div>

        <!-- RELATED HEADER -->
        <div
          v-if="group.related.length"
          class="ml-28 mt-6 text-xs uppercase tracking-wide text-zinc-400"
        >
          Related
        </div>

        <!-- RELATED -->
        <div
          v-if="group.related.length"
          class="ml-28 mt-2 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3"
        >
          <div
            v-for="r in group.related"
            :key="r.id"
            class="flex items-start gap-4"
          >
            <img
              v-if="r.cover"
              :src="r.cover"
              class="h-20 aspect-[2/3] rounded-md object-cover flex-shrink-0 opacity-80"
            />

            <div class="flex-1">
              <div class="text-sm">
                <a
                  :href="anilistUrl(r.id)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ r.titleEn }}
                </a>
                <span class="text-xs text-zinc-500 ml-1">
                  ({{ r.relationLabel }})
                </span>
              </div>
            </div>

            <div class="text-xs" :class="statusColor(r.status)">
              {{ r.status ?? "—" }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="!groups.length" class="text-zinc-500">
        Keine Relations gefunden
      </div>
    </div>
  </div>
</template>
