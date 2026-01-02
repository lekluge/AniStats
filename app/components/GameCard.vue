<script setup lang="ts">
import { computed } from "vue";

type GenreCover = {
  id: number;
  title: string;
  cover: string;
};

import { useRouter } from 'vue-router';
const props = defineProps<{
  rank: number;
  target: string;
  data: {
    genre: string;
    count: number;
    meanScore: number;
    minutesWatched: number;
    covers: GenreCover[];
  };
  filter?: {
    key: string;        // z. B. "genre" | "filter"
    modeKey?: string;   // z. B. "genreMode" | "filterMode"
    typeKey?: string;   // optional (nur für Tags)
    typeValue?: string; // "tag"
    modeValue?: string; // "include"
  };
}>();
const router = useRouter();

const hours = computed(() =>
  Math.round(props.data.minutesWatched / 60)
);

function anilistUrl(id: number) {
  return `https://anilist.co/anime/${id}`;
}

const previewCovers = computed(() =>
  props.data.covers.slice(1, 6)
);

const remainingCount = computed(() =>
  Math.max(props.data.covers.length - 5, 0)
);

function goToList() {
  const query: Record<string, string> = {
    layout: "list",
  };

  if (props.filter) {
    query[props.filter.key] = props.data.genre;

    if (props.filter.modeKey) {
      query[props.filter.modeKey] = props.filter.modeValue ?? "include";
    }

    if (props.filter.typeKey && props.filter.typeValue) {
      query[props.filter.typeKey] = props.filter.typeValue;
    }
  }

  router.push({
    path: props.target,
    query,
  });
}
</script>

<template>
  <div
    class="h-full rounded-2xl border border-zinc-800 bg-zinc-900/40
           p-4 flex flex-col gap-4"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <h3
        class="text-base font-semibold leading-tight wrap-break-word cursor-pointer hover:text-indigo-400"
        @click="goToList"
        title="Genre filtern und Listenansicht anzeigen"
      >
        {{ data.genre }}
      </h3>
      <span
        class="text-xs font-medium bg-indigo-600/20 text-indigo-300
               px-2 py-1 rounded-full shrink-0"
      >
        #{{ rank }}
      </span>
    </div>

    <!-- Featured + Stats -->
    <div class="flex gap-4 items-center">
      <!-- Featured -->
      <a
        v-if="data.covers[0]"
        :href="anilistUrl(data.covers[0].id)"
        target="_blank"
        rel="noopener"
        class="shrink-0"
      >
        <img
          :src="data.covers[0].cover"
          class="h-32 aspect-2/3 rounded-lg object-cover"
        />
      </a>

      <!-- Stats -->
      <div class="flex-1 grid grid-cols-3 gap-2 text-sm">
        <div class="rounded-lg bg-zinc-800/60 p-2 text-center">
          <div class="text-xs text-zinc-400">Count</div>
          <div class="font-semibold">{{ data.count }}</div>
        </div>
        <div class="rounded-lg bg-zinc-800/60 p-2 text-center">
          <div class="text-xs text-zinc-400">Ø Score</div>
          <div class="font-semibold">
            {{ data.meanScore || "—" }}
          </div>
        </div>
        <div class="rounded-lg bg-zinc-800/60 p-2 text-center">
          <div class="text-xs text-zinc-400">Time</div>
          <div class="font-semibold">{{ hours }} h</div>
        </div>
      </div>
    </div>

    <!-- Cover Preview Row -->
    <div class="flex items-center gap-2">
      <a
        v-for="anime in previewCovers"
        :key="anime.id"
        :href="anilistUrl(anime.id)"
        target="_blank"
        rel="noopener"
        :title="anime.title"
        class="shrink-0"
      >
        <img
          :src="anime.cover"
          class="h-16 aspect-2/3 rounded-md object-cover
                 transition hover:scale-105"
        />
      </a>

      <!-- +X Badge -->
      <div
        v-if="remainingCount"
        class="h-16 aspect-2/3 rounded-md flex items-center justify-center bg-zinc-800/70 text-xs text-zinc-300 cursor-pointer hover:text-indigo-400"
        @click="goToList"
        title="Genre filtern und Listenansicht anzeigen"
      >
        +{{ remainingCount }}
      </div>
    </div>
  </div>
</template>
