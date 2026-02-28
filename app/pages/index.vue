<script setup lang="ts">
const { login } = useAuth();
definePageMeta({
  middleware: "guest",
  title: "Welcome",
});
</script>

<template>
  <div class="relative overflow-hidden page-shell">
    <section class="ui-card p-8 md:p-12">
      <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div class="space-y-5">
          <div class="inline-flex rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs font-medium text-zinc-500">
            AniList-inspired analytics workspace
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-slate-800">
            Deine Anime-Statistiken
            <span class="text-indigo-500"> professionell visualisiert</span>
          </h1>
          <p class="max-w-xl text-base text-zinc-400">
            Verbinde deinen AniList Account und analysiere Genres, Tags, Relations und History
            in einem konsistenten Dashboard.
          </p>
          <button @click="login" class="ui-btn ui-btn-primary px-8 py-3 text-base font-semibold">
            Login mit AniList
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="ui-card space-y-2">
            <div class="text-xs uppercase tracking-wide text-zinc-500">KPI</div>
            <div class="text-2xl font-semibold text-slate-800">Automatisch</div>
            <p class="text-sm text-zinc-400">Anime, Episoden, Stunden und Completion auf einen Blick.</p>
          </div>
          <div class="ui-card space-y-2">
            <div class="text-xs uppercase tracking-wide text-zinc-500">Charts</div>
            <div class="text-2xl font-semibold text-slate-800">Interaktiv</div>
            <p class="text-sm text-zinc-400">Status-Verteilung und Timeline direkt aus deinen Listendaten.</p>
          </div>
          <div class="ui-card space-y-2 sm:col-span-2">
            <div class="text-xs uppercase tracking-wide text-zinc-500">Deep Dive</div>
            <div class="text-2xl font-semibold text-slate-800">Filter + Recommendations</div>
            <p class="text-sm text-zinc-400">Kombiniere Genre/Tag-Filter, vergleiche User und entdecke passende Titel.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <div class="ui-card space-y-2">
        <div class="text-xs font-semibold text-zinc-500">1. Einloggen</div>
        <p class="text-sm text-zinc-400">Sicher mit AniList OAuth authentifizieren.</p>
      </div>
      <div class="ui-card space-y-2">
        <div class="text-xs font-semibold text-zinc-500">2. Daten laden</div>
        <p class="text-sm text-zinc-400">Listen werden automatisch abgerufen und aufbereitet.</p>
      </div>
      <div class="ui-card space-y-2">
        <div class="text-xs font-semibold text-zinc-500">3. Auswerten</div>
        <p class="text-sm text-zinc-400">Direkt in Dashboard, History, Compare und Recommendation arbeiten.</p>
      </div>
    </section>
  </div>
</template>