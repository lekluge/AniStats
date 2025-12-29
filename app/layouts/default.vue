<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100">
    <header class="border-b border-zinc-800">
      <div
        class="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between"
      >
        <!-- Logo / Home -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2 hover:opacity-80 transition"
          @click="closeMenu"
        >
          <img src="/logo.png" alt="AniList Stats" class="h-8 w-auto" />
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex gap-6 text-sm">
          <NuxtLink to="/genres" class="nav-link">Genres</NuxtLink>
          <NuxtLink to="/tags" class="nav-link">Tags</NuxtLink>
          <NuxtLink to="/combine" class="nav-link">Combine</NuxtLink>
          <NuxtLink to="/relations" class="nav-link">Relations</NuxtLink>
          <NuxtLink to="/compare" class="nav-link">Compare</NuxtLink>
          <NuxtLink to="/recommendation" class="nav-link">Recommendation</NuxtLink>
        </nav>

        <!-- Mobile Burger -->
        <button
          class="md:hidden p-2 rounded hover:bg-zinc-800"
          @click="menuOpen = !menuOpen"
          aria-label="Toggle navigation"
        >
          <!-- simple burger / close -->
          <svg
            v-if="!menuOpen"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>

          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="menuOpen"
        class="md:hidden border-t border-zinc-800 bg-zinc-950"
      >
        <nav class="flex flex-col px-4 py-4 gap-3 text-sm">
          <NuxtLink to="/genres" class="nav-link" @click="closeMenu"
            >Genres</NuxtLink
          >
          <NuxtLink to="/tags" class="nav-link" @click="closeMenu"
            >Tags</NuxtLink
          >
          <NuxtLink to="/combine" class="nav-link" @click="closeMenu"
            >Combine</NuxtLink
          >
          <NuxtLink to="/relations" class="nav-link" @click="closeMenu"
            >Relations</NuxtLink
          >
          <NuxtLink to="/compare" class="nav-link" @click="closeMenu"
            >Compare</NuxtLink
          >
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";

const menuOpen = ref(false);

const closeMenu = () => {
  menuOpen.value = false;
};
</script>
