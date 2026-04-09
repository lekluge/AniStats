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
const { theme } = useTheme();

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
  } catch (e) {
    console.error("[Relations]", e);
    error.value = `${t("common.errorPrefix")}: ${t("relations.loadError")}`;
  } finally {
    loading.value = false;
  }
}

onMounted(loadRelations);

const pageSize = 10;
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

watch(totalPages, (next) => {
  if (currentPage.value > next) currentPage.value = next;
});

function statusBadgeClass(status?: string) {
  const isLight = theme.value === "light";
  switch (status) {
    case "COMPLETED":
      return isLight
        ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
        : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
    case "CURRENT":
      return isLight
        ? "bg-sky-100 text-sky-800 ring-1 ring-sky-300"
        : "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30";
    case "PLANNING":
      return isLight
        ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
    case "PAUSED":
      return isLight
        ? "bg-orange-100 text-orange-800 ring-1 ring-orange-300"
        : "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30";
    case "DROPPED":
      return isLight
        ? "bg-rose-100 text-rose-800 ring-1 ring-rose-300"
        : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30";
    case "REPEATING":
      return isLight
        ? "bg-violet-100 text-violet-800 ring-1 ring-violet-300"
        : "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30";
    default:
      return isLight
        ? "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300"
        : "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20";
  }
}

function relationTypeClass(type?: string) {
  const isLight = theme.value === "light";
  switch ((type ?? "").toUpperCase()) {
    case "SEQUEL":
      return isLight
        ? "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300"
        : "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30";
    case "PREQUEL":
      return isLight
        ? "bg-cyan-100 text-cyan-800 ring-1 ring-cyan-300"
        : "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30";
    case "SIDE_STORY":
      return isLight
        ? "bg-fuchsia-100 text-fuchsia-800 ring-1 ring-fuchsia-300"
        : "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/30";
    case "ALTERNATIVE":
      return isLight
        ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
    case "SPIN_OFF":
      return isLight
        ? "bg-lime-100 text-lime-800 ring-1 ring-lime-300"
        : "bg-lime-500/15 text-lime-300 ring-1 ring-lime-500/30";
    default:
      return isLight
        ? "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300"
        : "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20";
  }
}

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}

function displayTitle(en?: string | null, ro?: string | null) {
  return en || ro || "-";
}

function groupTitle(group: RelationGroupWithStatus) {
  const lead = group.chain[0];
  if (!lead) return `#${group.rootId}`;
  return displayTitle(lead.titleEn, lead.titleRo);
}

function watchedInGroup(group: RelationGroupWithStatus) {
  let count = 0;
  for (const item of group.chain) {
    if (item.status) count += 1;
    for (const related of item.related ?? []) {
      if (related.status) count += 1;
    }
  }
  return count;
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
          class="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-[0_10px_40px_rgba(0,0,0,0.18)]"
        >
          <div class="flex items-start justify-between gap-3 border-b border-zinc-800/70 bg-zinc-950/40 px-4 py-3">
            <div class="min-w-0">
              <div class="truncate text-base font-semibold text-zinc-100">
                {{ groupTitle(group) }}
              </div>
              <div class="text-xs text-zinc-400">
                {{ group.chain.length }} entries - {{ watchedInGroup(group) }} in list
              </div>
            </div>
            <a
              :href="anilistUrl(group.rootId)"
              target="_blank"
              class="shrink-0 rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-indigo-500 hover:text-indigo-300"
            >
              AniList
            </a>
          </div>

          <div class="p-4">
            <ol class="space-y-4">
              <li v-for="(item, index) in group.chain" :key="item.id" class="relative pl-6">
                <span class="absolute left-0 top-2 h-2 w-2 rounded-full bg-indigo-400" />
                <span v-if="index < group.chain.length - 1" class="absolute left-[3px] top-4 bottom-[-16px] w-px bg-zinc-700/80" />

                <div class="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
                  <div class="flex items-start gap-3">
                    <ImageWithLoader
                      v-if="item.cover"
                      :src="item.cover"
                      :alt="displayTitle(item.titleEn, item.titleRo)"
                      class="h-16 aspect-[2/3] rounded-md shadow shrink-0"
                    />

                    <div class="min-w-0 flex-1">
                      <a
                        :href="anilistUrl(item.id)"
                        target="_blank"
                        class="line-clamp-2 text-sm font-medium leading-tight text-zinc-100 hover:text-indigo-300"
                      >
                        {{ displayTitle(item.titleEn, item.titleRo) }}
                      </a>
                      <div class="mt-2">
                        <span class="inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium" :class="statusBadgeClass(item.status)">
                          {{ item.status ?? t("common.notInList") }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="item.related?.length" class="mt-3 grid gap-2 sm:grid-cols-2">
                    <a
                      v-for="r in item.related"
                      :key="r.id"
                      :href="anilistUrl(r.id)"
                      target="_blank"
                      class="flex items-start gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/45 p-2 hover:border-indigo-500/50"
                    >
                      <ImageWithLoader
                        v-if="r.cover"
                        :src="r.cover"
                        :alt="displayTitle(r.titleEn, r.titleRo)"
                        class="h-12 aspect-[2/3] rounded opacity-90 shrink-0"
                      />

                      <div class="min-w-0 flex-1">
                        <div class="truncate text-xs font-medium text-zinc-200">
                          {{ displayTitle(r.titleEn, r.titleRo) }}
                        </div>
                        <div class="mt-1 flex flex-wrap items-center gap-1.5">
                          <span class="inline-flex rounded-md px-1.5 py-0.5 text-[10px]" :class="relationTypeClass(r.relationType)">
                            {{ r.relationType }}
                          </span>
                          <span class="inline-flex rounded-md px-1.5 py-0.5 text-[10px]" :class="statusBadgeClass(r.status)">
                            {{ r.status ?? t("common.notInList") }}
                          </span>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
      <div v-else class="text-zinc-500">{{ t("common.noRelationsFound") }}</div>
    </template>
  </div>
</template>
