<script setup lang="ts">
import { computed } from "vue";
const { t } = useLocale();

type AniDate = { year?: number; month?: number; day?: number };

type HistoryCardData = {
  id: number;
  title: string;
  cover?: string | null;
  startedAt?: AniDate | null;
  completedAt?: AniDate | null;
};

const props = defineProps<{
  rank: number;
  data: HistoryCardData;
}>();

function pad2(n?: number) {
  return String(n ?? 0).padStart(2, "0");
}

function fmtYmd(d?: AniDate | null) {
  if (!d?.year || !d?.month || !d?.day) return null;
  return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`;
}

function toDate(d?: AniDate | null) {
  if (!d?.year || !d?.month || !d?.day) return null;
  return new Date(d.year, d.month - 1, d.day);
}

function diffDays(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

const completedText = computed(() => {
  const c = fmtYmd(props.data.completedAt ?? null);
  return c ? `${t("history.completed")}: ${c}` : null;
});

const startedText = computed(() => {
  const s = fmtYmd(props.data.startedAt ?? null);
  return s ? `${s}` : null;
});

const spanText = computed(() => {
  const s = toDate(props.data.startedAt ?? null);
  const e = toDate(props.data.completedAt ?? null);
  if (!s || !e) return "-";
  return `${diffDays(s, e) + 1} ${t("history.daysShort")}`;
});

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="ui-card relative h-full overflow-hidden p-3">
    <span
      class="absolute right-3 top-3 inline-flex items-center rounded-full border border-indigo-500/40 bg-indigo-600/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400"
    >
      #{{ rank }}
    </span>

    <div class="flex gap-3 items-start">
      <img
        v-if="data.cover"
        :src="data.cover"
        class="h-24 aspect-2/3 rounded-lg object-cover shrink-0"
        :alt="data.title"
        loading="lazy"
      />

      <div class="min-w-0 flex-1">
        <a
          :href="anilistUrl(data.id)"
          target="_blank"
          class="block pr-12 text-sm font-semibold leading-tight wrap-break-word hover:text-indigo-400"
          :title="data.title"
        >
          {{ data.title }}
        </a>

        <div class="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <div v-if="completedText" class="rounded-md border border-zinc-700/80 bg-zinc-900/40 px-1.5 py-0.5 text-zinc-400">
            {{ completedText }}
          </div>
          <div v-if="startedText" class="rounded-md border border-zinc-700/80 bg-zinc-900/40 px-1.5 py-0.5 text-zinc-400">
            Start: {{ startedText }}
          </div>
          <div class="rounded-md border border-zinc-700/80 bg-zinc-900/40 px-1.5 py-0.5 text-zinc-300">
            {{ t("history.span") }}: <span class="font-semibold">{{ spanText }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
