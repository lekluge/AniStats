<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100">
    <header class="border-b border-zinc-800">
      <div
        class="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between"
      >
        <!-- Logo / Home -->
        <NuxtLink
          to="/"
          class="font-semibold tracking-tight hover:text-indigo-400"
        >
          AniList Stats
        </NuxtLink>

        <!-- Navigation -->
        <nav class="flex gap-6 text-sm">
          <NuxtLink to="/genres" class="nav-link"> Genres </NuxtLink>

          <NuxtLink to="/tags" class="nav-link"> Tags </NuxtLink>

          <NuxtLink to="/combine" class="nav-link"> Combine </NuxtLink>

          <!-- 🔥 NEU -->
          <NuxtLink to="/relations" class="nav-link"> Relations </NuxtLink>

          <NuxtLink to="/compare" class="nav-link"> Compare </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
