<script setup lang="ts">
const { login } = useAuth();
const { t } = useLocale();
definePageMeta({
  middleware: "guest",
  title: "Welcome",
});

const highlights = computed(() => [
  { title: t("index.h1"), text: t("index.h1Text") },
  { title: t("index.h2"), text: t("index.h2Text") },
  { title: t("index.h3"), text: t("index.h3Text") },
]);

const faq = computed(() => [
  { q: t("index.f1q"), a: t("index.f1a") },
  { q: t("index.f2q"), a: t("index.f2a") },
  { q: t("index.f3q"), a: t("index.f3a") },
  { q: t("index.f4q"), a: t("index.f4a") },
]);
</script>

<template>
  <div class="relative overflow-hidden page-shell">
    <section class="ui-card p-8 md:p-12">
      <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div class="space-y-5">
          <div class="inline-flex rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs font-medium text-zinc-500">
            {{ t("index.badge") }}
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-slate-800">
            {{ t("index.titleStart") }}
            <span class="text-indigo-500"> {{ t("index.titleAccent") }}</span>
          </h1>
          <p class="max-w-xl text-base text-zinc-400">
            {{ t("index.subtitle") }}
          </p>
          <button @click="login" class="ui-btn ui-btn-primary px-8 py-3 text-base font-semibold">
            {{ t("index.login") }}
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="ui-card space-y-2">
            <div class="text-xs uppercase tracking-wide text-zinc-500">{{ t("index.kpi") }}</div>
            <div class="text-2xl font-semibold text-slate-800">{{ t("index.h1") }}</div>
            <p class="text-sm text-zinc-400">{{ t("index.h1Text") }}</p>
          </div>
          <div class="ui-card space-y-2">
            <div class="text-xs uppercase tracking-wide text-zinc-500">{{ t("index.charts") }}</div>
            <div class="text-2xl font-semibold text-slate-800">{{ t("index.h2") }}</div>
            <p class="text-sm text-zinc-400">{{ t("index.h2Text") }}</p>
          </div>
          <div class="ui-card space-y-2 sm:col-span-2">
            <div class="text-xs uppercase tracking-wide text-zinc-500">{{ t("index.deepDive") }}</div>
            <div class="text-2xl font-semibold text-slate-800">{{ t("index.h3") }}</div>
            <p class="text-sm text-zinc-400">{{ t("index.h3Text") }}</p>
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
        <div class="text-xs font-semibold text-zinc-500">{{ t("index.step1") }}</div>
        <p class="text-sm text-zinc-400">{{ t("index.step1Text") }}</p>
      </div>
      <div class="ui-card space-y-2">
        <div class="text-xs font-semibold text-zinc-500">{{ t("index.step2") }}</div>
        <p class="text-sm text-zinc-400">{{ t("index.step2Text") }}</p>
      </div>
      <div class="ui-card space-y-2">
        <div class="text-xs font-semibold text-zinc-500">{{ t("index.step3") }}</div>
        <p class="text-sm text-zinc-400">{{ t("index.step3Text") }}</p>
      </div>
    </section>

    <section class="ui-card p-6 md:p-8 space-y-5">
      <div>
        <h2 class="text-2xl font-semibold text-slate-800">{{ t("index.sectionTitle") }}</h2>
        <p class="mt-2 text-sm text-zinc-400">{{ t("index.sectionText") }}</p>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">{{ t("index.c1") }}</h3>
          <p class="mt-1 text-sm text-zinc-400">{{ t("index.c1Text") }}</p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">{{ t("index.c2") }}</h3>
          <p class="mt-1 text-sm text-zinc-400">{{ t("index.c2Text") }}</p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">{{ t("index.c3") }}</h3>
          <p class="mt-1 text-sm text-zinc-400">{{ t("index.c3Text") }}</p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 class="font-semibold text-slate-800">{{ t("index.c4") }}</h3>
          <p class="mt-1 text-sm text-zinc-400">{{ t("index.c4Text") }}</p>
        </div>
      </div>
    </section>

    <section class="ui-card p-6 md:p-8 space-y-4">
      <h2 class="text-2xl font-semibold text-slate-800">{{ t("index.faq") }}</h2>
      <div class="space-y-2">
        <details v-for="item in faq" :key="item.q" class="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
          <summary class="cursor-pointer list-none font-medium text-slate-800">{{ item.q }}</summary>
          <p class="mt-2 text-sm text-zinc-400">{{ item.a }}</p>
        </details>
      </div>
    </section>

    <section class="ui-card p-8 text-center space-y-4">
      <h2 class="text-2xl font-semibold text-slate-800">{{ t("index.ctaTitle") }}</h2>
      <p class="mx-auto max-w-2xl text-sm text-zinc-400">{{ t("index.ctaText") }}</p>
      <div>
        <button @click="login" class="ui-btn ui-btn-primary px-8 py-3 text-base font-semibold">
          {{ t("index.ctaButton") }}
        </button>
      </div>
    </section>
  </div>
</template>
