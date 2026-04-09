import { enqueueAniList } from "./anilistQueue";

const inFlightRequests = new Map<string, Promise<unknown>>();
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function performAniListRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  attempt: number,
): Promise<T> {
  return enqueueAniList(async () => {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 429) {
      if (attempt >= 5) {
        throw new Error("AniList rate limit exceeded");
      }

      const retryAfter = res.headers.get("retry-after");
      const waitMs = retryAfter
        ? Number(retryAfter) * 1000
        : 1000 * Math.pow(2, attempt);

      console.warn(`[AniList] 429 - retry ${attempt}/5 in ${waitMs}ms`);

      await sleep(waitMs);
      return performAniListRequest(query, variables, attempt + 1);
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AniList error ${res.status}: ${text}`);
    }

    const json = await res.json();

    if (json.errors) {
      throw new Error(JSON.stringify(json.errors));
    }

    return json.data as T;
  });
}

export async function anilistRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  attempt = 1,
): Promise<T> {
  const key = `${query}::${JSON.stringify(variables)}`;
  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  if (inFlightRequests.size >= 200) {
    const firstKey = inFlightRequests.keys().next().value;
    if (firstKey !== undefined) inFlightRequests.delete(firstKey);
  }

  const promise = performAniListRequest<T>(query, variables, attempt);
  const cleanup = setTimeout(() => inFlightRequests.delete(key), 60_000);
  const request = promise.finally(() => {
    clearTimeout(cleanup);
    inFlightRequests.delete(key);
  }) as Promise<T>;

  inFlightRequests.set(key, request as Promise<unknown>);
  return request;
}
