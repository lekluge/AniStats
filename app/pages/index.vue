<script setup lang="ts">
const { login } = useAuth()
definePageMeta({
  middleware: "guest", title: "Welcome"
})
</script>

<template>
  <div class="relative overflow-hidden">

    <!-- Background Gradient -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10" />
    <div class="absolute inset-0 -z-10 bg-zinc-950/90" />

    <div class="mx-auto max-w-6xl px-6 py-20 space-y-28">

      <!-- HERO -->
      <section class="text-center space-y-8">

        <h1 class="text-5xl sm:text-6xl font-bold tracking-tight">
          Deine <span class="text-indigo-500">Anime-Statistiken</span><br />
          neu visualisiert.
        </h1>

        <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
          AniStats verbindet sich mit deinem AniList-Account und zeigt dir
          Stunden, Episoden, Trends und Watch-Verhalten in interaktiven Charts.
        </p>

        <div class="flex justify-center gap-4">
          <button
            @click="login"
            class="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-semibold text-white transition shadow-lg shadow-indigo-600/20"
          >
            Login mit AniList
          </button>

        </div>

      </section>

      <!-- FEATURES -->
      <section class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

        <div class="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-8 space-y-4 hover:border-indigo-500/40 transition">
          <div class="text-3xl">📊</div>
          <h3 class="text-xl font-semibold">Automatische KPIs</h3>
          <p class="text-zinc-400">
            Anime, Episoden, Stunden und Completion-Rate – sofort berechnet.
          </p>
        </div>

        <div class="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-8 space-y-4 hover:border-indigo-500/40 transition">
          <div class="text-3xl">📈</div>
          <h3 class="text-xl font-semibold">Interaktive Charts</h3>
          <p class="text-zinc-400">
            Status-Verteilung, Timeline und Trend-Analysen auf einen Blick.
          </p>
        </div>

        <div class="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-8 space-y-4 hover:border-indigo-500/40 transition">
          <div class="text-3xl">📅</div>
          <h3 class="text-xl font-semibold">History & Seasons</h3>
          <p class="text-zinc-400">
            Filtere nach Zeitraum oder Season und erkenne deine Muster.
          </p>
        </div>

      </section>

      <!-- HOW IT WORKS -->
      <section class="space-y-12">

        <h2 class="text-3xl font-bold text-center">
          So funktioniert AniStats
        </h2>

        <div class="grid gap-8 sm:grid-cols-3">

          <div class="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 text-center space-y-3">
            <div class="text-indigo-500 text-2xl font-bold">1</div>
            <h4 class="font-semibold">Einloggen</h4>
            <p class="text-zinc-400 text-sm">
              Sicher via AniList OAuth verbinden.
            </p>
          </div>

          <div class="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 text-center space-y-3">
            <div class="text-indigo-500 text-2xl font-bold">2</div>
            <h4 class="font-semibold">Daten abrufen</h4>
            <p class="text-zinc-400 text-sm">
              Deine Anime-Listen werden automatisch geladen.
            </p>
          </div>

          <div class="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 text-center space-y-3">
            <div class="text-indigo-500 text-2xl font-bold">3</div>
            <h4 class="font-semibold">Insights genießen</h4>
            <p class="text-zinc-400 text-sm">
              Interaktive Visualisierungen & persönliche Trends.
            </p>
          </div>

        </div>

      </section>

      <!-- CTA -->
      <section class="text-center space-y-6">

        <h3 class="text-2xl font-semibold">
          Bereit für deine Anime-Insights?
        </h3>

        <button
          @click="login"
          class="bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-2xl text-lg font-semibold transition shadow-xl shadow-indigo-600/20"
        >
          Jetzt Login mit AniList
        </button>

      </section>

    </div>

  </div>
</template>