<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    loading?: "lazy" | "eager";
    spinnerClass?: string;
  }>(),
  {
    alt: "",
    loading: "lazy",
    spinnerClass: "",
  }
);

const isLoaded = ref(false);

watch(
  () => props.src,
  () => {
    isLoaded.value = false;
  },
  { immediate: true }
);

function onLoad() {
  isLoaded.value = true;
}

function onError() {
  // Keep layout stable even if image fails.
  isLoaded.value = true;
}
</script>

<template>
  <div class="relative overflow-hidden bg-zinc-800/70" :aria-busy="!isLoaded">
    <div v-if="!isLoaded" class="absolute inset-0 flex items-center justify-center">
      <div
        class="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-indigo-500"
        :class="spinnerClass"
      />
    </div>

    <img
      :src="src"
      :alt="alt"
      :loading="loading"
      class="h-full w-full object-cover transition-opacity duration-200"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>
