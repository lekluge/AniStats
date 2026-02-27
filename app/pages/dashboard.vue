<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";

/* -----------------------------
 * ECharts setup (WICHTIG)
 * ----------------------------- */
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, LineChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

/* -----------------------------
 * State
 * ----------------------------- */
const usernameCookie = useCookie<string>("anilist-user", {
  default: () => "",
});

const username = computed({
  get: () => usernameCookie.value ?? "",
  set: (val: string) => {
    usernameCookie.value = val.trim();
  },
});
const loading = ref(false);
const error = ref<string | null>(null);
const entries = ref<AnimeEntry[]>([]);
definePageMeta({ title: "Dashboard", middleware: "auth" });

/* -----------------------------
 * API Call
 * ----------------------------- */
async function loadAnime() {
  loading.value = true;
  error.value = null;

  try {
    if (!username.value) {
      loading.value = false;
      return;
    }

    const res = await api.post("/api/private/anilist", null, {
      params: { user: username.value },
    });

    entries.value = normalizeAnilist(res.data.data.MediaListCollection.lists);
  } catch (e: any) {
    error.value = e?.message ?? "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (username.value) {
    loadAnime();
  }
});
/* -----------------------------
 * KPIs
 * ----------------------------- */
const totalAnime = computed(() => entries.value.length);

const totalEpisodes = computed(() =>
  entries.value.reduce((sum, e) => sum + (e.progress ?? 0), 0)
);

const totalMinutes = computed(() =>
  entries.value.reduce((sum, e) => {
    if (!e.progress || !e.duration) return sum;
    return sum + e.progress * e.duration;
  }, 0)
);

const totalHours = computed(() => Math.round(totalMinutes.value / 60));

const completedCount = computed(
  () => entries.value.filter((e) => e.status === "COMPLETED").length
);

/* -----------------------------
 * Status Chart Data
 * ----------------------------- */
const statusMap = computed(() => {
  const map: Record<string, number> = {};
  for (const e of entries.value) {
    map[e.status] = (map[e.status] || 0) + 1;
  }
  return map;
});
const statusLabels: Record<string, string> = {
  COMPLETED: "Completed",
  PLANNING: "Planning",
  CURRENT: "Watching",
  DROPPED: "Dropped",
  PAUSED: "Paused",
};
const statusColors: Record<string, string> = {
  Completed: "#22c55e", // grün
  Planning: "#a3e635", // hellgrün
  Watching: "#38bdf8", // blau
  Dropped: "#fb7185", // rot
  Paused: "#facc15", // gelb
};
const statusChartData = computed(() =>
  Object.entries(statusMap.value).map(([status, value]) => ({
    name: statusLabels[status] ?? status,
    value,
  }))
);
const statusChartOption = ref<any>(null);

watchEffect(() => {
  if (!statusChartData.value.length) return;

  statusChartOption.value = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `
      <div style="display:flex;gap:8px;align-items:center">
        <span style="
          width:8px;
          height:8px;
          border-radius:999px;
          background:${params.color};
        "></span>
        <div>
          <div style="opacity:.7">${params.name}</div>
          <div style="font-weight:600">
            ${params.value} (${params.percent}%)
          </div>
        </div>
      </div>
    `;
      },
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: "#a1a1aa",
      },
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "75%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#09090b",
          borderWidth: 2,
          color: (params: any) => statusColors[params.name],
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: statusChartData.value,
      },
    ],
  };
});

const watchTimelineData = computed(() => {
  const map: Record<number, number> = {};

  for (const e of entries.value) {
    if (!e.seasonYear) continue;

    const minutes = (e.progress ?? 0) * (e.duration ?? 20);
    map[e.seasonYear] = (map[e.seasonYear] || 0) + minutes;
  }

  return Object.entries(map)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, minutes]) => [
      new Date(Number(year), 0, 1).getTime(),
      Math.round(minutes / 60),
    ]);
});
const timelineChartOption = ref<any>(null);
watchEffect(() => {
  if (!watchTimelineData.value.length) return;

  timelineChartOption.value = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#09090b",
      borderColor: "#27272a",
      textStyle: { color: "#e5e7eb" },
      formatter: (params: any[]) => {
        const p = params[0];
        const [ts, hours] = p.value;

        return `
      <div style="display:flex;gap:8px;align-items:center">
        <span style="
          width:8px;
          height:8px;
          border-radius:999px;
          background:${p.color};
        "></span>
        <div>
          <div style="opacity:.7">${new Date(ts).getFullYear()}</div>
          <div style="font-weight:600">${hours} Stunden</div>
        </div>
      </div>
    `;
      },
    },

    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 40,
    },

    xAxis: {
      type: "time",
      axisLabel: {
        color: "#a1a1aa",
        formatter: (v: number) => `${new Date(v).getFullYear()}`,
      },
      splitLine: { show: false },
    },

    yAxis: {
      type: "value",
      name: "Stunden",
      axisLabel: { color: "#a1a1aa" },
      splitLine: {
        lineStyle: { color: "#27272a" },
      },
    },

    series: [
      {
        type: "line",
        data: watchTimelineData.value,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          color: "#a78bfa",
          width: 3,
        },
        itemStyle: {
          color: "#a78bfa",
        },
        areaStyle: {
          color: "rgba(167,139,250,0.15)",
        },
      },
    ],
  };
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-3xl font-bold">Dashboard</h1>

      <div class="flex gap-2">
        <input
          v-model="username"
          class="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
          placeholder="AniList Username"
          @keydown.enter.prevent="loadAnime"
          @keydown.space.prevent="loadAnime"

        />
        <button
          @click="loadAnime"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
          :disabled="loading"
        >
          Laden
        </button>
      </div>
    </div>

    <!-- States -->
    <div v-if="loading" class="text-zinc-400">Lade AniList Daten…</div>

    <div v-else-if="error" class="text-red-400">Fehler: {{ error }}</div>

    <!-- KPI Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div class="text-sm text-zinc-400">Anime</div>
        <div class="mt-2 text-2xl font-semibold">
          {{ totalAnime }}
        </div>
      </div>

      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div class="text-sm text-zinc-400">Episoden</div>
        <div class="mt-2 text-2xl font-semibold">
          {{ totalEpisodes }}
        </div>
      </div>

      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div class="text-sm text-zinc-400">Stunden</div>
        <div class="mt-2 text-2xl font-semibold">
          {{ totalHours }}
        </div>
      </div>

      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div class="text-sm text-zinc-400">Completed</div>
        <div class="mt-2 text-2xl font-semibold">
          {{ completedCount }}
        </div>
      </div>
      <div
        class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:col-span-8 lg:col-span-4"
      >
        <h2 class="mb-4 text-lg font-semibold">Status-Verteilung</h2>
        <ClientOnly>
          <VChart
            v-if="statusChartOption"
            :style="{ height: '300px', width: '100%' }"
            :option="statusChartOption"
            autoresize
          />
        </ClientOnly>
      </div>
      <div
        class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:col-span-8 lg:col-span-4"
      >
        <h2 class="mb-4 text-lg font-semibold">Anime Release Jahr</h2>

        <ClientOnly>
          <VChart
            v-if="timelineChartOption"
            :style="{ height: '320px', width: '100%' }"
            :option="timelineChartOption"
            autoresize
          />
        </ClientOnly>
      </div>
      <div
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:col-span-8 lg:col-span-4"
      ></div>
    </div>
  </div>
</template>
