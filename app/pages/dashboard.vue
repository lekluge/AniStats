<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";

import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, LineChart, BarChart } from "echarts/charts";
import { TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, PieChart, LineChart, BarChart, TooltipComponent, LegendComponent, GridComponent]);

type MetricMode = "titles" | "hours" | "score";

definePageMeta({ title: "Dashboard", middleware: "auth" });

const usernameCookie = useCookie<string>("anilist-user", { default: () => "" });
const username = computed({
  get: () => usernameCookie.value ?? "",
  set: (val: string) => {
    usernameCookie.value = val.trim();
  },
});

const loading = ref(false);
const error = ref<string | null>(null);
const entries = ref<AnimeEntry[]>([]);
const lastLoadedUser = ref("");

const scoreMetric = ref<MetricMode>("titles");
const episodeMetric = ref<MetricMode>("titles");
const releaseMetric = ref<MetricMode>("titles");
const watchMetric = ref<MetricMode>("titles");

const CHART_BG = "#13233a";
const CHART_FG = "#8fa4bf";
const CHART_LINE = "#7f92aa";
const CHART_BAR = "#95a8bf";

async function loadAnime() {
  loading.value = true;
  error.value = null;

  try {
    const currentUser = username.value.trim();
    if (!currentUser) {
      entries.value = [];
      lastLoadedUser.value = "";
      loading.value = false;
      return;
    }

    const res = await api.post("/api/private/anilist", null, {
      params: { user: currentUser },
    });

    entries.value = normalizeAnilist(res.data.data.MediaListCollection.lists);
    lastLoadedUser.value = currentUser;
  } catch (e: any) {
    error.value = e?.message ?? "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

let autoLoadTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => username.value,
  (nextUser) => {
    const trimmed = (nextUser ?? "").trim();
    if (!trimmed) {
      entries.value = [];
      error.value = null;
      lastLoadedUser.value = "";
      return;
    }

    if (trimmed === lastLoadedUser.value) return;

    if (autoLoadTimer) clearTimeout(autoLoadTimer);
    autoLoadTimer = setTimeout(() => {
      if (!loading.value) loadAnime();
    }, 350);
  },
  { immediate: true }
);

onUnmounted(() => {
  if (autoLoadTimer) clearTimeout(autoLoadTimer);
});

const totalAnime = computed(() => entries.value.length);
const totalEpisodes = computed(() => entries.value.reduce((sum, e) => sum + (e.progress ?? 0), 0));
const totalMinutes = computed(() =>
  entries.value.reduce((sum, e) => {
    if (!e.progress || !e.duration) return sum;
    return sum + e.progress * e.duration;
  }, 0)
);
const totalDaysWatched = computed(() => Number((totalMinutes.value / 60 / 24).toFixed(1)));

const totalPlannedDays = computed(() => {
  const plannedMinutes = entries.value.reduce((sum, e) => {
    if (e.status !== "PLANNING") return sum;
    const duration = e.duration ?? 20;
    const totalEp = e.episodes ?? e.progress ?? 0;
    const remaining = Math.max(totalEp - (e.progress ?? 0), 0);
    return sum + remaining * duration;
  }, 0);

  return Number((plannedMinutes / 60 / 24).toFixed(1));
});

const scoredEntries = computed(() => entries.value.filter((e) => Number(e.score ?? 0) > 0));
const meanScore = computed(() => {
  if (!scoredEntries.value.length) return 0;
  const sum = scoredEntries.value.reduce((acc, e) => acc + Number(e.score), 0);
  return Number((sum / scoredEntries.value.length).toFixed(1));
});

const scoreStdDev = computed(() => {
  if (scoredEntries.value.length <= 1) return 0;
  const mean = meanScore.value;
  const variance =
    scoredEntries.value.reduce((acc, e) => acc + (Number(e.score) - mean) ** 2, 0) /
    scoredEntries.value.length;
  return Number(Math.sqrt(variance).toFixed(1));
});

const overviewStats = computed(() => [
  { label: "Total Anime", value: totalAnime.value },
  { label: "Episodes Watched", value: totalEpisodes.value },
  { label: "Days Watched", value: totalDaysWatched.value },
  { label: "Days Planned", value: totalPlannedDays.value },
  { label: "Mean Score", value: meanScore.value },
  { label: "Standard Deviation", value: scoreStdDev.value },
]);

function computeMetricValue(
  bucket: { titles: number; hours: number; scoreSum: number; scoredTitles: number },
  mode: MetricMode
) {
  if (mode === "titles") return bucket.titles;
  if (mode === "hours") return Number(bucket.hours.toFixed(1));
  if (bucket.scoredTitles === 0) return 0;
  return Number((bucket.scoreSum / bucket.scoredTitles).toFixed(1));
}

function makeBarOption(labels: string[], values: number[], labelName: string) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#0d1a2c",
      borderColor: "#243854",
      textStyle: { color: "#eaf0f8" },
    },
    grid: { left: 24, right: 16, top: 20, bottom: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: CHART_FG, fontWeight: 600 },
      axisLine: { lineStyle: { color: "#2a3f5c" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      name: labelName,
      nameTextStyle: { color: CHART_FG },
      axisLabel: { color: CHART_FG },
      splitLine: { lineStyle: { color: "#20354f" } },
    },
    series: [
      {
        type: "bar",
        data: values,
        barMaxWidth: 42,
        itemStyle: { color: CHART_BAR, borderRadius: [6, 6, 0, 0] },
        label: { show: true, position: "top", color: "#b7c6d9", fontWeight: 600 },
      },
    ],
  };
}

function makeLineOption(labels: string[], values: number[], labelName: string) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0d1a2c",
      borderColor: "#243854",
      textStyle: { color: "#eaf0f8" },
    },
    grid: { left: 24, right: 16, top: 20, bottom: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: CHART_FG, fontWeight: 600 },
      axisLine: { lineStyle: { color: "#2a3f5c" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      name: labelName,
      nameTextStyle: { color: CHART_FG },
      axisLabel: { color: CHART_FG },
      splitLine: { lineStyle: { color: "#20354f" } },
    },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: CHART_LINE, width: 3 },
        itemStyle: { color: CHART_LINE },
        areaStyle: { color: "rgba(127,146,170,0.14)" },
        label: { show: true, position: "top", color: "#b7c6d9", fontWeight: 600 },
      },
    ],
  };
}

function metricLabel(mode: MetricMode) {
  if (mode === "titles") return "Titles";
  if (mode === "hours") return "Hours";
  return "Mean Score";
}

function mapCountry(value?: string | null) {
  const key = (value ?? "").toUpperCase();
  if (key === "JP") return "Japan";
  if (key === "KR") return "Korea";
  if (key === "CN") return "China";
  if (!key) return "Unknown";
  return key;
}

const formatOrder = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL", "MUSIC", "TV_SHORT"];
const formatDistribution = computed(() => {
  const map: Record<string, number> = {};
  for (const e of entries.value) {
    const key = (e.format || "UNKNOWN").toUpperCase();
    map[key] = (map[key] || 0) + 1;
  }
  const rows = Object.entries(map).map(([name, value]) => ({ name, value }));
  return rows.sort((a, b) => {
    const ai = formatOrder.indexOf(a.name);
    const bi = formatOrder.indexOf(b.name);
    if (ai === -1 && bi === -1) return b.value - a.value;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
});

const statusLabels: Record<string, string> = {
  COMPLETED: "Completed",
  PLANNING: "Planning",
  CURRENT: "Watching",
  DROPPED: "Dropped",
  PAUSED: "Paused",
  REPEATING: "Repeating",
};
const statusDistribution = computed(() => {
  const map: Record<string, number> = {};
  for (const e of entries.value) {
    map[e.status] = (map[e.status] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name: statusLabels[name] ?? name, value }));
});

const countryDistribution = computed(() => {
  const map: Record<string, number> = {};
  for (const e of entries.value) {
    const key = mapCountry(e.countryOfOrigin);
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
});

function makeDonutOption(rows: Array<{ name: string; value: number }>) {
  const pieRows = rows.filter((r) => r.value > 0);
  const hasSingleSlice = pieRows.length <= 1;

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#0d1a2c",
      borderColor: "#243854",
      textStyle: { color: "#eaf0f8" },
    },
    legend: { show: false },
    series: [
      {
        type: "pie",
        radius: ["62%", "82%"],
        center: ["50%", "50%"],
        data: pieRows.length ? pieRows : [{ name: "Empty", value: 1 }],
        label: { show: false },
        itemStyle: {
          borderWidth: hasSingleSlice ? 0 : 2,
          borderColor: CHART_BG,
        },
      },
    ],
  };
}

const formatOption = computed(() => makeDonutOption(formatDistribution.value));
const statusOption = computed(() => makeDonutOption(statusDistribution.value));
const countryOption = computed(() => makeDonutOption(countryDistribution.value));

const scoreDist = computed(() => {
  const maxScore = scoredEntries.value.reduce((m, e) => Math.max(m, Number(e.score || 0)), 0);
  const useTenScale = maxScore <= 10;

  const buckets = new Map<number, { titles: number; hours: number; scoreSum: number; scoredTitles: number }>();
  for (const e of scoredEntries.value) {
    const raw = Number(e.score || 0);
    const key = useTenScale ? Math.round(raw) : Math.round(raw / 10);
    const cur = buckets.get(key) ?? { titles: 0, hours: 0, scoreSum: 0, scoredTitles: 0 };
    cur.titles += 1;
    cur.hours += ((e.progress ?? 0) * (e.duration ?? 20)) / 60;
    cur.scoreSum += raw;
    cur.scoredTitles += 1;
    buckets.set(key, cur);
  }

  const rows = [...buckets.entries()].sort((a, b) => a[0] - b[0]);
  const labels = rows.map(([k]) => String(k));
  const values = rows.map(([, v]) => computeMetricValue(v, scoreMetric.value));
  return { labels, values };
});

const scoreOption = computed(() => makeBarOption(scoreDist.value.labels, scoreDist.value.values, metricLabel(scoreMetric.value)));

const episodeBins = [
  { label: "1", match: (n: number | null) => n === 1 },
  { label: "2-6", match: (n: number | null) => n !== null && n >= 2 && n <= 6 },
  { label: "7-16", match: (n: number | null) => n !== null && n >= 7 && n <= 16 },
  { label: "17-28", match: (n: number | null) => n !== null && n >= 17 && n <= 28 },
  { label: "29-55", match: (n: number | null) => n !== null && n >= 29 && n <= 55 },
  { label: "56-100", match: (n: number | null) => n !== null && n >= 56 && n <= 100 },
  { label: "101+", match: (n: number | null) => n !== null && n >= 101 },
  { label: "Unknown", match: (n: number | null) => n === null || n === 0 },
];

const episodeDist = computed(() => {
  const map = new Map<string, { titles: number; hours: number; scoreSum: number; scoredTitles: number }>();
  for (const b of episodeBins) map.set(b.label, { titles: 0, hours: 0, scoreSum: 0, scoredTitles: 0 });

  for (const e of entries.value) {
    const ep = e.episodes ?? null;
    const bucket = episodeBins.find((b) => b.match(ep))?.label ?? "Unknown";
    const cur = map.get(bucket)!;
    cur.titles += 1;
    cur.hours += ((e.progress ?? 0) * (e.duration ?? 20)) / 60;
    if (Number(e.score || 0) > 0) {
      cur.scoreSum += Number(e.score);
      cur.scoredTitles += 1;
    }
  }

  const labels = episodeBins.map((b) => b.label);
  const values = labels.map((l) => computeMetricValue(map.get(l)!, episodeMetric.value));
  return { labels, values };
});

const episodeOption = computed(() =>
  makeBarOption(episodeDist.value.labels, episodeDist.value.values, metricLabel(episodeMetric.value))
);

const releaseYearDist = computed(() => {
  const map = new Map<number, { titles: number; hours: number; scoreSum: number; scoredTitles: number }>();
  for (const e of entries.value) {
    const year = e.seasonYear;
    if (!year) continue;
    const cur = map.get(year) ?? { titles: 0, hours: 0, scoreSum: 0, scoredTitles: 0 };
    cur.titles += 1;
    cur.hours += ((e.progress ?? 0) * (e.duration ?? 20)) / 60;
    if (Number(e.score || 0) > 0) {
      cur.scoreSum += Number(e.score);
      cur.scoredTitles += 1;
    }
    map.set(year, cur);
  }

  const rows = [...map.entries()].sort((a, b) => a[0] - b[0]);
  const labels = rows.map(([year]) => String(year));
  const values = rows.map(([, v]) => computeMetricValue(v, releaseMetric.value));
  return { labels, values };
});

const releaseOption = computed(() =>
  makeLineOption(releaseYearDist.value.labels, releaseYearDist.value.values, metricLabel(releaseMetric.value))
);

const watchYearDist = computed(() => {
  const map = new Map<number, { titles: number; hours: number; scoreSum: number; scoredTitles: number }>();
  for (const e of entries.value) {
    const year = e.completedAt?.year;
    if (!year) continue;
    const cur = map.get(year) ?? { titles: 0, hours: 0, scoreSum: 0, scoredTitles: 0 };
    cur.titles += 1;
    cur.hours += ((e.progress ?? 0) * (e.duration ?? 20)) / 60;
    if (Number(e.score || 0) > 0) {
      cur.scoreSum += Number(e.score);
      cur.scoredTitles += 1;
    }
    map.set(year, cur);
  }

  const rows = [...map.entries()].sort((a, b) => a[0] - b[0]);
  const labels = rows.map(([year]) => String(year));
  const values = rows.map(([, v]) => computeMetricValue(v, watchMetric.value));
  return { labels, values };
});

const watchOption = computed(() =>
  makeLineOption(watchYearDist.value.labels, watchYearDist.value.values, metricLabel(watchMetric.value))
);

function getPercent(value: number) {
  if (!totalAnime.value) return "0%";
  const raw = (value / totalAnime.value) * 100;
  if (raw > 0 && raw < 0.1) return "<0.1%";
  return `${raw.toFixed(1)}%`;
}
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <h1 class="text-3xl font-bold">Dashboard</h1>

      <div class="flex gap-2">
        <input
          v-model="username"
          class="ui-input"
          placeholder="AniList Username"
          @keydown.enter.prevent="loadAnime"
          @keydown.space.prevent="loadAnime"
        />
        <button @click="loadAnime" class="ui-btn ui-btn-primary" :disabled="loading">Laden</button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>

    <div v-else-if="error" class="text-red-400">Fehler: {{ error }}</div>

    <div v-else class="space-y-6 rounded-2xl border border-[#1c3554] bg-[#07192d] p-5 text-[#d8e3f3]">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div v-for="item in overviewStats" :key="item.label" class="rounded-xl border border-[#1e3858] bg-[#0e2239] px-4 py-3">
          <div class="text-3xl font-bold tracking-tight">{{ item.value }}</div>
          <div class="text-sm text-[#8fa4bf]">{{ item.label }}</div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <section class="rounded-xl border border-[#1e3858] bg-[#13233a] p-4">
          <h2 class="mb-3 text-xl font-semibold">Format Distribution</h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart :style="{ height: '130px', width: '130px' }" :option="formatOption" autoresize />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div v-for="row in formatDistribution" :key="row.name" class="flex items-center justify-between rounded-lg bg-[#233a57] px-3 py-1.5">
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{ getPercent(row.value) }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-[#1e3858] bg-[#13233a] p-4">
          <h2 class="mb-3 text-xl font-semibold">Status Distribution</h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart :style="{ height: '130px', width: '130px' }" :option="statusOption" autoresize />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div v-for="row in statusDistribution" :key="row.name" class="flex items-center justify-between rounded-lg bg-[#233a57] px-3 py-1.5">
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{ getPercent(row.value) }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-[#1e3858] bg-[#13233a] p-4">
          <h2 class="mb-3 text-xl font-semibold">Country Distribution</h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart :style="{ height: '130px', width: '130px' }" :option="countryOption" autoresize />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div v-for="row in countryDistribution" :key="row.name" class="flex items-center justify-between rounded-lg bg-[#233a57] px-3 py-1.5">
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{ getPercent(row.value) }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="rounded-xl border border-[#1e3858] bg-[#13233a] p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">Score</h2>
          <div class="flex rounded-full bg-[#0d1d32] p-1 text-sm">
            <button class="rounded-full px-3 py-1" :class="scoreMetric === 'titles' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="scoreMetric = 'titles'">Titles Watched</button>
            <button class="rounded-full px-3 py-1" :class="scoreMetric === 'hours' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="scoreMetric = 'hours'">Hours Watched</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="scoreOption" autoresize />
        </ClientOnly>
      </section>

      <section class="rounded-xl border border-[#1e3858] bg-[#13233a] p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">Episode Count</h2>
          <div class="flex rounded-full bg-[#0d1d32] p-1 text-sm">
            <button class="rounded-full px-3 py-1" :class="episodeMetric === 'titles' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="episodeMetric = 'titles'">Titles Watched</button>
            <button class="rounded-full px-3 py-1" :class="episodeMetric === 'hours' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="episodeMetric = 'hours'">Hours Watched</button>
            <button class="rounded-full px-3 py-1" :class="episodeMetric === 'score' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="episodeMetric = 'score'">Mean Score</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="episodeOption" autoresize />
        </ClientOnly>
      </section>

      <section class="rounded-xl border border-[#1e3858] bg-[#13233a] p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">Release Year</h2>
          <div class="flex rounded-full bg-[#0d1d32] p-1 text-sm">
            <button class="rounded-full px-3 py-1" :class="releaseMetric === 'titles' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="releaseMetric = 'titles'">Titles Watched</button>
            <button class="rounded-full px-3 py-1" :class="releaseMetric === 'hours' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="releaseMetric = 'hours'">Hours Watched</button>
            <button class="rounded-full px-3 py-1" :class="releaseMetric === 'score' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="releaseMetric = 'score'">Mean Score</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="releaseOption" autoresize />
        </ClientOnly>
      </section>

      <section class="rounded-xl border border-[#1e3858] bg-[#13233a] p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">Watch Year</h2>
          <div class="flex rounded-full bg-[#0d1d32] p-1 text-sm">
            <button class="rounded-full px-3 py-1" :class="watchMetric === 'titles' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="watchMetric = 'titles'">Titles Watched</button>
            <button class="rounded-full px-3 py-1" :class="watchMetric === 'hours' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="watchMetric = 'hours'">Hours Watched</button>
            <button class="rounded-full px-3 py-1" :class="watchMetric === 'score' ? 'bg-[#7f92aa] text-[#0e2136]' : 'text-[#8fa4bf]'" @click="watchMetric = 'score'">Mean Score</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="watchOption" autoresize />
        </ClientOnly>
      </section>
    </div>
  </div>
</template>
