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
const { t } = useLocale();

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
const anilistStats = ref<{ episodesWatched: number | null; minutesWatched: number | null }>({
  episodesWatched: null,
  minutesWatched: null,
});

const scoreMetric = ref<MetricMode>("titles");
const episodeMetric = ref<MetricMode>("titles");
const releaseMetric = ref<MetricMode>("titles");
const watchMetric = ref<MetricMode>("titles");

const { theme } = useTheme();
const chartPalette = computed(() => {
  if (theme.value === "dark") {
    return {
      text: "#8fa4bf",
      textStrong: "#b7c6d9",
      axis: "#2a3f5c",
      split: "#20354f",
      tooltipBg: "#0d1a2c",
      tooltipBorder: "#243854",
      tooltipText: "#eaf0f8",
      line: "#7f92aa",
      bar: "#95a8bf",
      area: "rgba(127,146,170,0.14)",
      panelBg: "#13233a",
    };
  }

  return {
    text: "#5f6c7b",
    textStrong: "#2a3d52",
    axis: "#c8d5e6",
    split: "#dbe5f0",
    tooltipBg: "#ffffff",
    tooltipBorder: "#dbe5f0",
    tooltipText: "#1f2a37",
    line: "#2f8fdb",
    bar: "#3db4f2",
    area: "rgba(61,180,242,0.16)",
    panelBg: "#f8fbff",
  };
});

async function loadAnime() {
  loading.value = true;
  error.value = null;

  try {
    const currentUser = username.value.trim();
    if (!currentUser) {
      entries.value = [];
      anilistStats.value = { episodesWatched: null, minutesWatched: null };
      lastLoadedUser.value = "";
      loading.value = false;
      return;
    }

    const res = await api.post("/api/private/anilist", null, {
      params: { user: currentUser },
    });

    entries.value = normalizeAnilist(res.data.data.MediaListCollection.lists);
    anilistStats.value = {
      episodesWatched: Number.isFinite(Number(res.data.data.stats?.episodesWatched))
        ? Number(res.data.data.stats.episodesWatched)
        : null,
      minutesWatched: Number.isFinite(Number(res.data.data.stats?.minutesWatched))
        ? Number(res.data.data.stats.minutesWatched)
        : null,
    };
    lastLoadedUser.value = currentUser;
  } catch {
    error.value = `${t("common.errorPrefix")}: ${t("dashboard.loadError")}`;
    anilistStats.value = { episodesWatched: null, minutesWatched: null };
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
      anilistStats.value = { episodesWatched: null, minutesWatched: null };
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
const completedEntries = computed(() => entries.value.filter((e) => e.status === "COMPLETED"));
const watchedEntries = computed(() =>
  entries.value.filter((e) => e.status === "COMPLETED" || e.status === "CURRENT" || e.status === "REPEATING" || e.status === "PAUSED" || e.status === "DROPPED")
);

const totalAnime = computed(() => completedEntries.value.length);
const totalEpisodes = computed(() =>
  typeof anilistStats.value.episodesWatched === "number"
    ? anilistStats.value.episodesWatched
    : watchedEntries.value.reduce((sum, e) => sum + (e.progress ?? 0), 0)
);
const totalMinutes = computed(() =>
  typeof anilistStats.value.minutesWatched === "number"
    ? anilistStats.value.minutesWatched
    : watchedEntries.value.reduce((sum, e) => {
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

const scoredEntries = computed(() => completedEntries.value.filter((e) => Number(e.score ?? 0) > 0));
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
  { label: t("dashboard.totalAnime"), value: totalAnime.value },
  { label: t("dashboard.episodesWatched"), value: totalEpisodes.value },
  { label: t("dashboard.daysWatched"), value: totalDaysWatched.value },
  { label: t("dashboard.daysPlanned"), value: totalPlannedDays.value },
  { label: t("dashboard.meanScore"), value: meanScore.value },
  { label: t("dashboard.standardDeviation"), value: scoreStdDev.value },
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
  const palette = chartPalette.value;
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: palette.tooltipBg,
      borderColor: palette.tooltipBorder,
      textStyle: { color: palette.tooltipText },
    },
    grid: { left: 24, right: 16, top: 20, bottom: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: palette.text, fontWeight: 600 },
      axisLine: { lineStyle: { color: palette.axis } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      name: labelName,
      nameTextStyle: { color: palette.text },
      axisLabel: { color: palette.text },
      splitLine: { lineStyle: { color: palette.split } },
    },
    series: [
      {
        type: "bar",
        data: values,
        barMaxWidth: 42,
        itemStyle: { color: palette.bar, borderRadius: [6, 6, 0, 0] },
        label: { show: true, position: "top", color: palette.textStrong, fontWeight: 600 },
      },
    ],
  };
}

function makeLineOption(labels: string[], values: number[], labelName: string) {
  const palette = chartPalette.value;
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: palette.tooltipBg,
      borderColor: palette.tooltipBorder,
      textStyle: { color: palette.tooltipText },
    },
    grid: { left: 24, right: 16, top: 20, bottom: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: palette.text, fontWeight: 600 },
      axisLine: { lineStyle: { color: palette.axis } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      name: labelName,
      nameTextStyle: { color: palette.text },
      axisLabel: { color: palette.text },
      splitLine: { lineStyle: { color: palette.split } },
    },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: palette.line, width: 3 },
        itemStyle: { color: palette.line },
        areaStyle: { color: palette.area },
        label: { show: true, position: "top", color: palette.textStrong, fontWeight: 600 },
      },
    ],
  };
}

function metricLabel(mode: MetricMode) {
  if (mode === "titles") return t("dashboard.titles");
  if (mode === "hours") return t("common.hours");
  return t("dashboard.meanScore");
}

function mapCountry(value?: string | null) {
  const key = (value ?? "").toUpperCase();
  if (key === "JP") return t("dashboard.japan");
  if (key === "KR") return t("dashboard.korea");
  if (key === "CN") return t("dashboard.china");
  if (!key) return t("common.unknown");
  return key;
}

const formatOrder = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL", "MUSIC", "TV_SHORT"];
const formatDistribution = computed(() => {
  const map: Record<string, number> = {};
  for (const e of completedEntries.value) {
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

const statusLabels = computed<Record<string, string>>(() => ({
  COMPLETED: t("dashboard.completed"),
  PLANNING: t("dashboard.planning"),
  CURRENT: t("dashboard.watching"),
  DROPPED: t("dashboard.dropped"),
  PAUSED: t("dashboard.paused"),
  REPEATING: t("dashboard.repeating"),
}));
const statusDistribution = computed(() => {
  const map: Record<string, number> = {};
  for (const e of completedEntries.value) {
    map[e.status] = (map[e.status] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name: statusLabels.value[name] ?? name, value }));
});

const countryDistribution = computed(() => {
  const map: Record<string, number> = {};
  for (const e of completedEntries.value) {
    const key = mapCountry(e.countryOfOrigin);
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
});

function makeDonutOption(rows: Array<{ name: string; value: number }>) {
  const palette = chartPalette.value;
  const pieRows = rows.filter((r) => r.value > 0);
  const hasSingleSlice = pieRows.length <= 1;

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: palette.tooltipBg,
      borderColor: palette.tooltipBorder,
      textStyle: { color: palette.tooltipText },
    },
    legend: { show: false },
    series: [
      {
        type: "pie",
        radius: ["62%", "82%"],
        center: ["50%", "50%"],
        data: pieRows.length ? pieRows : [{ name: t("common.unknown"), value: 1 }],
        label: { show: false },
        itemStyle: {
          borderWidth: hasSingleSlice ? 0 : 2,
          borderColor: palette.panelBg,
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
  { label: t("common.unknown"), match: (n: number | null) => n === null || n === 0 },
];

const episodeDist = computed(() => {
  const map = new Map<string, { titles: number; hours: number; scoreSum: number; scoredTitles: number }>();
  for (const b of episodeBins) map.set(b.label, { titles: 0, hours: 0, scoreSum: 0, scoredTitles: 0 });

  for (const e of completedEntries.value) {
    const ep = e.episodes ?? null;
    const bucket = episodeBins.find((b) => b.match(ep))?.label ?? t("common.unknown");
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
  for (const e of completedEntries.value) {
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
  for (const e of completedEntries.value) {
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

function buildPercentLabels(rows: Array<{ name: string; value: number }>) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (!total) {
    return Object.fromEntries(rows.map((row) => [row.name, "0.0%"])) as Record<string, string>;
  }

  const scaled = rows.map((row) => {
    const exactTenths = (row.value / total) * 1000;
    const baseTenths = Math.floor(exactTenths);
    return {
      name: row.name,
      baseTenths,
      remainder: exactTenths - baseTenths,
    };
  });

  let missingTenths = 1000 - scaled.reduce((sum, row) => sum + row.baseTenths, 0);
  scaled.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < scaled.length && missingTenths > 0; i++) {
    scaled[i].baseTenths += 1;
    missingTenths -= 1;
  }

  return Object.fromEntries(
    scaled.map((row) => [row.name, `${(row.baseTenths / 10).toFixed(1)}%`])
  ) as Record<string, string>;
}

const formatPercentLabels = computed(() => buildPercentLabels(formatDistribution.value));
const statusPercentLabels = computed(() => buildPercentLabels(statusDistribution.value));
const countryPercentLabels = computed(() => buildPercentLabels(countryDistribution.value));
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <h1 class="text-3xl font-bold">{{ t("dashboard.title") }}</h1>

      <div class="flex gap-2">
        <input
          v-model="username"
          class="ui-input"
          :placeholder="t('common.usernamePlaceholder')"
          @keydown.enter.prevent="loadAnime"
          @keydown.space.prevent="loadAnime"
        />
        <button @click="loadAnime" class="ui-btn ui-btn-primary" :disabled="loading">{{ t("common.load") }}</button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>

    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <div v-else class="dashboard-shell">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div v-for="item in overviewStats" :key="item.label" class="dashboard-kpi">
          <div class="text-3xl font-bold tracking-tight">{{ item.value }}</div>
          <div class="dashboard-kpi-label">{{ item.label }}</div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <section class="dashboard-panel">
          <h2 class="mb-3 text-xl font-semibold">{{ t("dashboard.formatDistribution") }}</h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart :style="{ height: '130px', width: '130px' }" :option="formatOption" autoresize />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div v-for="row in formatDistribution" :key="row.name" class="dashboard-legend-row">
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{ formatPercentLabels[row.name] }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard-panel">
          <h2 class="mb-3 text-xl font-semibold">{{ t("dashboard.statusDistribution") }}</h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart :style="{ height: '130px', width: '130px' }" :option="statusOption" autoresize />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div v-for="row in statusDistribution" :key="row.name" class="dashboard-legend-row">
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{ statusPercentLabels[row.name] }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard-panel">
          <h2 class="mb-3 text-xl font-semibold">{{ t("dashboard.countryDistribution") }}</h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart :style="{ height: '130px', width: '130px' }" :option="countryOption" autoresize />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div v-for="row in countryDistribution" :key="row.name" class="dashboard-legend-row">
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{ countryPercentLabels[row.name] }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">{{ t("dashboard.scoreChart") }}</h2>
          <div class="dashboard-toggle">
            <button class="rounded-full px-3 py-1" :class="scoreMetric === 'titles' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="scoreMetric = 'titles'">{{ t("dashboard.titlesWatched") }}</button>
            <button class="rounded-full px-3 py-1" :class="scoreMetric === 'hours' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="scoreMetric = 'hours'">{{ t("dashboard.hoursWatched") }}</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="scoreOption" autoresize />
        </ClientOnly>
      </section>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">{{ t("dashboard.episodeCount") }}</h2>
          <div class="dashboard-toggle">
            <button class="rounded-full px-3 py-1" :class="episodeMetric === 'titles' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="episodeMetric = 'titles'">{{ t("dashboard.titlesWatched") }}</button>
            <button class="rounded-full px-3 py-1" :class="episodeMetric === 'hours' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="episodeMetric = 'hours'">{{ t("dashboard.hoursWatched") }}</button>
            <button class="rounded-full px-3 py-1" :class="episodeMetric === 'score' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="episodeMetric = 'score'">{{ t("dashboard.meanScoreTab") }}</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="episodeOption" autoresize />
        </ClientOnly>
      </section>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">{{ t("dashboard.releaseYear") }}</h2>
          <div class="dashboard-toggle">
            <button class="rounded-full px-3 py-1" :class="releaseMetric === 'titles' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="releaseMetric = 'titles'">{{ t("dashboard.titlesWatched") }}</button>
            <button class="rounded-full px-3 py-1" :class="releaseMetric === 'hours' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="releaseMetric = 'hours'">{{ t("dashboard.hoursWatched") }}</button>
            <button class="rounded-full px-3 py-1" :class="releaseMetric === 'score' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="releaseMetric = 'score'">{{ t("dashboard.meanScoreTab") }}</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="releaseOption" autoresize />
        </ClientOnly>
      </section>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">{{ t("dashboard.watchYear") }}</h2>
          <div class="dashboard-toggle">
            <button class="rounded-full px-3 py-1" :class="watchMetric === 'titles' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="watchMetric = 'titles'">{{ t("dashboard.titlesWatched") }}</button>
            <button class="rounded-full px-3 py-1" :class="watchMetric === 'hours' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="watchMetric = 'hours'">{{ t("dashboard.hoursWatched") }}</button>
            <button class="rounded-full px-3 py-1" :class="watchMetric === 'score' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'" @click="watchMetric = 'score'">{{ t("dashboard.meanScoreTab") }}</button>
          </div>
        </div>
        <ClientOnly>
          <VChart :style="{ height: '280px', width: '100%' }" :option="watchOption" autoresize />
        </ClientOnly>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-shell {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-kpi {
  border: 1px solid var(--border);
  background: var(--surface-soft);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
}

.dashboard-kpi-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.dashboard-panel {
  border: 1px solid var(--border);
  background: var(--surface-soft);
  border-radius: 0.75rem;
  padding: 1rem;
}

.dashboard-legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.5rem;
  background: var(--surface-muted);
  padding: 0.375rem 0.75rem;
}

.dashboard-percent {
  color: var(--text-soft);
}

.dashboard-toggle {
  display: flex;
  border-radius: 9999px;
  background: var(--surface-muted);
  padding: 0.25rem;
  font-size: 0.875rem;
}

.dashboard-toggle-btn {
  color: var(--text-muted);
}

.dashboard-toggle-btn-active {
  background: var(--primary);
  color: #fff;
}
</style>
