let lastRequestAt = 0;
let queueTail: Promise<void> = Promise.resolve();

// AniList erlaubt ca. 90 req/min -> wir nehmen safe ~1 req / 1.2s
const MIN_DELAY_MS = 1200;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function enqueueAniList<T>(fn: () => Promise<T>): Promise<T> {
  const scheduled = queueTail.then(async () => {
    const now = Date.now();
    const diff = now - lastRequestAt;
    if (diff < MIN_DELAY_MS) {
      await sleep(MIN_DELAY_MS - diff);
    }

    lastRequestAt = Date.now();
    return fn();
  });

  queueTail = scheduled.then(
    () => undefined,
    () => undefined,
  );

  return scheduled;
}