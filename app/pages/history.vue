<script setup lang="ts">
definePageMeta({ middleware: "auth", title: "History" })

import HistoryCard from "~/components/HistoryCard.vue"

const { t } = useLocale()

type LayoutMode = "grid" | "list"
type AniDate = { year?: number; month?: number; day?: number }
type SeasonKey = "WINTER" | "SPRING" | "SUMMER" | "FALL"
type SortDirection = "asc" | "desc"

type HistoryEntry = {
  id: number
  titleEn?: string | null
  titleRo?: string | null
  cover?: string | null
  startedAt?: AniDate | null
  completedAt?: AniDate | null
}

const start = ref("")
const end = ref("")
const results = ref<HistoryEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const layoutMode = ref<LayoutMode>("list")
const durationSortDirection = ref<SortDirection>("desc")

const selectedYear = ref<number>(new Date().getFullYear())
const selectedSeason = ref<SeasonKey | null>(null)

const pageSize = 50
const currentPage = ref(1)

function durationDays(entry: HistoryEntry) {
  const s = toDate(entry.startedAt ?? null)
  const e = toDate(entry.completedAt ?? null)
  if (!s || !e) return -1
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000))
}

const durationSortedResults = computed(() => {
  return [...results.value].sort((a, b) => {
    const da = durationDays(a)
    const db = durationDays(b)
    return durationSortDirection.value === "asc" ? da - db : db - da
  })
})

const timelineSortedResults = computed(() =>
  [...results.value].sort((a, b) => completedKey(b) - completedKey(a))
)

const totalPages = computed(() => Math.max(1, Math.ceil(timelineSortedResults.value.length / pageSize)))

const paginatedResults = computed(() => {
  const s = (currentPage.value - 1) * pageSize
  return timelineSortedResults.value.slice(s, s + pageSize)
})

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function getSeasonRange(year: number, season: SeasonKey) {
  if (season === "WINTER") return { start: toIsoDate(year, 1, 1), end: toIsoDate(year, 3, 31) }
  if (season === "SPRING") return { start: toIsoDate(year, 4, 1), end: toIsoDate(year, 6, 30) }
  if (season === "SUMMER") return { start: toIsoDate(year, 7, 1), end: toIsoDate(year, 9, 30) }
  return { start: toIsoDate(year, 10, 1), end: toIsoDate(year, 12, 31) }
}

function currentSeasonFromDate(d = new Date()): { year: number; season: SeasonKey } {
  const year = d.getFullYear()
  const m = d.getMonth() + 1
  if (m >= 1 && m <= 3) return { year, season: "WINTER" }
  if (m >= 4 && m <= 6) return { year, season: "SPRING" }
  if (m >= 7 && m <= 9) return { year, season: "SUMMER" }
  return { year, season: "FALL" }
}

function applySeason(season: SeasonKey) {
  selectedSeason.value = season
  const r = getSeasonRange(selectedYear.value, season)
  start.value = r.start
  end.value = r.end
}

function shiftYear(delta: number) {
  selectedYear.value += delta
  if (selectedSeason.value) {
    const r = getSeasonRange(selectedYear.value, selectedSeason.value)
    start.value = r.start
    end.value = r.end
  }
}

function toDate(d?: AniDate | null) {
  if (!d?.year || !d?.month || !d?.day) return null
  return new Date(d.year, d.month - 1, d.day)
}

function completedKey(a: HistoryEntry) {
  const dt = toDate(a.completedAt ?? null)
  return dt ? dt.getTime() : 0
}

async function loadHistory() {
  if (!start.value || !end.value) return

  loading.value = true
  error.value = null
  currentPage.value = 1

  try {
    const res = await $fetch<HistoryEntry[]>("/api/private/history", {
      query: { start: start.value, end: end.value },
    })

    results.value = [...(res ?? [])].sort((a, b) => completedKey(b) - completedKey(a))
  } catch (e) {
    console.error("[History]", e)
    error.value = `${t("common.errorPrefix")}: ${t("history.loadError")}`
  } finally {
    loading.value = false
  }
}

let autoLoadTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => [start.value, end.value],
  ([s, e], [prevS, prevE]) => {
    if (!s || !e) return
    if (s === prevS && e === prevE) return

    if (autoLoadTimer) clearTimeout(autoLoadTimer)
    autoLoadTimer = setTimeout(() => {
      if (!loading.value) loadHistory()
    }, 250)
  }
)

watch(durationSortDirection, () => {
  currentPage.value = 1
})

onMounted(() => {
  const cur = currentSeasonFromDate(new Date())
  selectedYear.value = cur.year
  selectedSeason.value = cur.season
  const r = getSeasonRange(cur.year, cur.season)
  start.value = r.start
  end.value = r.end
})

const cardData = computed(() =>
  durationSortedResults.value.map((a) => ({
    id: a.id,
    title: a.titleEn ?? a.titleRo ?? t("common.unknown"),
    cover: a.cover ?? null,
    startedAt: a.startedAt ?? null,
    completedAt: a.completedAt ?? null,
  }))
)

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`
}

function aniDateKey(d?: AniDate | null) {
  if (!d?.year || !d?.month || !d?.day) return "unknown"
  return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`
}

function formatAniDate(d?: AniDate | null) {
  if (!d?.year || !d?.month || !d?.day) return t("common.unknown")
  const date = new Date(d.year, d.month - 1, d.day)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const timelineGroups = computed(() => {
  const groups: Array<{ key: string; label: string; items: HistoryEntry[] }> = []
  const map = new Map<string, { key: string; label: string; items: HistoryEntry[] }>()

  for (const item of paginatedResults.value) {
    const key = aniDateKey(item.completedAt)
    const label = item.completedAt ? formatAniDate(item.completedAt) : t("common.unknown")
    const bucket = map.get(key)

    if (!bucket) {
      const next = { key, label, items: [item] }
      map.set(key, next)
      groups.push(next)
    } else {
      bucket.items.push(item)
    }
  }

  return groups
})
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <h1 class="text-3xl font-bold">{{ t("history.title") }}</h1>
    </div>

    <section class="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-3">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div class="flex-1 space-y-3">
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input v-model="start" type="date" class="ui-input w-full sm:w-40" />
            <input v-model="end" type="date" class="ui-input w-full sm:w-40" />
            <button
              class="ui-btn ui-btn-primary w-full sm:w-auto"
              :disabled="loading || !start || !end"
              :title="t('common.optionalAutoload')"
              @click="loadHistory"
            >
              {{ t("common.load") }}
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-2 text-xs rounded border bg-zinc-900 text-zinc-300"
                :disabled="loading"
                @click="shiftYear(-1)"
              >
                &larr;
              </button>

              <div class="px-3 py-2 text-xs rounded border border-zinc-800 bg-zinc-900 text-zinc-200">
                {{ selectedYear }}
              </div>

              <button
                class="px-3 py-2 text-xs rounded border bg-zinc-900 text-zinc-300"
                :disabled="loading"
                @click="shiftYear(1)"
              >
                &rarr;
              </button>
            </div>

            <div class="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div class="flex flex-wrap gap-2">
              <button
                class="px-3 py-2 text-xs rounded border"
                :class="selectedSeason === 'WINTER' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
                :disabled="loading"
                @click="applySeason('WINTER')"
              >
                {{ t("common.winter") }}
              </button>

              <button
                class="px-3 py-2 text-xs rounded border"
                :class="selectedSeason === 'SPRING' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
                :disabled="loading"
                @click="applySeason('SPRING')"
              >
                {{ t("common.spring") }}
              </button>

              <button
                class="px-3 py-2 text-xs rounded border"
                :class="selectedSeason === 'SUMMER' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
                :disabled="loading"
                @click="applySeason('SUMMER')"
              >
                {{ t("common.summer") }}
              </button>

              <button
                class="px-3 py-2 text-xs rounded border"
                :class="selectedSeason === 'FALL' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
                :disabled="loading"
                @click="applySeason('FALL')"
              >
                {{ t("common.fall") }}
              </button>
            </div>
          </div>

          <div class="text-xs text-zinc-500">
            {{ t("history.presetInfo") }}
          </div>
        </div>

        <div class="flex flex-col gap-2 xl:items-end">
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-2 text-xs rounded border"
              :class="layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
              @click="layoutMode = 'grid'"
            >
              {{ t("common.grid") }}
            </button>

            <button
              class="px-3 py-2 text-xs rounded border"
              :class="layoutMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'"
              @click="layoutMode = 'list'"
            >
              {{ t("common.list") }}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-zinc-500">{{ t("common.time") }}</span>
            <button
              class="px-3 py-2 text-xs rounded border"
              @click="durationSortDirection = durationSortDirection === 'asc' ? 'desc' : 'asc'"
            >
              {{ durationSortDirection === "asc" ? t("common.sortAsc") : t("common.sortDesc") }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>

    <div v-else-if="error" class="text-red-400">
      {{ error }}
    </div>

    <div v-else-if="layoutMode === 'grid'" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      <HistoryCard v-for="(item, i) in cardData" :key="item.id" :rank="i + 1" :data="item" />
    </div>

    <div v-else>
      <div class="flex items-center justify-between text-sm mb-2">
        <button class="px-3 py-1 rounded border" :disabled="currentPage === 1" @click="currentPage--">
          &larr; {{ t("common.back") }}
        </button>

        <span>{{ t("common.page") }} {{ currentPage }} / {{ totalPages }}</span>

        <button class="px-3 py-1 rounded border" :disabled="currentPage === totalPages" @click="currentPage++">
          {{ t("common.next") }} &rarr;
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="(group, groupIndex) in timelineGroups" :key="group.key" class="relative pl-6">
          <span class="absolute left-0 top-2 h-2 w-2 rounded-full bg-indigo-400" />
          <span
            v-if="groupIndex < timelineGroups.length - 1"
            class="absolute left-[3px] top-4 bottom-[-16px] w-px bg-zinc-700/80"
          />

          <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {{ group.label }}
          </div>

          <div class="space-y-2">
            <div
              v-for="a in group.items"
              :key="a.id"
              class="flex gap-3 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/30"
            >
              <ImageWithLoader
                v-if="a.cover"
                :src="a.cover"
                :alt="a.titleEn ?? a.titleRo ?? t('common.unknown')"
                class="h-14 aspect-2/3 rounded"
              />

              <div class="min-w-0 flex-1">
                <a :href="anilistUrl(a.id)" target="_blank" class="block hover:underline hover:text-indigo-400">
                  {{ a.titleEn ?? a.titleRo ?? t("common.unknown") }}
                </a>
                <div class="mt-1 flex flex-wrap gap-1.5 text-[11px] text-zinc-500">
                  <span class="rounded-md border border-zinc-700/80 bg-zinc-900/40 px-1.5 py-0.5">
                    {{ t("history.completed") }}: {{ formatAniDate(a.completedAt) }}
                  </span>
                  <span class="rounded-md border border-zinc-700/80 bg-zinc-900/40 px-1.5 py-0.5">
                    {{ t("history.span") }}:
                    {{
                      toDate(a.startedAt) && toDate(a.completedAt)
                        ? `${Math.max(
                            1,
                            Math.ceil(
                              (toDate(a.completedAt)!.getTime() - toDate(a.startedAt)!.getTime()) / 86400000
                            )
                          )}${t("history.daysShort")}`
                        : "-"
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
