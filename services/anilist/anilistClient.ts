import { createError } from "h3";
import { enqueueAniList } from "./anilistQueue";
const ANILIST_URL = "https://graphql.anilist.co";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function anilistRequest<T>(
  query: string,
  variables: Record<string, any>,
  attempt = 1
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

      console.warn(`[AniList] 429 – retry ${attempt}/5 in ${waitMs}ms`);

      await new Promise((r) => setTimeout(r, waitMs));
      return anilistRequest(query, variables, attempt + 1);
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
