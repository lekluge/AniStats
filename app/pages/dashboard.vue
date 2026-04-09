<script setup lang="ts">
import { api } from "~/composables/useApi";
import { normalizeAnilist } from "~/utils/normalizeAnilist";
import type { AnimeEntry } from "~/types/anime";

import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, LineChart, BarChart, ScatterChart } from "echarts/charts";
import { TooltipComponent, LegendComponent, GridComponent, VisualMapComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, PieChart, LineChart, BarChart, ScatterChart, TooltipComponent, LegendComponent, GridComponent, VisualMapComponent]);

type MetricMode = "titles" | "hours" | "score";

definePageMeta({ title: "Dashboard", middleware: "auth" });
const { t } = useLocale();

const username = useAnilistUser();

const loading = ref(false);
const error = ref<string | null>(null);
const entries = ref<AnimeEntry[]>([]);
const lastLoadedUser = ref("");
const anilistStats = ref<{
  episodesWatched: number | null;
  minutesWatched: number | null;
}>({
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

    if (!/^[a-zA-Z0-9_-]{1,30}$/.test(currentUser)) {
      error.value = "Invalid username format";
      loading.value = false;
      return;
    }

    const res = await api.post("/api/private/anilist", null, {
      params: { user: currentUser },
    });

    entries.value = normalizeAnilist(res.data.data.MediaListCollection.lists);
    anilistStats.value = {
      episodesWatched: Number.isFinite(
        Number(res.data.data.stats?.episodesWatched),
      )
        ? Number(res.data.data.stats.episodesWatched)
        : null,
      minutesWatched: Number.isFinite(
        Number(res.data.data.stats?.minutesWatched),
      )
        ? Number(res.data.data.stats.minutesWatched)
        : null,
    };
    lastLoadedUser.value = currentUser;
  } catch (e) {
    console.error("[Dashboard]", e);
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
  { immediate: true },
);

onUnmounted(() => {
  if (autoLoadTimer) clearTimeout(autoLoadTimer);
});
const completedEntries = computed(() =>
  entries.value.filter((e) => e.status === "COMPLETED"),
);
const watchedEntries = computed(() =>
  entries.value.filter(
    (e) =>
      e.status === "COMPLETED" ||
      e.status === "CURRENT" ||
      e.status === "REPEATING" ||
      e.status === "PAUSED" ||
      e.status === "DROPPED",
  ),
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
const totalDaysWatched = computed(() =>
  Number((totalMinutes.value / 60 / 24).toFixed(1)),
);

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

// ─── Milestones ──────────────────────────────────────────────────────────────

interface Milestone {
  kind: "anime" | "watchtime";
  label: string;     // e.g. "100th Anime" | "50 Days Watched"
  value: number;     // count or days
  title: string | null;
  date: string | null;
}

function fuzzyDateToTimestamp(fd: { year?: number | null; month?: number | null; day?: number | null } | null): number {
  if (!fd?.year) return 0;
  return Date.UTC(fd.year, Math.max((fd.month ?? 1) - 1, 0), Math.max(fd.day ?? 1, 1));
}

function formatFuzzyDate(fd: { year?: number | null; month?: number | null; day?: number | null } | null): string | null {
  if (!fd?.year) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts: string[] = [];
  if (fd.day) parts.push(String(fd.day));
  if (fd.month) parts.push(months[(fd.month ?? 1) - 1]);
  parts.push(String(fd.year));
  return parts.join(" ");
}

const ANIME_MILESTONE_INTERVALS = [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
const WATCHTIME_MILESTONE_DAYS = [10, 25, 50, 75, 100, 150, 200, 250, 300];

const milestones = computed<Milestone[]>(() => {
  const result: Milestone[] = [];

  // Sort completed entries by completedAt date ascending
  const sorted = [...completedEntries.value]
    .filter((e) => fuzzyDateToTimestamp(e.completedAt) > 0)
    .sort((a, b) => fuzzyDateToTimestamp(a.completedAt) - fuzzyDateToTimestamp(b.completedAt));

  if (sorted.length === 0) return result;

  // Anime count milestones
  for (const n of ANIME_MILESTONE_INTERVALS) {
    if (n > sorted.length) break;
    const entry = sorted[n - 1];
    const titleEn = entry.title?.english?.trim() || null;
    const titleRo = entry.title?.romaji?.trim() || null;
    result.push({
      kind: "anime",
      label: `${n}`,
      value: n,
      title: titleEn ?? titleRo,
      date: formatFuzzyDate(entry.completedAt),
    });
  }

  // Watch-time milestones: accumulate minutes up to each completedAt date
  // Use per-entry estimate: progress * duration
  let cumulativeMinutes = 0;
  let nextDayMilestoneIndex = 0;

  for (const entry of sorted) {
    const entryMinutes = (entry.progress ?? 0) * (entry.duration ?? 20);
    cumulativeMinutes += entryMinutes;

    while (
      nextDayMilestoneIndex < WATCHTIME_MILESTONE_DAYS.length &&
      cumulativeMinutes / 60 / 24 >= WATCHTIME_MILESTONE_DAYS[nextDayMilestoneIndex]
    ) {
      const days = WATCHTIME_MILESTONE_DAYS[nextDayMilestoneIndex];
      // Only add if we have at least a rough date
      if (fuzzyDateToTimestamp(entry.completedAt) > 0) {
        result.push({
          kind: "watchtime",
          label: `${days}`,
          value: days,
          title: null,
          date: formatFuzzyDate(entry.completedAt),
        });
      }
      nextDayMilestoneIndex++;
    }

  }

  // Sort milestones by kind (anime first), then by value ascending
  result.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "anime" ? -1 : 1;
    return a.value - b.value;
  });

  return result;
});

const scoredEntries = computed(() =>
  completedEntries.value.filter((e) => Number(e.score ?? 0) > 0),
);
const meanScore = computed(() => {
  if (!scoredEntries.value.length) return 0;
  const sum = scoredEntries.value.reduce((acc, e) => acc + Number(e.score), 0);
  return Number((sum / scoredEntries.value.length).toFixed(1));
});

const scoreStdDev = computed(() => {
  if (scoredEntries.value.length <= 1) return 0;
  const mean = meanScore.value;
  const variance =
    scoredEntries.value.reduce(
      (acc, e) => acc + (Number(e.score) - mean) ** 2,
      0,
    ) / scoredEntries.value.length;
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
  bucket: {
    titles: number;
    hours: number;
    scoreSum: number;
    scoredTitles: number;
  },
  mode: MetricMode,
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
        label: {
          show: true,
          position: "top",
          color: palette.textStrong,
          fontWeight: 600,
        },
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
        label: {
          show: true,
          position: "top",
          color: palette.textStrong,
          fontWeight: 600,
        },
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

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function wrapTextByWords(text: string, maxCharsPerLine = 34, maxLines = 3) {
  const normalized = (text ?? "").trim();
  if (!normalized) return "";

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length >= maxLines - 1) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  const hasOverflow = words.join(" ").length > lines.join(" ").length;
  if (hasOverflow && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxCharsPerLine - 1
      ? `${last.slice(0, maxCharsPerLine - 1)}…`
      : `${last}…`;
  }

  return lines.join("\n");
}

function getRangeHighlightStyle(min: number, max: number, from: number, to: number) {
  const span = Math.max(max - min, 0.0001);
  const start = ((from - min) / span) * 100;
  const end = ((to - min) / span) * 100;
  return {
    "--range-start": `${Math.max(0, Math.min(100, start))}%`,
    "--range-end": `${Math.max(0, Math.min(100, end))}%`,
  };
}

type AtlasPoint = {
  id: number;
  title: string;
  subtitle: string;
  genres: string[];
  tags: string[];
  dominantGenre: string;
  score: number;
  density: number;
  scoreNorm: number;
  isWatched: boolean;
  color?: string;
  value: [number, number, number, number];
};

type AtlasTag = {
  name: string;
  rank: number;
};

type AtlasEntry = {
  id: number;
  titleEn: string;
  titleRo: string;
  genres: string[];
  tags: AtlasTag[];
  score: number;
  progress: number;
  duration: number | null;
  seasonYear: number | null;
  completedYear: number | null;
  isWatched: boolean;
};

type AtlasSourceMode = "mine" | "all";
type AtlasCatalogApiItem = {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  averageScore: number | null;
  seasonYear: number | null;
  startYear: number | null;
  genres: string[];
  tags: Array<{ name: string; rank: number | null }>;
};

const atlasSourceMode = ref<AtlasSourceMode>("mine");
const atlasCatalogLoading = ref(false);
const atlasCatalogError = ref<string | null>(null);
const atlasCatalogItems = ref<AtlasCatalogApiItem[]>([]);

const atlasSearch = ref("");
const atlasSelectedGenres = ref<string[]>([]);
const atlasScoreMin = ref(5);
const atlasScoreMax = ref(10);
const atlasYearMin = ref(2000);
const atlasYearMax = ref(new Date().getFullYear());

const atlasGenrePalette = [
  "#60a5fa",
  "#2dd4bf",
  "#a3e635",
  "#f59e0b",
  "#f97316",
  "#fb7185",
  "#a78bfa",
  "#22d3ee",
];

async function loadAtlasCatalog() {
  if (atlasCatalogItems.value.length > 0 || atlasCatalogLoading.value) return;

  atlasCatalogLoading.value = true;
  atlasCatalogError.value = null;

  try {
    const res = await api.get<{ total: number; items: AtlasCatalogApiItem[] }>("/api/private/atlas-catalog");
    atlasCatalogItems.value = res.data.items ?? [];
  } catch (e) {
    console.error("[Dashboard]", e);
    atlasCatalogError.value = `${t("common.errorPrefix")}: ${t("dashboard.atlasCatalogLoadError")}`;
  } finally {
    atlasCatalogLoading.value = false;
  }
}

watch(
  atlasSourceMode,
  async (mode) => {
    if (mode === "all") {
      await loadAtlasCatalog();
    }
  },
  { immediate: true }
);

const atlasWatchedBaseEntries = computed<AtlasEntry[]>(() =>
  watchedEntries.value
    .filter((entry) => (entry.genres?.length ?? 0) > 0 || (entry.tags?.length ?? 0) > 0)
    .map((entry) => ({
      id: entry.id,
      titleEn: entry.title.english ?? entry.title.romaji ?? `#${entry.id}`,
      titleRo: entry.title.romaji ?? entry.title.english ?? "",
      genres: entry.genres ?? [],
      tags: (entry.tags ?? []).map((tag) => ({
        name: tag.name,
        rank: Number(tag.rank ?? 0),
      })),
      score: Number(entry.score ?? 0),
      progress: Number(entry.progress ?? 0),
      duration: entry.duration ?? null,
      seasonYear: entry.seasonYear ?? null,
      completedYear: entry.completedAt?.year ?? null,
      isWatched: true,
    }))
);

const atlasCatalogBaseEntries = computed<AtlasEntry[]>(() =>
  atlasCatalogItems.value.map((entry) => ({
    id: entry.id,
    titleEn: entry.titleEn ?? entry.titleRo ?? `#${entry.id}`,
    titleRo: entry.titleRo ?? entry.titleEn ?? "",
    genres: entry.genres ?? [],
    tags: (entry.tags ?? []).map((tag) => ({
      name: tag.name,
      rank: Number(tag.rank ?? 0),
    })),
    score: typeof entry.averageScore === "number" ? Number((entry.averageScore / 10).toFixed(1)) : 0,
    progress: 0,
    duration: null,
    seasonYear: entry.seasonYear ?? entry.startYear ?? null,
    completedYear: null,
    isWatched: false,
  }))
);

const atlasBaseEntries = computed<AtlasEntry[]>(() => {
  if (atlasSourceMode.value === "mine") return atlasWatchedBaseEntries.value;

  const watchedIds = new Set<number>(atlasWatchedBaseEntries.value.map((entry) => entry.id));
  const unseenCatalog = atlasCatalogBaseEntries.value.filter((entry) => !watchedIds.has(entry.id));
  return [...atlasWatchedBaseEntries.value, ...unseenCatalog];
});

const atlasGenreOptions = computed(() => {
  const map = new Map<string, number>();
  for (const entry of atlasBaseEntries.value) {
    for (const genre of entry.genres) {
      map.set(genre, (map.get(genre) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18)
    .map(([genre, count]) => ({ genre, count }));
});

const atlasBounds = computed(() => {
  const scoreValues = atlasBaseEntries.value
    .map((entry) => Number(entry.score ?? 0))
    .filter((value) => Number.isFinite(value) && value >= 0);

  const yearValues = atlasBaseEntries.value
    .map((entry) => entry.seasonYear ?? entry.completedYear ?? null)
    .filter((value): value is number => typeof value === "number" && value > 0);

  const scoreMin = scoreValues.length ? Math.floor(Math.min(...scoreValues)) : 0;
  const scoreMaxRaw = scoreValues.length ? Math.ceil(Math.max(...scoreValues)) : 10;
  const scoreMax = Math.max(scoreMaxRaw, scoreMin + 1);

  const yearMin = yearValues.length ? Math.min(...yearValues) : 2000;
  const yearMaxRaw = yearValues.length ? Math.max(...yearValues) : new Date().getFullYear();
  const yearMax = Math.max(yearMaxRaw, yearMin + 1);

  return { scoreMin, scoreMax, yearMin, yearMax };
});

watch(
  atlasBounds,
  (bounds) => {
    atlasScoreMin.value = Math.max(bounds.scoreMin, Math.min(atlasScoreMin.value, bounds.scoreMax));
    atlasScoreMax.value = Math.min(bounds.scoreMax, Math.max(atlasScoreMax.value, bounds.scoreMin));
    if (atlasScoreMin.value > atlasScoreMax.value) atlasScoreMin.value = atlasScoreMax.value;

    atlasYearMin.value = Math.max(bounds.yearMin, Math.min(atlasYearMin.value, bounds.yearMax));
    atlasYearMax.value = Math.min(bounds.yearMax, Math.max(atlasYearMax.value, bounds.yearMin));
    if (atlasYearMin.value > atlasYearMax.value) atlasYearMin.value = atlasYearMax.value;
  },
  { immediate: true }
);

function toggleAtlasGenre(genre: string) {
  if (atlasSelectedGenres.value.includes(genre)) {
    atlasSelectedGenres.value = atlasSelectedGenres.value.filter((g) => g !== genre);
    return;
  }
  atlasSelectedGenres.value = [...atlasSelectedGenres.value, genre];
}

function resetAtlasFilters() {
  atlasSearch.value = "";
  atlasSelectedGenres.value = [];
  atlasScoreMin.value = atlasBounds.value.scoreMin;
  atlasScoreMax.value = atlasBounds.value.scoreMax;
  atlasYearMin.value = atlasBounds.value.yearMin;
  atlasYearMax.value = atlasBounds.value.yearMax;
}

const atlasFilteredEntries = computed(() => {
  const query = atlasSearch.value.trim().toLowerCase();

  return atlasBaseEntries.value.filter((entry) => {
    const score = Number(entry.score ?? 0);
    if (score < atlasScoreMin.value || score > atlasScoreMax.value) return false;

    const year = entry.seasonYear ?? entry.completedYear ?? null;
    if (year && (year < atlasYearMin.value || year > atlasYearMax.value)) return false;

    if (atlasSelectedGenres.value.length > 0) {
      if (!atlasSelectedGenres.value.every((genre) => entry.genres.includes(genre))) return false;
    }

    if (!query) return true;

    const titleEn = entry.titleEn.toLowerCase();
    const titleRo = entry.titleRo.toLowerCase();
    const genres = entry.genres.join(" ").toLowerCase();
    const tags = entry.tags.map((tag) => tag.name).join(" ").toLowerCase();

    return titleEn.includes(query) || titleRo.includes(query) || genres.includes(query) || tags.includes(query);
  });
});

type AtlasDerivedPoint = {
  id: number;
  title: string;
  subtitle: string;
  genres: string[];
  tags: string[];
  dominantGenre: string;
  score: number;
  density: number;
  scoreNorm: number;
  size: number;
  x: number;
  y: number;
  isWatched: boolean;
};

function buildAtlasDerivedPoints(): AtlasDerivedPoint[] {
  const source = atlasFilteredEntries.value
    .sort((a, b) => {
      const aWeight = (a.progress ?? 0) * (a.duration ?? 20) + (a.score ?? 0) * 15;
      const bWeight = (b.progress ?? 0) * (b.duration ?? 20) + (b.score ?? 0) * 15;
      return bWeight - aWeight;
    })
    .slice(0, 1000);

  if (!source.length) return [];

  const raw = source.map((entry) => {
    const tokenWeights: Array<{ key: string; weight: number }> = [];
    const score = Number(entry.score ?? 0);
    const dominantGenre = entry.genres[0] ?? t("common.unknown");
    const rankedTags = [...entry.tags]
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 12);

    // Genre-Modus: Positionierung primär nach Hauptgenre.
    // Leichter, deterministischer Jitter verhindert vollständiges Überlappen.
    tokenWeights.push({ key: `gmain:${dominantGenre}`, weight: 2.2 });
    tokenWeights.push({ key: `gj:${dominantGenre}:${entry.id % 29}`, weight: 0.42 });

    // Neben-Genres ziehen den Punkt leicht in benachbarte Genre-Cluster.
    for (const genre of entry.genres.slice(1, 5)) {
      tokenWeights.push({ key: `gblend:${genre}`, weight: 0.72 });
    }

    let x = 0;
    let y = 0;
    let totalWeight = 0;

    for (const token of tokenWeights) {
      const h1 = hashString(`${token.key}:x`);
      const h2 = hashString(`${token.key}:y`);
      const angle = ((h1 % 360) * Math.PI) / 180;
      const radial = 0.45 + ((h2 % 1000) / 1000) * 0.9;

      x += Math.cos(angle) * radial * token.weight;
      y += Math.sin(angle) * radial * token.weight;
      totalWeight += token.weight;
    }

    if (totalWeight > 0) {
      x /= totalWeight;
      y /= totalWeight;
    }

    const progress = Number(entry.progress ?? 0);
    const size = Math.max(
      4,
      Math.min(
        18,
        3.5 +
          Math.log2(1 + Math.max(progress, 1)) * 1.1 +
          (score > 0 ? score / 10 : 0.6) * 3.2
      )
    );

    return {
      id: entry.id,
      title: entry.titleEn,
      subtitle: entry.titleRo,
      genres: entry.genres,
      tags: rankedTags.map((tag) => tag.name),
      dominantGenre,
      score,
      x,
      y,
      size,
      isWatched: entry.isWatched,
    };
  });

  const minX = Math.min(...raw.map((item) => item.x));
  const maxX = Math.max(...raw.map((item) => item.x));
  const minY = Math.min(...raw.map((item) => item.y));
  const maxY = Math.max(...raw.map((item) => item.y));

  const scaleX = Math.max(maxX - minX, 0.0001);
  const scaleY = Math.max(maxY - minY, 0.0001);

  const normalized = raw.map((item) => ({
    ...item,
    nx: ((item.x - minX) / scaleX) * 2 - 1,
    ny: ((item.y - minY) / scaleY) * 2 - 1,
  }));

  const radiusSq = 0.075 * 0.075;
  const densities = normalized.map((base, i) => {
    let local = 0;
    for (let j = 0; j < normalized.length; j++) {
      if (i === j) continue;
      const dx = base.nx - normalized[j].nx;
      const dy = base.ny - normalized[j].ny;
      if (dx * dx + dy * dy <= radiusSq) local += 1;
    }
    return local;
  });

  const maxDensity = Math.max(...densities, 1);
  const maxScored = Math.max(
    ...normalized.map((item) => (item.score > 0 ? item.score : 0)),
    1
  );

  const projected = normalized.map((item, idx) => {
    const density = Number((densities[idx] / maxDensity).toFixed(4));
    const scoreNorm = item.score > 0 ? Number((item.score / maxScored).toFixed(4)) : 0;

    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      genres: item.genres,
      tags: item.tags,
      dominantGenre: item.dominantGenre,
      score: item.score,
      density,
      scoreNorm,
      size: item.size,
      x: item.nx,
      y: item.ny,
      isWatched: item.isWatched,
    };
  });

  return projected;
}

const atlasDerivedPoints = computed(() => buildAtlasDerivedPoints());
const atlasGenreCounts = computed(() => {
  const map = new Map<string, number>();
  for (const point of atlasDerivedPoints.value) {
    map.set(point.dominantGenre, (map.get(point.dominantGenre) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
});

const atlasGenreColorMap = computed(() => {
  const map = new Map<string, string>();
  const top = atlasGenreCounts.value.slice(0, atlasGenrePalette.length);
  top.forEach(([genre], idx) => map.set(genre, atlasGenrePalette[idx]));
  return map;
});

const atlasGenreLegendRows = computed(() =>
  atlasGenreCounts.value.slice(0, atlasGenrePalette.length).map(([genre, count], idx) => ({
    genre,
    count,
    color: atlasGenrePalette[idx],
  }))
);

const atlasPoints = computed<AtlasPoint[]>(() =>
  atlasDerivedPoints.value.map((point) => ({
    id: point.id,
    title: point.title,
    subtitle: point.subtitle,
    genres: point.genres,
    tags: point.tags,
    dominantGenre: point.dominantGenre,
    score: point.score,
    density: point.density,
    scoreNorm: point.scoreNorm,
    isWatched: point.isWatched,
    color: atlasGenreColorMap.value.get(point.dominantGenre) ?? "#64748b",
    value: [point.x, point.y, point.scoreNorm, point.size],
  }))
);

const atlasGenreSeries = computed(() => {
  const topGenres = atlasGenreLegendRows.value.map((row) => row.genre);
  const series: Array<Record<string, unknown>> = [];

  for (const row of atlasGenreLegendRows.value) {
    const genrePoints = atlasPoints.value.filter((point) => point.dominantGenre === row.genre);
    const watchedPoints = genrePoints.filter((point) => point.isWatched);
    const unseenPoints = genrePoints.filter((point) => !point.isWatched);

    if (watchedPoints.length) {
      series.push({
        type: "scatter",
        name: `${row.genre}-watched`,
        data: watchedPoints,
        symbolSize: (value: [number, number, number, number]) => Math.max(4.5, value[3] * 0.92),
        itemStyle: {
          color: row.color,
          opacity: 0.75,
          shadowBlur: 12,
          shadowColor: "rgba(20, 190, 255, 0.28)",
          borderColor: "#ffffff",
          borderWidth: 0.5,
        },
      });
    }

    if (unseenPoints.length) {
      series.push({
        type: "scatter",
        name: `${row.genre}-unseen`,
        data: unseenPoints,
        symbol: "diamond",
        symbolSize: (value: [number, number, number, number]) => Math.max(9, value[3] * 1.4),
        itemStyle: {
          color: "#ff4d6d",
          opacity: 0.92,
          borderColor: "#ffffff",
          borderWidth: 1.35,
          shadowBlur: 18,
          shadowColor: "rgba(255, 77, 109, 0.55)",
        },
      });
    }
  }

  const others = atlasPoints.value.filter((point) => !topGenres.includes(point.dominantGenre));
  if (others.length) {
    const otherWatched = others.filter((point) => point.isWatched);
    const otherUnseen = others.filter((point) => !point.isWatched);

    if (otherWatched.length) {
      series.push({
        type: "scatter",
        name: "others-watched",
        data: otherWatched,
        symbolSize: (value: [number, number, number, number]) => Math.max(4.5, value[3] * 0.92),
        itemStyle: {
          color: "#64748b",
          opacity: 0.68,
          borderColor: "#ffffff",
          borderWidth: 0.5,
        },
      });
    }

    if (otherUnseen.length) {
      series.push({
        type: "scatter",
        name: "others-unseen",
        data: otherUnseen,
        symbol: "diamond",
        symbolSize: (value: [number, number, number, number]) => Math.max(9, value[3] * 1.4),
        itemStyle: {
          color: "#ff4d6d",
          opacity: 0.9,
          borderColor: "#ffffff",
          borderWidth: 1.35,
          shadowBlur: 16,
          shadowColor: "rgba(255, 77, 109, 0.55)",
        },
      });
    }
  }

  return series;
});

const atlasOption = computed(() => {
  const palette = chartPalette.value;

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: palette.tooltipBg,
      borderColor: palette.tooltipBorder,
      textStyle: { color: palette.tooltipText },
      formatter: (params: { data?: AtlasPoint }) => {
        const data = params.data;
        if (!data) return "";
        const genres = [...new Set(data.genres)].slice(0, 5).join(", ");
        const tags = data.tags.slice(0, 4).join(", ");
        const scoreLabel = data.score > 0 ? data.score.toFixed(1) : "-";

        return [
          `<strong style="display:block;max-width:320px;white-space:normal;word-break:break-word;">${data.title}</strong>`,
          data.subtitle && data.subtitle !== data.title
            ? `<span style="display:block;max-width:320px;white-space:normal;word-break:break-word;">${data.subtitle}</span>`
            : "",
          `<span>${t("dashboard.atlasTooltipType")}: ${data.isWatched ? t("dashboard.atlasPointWatched") : t("dashboard.atlasPointRecommendation")}</span>`,
          `<span>${t("common.score")}: ${scoreLabel}</span>`,
          `<span>${t("dashboard.atlasPrimaryGenre")}: ${data.dominantGenre}</span>`,
          genres ? `<span>Genres: ${genres}</span>` : "",
          tags ? `<span>Tags: ${tags}</span>` : "",
        ]
          .filter(Boolean)
          .join("<br/>");
      },
    },
    grid: { left: 12, right: 12, top: 8, bottom: 8 },
    xAxis: {
      min: -1.05,
      max: 1.05,
      show: false,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    yAxis: {
      min: -1.05,
      max: 1.05,
      show: false,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    series: atlasGenreSeries.value.map((series) => ({
      ...series,
      emphasis: {
        focus: "series",
        itemStyle: {
          opacity: 1,
          borderColor: "#ffffff",
          borderWidth: 1.3,
        },
        label: {
          show: true,
          formatter: (params: { data?: AtlasPoint }) =>
            wrapTextByWords(params.data?.title ?? "", 32, 3),
          color: palette.textStrong,
          fontWeight: 700,
          position: "top",
          lineHeight: 16,
          overflow: "break",
          width: 280,
        },
      },
    })),
  };
});

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
  return Object.entries(map).map(([name, value]) => ({
    name: statusLabels.value[name] ?? name,
    value,
  }));
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
        data: pieRows.length
          ? pieRows
          : [{ name: t("common.unknown"), value: 1 }],
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
const countryOption = computed(() =>
  makeDonutOption(countryDistribution.value),
);

const scoreDist = computed(() => {
  const maxScore = scoredEntries.value.reduce(
    (m, e) => Math.max(m, Number(e.score || 0)),
    0,
  );
  const useTenScale = maxScore <= 10;

  const buckets = new Map<
    number,
    { titles: number; hours: number; scoreSum: number; scoredTitles: number }
  >();
  for (const e of scoredEntries.value) {
    const raw = Number(e.score || 0);
    const key = useTenScale ? Math.round(raw) : Math.round(raw / 10);
    const cur = buckets.get(key) ?? {
      titles: 0,
      hours: 0,
      scoreSum: 0,
      scoredTitles: 0,
    };
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

const scoreOption = computed(() =>
  makeBarOption(
    scoreDist.value.labels,
    scoreDist.value.values,
    metricLabel(scoreMetric.value),
  ),
);

const episodeBins = [
  { label: "1", match: (n: number | null) => n === 1 },
  { label: "2-6", match: (n: number | null) => n !== null && n >= 2 && n <= 6 },
  {
    label: "7-16",
    match: (n: number | null) => n !== null && n >= 7 && n <= 16,
  },
  {
    label: "17-28",
    match: (n: number | null) => n !== null && n >= 17 && n <= 28,
  },
  {
    label: "29-55",
    match: (n: number | null) => n !== null && n >= 29 && n <= 55,
  },
  {
    label: "56-100",
    match: (n: number | null) => n !== null && n >= 56 && n <= 100,
  },
  { label: "101+", match: (n: number | null) => n !== null && n >= 101 },
  {
    label: t("common.unknown"),
    match: (n: number | null) => n === null || n === 0,
  },
];

const episodeDist = computed(() => {
  const map = new Map<
    string,
    { titles: number; hours: number; scoreSum: number; scoredTitles: number }
  >();
  for (const b of episodeBins)
    map.set(b.label, { titles: 0, hours: 0, scoreSum: 0, scoredTitles: 0 });

  for (const e of completedEntries.value) {
    const ep = e.episodes ?? null;
    const bucket =
      episodeBins.find((b) => b.match(ep))?.label ?? t("common.unknown");
    const cur = map.get(bucket);
    if (!cur) continue;
    cur.titles += 1;
    cur.hours += ((e.progress ?? 0) * (e.duration ?? 20)) / 60;
    if (Number(e.score || 0) > 0) {
      cur.scoreSum += Number(e.score);
      cur.scoredTitles += 1;
    }
  }

  const labels = episodeBins.map((b) => b.label);
  const values = labels.map((l) => {
    const bucket = map.get(l);
    if (!bucket) return 0;
    return computeMetricValue(bucket, episodeMetric.value);
  });
  return { labels, values };
});

const episodeOption = computed(() =>
  makeBarOption(
    episodeDist.value.labels,
    episodeDist.value.values,
    metricLabel(episodeMetric.value),
  ),
);

const releaseYearDist = computed(() => {
  const map = new Map<
    number,
    { titles: number; hours: number; scoreSum: number; scoredTitles: number }
  >();
  for (const e of completedEntries.value) {
    const year = e.seasonYear;
    if (!year) continue;
    const cur = map.get(year) ?? {
      titles: 0,
      hours: 0,
      scoreSum: 0,
      scoredTitles: 0,
    };
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
  const values = rows.map(([, v]) =>
    computeMetricValue(v, releaseMetric.value),
  );
  return { labels, values };
});

const releaseOption = computed(() =>
  makeLineOption(
    releaseYearDist.value.labels,
    releaseYearDist.value.values,
    metricLabel(releaseMetric.value),
  ),
);

const watchYearDist = computed(() => {
  const map = new Map<
    number,
    { titles: number; hours: number; scoreSum: number; scoredTitles: number }
  >();
  for (const e of completedEntries.value) {
    const year = e.completedAt?.year;
    if (!year) continue;
    const cur = map.get(year) ?? {
      titles: 0,
      hours: 0,
      scoreSum: 0,
      scoredTitles: 0,
    };
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
  makeLineOption(
    watchYearDist.value.labels,
    watchYearDist.value.values,
    metricLabel(watchMetric.value),
  ),
);

function buildPercentLabels(rows: Array<{ name: string; value: number }>) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (!total) {
    return Object.fromEntries(rows.map((row) => [row.name, "0.0%"])) as Record<
      string,
      string
    >;
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

  let missingTenths =
    1000 - scaled.reduce((sum, row) => sum + row.baseTenths, 0);
  scaled.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < scaled.length && missingTenths > 0; i++) {
    scaled[i].baseTenths += 1;
    missingTenths -= 1;
  }

  return Object.fromEntries(
    scaled.map((row) => [row.name, `${(row.baseTenths / 10).toFixed(1)}%`]),
  ) as Record<string, string>;
}

const formatPercentLabels = computed(() =>
  buildPercentLabels(formatDistribution.value),
);
const statusPercentLabels = computed(() =>
  buildPercentLabels(statusDistribution.value),
);
const countryPercentLabels = computed(() =>
  buildPercentLabels(countryDistribution.value),
);
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
        <button
          @click="loadAnime"
          class="ui-btn ui-btn-primary"
          :disabled="loading"
        >
          {{ t("common.load") }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500"
      />
    </div>

    <div v-else-if="error" class="text-red-400">{{ error }}</div>

    <div v-else class="dashboard-shell">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div
          v-for="item in overviewStats"
          :key="item.label"
          class="dashboard-kpi"
        >
          <div class="text-3xl font-bold tracking-tight">{{ item.value }}</div>
          <div class="dashboard-kpi-label">{{ item.label }}</div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <section class="dashboard-panel">
          <h2 class="mb-3 text-xl font-semibold">
            {{ t("dashboard.formatDistribution") }}
          </h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart
                :style="{ height: '130px', width: '130px' }"
                :option="formatOption"
                autoresize
              />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div
                v-for="row in formatDistribution"
                :key="row.name"
                class="dashboard-legend-row"
              >
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{
                  formatPercentLabels[row.name]
                }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard-panel">
          <h2 class="mb-3 text-xl font-semibold">
            {{ t("dashboard.statusDistribution") }}
          </h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart
                :style="{ height: '130px', width: '130px' }"
                :option="statusOption"
                autoresize
              />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div
                v-for="row in statusDistribution"
                :key="row.name"
                class="dashboard-legend-row"
              >
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{
                  statusPercentLabels[row.name]
                }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard-panel">
          <h2 class="mb-3 text-xl font-semibold">
            {{ t("dashboard.countryDistribution") }}
          </h2>
          <div class="grid grid-cols-[130px_1fr] gap-4 items-center">
            <ClientOnly>
              <VChart
                :style="{ height: '130px', width: '130px' }"
                :option="countryOption"
                autoresize
              />
            </ClientOnly>
            <div class="space-y-2 text-sm">
              <div
                v-for="row in countryDistribution"
                :key="row.name"
                class="dashboard-legend-row"
              >
                <span>{{ row.name }}</span>
                <span class="text-[#b8c8db]">{{
                  countryPercentLabels[row.name]
                }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">{{ t("dashboard.animeAtlas") }}</h2>
          <div class="atlas-hint">{{ t("dashboard.atlasHint") }}</div>
        </div>

        <div class="atlas-source-toggle mb-3">
          <div class="dashboard-toggle">
            <button
              class="rounded-full px-3 py-1"
              :class="atlasSourceMode === 'mine' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'"
              @click="atlasSourceMode = 'mine'"
            >
              {{ t("dashboard.atlasSourceMine") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="atlasSourceMode === 'all' ? 'dashboard-toggle-btn-active' : 'dashboard-toggle-btn'"
              @click="atlasSourceMode = 'all'"
            >
              {{ t("dashboard.atlasSourceAll") }}
            </button>
          </div>
          <div v-if="atlasSourceMode === 'all' && atlasCatalogLoading" class="atlas-source-loading">
            {{ t("common.loading") }}
          </div>
        </div>

        <div v-if="atlasCatalogError" class="atlas-source-error">{{ atlasCatalogError }}</div>

        <div class="atlas-filter-panel">
          <div class="atlas-filter-top">
            <label class="atlas-filter-search">
              <span class="atlas-filter-label">{{ t("dashboard.atlasFilterSearchLabel") }}</span>
              <input
                v-model="atlasSearch"
                type="search"
                class="atlas-input"
                :placeholder="t('dashboard.atlasFilterSearchPlaceholder')"
              />
            </label>
            <div class="atlas-filter-summary">
              {{ atlasFilteredEntries.length }} / {{ atlasBaseEntries.length }} {{ t("dashboard.atlasFilterAnimeCount") }}
            </div>
            <button class="atlas-reset-btn" type="button" @click="resetAtlasFilters">
              {{ t("dashboard.atlasFilterReset") }}
            </button>
          </div>

          <div class="atlas-filter-block">
            <div class="atlas-filter-label">{{ t("dashboard.atlasFilterGenresLabel") }}</div>
            <div class="atlas-chip-grid">
              <button
                v-for="item in atlasGenreOptions"
                :key="item.genre"
                type="button"
                class="atlas-chip"
                :class="atlasSelectedGenres.includes(item.genre) ? 'atlas-chip-active' : ''"
                @click="toggleAtlasGenre(item.genre)"
              >
                <span>{{ item.genre }}</span>
                <span class="atlas-chip-count">{{ item.count }}</span>
              </button>
            </div>
          </div>

          <div class="atlas-filter-ranges">
            <div class="atlas-filter-block">
              <div class="atlas-filter-label">{{ t("dashboard.atlasFilterScoreLabel") }}</div>
              <div class="atlas-range-values">
                <span>{{ atlasScoreMin.toFixed(1) }}</span>
                <span>{{ atlasScoreMax.toFixed(1) }}</span>
              </div>
              <div
                class="atlas-dual-range"
                :style="getRangeHighlightStyle(atlasBounds.scoreMin, atlasBounds.scoreMax, atlasScoreMin, atlasScoreMax)"
              >
                <input
                  v-model.number="atlasScoreMin"
                  type="range"
                  :min="atlasBounds.scoreMin"
                  :max="atlasBounds.scoreMax"
                  step="0.1"
                  @input="atlasScoreMin = Math.min(atlasScoreMin, atlasScoreMax)"
                />
                <input
                  v-model.number="atlasScoreMax"
                  type="range"
                  :min="atlasBounds.scoreMin"
                  :max="atlasBounds.scoreMax"
                  step="0.1"
                  @input="atlasScoreMax = Math.max(atlasScoreMax, atlasScoreMin)"
                />
              </div>
            </div>

            <div class="atlas-filter-block">
              <div class="atlas-filter-label">{{ t("dashboard.atlasFilterYearLabel") }}</div>
              <div class="atlas-range-values">
                <span>{{ atlasYearMin }}</span>
                <span>{{ atlasYearMax }}</span>
              </div>
              <div
                class="atlas-dual-range"
                :style="getRangeHighlightStyle(atlasBounds.yearMin, atlasBounds.yearMax, atlasYearMin, atlasYearMax)"
              >
                <input
                  v-model.number="atlasYearMin"
                  type="range"
                  :min="atlasBounds.yearMin"
                  :max="atlasBounds.yearMax"
                  step="1"
                  @input="atlasYearMin = Math.min(atlasYearMin, atlasYearMax)"
                />
                <input
                  v-model.number="atlasYearMax"
                  type="range"
                  :min="atlasBounds.yearMin"
                  :max="atlasBounds.yearMax"
                  step="1"
                  @input="atlasYearMax = Math.max(atlasYearMax, atlasYearMin)"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          class="atlas-shell"
          :class="theme === 'dark' ? 'atlas-shell-dark' : 'atlas-shell-light'"
        >
          <ClientOnly>
            <VChart
              v-if="atlasPoints.length"
              :style="{ height: '560px', width: '100%' }"
              :option="atlasOption"
              autoresize
            />
          </ClientOnly>
          <div v-if="!atlasPoints.length" class="atlas-empty">
            {{ t("dashboard.atlasEmpty") }}
          </div>
        </div>

        <div class="atlas-legend">
          <div class="atlas-legend-title">{{ t("dashboard.atlasLegendTitle") }}</div>
          <div class="atlas-point-legend">
            <span class="atlas-point-legend-item">
              <span class="atlas-point-marker atlas-point-marker-watched" />
              {{ t("dashboard.atlasPointWatched") }}
            </span>
            <span class="atlas-point-legend-item">
              <span class="atlas-point-marker atlas-point-marker-recommendation" />
              {{ t("dashboard.atlasPointRecommendation") }}
            </span>
          </div>
          <div class="atlas-genre-legend">
            <div v-for="row in atlasGenreLegendRows" :key="row.genre" class="atlas-genre-row">
              <span class="atlas-genre-swatch" :style="{ background: row.color }" />
              <span class="atlas-genre-name">{{ row.genre }}</span>
              <span class="atlas-genre-count">{{ row.count }}</span>
            </div>
          </div>

          <div class="atlas-size-note">{{ t("dashboard.atlasSizeHint") }}</div>
        </div>
      </section>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">{{ t("dashboard.scoreChart") }}</h2>
          <div class="dashboard-toggle">
            <button
              class="rounded-full px-3 py-1"
              :class="
                scoreMetric === 'titles'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="scoreMetric = 'titles'"
            >
              {{ t("dashboard.titlesWatched") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="
                scoreMetric === 'hours'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="scoreMetric = 'hours'"
            >
              {{ t("dashboard.hoursWatched") }}
            </button>
          </div>
        </div>
        <ClientOnly>
          <VChart
            :style="{ height: '280px', width: '100%' }"
            :option="scoreOption"
            autoresize
          />
        </ClientOnly>
      </section>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">
            {{ t("dashboard.episodeCount") }}
          </h2>
          <div class="dashboard-toggle">
            <button
              class="rounded-full px-3 py-1"
              :class="
                episodeMetric === 'titles'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="episodeMetric = 'titles'"
            >
              {{ t("dashboard.titlesWatched") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="
                episodeMetric === 'hours'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="episodeMetric = 'hours'"
            >
              {{ t("dashboard.hoursWatched") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="
                episodeMetric === 'score'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="episodeMetric = 'score'"
            >
              {{ t("dashboard.meanScoreTab") }}
            </button>
          </div>
        </div>
        <ClientOnly>
          <VChart
            :style="{ height: '280px', width: '100%' }"
            :option="episodeOption"
            autoresize
          />
        </ClientOnly>
      </section>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">
            {{ t("dashboard.releaseYear") }}
          </h2>
          <div class="dashboard-toggle">
            <button
              class="rounded-full px-3 py-1"
              :class="
                releaseMetric === 'titles'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="releaseMetric = 'titles'"
            >
              {{ t("dashboard.titlesWatched") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="
                releaseMetric === 'hours'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="releaseMetric = 'hours'"
            >
              {{ t("dashboard.hoursWatched") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="
                releaseMetric === 'score'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="releaseMetric = 'score'"
            >
              {{ t("dashboard.meanScoreTab") }}
            </button>
          </div>
        </div>
        <ClientOnly>
          <VChart
            :style="{ height: '280px', width: '100%' }"
            :option="releaseOption"
            autoresize
          />
        </ClientOnly>
      </section>

      <section class="dashboard-panel">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl font-semibold">{{ t("dashboard.watchYear") }}</h2>
          <div class="dashboard-toggle">
            <button
              class="rounded-full px-3 py-1"
              :class="
                watchMetric === 'titles'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="watchMetric = 'titles'"
            >
              {{ t("dashboard.titlesWatched") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="
                watchMetric === 'hours'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="watchMetric = 'hours'"
            >
              {{ t("dashboard.hoursWatched") }}
            </button>
            <button
              class="rounded-full px-3 py-1"
              :class="
                watchMetric === 'score'
                  ? 'dashboard-toggle-btn-active'
                  : 'dashboard-toggle-btn'
              "
              @click="watchMetric = 'score'"
            >
              {{ t("dashboard.meanScoreTab") }}
            </button>
          </div>
        </div>
        <ClientOnly>
          <VChart
            :style="{ height: '280px', width: '100%' }"
            :option="watchOption"
            autoresize
          />
        </ClientOnly>
      </section>

      <section v-if="milestones.length" class="dashboard-panel">
        <h2 class="mb-4 text-xl font-semibold">{{ t("dashboard.milestones") }}</h2>
        <div class="milestones-grid">
          <div
            v-for="m in milestones"
            :key="`${m.kind}-${m.value}`"
            class="milestone-card"
            :class="m.kind === 'watchtime' ? 'milestone-card-time' : 'milestone-card-anime'"
          >
            <div class="milestone-badge">
              <span v-if="m.kind === 'anime'">{{ m.value }}{{ t("dashboard.milestonesAnimeOrdinalSuffix") }}</span>
              <span v-else>{{ m.value }} {{ t("dashboard.milestonesWatchDays") }}</span>
            </div>
            <div v-if="m.title" class="milestone-title">{{ m.title }}</div>
            <div v-if="m.date" class="milestone-date">{{ m.date }}</div>
          </div>
        </div>
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

.atlas-shell {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  min-height: 560px;
}

.atlas-shell-dark {
  background:
    radial-gradient(circle at 18% 20%, rgba(24, 96, 255, 0.18), transparent 45%),
    radial-gradient(circle at 80% 72%, rgba(7, 182, 157, 0.14), transparent 40%),
    #05080f;
}

.atlas-shell-light {
  background:
    radial-gradient(circle at 18% 20%, rgba(24, 96, 255, 0.14), transparent 45%),
    radial-gradient(circle at 80% 72%, rgba(7, 182, 157, 0.1), transparent 40%),
    #f5f9ff;
}

.atlas-empty {
  min-height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.atlas-source-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
}

.atlas-source-loading {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.atlas-source-error {
  margin-bottom: 0.7rem;
  font-size: 0.82rem;
  color: #ef4444;
}

.atlas-filter-panel {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
  border: 1px solid var(--border);
  background: var(--surface-muted);
  border-radius: 0.65rem;
  padding: 0.75rem;
}

.atlas-filter-top {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto auto;
  gap: 0.6rem;
  align-items: end;
}

.atlas-filter-search {
  display: grid;
  gap: 0.3rem;
}

.atlas-filter-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.atlas-input {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 0.5rem;
  padding: 0.45rem 0.7rem;
  font-size: 0.9rem;
}

.atlas-filter-summary {
  font-size: 0.82rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.atlas-reset-btn {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 0.5rem;
  padding: 0.45rem 0.7rem;
  font-size: 0.82rem;
  white-space: nowrap;
}

.atlas-filter-block {
  display: grid;
  gap: 0.45rem;
}

.atlas-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.atlas-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  border-radius: 999px;
  padding: 0.24rem 0.62rem;
  font-size: 0.77rem;
}

.atlas-chip-active {
  background: color-mix(in srgb, var(--primary) 24%, var(--surface));
  border-color: color-mix(in srgb, var(--primary) 56%, var(--border));
  color: var(--text);
}

.atlas-chip-count {
  color: var(--text-soft);
}

.atlas-filter-ranges {
  display: grid;
  grid-template-columns: repeat(2, minmax(190px, 1fr));
  gap: 0.8rem;
}

.atlas-range-values {
  display: flex;
  justify-content: space-between;
  font-size: 0.79rem;
  color: var(--text-muted);
}

.atlas-dual-range {
  position: relative;
  height: 24px;
  --range-start: 0%;
  --range-end: 100%;
}

.atlas-dual-range::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 999px;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--text-muted) 28%, transparent) 0%,
      color-mix(in srgb, var(--text-muted) 28%, transparent) var(--range-start),
      color-mix(in srgb, var(--primary) 65%, #4ade80) var(--range-start),
      color-mix(in srgb, var(--primary) 65%, #4ade80) var(--range-end),
      color-mix(in srgb, var(--text-muted) 28%, transparent) var(--range-end),
      color-mix(in srgb, var(--text-muted) 28%, transparent) 100%
    );
}

.atlas-dual-range input[type="range"] {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 24px;
  margin: 0;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

.atlas-dual-range input[type="range"]::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
}

.atlas-dual-range input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: auto;
  width: 14px;
  height: 14px;
  margin-top: -4px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  background: var(--primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 45%, #0f172a);
}

.atlas-dual-range input[type="range"]::-moz-range-track {
  height: 6px;
  background: transparent;
}

.atlas-dual-range input[type="range"]::-moz-range-thumb {
  pointer-events: auto;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  background: var(--primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 45%, #0f172a);
}

.atlas-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  max-width: min(100%, 30rem);
  text-align: right;
  white-space: normal;
  overflow-wrap: anywhere;
}

.atlas-legend {
  margin-top: 0.75rem;
  border: 1px solid var(--border);
  background: var(--surface-muted);
  border-radius: 0.65rem;
  padding: 0.65rem 0.75rem;
}

.atlas-legend-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.atlas-point-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.atlas-point-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: var(--text-muted);
}

.atlas-point-marker {
  width: 12px;
  height: 12px;
  display: inline-block;
}

.atlas-point-marker-watched {
  border-radius: 999px;
  background: var(--primary);
  border: 1px solid #ffffff;
}

.atlas-point-marker-recommendation {
  background: #ff4d6d;
  transform: rotate(45deg);
  opacity: 0.95;
  border: 1px solid #ffffff;
  box-shadow: 0 0 10px rgba(255, 77, 109, 0.45);
}

.atlas-genre-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 0.35rem 0.75rem;
}

.atlas-genre-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.atlas-genre-swatch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.atlas-genre-name {
  color: var(--text);
  font-size: 0.78rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.atlas-genre-count {
  margin-left: auto;
  font-size: 0.76rem;
  color: var(--text-muted);
}

.atlas-size-note {
  margin-top: 0.45rem;
  font-size: 0.76rem;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .atlas-source-toggle {
    align-items: flex-start;
    flex-direction: column;
  }

  .atlas-filter-top {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .atlas-filter-ranges {
    grid-template-columns: 1fr;
  }
}

/* ─── Milestones ─────────────────────────────────────────────────────────── */
.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}

.milestone-card {
  border: 1px solid var(--border);
  border-radius: 0.65rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.milestone-card-anime {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(99, 102, 241, 0.03));
  border-color: rgba(99, 102, 241, 0.25);
}

.milestone-card-time {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.03));
  border-color: rgba(16, 185, 129, 0.25);
}

.milestone-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.milestone-card-anime .milestone-badge {
  color: #818cf8;
}

.milestone-card-time .milestone-badge {
  color: #34d399;
}

.milestone-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.25;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.milestone-date {
  font-size: 0.74rem;
  color: var(--text-muted);
}
</style>

