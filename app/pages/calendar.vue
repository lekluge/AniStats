<script setup lang="ts">
import { api } from "~/composables/useApi";

definePageMeta({ title: "Calendar", middleware: "auth" });

type CalendarEvent = {
  id: number;
  title: string;
  coverImage: string | null;
  airingAt: number;
  nextEpisode: number;
  totalEpisodes: number | null;
  watchedEpisodes: number;
};

type CalendarDay = {
  key: string;
  date: Date;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
};

const { t, locale } = useLocale();

const usernameCookie = useCookie<string>("anilist-user", { default: () => "" });
const username = computed({
  get: () => usernameCookie.value ?? "",
  set: (val: string) => {
    usernameCookie.value = val.trim();
  },
});

const loading = ref(false);
const error = ref<string | null>(null);
const events = ref<CalendarEvent[]>([]);
const lastLoadedUser = ref("");
const hidePastEvents = ref(false);
const hideSeenEpisodes = ref(false);
const includePlanningNotYetReleased = ref(false);
const selectedDayKey = ref<string>(toDateKey(new Date()));
const dateLocale = computed(() => (locale.value === "de" ? "de-DE" : "en-US"));

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

const viewedMonth = ref(monthStart(new Date()));

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateKeyToDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function jumpToday() {
  const today = new Date();
  viewedMonth.value = monthStart(today);
  selectedDayKey.value = toDateKey(today);
}

function nextMonth() {
  viewedMonth.value = monthStart(
    new Date(viewedMonth.value.getFullYear(), viewedMonth.value.getMonth() + 1, 1),
  );
}

function previousMonth() {
  viewedMonth.value = monthStart(
    new Date(viewedMonth.value.getFullYear(), viewedMonth.value.getMonth() - 1, 1),
  );
}

async function loadAnime() {
  loading.value = true;
  error.value = null;

  try {
    const currentUser = username.value.trim();
    if (!currentUser) {
      events.value = [];
      lastLoadedUser.value = "";
      loading.value = false;
      return;
    }

    const res = await api.get("/api/private/anilist-airing-calendar", {
      params: {
        user: currentUser,
        includePlanningNotYetReleased: includePlanningNotYetReleased.value,
      },
    });
    events.value = (res.data.events ?? []).map(
      (row: {
        id: number;
        title: string;
        coverImage: string | null;
        totalEpisodes: number | null;
        watchedEpisodes: number;
        episode: number;
        airingAt: number;
      }) => ({
        id: row.id,
        title: row.title,
        coverImage: row.coverImage,
        totalEpisodes: row.totalEpisodes,
        watchedEpisodes: row.watchedEpisodes,
        nextEpisode: row.episode,
        airingAt: row.airingAt,
      }),
    );
    lastLoadedUser.value = currentUser;
  } catch {
    error.value = `${t("common.errorPrefix")}: ${t("calendar.loadError")}`;
  } finally {
    loading.value = false;
  }
}

let autoLoadTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => username.value,
  (nextUser) => {
    const trimmed = (nextUser ?? "").trim();
    if (!trimmed) {
      events.value = [];
      error.value = null;
      lastLoadedUser.value = "";
      return;
    }

    if (trimmed === lastLoadedUser.value) return;
    if (autoLoadTimer) clearTimeout(autoLoadTimer);

    autoLoadTimer = setTimeout(() => {
      if (!loading.value) loadAnime();
    }, 350);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (autoLoadTimer) clearTimeout(autoLoadTimer);
});

const visibleEvents = computed(() => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return events.value.filter((event) => {
    const isSeen = event.nextEpisode <= event.watchedEpisodes;
    const isPast = event.airingAt <= nowSeconds;

    if (hideSeenEpisodes.value && isSeen) return false;
    if (hidePastEvents.value && isPast) return false;
    return true;
  });
});

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>();
  for (const item of visibleEvents.value) {
    const key = toDateKey(new Date(item.airingAt * 1000));
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
  }
  return map;
});

const monthLabel = computed(() =>
  viewedMonth.value.toLocaleDateString(dateLocale.value, {
    month: "long",
    year: "numeric",
  }),
);

watch(includePlanningNotYetReleased, () => {
  if (!loading.value && username.value.trim()) {
    loadAnime();
  }
});

const weekdayLabels = computed(() => {
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, index) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index).toLocaleDateString(dateLocale.value, {
      weekday: "short",
    }),
  );
});

const calendarDays = computed<CalendarDay[]>(() => {
  const year = viewedMonth.value.getFullYear();
  const month = viewedMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  const todayKey = toDateKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );
    const key = toDateKey(date);
    return {
      key,
      date,
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isToday: key === todayKey,
      events: eventsByDate.value.get(key) ?? [],
    };
  });
});

const selectedDay = computed(() => {
  return {
    key: selectedDayKey.value,
    date: dateKeyToDate(selectedDayKey.value),
    events: eventsByDate.value.get(selectedDayKey.value) ?? [],
  };
});

function formatEventTime(tsSeconds: number) {
  return new Date(tsSeconds * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString(dateLocale.value, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function eventState(event: CalendarEvent) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (event.nextEpisode <= event.watchedEpisodes) return "seen";
  if (event.airingAt <= nowSeconds) return "released-unseen";
  return "upcoming";
}

function selectDay(dayKey: string) {
  selectedDayKey.value = dayKey;
}
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <h1 class="text-3xl font-bold">{{ t("calendar.title") }}</h1>

      <div class="flex gap-2">
        <input
          v-model="username"
          class="ui-input"
          :placeholder="t('common.usernamePlaceholder')"
          @keydown.enter.prevent="loadAnime"
          @keydown.space.prevent="loadAnime"
        />
        <button @click="loadAnime" class="ui-btn ui-btn-primary" :disabled="loading">
          {{ t("common.load") }}
        </button>
      </div>
    </div>

    <section class="calendar-shell">
      <div class="calendar-toolbar">
        <button class="ui-btn" :disabled="loading" @click="previousMonth">&larr;</button>
        <h2 class="calendar-month">{{ monthLabel }}</h2>
        <button class="ui-btn" :disabled="loading" @click="nextMonth">&rarr;</button>
        <button class="ui-btn" :disabled="loading" @click="jumpToday">
          {{ t("calendar.today") }}
        </button>
      </div>

      <div class="calendar-filters">
        <button
          class="ui-btn"
          :class="{ 'calendar-filter-active': hidePastEvents }"
          @click="hidePastEvents = !hidePastEvents"
        >
          {{ t("calendar.hidePastEvents") }}
        </button>
        <button
          class="ui-btn"
          :class="{ 'calendar-filter-active': hideSeenEpisodes }"
          @click="hideSeenEpisodes = !hideSeenEpisodes"
        >
          {{ t("calendar.hideSeenEpisodes") }}
        </button>
        <button
          class="ui-btn"
          :class="{ 'calendar-filter-active': includePlanningNotYetReleased }"
          @click="includePlanningNotYetReleased = !includePlanningNotYetReleased"
        >
          {{ t("calendar.includePlanningNotYetReleased") }}
        </button>
      </div>

      <section
        v-if="!loading && !error"
        class="calendar-day-panel"
      >
        <h3 class="calendar-day-panel-title">
          {{ formatFullDate(selectedDay.date) }}
        </h3>
        <div v-if="selectedDay.events.length > 0" class="calendar-day-panel-list">
          <a
            v-for="event in selectedDay.events"
            :key="`${selectedDay.key}-${event.id}-${event.nextEpisode}`"
            :href="`https://anilist.co/anime/${event.id}`"
            target="_blank"
            rel="noreferrer"
            class="calendar-day-panel-item"
            :class="{
              'calendar-event-seen': eventState(event) === 'seen',
              'calendar-event-released-unseen':
                eventState(event) === 'released-unseen',
            }"
          >
            <span class="calendar-event-time">{{ formatEventTime(event.airingAt) }}</span>
            <span class="calendar-event-title">{{ event.title }}</span>
            <span class="calendar-event-meta">
              {{ t("calendar.episodeShort") }} {{ event.nextEpisode }}
            </span>
          </a>
        </div>
        <p v-else class="calendar-day-empty">{{ t("calendar.noEventsOnDay") }}</p>
      </section>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
      </div>

      <div v-else-if="error" class="text-red-400">{{ error }}</div>

      <div v-else-if="visibleEvents.length === 0" class="text-sm text-[var(--text-muted)]">
        {{ t("calendar.noEventsForFilters") }}
      </div>

      <div v-else class="calendar-grid-wrap">
        <div class="calendar-weekdays">
          <div v-for="label in weekdayLabels" :key="label" class="calendar-weekday">
            {{ label }}
          </div>
        </div>

        <div class="calendar-grid">
          <article
            v-for="day in calendarDays"
            :key="day.key"
            class="calendar-cell"
            :class="{
              'calendar-cell-muted': !day.inCurrentMonth,
              'calendar-cell-today': day.isToday && selectedDayKey !== day.key,
              'calendar-cell-selected': selectedDayKey === day.key,
            }"
            @click="selectDay(day.key)"
          >
            <div class="calendar-day-number">{{ day.dayNumber }}</div>

            <div class="calendar-events">
              <a
                v-for="event in day.events.slice(0, 2)"
                :key="`${day.key}-${event.id}-${event.nextEpisode}`"
                :href="`https://anilist.co/anime/${event.id}`"
                target="_blank"
                rel="noreferrer"
                class="calendar-event"
                :class="{
                  'calendar-event-seen': eventState(event) === 'seen',
                  'calendar-event-released-unseen':
                    eventState(event) === 'released-unseen',
                }"
              >
                <span class="calendar-event-time">{{ formatEventTime(event.airingAt) }}</span>
                <span class="calendar-event-title">{{ event.title }}</span>
                <span class="calendar-event-meta">
                  {{ t("calendar.episodeShort") }} {{ event.nextEpisode }}
                </span>
              </a>

              <button
                v-if="day.events.length > 2"
                type="button"
                class="calendar-more"
                @click.stop="selectDay(day.key)"
              >
                +{{ day.events.length - 2 }}
              </button>
            </div>
          </article>
        </div>
      </div>

    </section>
  </div>
</template>

<style scoped>
.calendar-shell {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.calendar-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.calendar-filter-active {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 14%, var(--surface));
  color: var(--text);
}

.calendar-month {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  min-width: 190px;
  text-align: center;
}

.calendar-grid-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4rem;
}

.calendar-weekday {
  text-align: center;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4rem;
}

.calendar-cell {
  min-height: 132px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  border-radius: 0.75rem;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.calendar-cell-selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 55%, transparent);
}

.calendar-cell-muted {
  opacity: 0.45;
}

.calendar-cell-today {
  border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
}

.calendar-cell-today .calendar-day-number {
  color: var(--primary-strong);
}

.calendar-day-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-soft);
}

.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.calendar-event {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  padding: 0.25rem 0.35rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.calendar-event:hover {
  border-color: var(--primary);
}

.calendar-event-seen {
  border-color: #22c55e;
  background: color-mix(in srgb, #22c55e 12%, var(--surface));
}

.calendar-event-released-unseen {
  border-color: #ef4444;
  background: color-mix(in srgb, #ef4444 11%, var(--surface));
}

.calendar-event-time {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--primary-strong);
}

.calendar-event-title {
  font-size: 0.68rem;
  color: var(--text);
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.calendar-event-meta {
  font-size: 0.63rem;
  color: var(--text-muted);
}

.calendar-more {
  font-size: 0.68rem;
  color: var(--text-muted);
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  padding-left: 0.2rem;
}

.calendar-day-panel {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--surface-soft);
  padding: 0.75rem;
}

.calendar-day-panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.calendar-day-panel-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.5rem;
}

.calendar-day-empty {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.calendar-day-panel-item {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  padding: 0.4rem 0.45rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.calendar-day-panel-item.calendar-event-seen {
  border-color: #22c55e;
  background: color-mix(in srgb, #22c55e 12%, var(--surface));
}

.calendar-day-panel-item.calendar-event-released-unseen {
  border-color: #ef4444;
  background: color-mix(in srgb, #ef4444 11%, var(--surface));
}

@media (max-width: 960px) {
  .calendar-grid,
  .calendar-weekdays {
    min-width: 760px;
  }

  .calendar-grid-wrap {
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }
}
</style>
