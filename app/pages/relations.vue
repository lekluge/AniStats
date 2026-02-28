<script setup lang="ts">
import { api } from "~/composables/useApi";
import type {
  ApiRelationChainItem,
  ApiRelationGroup,
  ApiRelationItem,
  ApiRelationsResponse,
  ApiUserListResponse,
} from "~/types/api";

const { t } = useLocale();

const username = useAnilistUser();
const loading = ref(false);
const error = ref<string | null>(null);
const search = ref("");

type RelationItemWithStatus = ApiRelationItem & { status?: string };
type RelationChainWithStatus = Omit<ApiRelationChainItem, "related"> & {
  status?: string;
  related: RelationItemWithStatus[];
};
type RelationGroupWithStatus = Omit<ApiRelationGroup, "chain"> & {
  rootStatus?: string;
  chain: RelationChainWithStatus[];
};

const groups = ref<RelationGroupWithStatus[]>([]);

definePageMeta({ title: "Relations", middleware: "auth" });

function matchesQuery(query: string, en?: string | null, ro?: string | null) {
  if (!query) return true;
  const q = query.toLowerCase();
  return Boolean((en && en.toLowerCase().includes(q)) || (ro && ro.toLowerCase().includes(q)));
}

async function loadRelations() {
  loading.value = true;
  error.value = null;

  try {
    if (!username.value) {
      groups.value = [];
      return;
    }

    const userRes = await api.get<ApiUserListResponse>("/api/private/anilist-user-list", {
      params: { user: username.value },
    });
    const statusMap = userRes.data.statusMap ?? {};

    const relRes = await api.get<ApiRelationsResponse>("/api/private/relations");
    const allGroups = relRes.data.groups ?? [];

    const visibleGroups = allGroups.filter((group) => {
      if (statusMap[group.rootId]) return true;

      for (const chainItem of group.chain) {
        if (statusMap[chainItem.id]) return true;
        for (const related of chainItem.related ?? []) {
          if (statusMap[related.id]) return true;
        }
      }

      return false;
    });

    groups.value = visibleGroups.map((group) => ({
      ...group,
      rootStatus: statusMap[group.rootId],
      chain: group.chain.map((chainItem) => ({
        ...chainItem,
        status: statusMap[chainItem.id],
        related: (chainItem.related ?? []).map((related) => ({
          ...related,
          status: statusMap[related.id],
        })),
      })),
    }));
  } catch {
    error.value = `${t("common.errorPrefix")}: ${t("relations.loadError")}`;
  } finally {
    loading.value = false;
  }
}

onMounted(loadRelations);

const pageSize = 20;
const currentPage = ref(1);

const filteredGroups = computed(() => {
  if (!search.value) return groups.value;

  return groups.value.filter((group) => {
    for (const chainItem of group.chain) {
      if (matchesQuery(search.value, chainItem.titleEn, chainItem.titleRo)) return true;
      for (const related of chainItem.related ?? []) {
        if (matchesQuery(search.value, related.titleEn, related.titleRo)) return true;
      }
    }
    return false;
  });
});

const groupCount = computed(() => filteredGroups.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredGroups.value.length / pageSize)));
const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredGroups.value.slice(start, start + pageSize);
});

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
  return en || ro || "-";
}
</script>

<template>
  <div class="page-shell">
    <div class="page-header md:justify-between md:items-center">
      <h1 class="text-3xl font-bold">{{ t("relations.title") }}</h1>

      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <input
          v-model="username"
          class="ui-input w-full sm:w-40"
          :placeholder="t('common.usernamePlaceholder')"
          @keydown.enter.prevent="loadRelations"
          @keydown.space.prevent="loadRelations"
        />

        <button class="ui-btn ui-btn-primary w-full sm:w-auto" @click="loadRelations">
          {{ t("common.load") }}
        </button>
      </div>
    </div>

    <input
      v-if="!loading"
      v-model="search"
      :placeholder="t('common.animeSearchPlaceholder')"
      class="ui-input w-full px-4 py-3 md:py-2"
    />

    <div class="text-sm text-zinc-400">
      {{ groupCount }} {{ t("relations.franchisesFound") }}
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <template v-if="!loading && !error">
      <div class="flex items-center justify-between text-sm mb-2">
        <button class="px-3 py-1 rounded border" :disabled="currentPage === 1" @click="currentPage--">
          &larr; {{ t("common.back") }}
        </button>

        <span>{{ t("common.page") }} {{ currentPage }} / {{ totalPages }}</span>

        <button class="px-3 py-1 rounded border" :disabled="currentPage === totalPages" @click="currentPage++">
          {{ t("common.next") }} &rarr;
        </button>
      </div>

      <div v-if="paginatedGroups.length" class="space-y-4">
        <div
          v-for="group in paginatedGroups"
          :key="group.rootId"
          class="p-3 md:p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4"
        >
          <div class="pl-2 md:pl-4 space-y-4 text-sm">
            <div v-for="item in group.chain" :key="item.id" class="space-y-2">
              <div class="flex items-start gap-3">
                <img v-if="item.cover" :src="item.cover" class="h-14 sm:h-12 aspect-2/3 rounded object-cover shrink-0" />

                <a
                  :href="anilistUrl(item.id)"
                  target="_blank"
                  class="flex-1 wrap-break-word leading-tight hover:text-indigo-400"
                >
                  {{ displayTitle(item.titleEn, item.titleRo) }}
                </a>

                <span class="text-xs whitespace-nowrap" :class="statusColor(item.status)">
                  {{ item.status ?? "-" }}
                </span>
              </div>

              <div v-if="item.related?.length" class="pl-4 sm:pl-8 space-y-2 text-xs text-zinc-400">
                <div v-for="r in item.related" :key="r.id" class="flex items-start gap-2">
                  <img
                    v-if="r.cover"
                    :src="r.cover"
                    class="h-10 sm:h-8 aspect-2/3 rounded object-cover opacity-80 shrink-0"
                  />

                  <a
                    :href="anilistUrl(r.id)"
                    target="_blank"
                    class="flex-1 wrap-break-word hover:text-indigo-400"
                  >
                    {{ displayTitle(r.titleEn, r.titleRo) }}
                    <span class="ml-1 text-zinc-500">({{ r.relationType }})</span>
                  </a>

                  <span class="text-xs whitespace-nowrap" :class="statusColor(r.status)">
                    {{ r.status ?? "-" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-zinc-500">{{ t("common.noRelationsFound") }}</div>
    </template>
  </div>
</template>
