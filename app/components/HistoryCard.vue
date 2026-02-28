<script setup lang="ts">
import { computed } from "vue";

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
  return c ? `Completed: ${c}` : null;
});

const spanText = computed(() => {
  const s = toDate(props.data.startedAt ?? null);
  const e = toDate(props.data.completedAt ?? null);
  if (!s || !e) return "-";
  return `${diffDays(s, e) + 1} d`;
});

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}
</script>

<template>
  <div class="ui-card relative overflow-hidden p-4">
    <div class="mb-3 pr-10">
      <a
        :href="anilistUrl(data.id)"
        target="_blank"
        class="block text-base font-semibold leading-tight wrap-break-word hover:text-indigo-400"
        :title="data.title"
      >
        {{ data.title }}
      </a>

      <div v-if="completedText" class="mt-1 text-xs text-zinc-400">{{ completedText }}</div>
    </div>

    <div class="flex gap-3 items-center">
      <img
        v-if="data.cover"
        :src="data.cover"
        class="h-24 aspect-2/3 rounded-xl object-cover"
        :alt="data.title"
        loading="lazy"
      />

      <div class="flex-1">
        <div class="grid grid-cols-1 gap-2 text-sm">
          <div class="rounded-lg bg-zinc-800/60 p-2 text-center">
            <div class="text-xs text-zinc-400">Span</div>
            <div class="font-semibold">{{ spanText }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
