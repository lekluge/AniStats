<script setup lang="ts">
const { login } = useAuth();
definePageMeta({
  middleware: "guest",
  title: "Welcome",
});

const highlights = [
  {
    title: "Dashboard Metrics",
    text: "Anime count, watched episodes, total hours and completion split in one view.",
  },
  {
    title: "Smart Discovery",
    text: "Recommendation, genres, tags and relation chains help you find better next shows.",
  },
  {
    title: "History Insights",
    text: "Analyze watch behavior by season and custom date ranges for clearer trends.",
  },
];

const faq = [
  {
    q: "Welche Daten werden verwendet?",
    a: "Nur deine AniList Listendaten, die fuer Analysen und Visualisierung noetig sind.",
  },
  {
    q: "Brauche ich einen eigenen API Key?",
    a: "Nein. Du meldest dich normal ueber AniList OAuth an und kannst direkt starten.",
  },
  {
    q: "Kann ich mehrere User vergleichen?",
    a: "Ja. Auf der Compare Seite kannst du mehrere User hinzufuegen und gemeinsam auswerten.",
  },
  {
    q: "Funktioniert das auch ohne Bewertungen?",
    a: "Ja. Empfehlungen koennen auch aus Genre/Tag Mustern deiner Liste entstehen.",
  },
];
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

    <section class="grid gap-4 lg:grid-cols-3">
      <div v-for="item in highlights" :key="item.title" class="ui-card space-y-2">
        <h3 class="text-lg font-semibold text-slate-800">{{ item.title }}</h3>
        <p class="text-sm text-zinc-400">{{ item.text }}</p>
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

    <section class="ui-card p-6 md:p-8 space-y-5">
      <div>
        <h2 class="text-2xl font-semibold text-slate-800">Was du auswerten kannst</h2>
        <p class="mt-2 text-sm text-zinc-400">
          AniStats ist fuer Fans gebaut, die nicht nur wissen wollen was sie gesehen haben,
          sondern warum ihr Geschmack so ist wie er ist.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">Genre & Tag Profil</h3>
          <p class="mt-1 text-sm text-zinc-400">
            Erkenne dominante Muster, schliesse unpassende Tags aus und fokussiere Empfehlungen.
          </p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">Relation Explorer</h3>
          <p class="mt-1 text-sm text-zinc-400">
            Folge Prequel/Sequel Ketten und finde die richtige Reihenfolge fuer lange Franchises.
          </p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">Season Tracking</h3>
          <p class="mt-1 text-sm text-zinc-400">
            Sieh in welchen Seasons du am meisten schaust und wie sich dein Verhalten verschiebt.
          </p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">Compare View</h3>
          <p class="mt-1 text-sm text-zinc-400">
            Finde Ueberschneidungen zwischen Freunden und entdeckt gemeinsam neue Kandidaten.
          </p>
        </div>
      </div>
    </section>

    <section class="ui-card p-6 md:p-8 space-y-4">
      <h2 class="text-2xl font-semibold text-slate-800">FAQ</h2>
      <div class="space-y-2">
        <details
          v-for="item in faq"
          :key="item.q"
          class="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3"
        >
          <summary class="cursor-pointer list-none font-medium text-slate-800">
            {{ item.q }}
          </summary>
          <p class="mt-2 text-sm text-zinc-400">
            {{ item.a }}
          </p>
        </details>
      </div>
    </section>

    <section class="ui-card p-8 text-center space-y-4">
      <h2 class="text-2xl font-semibold text-slate-800">
        Bereit fuer deine naechste Anime Analyse?
      </h2>
      <p class="mx-auto max-w-2xl text-sm text-zinc-400">
        Logge dich ein und starte direkt mit Dashboard, Recommendation, Relations und Compare.
      </p>
      <div>
        <button @click="login" class="ui-btn ui-btn-primary px-8 py-3 text-base font-semibold">
          Jetzt mit AniList verbinden
        </button>
      </div>
    </section>
  </div>
</template>
