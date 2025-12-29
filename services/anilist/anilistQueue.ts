let lastRequestAt = 0

// AniList erlaubt ca. 90 req/min → wir nehmen safe ~1 req / 1.2s
const MIN_DELAY_MS = 1200

export async function enqueueAniList<T>(
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const diff = now - lastRequestAt

  if (diff < MIN_DELAY_MS) {
    const wait = MIN_DELAY_MS - diff
    await new Promise((r) => setTimeout(r, wait))
  }

  lastRequestAt = Date.now()
  return fn()
}
